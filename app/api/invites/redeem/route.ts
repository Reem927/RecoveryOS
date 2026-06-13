import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 })

  const { token } = await req.json()
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 })

  const supabase = createAdminSupabaseClient()

  const { data: invite } = await supabase
    .from("patient_invites")
    .select("id, patient_id, used_at, expires_at, email")
    .eq("token", token)
    .maybeSingle()

  if (!invite) return NextResponse.json({ error: "Invalid invite" }, { status: 400 })
  if (invite.used_at) return NextResponse.json({ error: "Invite already used" }, { status: 400 })
  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: "Invite expired" }, { status: 400 })
  }

  // Link Clerk user to patient
  const { error: updateErr } = await supabase
    .from("patients")
    .update({ client_clerk_id: userId, email: invite.email })
    .eq("id", invite.patient_id)

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

  // Mark invite as used
  await supabase
    .from("patient_invites")
    .update({ used_at: new Date().toISOString() })
    .eq("id", invite.id)

  return NextResponse.json({ ok: true })
}
