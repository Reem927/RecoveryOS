"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  ClipboardCheck,
  HeartPulse,
  Plus,
  Users,
  Waves,
} from "lucide-react"
import { AppShell } from "@/components/hydrawav3/app-shell"
import { StatCard } from "@/components/hydrawav3/stat-card"
import { useUser } from "@clerk/nextjs"

type Client = {
  id: string
  full_name: string
  focus_region: string | null
  email: string | null
  created_at: string
}

type Assessment = {
  id: string
  patient_id: string
  primary_area: string | null
  created_at: string
  ai_summary: {
    primary_focus_area?: string
    protocol_recommendation?: { name: string }
  } | null
}

export default function DashboardPage() {
  const { user } = useUser()
  const [clients, setClients] = useState<Client[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/assessments/recent").then((r) => r.json()),
    ]).then(([clientData, assessmentData]) => {
      if (Array.isArray(clientData)) setClients(clientData)
      if (Array.isArray(assessmentData)) setAssessments(assessmentData)
    }).finally(() => setLoading(false))
  }, [])

  const clientMap = new Map(clients.map((c) => [c.id, c]))

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 17) return "Good afternoon"
    return "Good evening"
  })()

  const displayName = user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "there"

  return (
    <AppShell
      title={`${greeting}, ${displayName}`}
      eyebrow={new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
      actions={
        <Link
          href="/session-setup"
          className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#C97A56] px-4 text-[13px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(201,122,86,0.7)] transition-colors hover:bg-[#B86A48]"
        >
          <Plus className="h-4 w-4" />
          New session
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Stats */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total clients"
            value={loading ? "—" : clients.length}
            icon={Users}
            tint="accent"
            footnote="Active roster"
          />
          <StatCard
            label="Assessments"
            value={loading ? "—" : assessments.length}
            icon={HeartPulse}
            tint="success"
            footnote="All time"
          />
          <StatCard
            label="This week"
            value={loading ? "—" : assessments.filter((a) => {
              const d = new Date(a.created_at)
              const now = new Date()
              const weekAgo = new Date(now)
              weekAgo.setDate(now.getDate() - 7)
              return d >= weekAgo
            }).length}
            icon={Waves}
            tint="purple"
            footnote="Recent assessments"
          />
          <StatCard
            label="AI summaries"
            value={loading ? "—" : assessments.filter((a) => a.ai_summary).length}
            icon={ClipboardCheck}
            tint="warning"
            footnote="With recovery insights"
          />
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Recent clients */}
          <section className="rounded-[12px] border border-black/[0.07] bg-white">
            <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                  Client roster
                </p>
                <h2 className="mt-1 text-[16px] font-semibold tracking-tight text-[#1F2937]">
                  {loading ? "Loading…" : `${clients.length} client${clients.length !== 1 ? "s" : ""}`}
                </h2>
              </div>
              <Link
                href="/clients"
                className="text-[12px] font-medium text-[#C97A56] hover:text-[#B86A48]"
              >
                View all
              </Link>
            </div>

            {loading && (
              <div className="px-5 py-8 text-center text-sm text-[#9CA3AF]">Loading clients…</div>
            )}

            {!loading && clients.length === 0 && (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-[#9CA3AF]">No clients yet.</p>
                <Link
                  href="/clients/new"
                  className="mt-2 inline-flex text-sm font-medium text-[#C97A56] hover:text-[#B86A48]"
                >
                  Add your first client →
                </Link>
              </div>
            )}

            <ul className="divide-y divide-black/[0.05]">
              {clients.slice(0, 6).map((client) => {
                const initials = client.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
                return (
                  <li
                    key={client.id}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[#F2EDE6]/60"
                  >
                    <div className="h-9 w-9 shrink-0 rounded-full bg-[#C97A56]/15 flex items-center justify-center text-[12px] font-semibold text-[#C97A56]">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-semibold text-[#1F2937]">
                        {client.full_name}
                      </div>
                      <div className="truncate text-[12px] text-[#6B7280] capitalize">
                        {client.focus_region ?? client.email ?? "No focus area set"}
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className="inline-flex h-8 items-center gap-1 rounded-[8px] border border-black/[0.07] bg-white px-2.5 text-[12px] font-medium text-[#1F2937] transition-colors hover:border-[#C97A56]/40 hover:text-[#C97A56]"
                    >
                      Open
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>

          {/* Recent assessments */}
          <section className="space-y-6">
            <div className="rounded-[12px] border border-black/[0.07] bg-white">
              <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                    Recent assessments
                  </p>
                  <h3 className="mt-1 text-[15px] font-semibold tracking-tight text-[#1F2937]">
                    Latest recovery insights
                  </h3>
                </div>
              </div>

              {loading && (
                <div className="px-5 py-8 text-center text-sm text-[#9CA3AF]">Loading…</div>
              )}

              {!loading && assessments.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-[#9CA3AF]">
                  No assessments yet. Open a client to create one.
                </div>
              )}

              <ul className="divide-y divide-black/[0.05]">
                {assessments.slice(0, 5).map((assessment) => {
                  const client = clientMap.get(assessment.patient_id)
                  const protocolName = assessment.ai_summary?.protocol_recommendation?.name
                  return (
                    <li key={assessment.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#F2EDE6] text-[11px] font-semibold text-[#C97A56] capitalize shrink-0">
                        {(assessment.primary_area ?? "—").slice(0, 3)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-semibold text-[#1F2937]">
                          {client?.full_name ?? "Unknown client"}
                        </div>
                        <div className="truncate text-[11px] text-[#9CA3AF]">
                          {protocolName ?? assessment.primary_area ?? "Assessment"}
                        </div>
                      </div>
                      <span className="text-[11px] text-[#9CA3AF] shrink-0">
                        {new Date(assessment.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Quick start */}
            <div className="relative overflow-hidden rounded-[12px] border border-black/[0.07] bg-[#162532] p-5 text-white">
              <div
                aria-hidden
                className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#C97A56]/25 blur-3xl"
              />
              <div className="relative">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">
                  Quick start
                </p>
                <h3 className="mt-1 text-[18px] font-semibold tracking-tight">
                  Start a session
                </h3>
                <p className="mt-1 text-[13px] text-white/60">
                  Select a client and protocol to begin a new recovery session.
                </p>
                <div className="mt-5">
                  <Link
                    href="/session-setup"
                    className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#C97A56] px-4 text-[13px] font-semibold text-white hover:bg-[#B86A48]"
                  >
                    <Plus className="h-4 w-4" />
                    Set up session
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  )
}
