import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = createAdminSupabaseClient()

  // Fetch assessment with patient info
  const { data: assessment, error: aErr } = await supabase
    .from("assessments")
    .select(`*, patient:patients(id, full_name, date_of_birth)`)
    .eq("id", id)
    .single()

  if (aErr || !assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
  }

  // Fetch last 3 sessions for this patient
  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, started_at, ended_at, protocol, notes_final")
    .eq("patient_id", assessment.patient_id)
    .order("started_at", { ascending: false })
    .limit(3)

  const systemPrompt = `You are a recovery intelligence assistant for Hydrawav3 wellness practitioners.
NEVER use: medical, clinical, treats, diagnoses, heals.
ALWAYS use: recovery, wellness, supports, empowers, mobility.
Return ONLY valid JSON, no markdown, no preamble.`

  const userPrompt = `Summarize this client assessment for a practitioner.
Assessment data: ${JSON.stringify(assessment)}
Last 3 sessions: ${JSON.stringify(sessions ?? [])}

Return this exact JSON structure:
{
  "practitioner_brief": "string",
  "primary_focus_area": "string",
  "recovery_signals": ["string"],
  "protocol_recommendation": {
    "name": "string",
    "sun_placement": "string",
    "moon_placement": "string",
    "rationale": "string",
    "intensity": "string"
  },
  "chat_context": "string",
  "suggested_questions": ["string"]
}`

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  })

  const rawText = message.content[0].type === "text" ? message.content[0].text : ""
  let summary: Record<string, unknown>
  try {
    summary = JSON.parse(rawText)
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response", raw: rawText }, { status: 500 })
  }

  // Save ai_summary back to assessment
  const { error: updateErr } = await supabase
    .from("assessments")
    .update({ ai_summary: summary })
    .eq("id", id)

  if (updateErr) {
    return NextResponse.json({ error: "Failed to save summary" }, { status: 500 })
  }

  return NextResponse.json(summary)
}
