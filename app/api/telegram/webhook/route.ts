import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function sendTelegramMessage(chatId: number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const message = body?.message
  if (!message) return NextResponse.json({ ok: true })

  const chatId: number = message.chat?.id
  const text: string = message.text ?? ""
  const supabase = createAdminSupabaseClient()

  // --- Binding flow: /start <token> ---
  if (text.startsWith("/start")) {
    const token = text.split(" ")[1]?.trim()

    if (token) {
      const { data: patient } = await supabase
        .from("patients")
        .select("id, full_name")
        .eq("telegram_binding_token", token)
        .maybeSingle()

      if (patient) {
        await supabase
          .from("patients")
          .update({ telegram_chat_id: chatId, telegram_binding_token: null })
          .eq("id", patient.id)

        await sendTelegramMessage(
          chatId,
          `👋 Hi <b>${patient.full_name}</b>! You're now connected to your Hydrawav3 recovery assistant.\n\nYou'll receive wellness check-ins after your sessions. You can also ask me anything about your recovery here.`,
        )
        return NextResponse.json({ ok: true })
      }
    }

    await sendTelegramMessage(
      chatId,
      "Welcome to Hydrawav3! To connect your account, use the link provided by your practitioner.",
    )
    return NextResponse.json({ ok: true })
  }

  // --- Existing client messaging ---
  const { data: patient } = await supabase
    .from("patients")
    .select("id, full_name")
    .eq("telegram_chat_id", chatId)
    .maybeSingle()

  if (!patient) {
    await sendTelegramMessage(
      chatId,
      "I don't recognise this account. Please use your practitioner's link to connect.",
    )
    return NextResponse.json({ ok: true })
  }

  // Fetch last 6 messages for context
  const { data: history } = await supabase
    .from("chat_messages")
    .select("sender_role, content")
    .eq("patient_id", patient.id)
    .order("created_at", { ascending: false })
    .limit(6)

  const claudeHistory = (history ?? [])
    .reverse()
    .map((m: { sender_role: string; content: string }) => ({
      role: m.sender_role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: m.content,
    }))

  // Save incoming message
  await supabase.from("chat_messages").insert({
    patient_id: patient.id,
    sender_role: "client",
    content: text,
    context_type: "followup",
  })

  // Generate AI reply
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    system: `You are a recovery wellness assistant for Hydrawav3, supporting ${patient.full_name} via Telegram.
Be warm, encouraging, and concise (2-3 sentences max).
NEVER use: medical, clinical, treats, diagnoses, heals.
ALWAYS use: recovery, wellness, supports, empowers, mobility.`,
    messages: [...claudeHistory, { role: "user", content: text }],
  })

  const reply = response.content[0].type === "text" ? response.content[0].text : ""

  // Save reply
  await supabase.from("chat_messages").insert({
    patient_id: patient.id,
    sender_role: "assistant",
    content: reply,
    context_type: "followup",
  })

  await sendTelegramMessage(chatId, reply)
  return NextResponse.json({ ok: true })
}
