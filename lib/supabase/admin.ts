import "server-only"

import { createClient } from "@supabase/supabase-js"

/**
 * Supabase client with SERVICE ROLE — bypasses RLS.
 *
 * Use ONLY on the server, and ONLY for:
 *   - Onboarding flows where the user's clinic_id isn't set yet
 *   - Webhook handlers with no user session (Clerk, Telegram, Inngest)
 *   - Background/Inngest jobs
 *
 * Never expose to the browser. Never use where the user-authenticated
 * client would work instead.
 */
export function createAdminSupabaseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (server-only).",
    )
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  )
}
