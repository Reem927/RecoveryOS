import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function sendTelegramMessage(chatId: number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN not configured")
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  })
  if (!res.ok) throw new Error(`Telegram API error: ${res.status}`)
}

export async function POST(req: NextRequest) {
  const { clientId, assessmentId } = await req.json()
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 })

  const supabase = createAdminSupabaseClient()

  const { data: client } = await supabase
    .from("patients")
    .select("id, full_name, telegram_chat_id")
    .eq("id", clientId)
    .maybeSingle()

  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 })
  if (!client.telegram_chat_id) {
    return NextResponse.json({ error: "Client has not connected Telegram yet" }, { status: 400 })
  }

  // Get assessment context for the message
  let contextText = ""
  if (assessmentId) {
    const { data: assessment } = await supabase
      .from("assessments")
      .select("primary_area, ai_summary")
      .eq("id", assessmentId)
      .single()

    if (assessment?.ai_summary) {
      const s = assessment.ai_summary as Record<string, unknown>
      const protocol = (s.protocol_recommendation as Record<string, string> | undefined)?.name
      const focusArea = typeof s.primary_focus_area === "string" ? s.primary_focus_area : assessment.primary_area
      contextText = `Today's session focused on ${focusArea ?? "recovery"}${protocol ? `, using the ${protocol} protocol` : ""}.`
    } else if (assessment?.primary_area) {
      contextText = `Today's session focused on ${assessment.primary_area} recovery.`
    }
  } else {
    // Try to fetch the most recent assessment for this client
    const { data: latest } = await supabase
      .from("assessments")
      .select("primary_area, ai_summary")
      .eq("patient_id", clientId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latest?.primary_area) {
      contextText = `Your recent session focused on ${latest.primary_area} recovery.`
    }
  }

  // Generate personalised follow-up with Claude
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    system: `You are a recovery wellness assistant for Hydrawav3, sending a post-session follow-up to ${client.full_name}.
Write a warm, encouraging check-in message (2-3 sentences max).
NEVER use: medical, clinical, treats, diagnoses, heals.
ALWAYS use: recovery, wellness, supports, empowers, mobility.
End with one simple question to check in on how they are feeling.`,
    messages: [
      {
        role: "user",
        content: `Generate a post-session follow-up message. Context: ${contextText || "General wellness session completed."}`,
      },
    ],
  })

  const message = response.content[0].type === "text" ? response.content[0].text : ""

  await sendTelegramMessage(client.telegram_chat_id as number, message)

  // Store in chat_messages
  await supabase.from("chat_messages").insert({
    patient_id: clientId,
    sender_role: "assistant",
    content: message,
    context_type: "followup",
    assessment_id: assessmentId ?? null,
  })

  return NextResponse.json({ ok: true, message })
}
