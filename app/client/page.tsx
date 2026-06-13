"use client"

import { useEffect, useState } from "react"
import { CalendarCheck, Activity, HeartPulse, Waves, Sparkles } from "lucide-react"
import { RecoveryTrendChart } from "@/components/hydrawav3/recovery-trend-chart"

type PatientMe = {
  id: string
  full_name: string
  nickname: string | null
  age: number | null
  gender: string | null
  focus_region: string | null
  practitioner: { full_name: string; title: string | null } | null
}

export default function ClientDashboard() {
  const [patient, setPatient] = useState<PatientMe | null>(null)

  useEffect(() => {
    fetch("/api/client/me")
      .then((r) => r.json())
      .then((d) => { if (!d.error) setPatient(d) })
  }, [])

  const displayName = patient?.nickname ?? patient?.full_name ?? "there"
  const practitionerName = patient?.practitioner?.full_name ?? "Your practitioner"
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Hero */}
      <section className="relative overflow-hidden rounded-[16px] border border-black/[0.07] bg-[#162532] p-6 text-white sm:p-8">
        <div aria-hidden className="absolute -right-16 -top-16 h-60 w-60 rounded-full bg-[#C97A56]/25 blur-3xl" />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
            Welcome back
          </p>
          <h1 className="mt-2 text-[28px] font-semibold leading-[1.1] tracking-tight sm:text-[32px]">
            Hi {displayName} 👋
          </h1>
          <p className="mt-3 max-w-lg text-[13.5px] leading-relaxed text-white/60">
            {patient?.focus_region
              ? `Your programme is focused on ${patient.focus_region} recovery. Keep up the great work.`
              : "Your recovery portal is ready. Your practitioner will add your programme soon."}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11.5px] text-white/70">
              <CalendarCheck className="h-3.5 w-3.5 text-[#C97A56]" />
              With {practitionerName}
            </div>
          </div>
        </div>
      </section>

      {/* Stats row — empty state */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Range of motion", icon: Activity },
          { label: "Symmetry", icon: HeartPulse },
          { label: "Sessions", icon: Waves },
          { label: "Adherence", icon: Sparkles },
        ].map(({ label, icon: Icon }) => (
          <div key={label} className="rounded-[12px] border border-black/[0.07] bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#C97A56]/10 text-[#C97A56]">
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">{label}</div>
            <div className="mt-1 text-[20px] font-semibold tracking-tight text-[#9CA3AF]">—</div>
            <div className="mt-0.5 text-[11.5px] text-[#9CA3AF]">No data yet</div>
          </div>
        ))}
      </section>

      {/* Chart placeholder */}
      <section className="rounded-[14px] border border-black/[0.07] bg-white p-5">
        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">Recovery score</p>
          <h2 className="mt-1 text-[16px] font-semibold tracking-tight text-[#1F2937]">Progress over time</h2>
        </div>
        <RecoveryTrendChart data={[]} />
      </section>

      {/* Profile summary */}
      {patient && (
        <section className="rounded-[14px] border border-black/[0.07] bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF] mb-4">Your profile</p>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#C97A56]/15 text-lg font-semibold text-[#C97A56]">
              {initials || "?"}
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#1F2937]">{displayName}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {patient.age && (
                  <span className="rounded-full bg-[#F2EDE6] px-2.5 py-0.5 text-[11px] font-medium text-[#6B7280]">{patient.age} yrs</span>
                )}
                {patient.gender && (
                  <span className="rounded-full bg-[#F2EDE6] px-2.5 py-0.5 text-[11px] font-medium text-[#6B7280]">{patient.gender}</span>
                )}
                {patient.focus_region && (
                  <span className="rounded-full bg-[#C97A56]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#C97A56] capitalize">{patient.focus_region}</span>
                )}
              </div>
              <p className="mt-1 text-[12px] text-[#9CA3AF]">Practitioner: {practitionerName}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
