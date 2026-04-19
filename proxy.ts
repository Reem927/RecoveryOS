import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/login",
  "/login(.*)",
  "/sign-up",
  "/sign-up(.*)",
])

const isOnboardingRoute = createRouteMatcher([
  "/onboarding",
  "/onboarding/(.*)",
])

// Routes that need auth but NOT an onboarded practitioner row — e.g. Clerk
// webhook endpoints, health checks. Add here if needed.
const skipsOnboardingCheck = createRouteMatcher([
  "/api/clerk/webhook",
  "/api/inngest",
])

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return

  await auth.protect()

  if (isOnboardingRoute(req) || skipsOnboardingCheck(req)) return

  const { userId } = await auth()
  if (!userId) return

  // Use service role for this check — user may not have a clinic_id yet,
  // and this runs on every protected request so we want predictable access.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )

  const { data } = await supabase
    .from("practitioners")
    .select("clinic_id")
    .eq("clerk_user_id", userId)
    .maybeSingle()

  if (!data || !data.clinic_id) {
    const url = new URL("/onboarding", req.url)
    return NextResponse.redirect(url)
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
