import { NextRequest, NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const supabase = createAdminSupabaseClient()

  const { data, error } = await supabase
    .from("assessments")
    .insert(body)
    .select("id")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const patientId = searchParams.get("patientId")

  const supabase = createAdminSupabaseClient()
  let query = supabase
    .from("assessments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

  if (patientId) query = query.eq("patient_id", patientId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
