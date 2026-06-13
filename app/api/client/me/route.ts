import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 })

  const supabase = createAdminSupabaseClient()
  const { data: patient } = await supabase
    .from("patients")
    .select(`
      id, full_name, nickname, age, gender,
      height_ft, height_in, weight_lbs,
      focus_region, email,
      practitioner:practitioners!primary_practitioner_id(full_name, title)
    `)
    .eq("client_clerk_id", userId)
    .maybeSingle()

  if (!patient) return NextResponse.json({ error: "No linked patient record" }, { status: 404 })

  return NextResponse.json(patient)
}
