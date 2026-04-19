import { NextRequest, NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { getCurrentPractitioner } from "@/lib/auth/current-practitioner"

export async function GET(
  _req: NextRequest,
  { params }: { params: { clientId: string } },
) {
  const practitioner = await getCurrentPractitioner()
  if (!practitioner?.clinic_id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 })
  }

  const supabase = createAdminSupabaseClient()
  const { data: client, error } = await supabase
    .from("patients")
    .select("id, full_name, email, phone, focus_region, dob, intake, created_at")
    .eq("id", params.clientId)
    .eq("clinic_id", practitioner.clinic_id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 })

  const { data: latestAssessment } = await supabase
    .from("assessments")
    .select("id, created_at, primary_area, ai_summary")
    .eq("patient_id", params.clientId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  return NextResponse.json({ ...client, latest_assessment: latestAssessment ?? null })
}
