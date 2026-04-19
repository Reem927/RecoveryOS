import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

type SenderRole = "practitioner" | "client"

function buildSystemPrompt(
  senderRole: SenderRole,
  chatContext: string | null,
  protocolRec: string | null,
): string {
  if (senderRole === "practitioner") {
    return `You are a recovery intelligence assistant embedded in the Hydrawav3 practitioner dashboard.
You have context on this client's assessment and recovery history.
CLIENT CONTEXT: ${chatContext ?? "No assessment loaded yet"}
PROTOCOL RECOMMENDED: ${protocolRec ?? "None yet"}

Your job: help the practitioner make faster, more confident decisions.
- Answer questions about this specific client's recovery signals and history
- Suggest protocol adjustments based on patterns you see in the data
- Flag anything in the assessment worth discussing with the client
- Keep responses under 4 sentences
- If asked something outside recovery/wellness scope, redirect: "That's outside my scope — your judgment as the practitioner guides that."
- NEVER use: medical, clinical, treats, diagnoses, heals
- ALWAYS use: recovery, wellness, supports, empowers, mobility`
  }

  return `You are a recovery intelligence assistant embedded in the Hydrawav3 wellness app.
You support clients on their recovery and wellness journey between sessions.
CLIENT CONTEXT: ${chatContext ?? "No recent assessment available"}

Your job: empower the client with recovery insights and motivation.
- Answer questions about their wellness journey and recovery progress
- Provide guidance on mobility, recovery practices, and wellness habits
- Encourage adherence to their wellness protocol
- Keep responses warm, supportive, and under 4 sentences
- NEVER use: medical, clinical, treats, diagnoses, heals
- ALWAYS use: recovery, wellness, supports, empowers, mobility`
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    clientId,
    message,
    senderRole,
    assessmentId,
    sessionId,
  }: {
    clientId: string
    message: string
    senderRole: SenderRole
    assessmentId?: string
    sessionId?: string
  } = body

  if (!message || !senderRole) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const supabase = createAdminSupabaseClient()

  // General practitioner mode (no clientId) — no history or DB storage
  if (!clientId) {
    const systemPrompt = buildSystemPrompt(senderRole, null, null)
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: "user", content: `[${senderRole}]: ${message}` }],
    })
    const reply = response.content[0].type === "text" ? response.content[0].text : ""
    return NextResponse.json({ reply })
  }

  // Fetch last 12 chat messages for history
  const { data: history } = await supabase
    .from("chat_messages")
    .select("sender_role, content, created_at")
    .eq("patient_id", clientId)
    .order("created_at", { ascending: true })
    .limit(12)

  const isFirstMessage = !history || history.length === 0

  // Fetch assessment context if provided
  let chatContext: string | null = null
  let protocolRec: string | null = null

  if (assessmentId) {
    const { data: assessment } = await supabase
      .from("assessments")
      .select("ai_summary")
      .eq("id", assessmentId)
      .single()

    if (assessment?.ai_summary) {
      const s = assessment.ai_summary as Record<string, unknown>
      chatContext = typeof s.chat_context === "string" ? s.chat_context : null
      const pr = s.protocol_recommendation as Record<string, string> | undefined
      if (pr) {
        protocolRec = `${pr.name} — sun: ${pr.sun_placement}, moon: ${pr.moon_placement}`
      }
    }
  }

  // Map history to Claude message format
  const claudeHistory: Anthropic.MessageParam[] = (history ?? []).map((m: { sender_role: string; content: string }) => ({
    role: m.sender_role === "assistant" ? "assistant" : "user",
    content: m.sender_role === "assistant"
      ? m.content
      : `[${m.sender_role}]: ${m.content}`,
  }))

  const systemPrompt = buildSystemPrompt(senderRole, chatContext, protocolRec)

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    system: systemPrompt,
    messages: [
      ...claudeHistory,
      { role: "user", content: `[${senderRole}]: ${message}` },
    ],
  })

  const reply = response.content[0].type === "text" ? response.content[0].text : ""

  // Determine context_type
  const contextType = assessmentId ? "assessment" : sessionId ? "session" : "general"

  // Save user message
  await supabase.from("chat_messages").insert({
    patient_id: clientId,
    sender_role: senderRole,
    content: message,
    context_type: contextType,
    assessment_id: assessmentId ?? null,
    session_id: sessionId ?? null,
  })

  // Save assistant reply
  await supabase.from("chat_messages").insert({
    patient_id: clientId,
    sender_role: "assistant",
    content: reply,
    context_type: contextType,
    assessment_id: assessmentId ?? null,
    session_id: sessionId ?? null,
  })

  const result: { reply: string; suggestedQuestions?: string[] } = { reply }

  // Include suggested questions only on first message
  if (isFirstMessage && assessmentId) {
    const { data: assessment } = await supabase
      .from("assessments")
      .select("ai_summary")
      .eq("id", assessmentId)
      .single()

    const sq = (assessment?.ai_summary as Record<string, unknown> | null)?.suggested_questions
    if (Array.isArray(sq)) {
      result.suggestedQuestions = sq as string[]
    }
  }

  return NextResponse.json(result)
}
