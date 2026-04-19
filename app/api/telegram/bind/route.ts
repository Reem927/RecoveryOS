import { NextRequest, NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

// POST /api/telegram/bind — generates a binding token + deep link for a patient
export async function POST(req: NextRequest) {
  const { patientId } = await req.json()
  if (!patientId) return NextResponse.json({ error: "patientId required" }, { status: 400 })

  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 16)
  const supabase = createAdminSupabaseClient()

  const { error } = await supabase
    .from("patients")
    .update({ telegram_binding_token: token })
    .eq("id", patientId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const botUsername = process.env.TELEGRAM_BOT_USERNAME ?? "hydrawav3_bot"
  const deepLink = `https://t.me/${botUsername}?start=${token}`

  return NextResponse.json({ deepLink, token })
}
