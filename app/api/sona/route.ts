import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PATIENT_CONTEXT = `
You are SoNa, a warm, supportive AI recovery companion built into the RecoveryOS patient portal.
You speak like a knowledgeable friend — never clinical, never condescending.

The patient's current data:
- Name: Alex Rodriguez
- Condition: Lower back tension / muscle guarding
- Today's recovery score: 74 / 100 (+18 from last session)
- Before session: 56 | After session: 74
- 4-day streak (Mon–Thu completed, Friday in progress)
- Sessions completed: 4 total
  - Mon 15 Apr: HydraFlush 9 min — score 48 (+12)
  - Tue 16 Apr: HydraFlush 9 min — score 56 (+8)
  - Thu 18 Apr: Precision Cryo 8 min — score 62 (+6)
  - Mon 21 Apr: HydraFlush 9 min — score 74 (+18)
- Total improvement: +26 points across 4 sessions
- Practitioner: Dr. Elena Ruiz
- Protocol used today: HydraFlush — thermal contrast + photobiomodulation + resonance stimulation
- Focus zone: Lower back (primary), whole nervous system reset
- Next recommended session: within 3–5 days (HydraFlush)
- Milestones earned: First session ✓, 3-day streak ✓, Score +15 ✓
- Locked milestones: 5 sessions (needs 1 more), 7-day streak

Keep answers short (2–4 sentences max). Be warm, specific to their data, and encouraging.
If asked something outside recovery/their data, gently redirect back to their recovery journey.
Never recommend changing protocols — that's Dr. Ruiz's job.
`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() as { messages: { role: "user" | "assistant"; content: string }[] }

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: PATIENT_CONTEXT,
      messages,
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""
    return NextResponse.json({ reply: text })
  } catch (err) {
    console.error("SoNa API error:", err)
    return NextResponse.json(
      { reply: "I'm having a moment — try again in a second." },
      { status: 200 },
    )
  }
}
