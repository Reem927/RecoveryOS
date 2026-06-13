"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { SignUp, useAuth, useClerk } from "@clerk/nextjs"
import Link from "next/link"
import { Suspense } from "react"

type InviteInfo = {
  valid: boolean
  email?: string
  patientName?: string
  practitionerName?: string
  error?: string
}

function JoinContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const [invite, setInvite] = useState<InviteInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const { isSignedIn } = useAuth()
  const { signOut } = useClerk()

  useEffect(() => {
    if (!token) { setInvite({ valid: false, error: "No invite token provided." }); setLoading(false); return }
    fetch(`/api/invites/validate?token=${token}`)
      .then((r) => r.json())
      .then((data) => setInvite(data))
      .finally(() => setLoading(false))
  }, [token])

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0F1E28] px-4 py-10 text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[#C97A56]/20 blur-[140px]" />
        <div className="absolute bottom-[-200px] right-[-120px] h-[440px] w-[440px] rounded-full bg-[#C97A56]/10 blur-[140px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold tracking-tight text-white">RecoveryOS</h1>
            <p className="mt-1 text-sm uppercase tracking-[0.16em] text-white/45">Client Portal</p>
          </Link>
        </div>

        {isSignedIn && (
          <div className="rounded-2xl border border-[#C97A56]/20 bg-[#C97A56]/[0.06] p-8 text-center space-y-4">
            <p className="text-base font-semibold text-white">You&apos;re already signed in</p>
            <p className="text-sm text-white/60">
              To create a client account, you need to sign out of your current session first.
            </p>
            <button
              onClick={() => signOut()}
              className="inline-block rounded-xl bg-[#C97A56] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#B86A48] transition-colors"
            >
              Sign out and continue
            </button>
          </div>
        )}

        {!isSignedIn && loading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 rounded-full border-2 border-[#C97A56] border-t-transparent animate-spin" />
          </div>
        )}

        {!isSignedIn && !loading && !invite?.valid && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15">
              <span className="text-2xl">✕</span>
            </div>
            <h2 className="text-lg font-semibold text-white">Invite Invalid</h2>
            <p className="text-sm text-white/60">{invite?.error ?? "This invite link is not valid."}</p>
            <p className="text-xs text-white/40">Ask your practitioner to send a new invite.</p>
          </div>
        )}

        {!isSignedIn && !loading && invite?.valid && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-[#C97A56]/20 bg-[#C97A56]/[0.06] px-5 py-4 text-center">
              <p className="text-sm text-white/60">Invited by</p>
              <p className="text-base font-semibold text-white">{invite.practitionerName}</p>
              <p className="mt-1 text-sm text-white/50">
                Hi {invite.patientName} — create your account below to access your recovery portal.
              </p>
            </div>

            <SignUp
              routing="hash"
              initialValues={{ emailAddress: invite.email }}
              forceRedirectUrl={`/client/join/complete?token=${token}`}
              fallbackRedirectUrl={`/client/join/complete?token=${token}`}
              appearance={{
                elements: {
                  card: "rounded-2xl shadow-2xl border border-white/10 w-full",
                  header: "hidden",
                  formButtonPrimary: "bg-[#C97A56] hover:bg-[#B86A48] text-white shadow-none",
                  footerActionLink: "text-[#C97A56] hover:text-[#B86A48]",
                  rootBox: "w-full",
                },
              }}
            />

            <p className="text-center text-xs text-white/30">
              Already have an account?{" "}
              <Link href="/client/login" className="text-[#C97A56] hover:text-[#B86A48]">Sign in</Link>
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

export default function ClientJoinPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#0F1E28]">
        <div className="h-8 w-8 rounded-full border-2 border-[#C97A56] border-t-transparent animate-spin" />
      </div>
    }>
      <JoinContent />
    </Suspense>
  )
}
