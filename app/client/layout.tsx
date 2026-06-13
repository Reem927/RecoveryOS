"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import Link from "next/link"
import { LogOut } from "lucide-react"
import { ChatFAB } from "@/components/chat-fab"

type PatientMe = {
  id: string
  full_name: string
  nickname: string | null
  practitioner: { full_name: string; title: string | null } | null
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, signOut } = useAuth()
  const router = useRouter()
  const [patient, setPatient] = useState<PatientMe | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) { router.replace("/client/login"); return }

    fetch("/api/client/me")
      .then((r) => {
        if (r.status === 404) { router.replace("/client/login"); return null }
        return r.json()
      })
      .then((data) => { if (data && !data.error) setPatient(data) })
      .finally(() => setChecking(false))
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F2EDE6]">
        <div className="h-7 w-7 rounded-full border-2 border-[#C97A56] border-t-transparent animate-spin" />
      </div>
    )
  }

  const displayName = patient?.nickname ?? patient?.full_name ?? ""
  const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-[#F2EDE6] text-[#1F2937]">
      <header className="sticky top-0 z-20 flex h-[68px] items-center gap-4 border-b border-black/5 bg-white/80 px-4 backdrop-blur-md md:px-8">
        <Link href="/client" className="flex min-w-0 flex-1 items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#C97A56]">
            <span className="text-[10px] font-bold text-white">R</span>
          </div>
          <div className="flex min-w-0 flex-col justify-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">Client Portal</p>
            <h1 className="truncate text-[16px] font-bold tracking-tight text-[#1F2937]">RecoveryOS</h1>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {displayName && (
            <div className="flex h-10 items-center gap-2 rounded-[10px] border border-black/[0.07] bg-white px-2.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C97A56] text-[10px] font-semibold text-white">
                {initials || "?"}
              </div>
              <span className="hidden text-[12px] font-medium text-[#374151] sm:block">{displayName}</span>
            </div>
          )}
          <button
            onClick={() => signOut(() => router.push("/"))}
            className="inline-flex h-10 items-center gap-1.5 rounded-[10px] border border-black/[0.07] bg-white px-3 text-[12px] font-medium text-[#374151] transition-colors hover:border-black/10"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:block">Sign out</span>
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        {children}
      </main>

      <ChatFAB
        clientId={patient?.id}
        clientName={displayName || undefined}
        senderRole="client"
      />
    </div>
  )
}
