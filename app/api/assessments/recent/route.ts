import { NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { getCurrentPractitioner } from "@/lib/auth/current-practitioner"

export async function GET() {
  const practitioner = await getCurrentPractitioner()
  if (!practitioner?.clinic_id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 })
  }

  const supabase = createAdminSupabaseClient()

  // Get all patient IDs for this clinic
  const { data: patients } = await supabase
    .from("patients")
    .select("id")
    .eq("clinic_id", practitioner.clinic_id)

  if (!patients?.length) return NextResponse.json([])

  const patientIds = patients.map((p) => p.id)

  const { data, error } = await supabase
    .from("assessments")
    .select("id, patient_id, primary_area, created_at, ai_summary")
    .in("patient_id", patientIds)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
