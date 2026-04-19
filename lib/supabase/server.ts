import "server-only"

import { auth } from "@clerk/nextjs/server"
import { createClient } from "@supabase/supabase-js"

/**
 * Supabase client for server contexts (Server Components, Route Handlers,
 * Server Actions) that runs AS THE AUTHENTICATED USER.
 *
 * Uses Clerk's session token so Supabase RLS policies see the user's JWT
 * claims (auth.jwt() ->> 'sub' resolves to the Clerk user id).
 */
export async function createServerSupabaseClient() {
  const { getToken } = await auth()

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      async accessToken() {
        return (await getToken()) ?? null
      },
    },
  )
}
