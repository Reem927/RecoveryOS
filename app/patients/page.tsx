"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Filter,
  HeartPulse,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react"
import { AppShell } from "@/components/hydrawav3/app-shell"
import { patients, type CareStatus, type Patient } from "@/lib/patients"

type StatusFilter = "all" | CareStatus

const statusLabel: Record<CareStatus, string> = {
  active: "Active care",
  new: "New intake",
  maintenance: "Maintenance",
  paused: "Paused",
}

const statusTone: Record<CareStatus, string> = {
  active: "bg-[#27AE60]/12 text-[#1f8e4a]",
  new: "bg-[#F0A500]/14 text-[#c47f00]",
  maintenance: "bg-[#6C5CE7]/12 text-[#5344c9]",
  paused: "bg-[#1F2937]/8 text-[#374151]",
}

const filters: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "new", label: "New" },
  { id: "maintenance", label: "Maintenance" },
  { id: "paused", label: "Paused" },
]

function scoreBadge(p: Patient) {
  if (!p.stats.recoveryScore) {
    return (
      <span className="inline-flex items-center rounded-[6px] bg-[#1F2937]/6 px-2 py-0.5 text-[11px] font-medium text-[#374151]">
        No baseline
      </span>
    )
  }
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[14px] font-semibold tabular-nums text-[#1F2937]">
        {p.stats.recoveryScore}
      </span>
      <span className="text-[11px] text-[#9CA3AF]">/ 100</span>
    </div>
  )
}

