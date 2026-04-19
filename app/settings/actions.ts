"use server"

import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { getCurrentPractitioner } from "@/lib/auth/current-practitioner"

export type Colleague = {
  id: string
  full_name: string
  title: string | null
  email: string | null
  isYou: boolean
}

export async function getClinicColleagues(): Promise<Colleague[]> {
  const me = await getCurrentPractitioner()
  if (!me || !me.clinic_id) return []

  const supabase = createAdminSupabaseClient()
  const { data } = await supabase
    .from("practitioners")
    .select("id, full_name, title, email")
    .eq("clinic_id", me.clinic_id)
    .order("full_name")

  return (data ?? []).map((p: { id: string; full_name: string; title: string | null; email: string | null }) => ({
    id: p.id,
    full_name: p.full_name,
    title: p.title,
    email: p.email,
    isYou: p.id === me.id,
  }))
}
