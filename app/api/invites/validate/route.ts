import { NextRequest, NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token")
  if (!token) return NextResponse.json({ valid: false, error: "Token required" }, { status: 400 })

  const supabase = createAdminSupabaseClient()
  const { data: invite } = await supabase
    .from("patient_invites")
    .select(`
      id, email, expires_at, used_at,
      patient:patients(id, full_name, nickname),
      practitioner:practitioners(full_name)
    `)
    .eq("token", token)
    .maybeSingle()

  if (!invite) return NextResponse.json({ valid: false, error: "Invalid invite" })

  if (invite.used_at) return NextResponse.json({ valid: false, error: "Invite already used" })

  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, error: "Invite has expired" })
  }

  const patient = invite.patient as { id: string; full_name: string; nickname: string | null } | null
  const practitioner = invite.practitioner as { full_name: string } | null

  return NextResponse.json({
    valid: true,
    email: invite.email,
    patientName: patient?.nickname ?? patient?.full_name ?? "there",
    practitionerName: practitioner?.full_name ?? "Your practitioner",
  })
}
