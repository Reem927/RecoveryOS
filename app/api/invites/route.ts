import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { getCurrentPractitioner } from "@/lib/auth/current-practitioner"

const resend = new Resend(process.env.RESEND_API_KEY)

function generateToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let token = ""
  for (let i = 0; i < 32; i++) token += chars[Math.floor(Math.random() * chars.length)]
  return token
}

export async function POST(req: NextRequest) {
  const practitioner = await getCurrentPractitioner()
  if (!practitioner?.clinic_id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 })
  }

  const { patientId, email } = await req.json()
  if (!patientId || !email) {
    return NextResponse.json({ error: "patientId and email required" }, { status: 400 })
  }

  const supabase = createAdminSupabaseClient()

  // Verify patient belongs to this clinic
  const { data: patient } = await supabase
    .from("patients")
    .select("id, full_name, nickname")
    .eq("id", patientId)
    .eq("clinic_id", practitioner.clinic_id)
    .maybeSingle()

  if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 })

  // Invalidate any existing unused invite for this patient
  await supabase
    .from("patient_invites")
    .update({ used_at: new Date().toISOString() })
    .eq("patient_id", patientId)
    .is("used_at", null)

  const token = generateToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { error: insertErr } = await supabase.from("patient_invites").insert({
    patient_id: patientId,
    clinic_id: practitioner.clinic_id,
    practitioner_id: practitioner.id,
    email,
    token,
    expires_at: expiresAt,
  })

  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

  // Also store email on the patient record
  await supabase.from("patients").update({ email }).eq("id", patientId)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const joinUrl = `${appUrl}/client/join?token=${token}`
  const displayName = patient.nickname ?? patient.full_name ?? "there"

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F2EDE6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2EDE6;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

        <tr><td style="padding-bottom:24px;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:#162532;letter-spacing:-0.5px;">RecoveryOS</div>
          <div style="font-size:10px;font-weight:600;letter-spacing:2px;color:#9CA3AF;text-transform:uppercase;margin-top:2px;">Client Portal</div>
        </td></tr>

        <tr><td style="background:#fff;border-radius:16px;padding:36px;border:1px solid rgba(0,0,0,0.07);">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td>
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#9CA3AF;">You're invited</p>
              <p style="margin:0 0 20px;font-size:22px;font-weight:700;color:#162532;">Hi ${displayName} 👋</p>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#374151;">
                <strong>${practitioner.full_name}</strong> has invited you to join your personal RecoveryOS client portal — where you can track your recovery progress, view your programme, and stay connected with your practitioner.
              </p>
              <p style="margin:0 0 28px;font-size:14px;line-height:1.6;color:#6B7280;">
                Your invite link is valid for <strong>7 days</strong>. Click below to create your account.
              </p>
            </td></tr>

            <tr><td style="text-align:center;padding-bottom:28px;">
              <a href="${joinUrl}"
                style="display:inline-block;background:#C97A56;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 36px;border-radius:12px;letter-spacing:0.01em;">
                Create My Account
              </a>
            </td></tr>

            <tr><td style="border-top:1px solid #F2EDE6;padding-top:20px;">
              <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.6;">
                Or paste this link in your browser:<br>
                <span style="color:#C97A56;word-break:break-all;">${joinUrl}</span>
              </p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding-top:20px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#9CA3AF;">Sent by ${practitioner.full_name} via RecoveryOS · This invite expires in 7 days.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  const from = process.env.RESEND_FROM_EMAIL ?? "RecoveryOS <onboarding@resend.dev>"
  const { error: sendErr } = await resend.emails.send({
    from,
    to: email,
    subject: `${practitioner.full_name} invited you to RecoveryOS`,
    html,
  })

  if (sendErr) {
    console.error("[invites] resend error:", sendErr)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
