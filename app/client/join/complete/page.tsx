"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"

function CompleteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token") ?? ""
  const called = useRef(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || called.current) return
    called.current = true

    fetch("/api/invites/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error ?? "Failed to set up account")
        }
        router.replace("/client")
      })
      .catch((err: Error) => {
        setError(err.message)
      })
  }, [token, router])

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0F1E28] text-white px-4">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center max-w-sm space-y-3">
          <p className="text-base font-semibold text-white">Setup failed</p>
          <p className="text-sm text-white/60">{error}</p>
          <p className="text-xs text-white/40">Ask your practitioner to send a new invite link.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0F1E28] text-white">
      <div className="h-8 w-8 rounded-full border-2 border-[#C97A56] border-t-transparent animate-spin" />
      <p className="text-sm text-white/60">Setting up your account…</p>
    </div>
  )
}

export default function JoinCompletePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#0F1E28]">
        <div className="h-8 w-8 rounded-full border-2 border-[#C97A56] border-t-transparent animate-spin" />
      </div>
    }>
      <CompleteContent />
    </Suspense>
  )
}