function deltaChip(delta: string) {
  if (delta === "—" || delta === "0") {
    return (
      <span className="inline-flex items-center rounded-[6px] bg-[#1F2937]/6 px-1.5 py-0.5 text-[10px] font-semibold text-[#374151]">
        —
      </span>
    )
  }
  const positive = delta.startsWith("+")
  const Icon = positive ? TrendingUp : TrendingDown
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[6px] px-1.5 py-0.5 text-[10px] font-semibold ${
        positive ? "bg-[#27AE60]/12 text-[#1f8e4a]" : "bg-[#E74C3C]/12 text-[#c0392b]"
      }`}
    >
      <Icon className="h-3 w-3" />
      {delta}
    </span>
  )
}

export default function PatientsListPage() {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return patients.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        p.focus.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [query, statusFilter])

  const counts = useMemo(
    () => ({
      total: patients.length,
      active: patients.filter((p) => p.status === "active").length,
      new: patients.filter((p) => p.status === "new").length,
      avgScore: Math.round(
        patients
          .filter((p) => p.stats.recoveryScore > 0)
          .reduce((sum, p) => sum + p.stats.recoveryScore, 0) /
          patients.filter((p) => p.stats.recoveryScore > 0).length,
      ),
    }),
    [],
  )

  return (
    <AppShell
      title="Clients"
      eyebrow="Caseload · All clinics"
      breadcrumbs={[{ label: "Clients" }]}
      actions={
        <Link
          href="/session-setup"
          className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#C97A56] px-4 text-[13px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(201,122,86,0.7)] hover:bg-[#B86A48]"
        >
          <Plus className="h-4 w-4" />
          New client
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Summary strip */}
        <section className="grid gap-3 md:grid-cols-4">
          <div className="rounded-[12px] border border-black/[0.07] bg-white px-4 py-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
              <Users className="h-3.5 w-3.5" /> Total
            </div>
            <div className="mt-1 text-[20px] font-semibold tabular-nums text-[#1F2937]">
              {counts.total}
            </div>
          </div>
          <div className="rounded-[12px] border border-black/[0.07] bg-white px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
              Active care
            </div>
            <div className="mt-1 text-[20px] font-semibold tabular-nums text-[#1F2937]">
              {counts.active}
            </div>
          </div>
          <div className="rounded-[12px] border border-black/[0.07] bg-white px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
              New intakes
            </div>
            <div className="mt-1 text-[20px] font-semibold tabular-nums text-[#1F2937]">
              {counts.new}
            </div>
          </div>
          <div className="rounded-[12px] border border-black/[0.07] bg-white px-4 py-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
              <HeartPulse className="h-3.5 w-3.5" /> Avg recovery
            </div>
            <div className="mt-1 text-[20px] font-semibold tabular-nums text-[#1F2937]">
              {counts.avgScore}
              <span className="ml-1 text-[12px] font-normal text-[#9CA3AF]">/ 100</span>
            </div>
          </div>
        </section>

        {/* Filters + search */}
        <section className="rounded-[12px] border border-black/[0.07] bg-white">
          <div className="flex flex-col gap-3 border-b border-black/[0.06] px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 overflow-x-auto">
              {filters.map((f) => {
                const active = statusFilter === f.id
                return (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[8px] border px-3 text-[12px] font-medium transition-colors ${
                      active
                        ? "border-[#C97A56] bg-[#C97A56]/10 text-[#B86A48]"
                        : "border-black/[0.07] bg-white text-[#374151] hover:border-black/10"
                    }`}
                  >
                    {f.label}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, tag, focus…"
                  className="h-9 w-72 rounded-[9px] border border-black/[0.08] bg-white pl-8 pr-3 text-[12.5px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/15"
                />
              </div>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1.5 rounded-[9px] border border-black/[0.07] bg-white px-3 text-[12px] font-medium text-[#374151] hover:border-black/10"
              >
                <Filter className="h-3.5 w-3.5" />
                More
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="hidden grid-cols-[1.4fr_1.2fr_0.9fr_0.9fr_1.1fr_0.3fr] items-center gap-4 border-b border-black/[0.05] px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF] md:grid">
            <div>Client</div>
            <div>Focus</div>
            <div>Recovery</div>
            <div>Trend</div>
            <div>Next visit</div>
            <div />
          </div>

          {filtered.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#F2EDE6]">
                <Users className="h-5 w-5 text-[#C97A56]" />
              </div>
              <p className="text-[14px] font-medium text-[#1F2937]">No clients match</p>
              <p className="mt-1 text-[12.5px] text-[#6B7280]">
                Try clearing filters or a different search term.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-black/[0.05]">
              {filtered.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/patients/${p.id}`}
                    className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-[#F2EDE6]/40 md:grid-cols-[1.4fr_1.2fr_0.9fr_0.9fr_1.1fr_0.3fr]"
                  >
                    {/* Patient identity */}
                    <div className="flex items-center gap-3">
                      <div
                        aria-hidden
                        className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-[#C97A56] to-[#7a3d22] ring-2 ring-white shadow-sm"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[14px] font-semibold text-[#1F2937]">
                            {p.name}
                          </span>
                          <span
                            className={`hidden rounded-[6px] px-2 py-0.5 text-[10.5px] font-medium md:inline-flex ${statusTone[p.status]}`}
                          >
                            {statusLabel[p.status]}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[11.5px] text-[#9CA3AF]">
                          <span>
                            {p.age} · {p.sex}
                          </span>
                          <span className="hidden md:inline">· Last {p.lastSession}</span>
                        </div>
                      </div>
                    </div>

                    {/* Focus / tags */}
                    <div className="hidden min-w-0 md:block">
                      <div className="truncate text-[13px] text-[#1F2937]">{p.focus}</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {p.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="rounded-[6px] bg-[#F2EDE6] px-1.5 py-0.5 text-[10.5px] font-medium text-[#7a4a33]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Recovery score */}
                    <div className="hidden md:block">{scoreBadge(p)}</div>

                    {/* Trend delta */}
                    <div className="hidden md:flex md:items-center md:gap-2">
                      {deltaChip(p.stats.scoreDelta)}
                      <span className="text-[11.5px] text-[#9CA3AF]">8 wk</span>
                    </div>

                    {/* Next visit */}
                    <div className="hidden md:flex md:items-center md:gap-2 md:text-[12.5px] md:text-[#374151]">
                      <CalendarDays className="h-3.5 w-3.5 text-[#C97A56]" />
                      {p.nextAppointment}
                    </div>

                    <div className="flex items-center justify-end text-[#9CA3AF]">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {filtered.length > 0 && (
            <div className="flex items-center justify-between border-t border-black/[0.05] px-5 py-3 text-[12px] text-[#6B7280]">
              <span>
                Showing {filtered.length} of {patients.length} clients
              </span>
              <Link
                href="/session-setup"
                className="inline-flex items-center gap-1 font-medium text-[#C97A56] hover:text-[#B86A48]"
              >
                Start a session
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  )
}
