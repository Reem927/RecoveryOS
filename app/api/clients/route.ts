import { NextRequest, NextResponse } from "next/server"
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
    .select("id, full_name, nickname, age, gender, height_ft, height_in, weight_lbs, email, phone, focus_region, dob, intake, created_at")
    .eq("clinic_id", practitioner.clinic_id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const practitioner = await getCurrentPractitioner()
  if (!practitioner?.clinic_id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 })
  }

  const body = await req.json()
  const { nickname, age, gender, height_ft, height_in, weight_lbs } = body

  if (!age || !gender || height_ft == null || height_in == null || !weight_lbs) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from("patients")
    .insert({
      clinic_id: practitioner.clinic_id,
      primary_practitioner_id: practitioner.id,
      full_name: nickname?.trim() || "Client",
      nickname: nickname?.trim() || null,
      age: Number(age),
      gender,
      height_ft: Number(height_ft),
      height_in: Number(height_in),
      weight_lbs: Number(weight_lbs),
    })
    .select("id, full_name, nickname, age, gender, height_ft, height_in, weight_lbs, email, phone, focus_region, dob, intake, created_at")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
