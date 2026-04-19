import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import Anthropic from "@anthropic-ai/sdk"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

const resend = new Resend(process.env.RESEND_API_KEY)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { clientId, assessmentId } = await req.json()
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 })

  const supabase = createAdminSupabaseClient()

  // Fetch client + their clinic's practitioner for booking URL
  const { data: client } = await supabase
    .from("patients")
    .select("id, full_name, email, clinic_id")
    .eq("id", clientId)
    .maybeSingle()

  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 })
  if (!client.email) return NextResponse.json({ error: "Client has no email address on file" }, { status: 400 })

  // Fetch practitioner name + booking URL for this clinic
  const { data: practitioner } = await supabase
    .from("practitioners")
    .select("full_name, booking_url")
    .eq("clinic_id", client.clinic_id)
    .limit(1)
    .maybeSingle()

  const practitionerName = practitioner?.full_name ?? "Your practitioner"
  const bookingUrl = (practitioner as { booking_url?: string } | null)?.booking_url
    ?? process.env.BOOKING_URL
    ?? null

  // Build context from assessment
  let contextText = ""
  let resolvedAssessmentId = assessmentId

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
    const { data: latest } = await supabase
      .from("assessments")
      .select("id, primary_area, ai_summary")
      .eq("patient_id", clientId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latest) {
      resolvedAssessmentId = latest.id
      contextText = `Your recent session focused on ${latest.primary_area ?? "recovery"}.`
    }
  }

  // Generate personalised message with Claude
  const aiResponse = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 250,
    system: `You are a recovery wellness assistant for Hydrawav3 writing a post-session follow-up email to ${client.full_name}.
Write a warm, encouraging message (3-4 sentences). Keep it personal and supportive.
NEVER use: medical, clinical, treats, diagnoses, heals.
ALWAYS use: recovery, wellness, supports, empowers, mobility.
End with one simple check-in question about how they are feeling.`,
    messages: [
      {
        role: "user",
        content: `Write the follow-up message body. Context: ${contextText || "General wellness session completed."}`,
      },
    ],
  })

  const messageBody = aiResponse.content[0].type === "text" ? aiResponse.content[0].text : ""

  const subject = contextText
    ? `Your recovery follow-up from today's session`
    : `A wellness check-in from your Hydrawav3 team`

  const bookingButton = bookingUrl
    ? `
        <!-- Booking CTA -->
        <tr><td style="padding-top:24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="background:#F2EDE6;border-radius:12px;padding:20px;text-align:center;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#374151;">Ready to book your next session?</p>
              <a href="${bookingUrl}"
                style="display:inline-block;background:#C97A56;color:#fff;text-decoration:none;font-size:13px;font-weight:600;padding:12px 28px;border-radius:10px;">
                Book with ${practitionerName}
              </a>
            </td></tr>
          </table>
        </td></tr>`
    : ""

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F2EDE6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2EDE6;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

        <!-- Header -->
        <tr><td style="padding-bottom:24px;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:#162532;letter-spacing:-0.5px;">RecoveryOS</div>
          <div style="font-size:10px;font-weight:600;letter-spacing:2px;color:#9CA3AF;text-transform:uppercase;margin-top:2px;">Hydrawav3</div>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#fff;border-radius:16px;padding:32px;border:1px solid rgba(0,0,0,0.07);">
          <table width="100%" cellpadding="0" cellspacing="0">

            <!-- Message -->
            <tr><td>
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#9CA3AF;">Your recovery follow-up</p>
              <p style="margin:0 0 20px;font-size:20px;font-weight:700;color:#162532;">Hi ${client.full_name} 👋</p>
              <p style="margin:0;font-size:15px;line-height:1.7;color:#374151;white-space:pre-line;">${messageBody}</p>
            </td></tr>

            ${bookingButton}

            <!-- Divider + signature -->
            <tr><td style="padding-top:24px;border-top:1px solid #F2EDE6;margin-top:24px;">
              <p style="margin:0;font-size:13px;color:#6B7280;">Warmly,<br><strong style="color:#162532;">${practitionerName}</strong><br><span style="color:#9CA3AF;font-size:12px;">Hydrawav3 · RecoveryOS</span></p>
            </td></tr>

          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding-top:20px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#9CA3AF;">You received this because your practitioner sent a follow-up via RecoveryOS.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  const fromAddress = process.env.RESEND_FROM_EMAIL ?? "RecoveryOS <onboarding@resend.dev>"

  const { data: emailData, error: sendError } = await resend.emails.send({
    from: fromAddress,
    to: client.email,
    subject,
    html,
  })

  if (sendError) {
    console.error("[followup] resend error:", sendError)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }

  // Store in chat_messages for conversation history
  await supabase.from("chat_messages").insert({
    patient_id: clientId,
    sender_role: "assistant",
    content: messageBody,
    context_type: "followup",
    assessment_id: resolvedAssessmentId ?? null,
  })

  // Store in follow_up_emails log (best-effort — table may not exist yet)
  await supabase.from("follow_up_emails").insert({
    patient_id: clientId,
    assessment_id: resolvedAssessmentId ?? null,
    resend_email_id: (emailData as { id?: string } | null)?.id ?? null,
    subject,
    body: messageBody,
    sent_to: client.email,
  }).then(() => {}).catch(() => {})

  return NextResponse.json({ ok: true, message: messageBody })
}
