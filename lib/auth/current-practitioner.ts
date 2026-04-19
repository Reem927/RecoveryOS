import "server-only"

import { auth } from "@clerk/nextjs/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export type PractitionerRow = {
  id: string
  clerk_user_id: string
  clinic_id: string | null
  full_name: string
  title: string | null
  email: string | null
  created_at: string
}

/**
 * Look up the practitioner row for the currently signed-in Clerk user.
 * Returns null if not signed in OR if no practitioner row exists yet.
 *
 * Uses the admin client because it's called during onboarding when the
 * user might not have a clinic_id yet (normal RLS could return 0 rows).
 */
export async function getCurrentPractitioner(): Promise<PractitionerRow | null> {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from("practitioners")
    .select("id, clerk_user_id, clinic_id, full_name, title, email, created_at")
    .eq("clerk_user_id", userId)
    .maybeSingle()

  if (error) {
    console.error("[getCurrentPractitioner] supabase error:", error)
    return null
  }

  return data
}

/**
 * Has the user completed onboarding (row exists AND has a clinic_id)?
 */
export function isOnboarded(row: PractitionerRow | null): boolean {
  return !!row && !!row.clinic_id
}
