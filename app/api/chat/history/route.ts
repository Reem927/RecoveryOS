import { NextRequest, NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get("clientId")

  if (!clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 })
  }

  const supabase = createAdminSupabaseClient()

  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, sender_role, content, context_type, assessment_id, session_id, created_at")
    .eq("patient_id", clientId)
    .order("created_at", { ascending: true })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
