import { NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { getCurrentPractitioner } from "@/lib/auth/current-practitioner"

export async function GET() {
  const practitioner = await getCurrentPractitioner()
  if (!practitioner?.clinic_id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 })
  }

  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from("patients")
    .select("id, full_name, email, phone, focus_region, dob, intake, created_at")
    .eq("clinic_id", practitioner.clinic_id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
