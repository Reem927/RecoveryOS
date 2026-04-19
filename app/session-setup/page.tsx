"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  HeartPulse,
  History,
  Info,
  ScanLine,
  Search,
  Sparkles,
  UserPlus,
  UserRound,
  Users,
  Zap,
} from "lucide-react"
import { AppShell } from "@/components/hydrawav3/app-shell"

type ClientType = "existing" | "new" | "guest"

type ClientRecord = {
  id: string
  name: string
  age: number
  lastSession: string
  lastScore: number
  lastProtocol: string
  tags: string[]
}

const clients: ClientRecord[] = [
  {
    id: "alex-morgan",
    name: "Alex Morgan",
    age: 34,
    lastSession: "3 days ago",
    lastScore: 78,
    lastProtocol: "H3-Alpha · 22 min",
    tags: ["Post-op shoulder", "Mobility"],
  },
  {
    id: "priya-chandra",
    name: "Priya Chandra",
    age: 29,
    lastSession: "Yesterday",
    lastScore: 82,
    lastProtocol: "H3-Beta · 18 min",
    tags: ["Marathon recovery", "Low HRV"],
  },
  {
    id: "marcus-lee",
    name: "Marcus Lee",
    age: 41,
    lastSession: "New client",
    lastScore: 0,
    lastProtocol: "—",
    tags: ["Lower back", "Intake pending"],
  },
  {
    id: "sofia-alvarez",
    name: "Sofia Alvarez",
    age: 52,
    lastSession: "6 days ago",
    lastScore: 71,
    lastProtocol: "H3-Alpha · 22 min",
    tags: ["Post-surgical", "Knee"],
  },
  {
    id: "amira-hassan",
    name: "Amira Hassan",
    age: 27,
    lastSession: "2 days ago",
    lastScore: 91,
    lastProtocol: "H3-Gamma · 14 min",
    tags: ["Athlete", "Maintenance"],
  },
  {
    id: "tomas-oliveira",
    name: "Tomás Oliveira",
    age: 45,
    lastSession: "4 days ago",
    lastScore: 72,
    lastProtocol: "H3-Beta · 18 min",
    tags: ["Cervical", "Desk worker"],
  },
  {
    id: "jordan-reyes",
    name: "Jordan Reyes",
    age: 38,
    lastSession: "1 week ago",
    lastScore: 74,
    lastProtocol: "H3-Alpha · 22 min",
    tags: ["Cervical mobility"],
  },
]

const recentClientIds = ["alex-morgan", "priya-chandra", "amira-hassan", "tomas-oliveira"]

export default function SessionSetupPage() {
  const [clientType, setClientType] = useState<ClientType>("existing")
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string>("alex-morgan")

  // New client form
  const [newName, setNewName] = useState("")
  const [newAge, setNewAge] = useState("")
  const [newFocus, setNewFocus] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return clients
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)),
    )
  }, [query])

  const selected = clients.find((c) => c.id === selectedId) ?? null

  const canContinue =
    (clientType === "existing" && !!selected) ||
    (clientType === "new" && newName.trim().length > 0) ||
    clientType === "guest"

  return (
    <AppShell
      title="Session setup"
      eyebrow="Step 1 of 2 · Prepare session"
      actions={
        <Link
          href="/"
          className="inline-flex h-10 items-center gap-1.5 rounded-[10px] border border-black/[0.07] bg-white px-3 text-[12.5px] font-medium text-[#374151] hover:border-black/10"
        >
          Cancel
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        {/* LEFT: configuration */}
        <div className="space-y-6">
          {/* Step 1 — Client type */}
          <section className="rounded-[12px] border border-black/[0.07] bg-white">
            <header className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
              <div className="flex items-center gap-3">
                <StepDot number={1} />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                    Select client type
                  </p>
                  <h2 className="mt-0.5 text-[15px] font-semibold tracking-tight text-[#1F2937]">
                    Who are we working with today?
                  </h2>
                </div>
              </div>
              <span className="hidden rounded-full bg-[#C97A56]/10 px-2.5 py-1 text-[11px] font-medium text-[#B86A48] sm:inline-flex">
                Decision-first
              </span>
            </header>

            <div className="p-5">
              <div className="grid grid-cols-3 gap-2 rounded-[10px] border border-black/[0.06] bg-[#F5F0EA] p-1">
                <SegButton
                  active={clientType === "existing"}
                  onClick={() => setClientType("existing")}
                  icon={Users}
                  label="Existing client"
                />
                <SegButton
                  active={clientType === "new"}
                  onClick={() => setClientType("new")}
                  icon={UserPlus}
                  label="New client"
                />
                <SegButton
                  active={clientType === "guest"}
                  onClick={() => setClientType("guest")}
                  icon={UserRound}
                  label="Guest session"
                />
              </div>

              {/* Existing */}
              {clientType === "existing" && (
                <div className="mt-5 space-y-4">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search clients by name or tag..."
                      className="h-11 w-full rounded-[10px] border border-black/[0.07] bg-white pl-9 pr-3 text-[14px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/15"
                    />
                  </div>

                  <ul className="max-h-[360px] divide-y divide-black/[0.05] overflow-y-auto rounded-[10px] border border-black/[0.06]">
                    {filtered.length === 0 && (
                      <li className="px-5 py-6 text-center text-[13px] text-[#6B7280]">
                        No clients match &quot;{query}&quot;.
                      </li>
                    )}
                    {filtered.map((c) => {
                      const active = selectedId === c.id
                      return (
                        <li key={c.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedId(c.id)}
                            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                              active
                                ? "bg-[#C97A56]/6"
                                : "hover:bg-[#F2EDE6]/60"
                            }`}
                          >
                            <div
                              aria-hidden
                              className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-[#C97A56]/70 to-[#162532]/70 ring-2 ring-white"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <div className="truncate text-[13.5px] font-semibold text-[#1F2937]">
                                  {c.name}
                                </div>
                                <span className="text-[11px] text-[#9CA3AF]">
                                  · {c.age}y
                                </span>
                              </div>
                              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                                <span className="text-[11px] text-[#6B7280]">
                                  Last session: {c.lastSession}
                                </span>
                                {c.tags.slice(0, 2).map((t) => (
                                  <span
                                    key={t}
                                    className="rounded-[5px] bg-[#F2EDE6] px-1.5 py-0.5 text-[10.5px] font-medium text-[#6B7280]"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                                active
                                  ? "border-[#C97A56] bg-[#C97A56] text-white"
                                  : "border-black/[0.12] bg-white text-transparent"
                              }`}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                            </div>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {/* New */}
              {clientType === "new" && (
                <div className="mt-5 space-y-4 rounded-[10px] border border-dashed border-black/[0.1] bg-[#F5F0EA]/50 p-5">
                  <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                    <Info className="h-3.5 w-3.5 text-[#C97A56]" />
                    Minimal intake — you can complete the full chart after the session.
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Labeled label="Full name">
                      <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Jordan Reyes"
                        className="h-11 w-full rounded-[10px] border border-black/[0.07] bg-white px-3.5 text-[14px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/15"
                      />
                    </Labeled>
                    <Labeled label="Age">
                      <input
                        value={newAge}
                        onChange={(e) => setNewAge(e.target.value)}
                        inputMode="numeric"
                        placeholder="34"
                        className="h-11 w-full rounded-[10px] border border-black/[0.07] bg-white px-3.5 text-[14px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/15"
                      />
                    </Labeled>
                  </div>
                  <Labeled label="Notes / focus area">
                    <textarea
                      value={newFocus}
                      onChange={(e) => setNewFocus(e.target.value)}
                      rows={3}
                      placeholder="e.g. Post-op shoulder, week 4. Limited external rotation."
                      className="w-full rounded-[10px] border border-black/[0.07] bg-white px-3.5 py-2.5 text-[13.5px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/15"
                    />
                  </Labeled>
                </div>
              )}

              {/* Guest */}
              {clientType === "guest" && (
                <div className="mt-5 flex items-start gap-3 rounded-[10px] border border-[#F0A500]/25 bg-[#F0A500]/8 p-4">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#F0A500]/20 text-[#c47f00]">
                    <Info className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-[13.5px] font-semibold text-[#1F2937]">
                      Proceeding as guest
                    </div>
                    <div className="mt-0.5 text-[12.5px] text-[#6B7280]">
                      No history will be saved. Results remain on this device for the duration of
                      the session only.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Step 2 — Session type */}
          <section className="rounded-[12px] border border-black/[0.07] bg-white">
            <header className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
              <div className="flex items-center gap-3">
                <StepDot number={2} />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                    Choose session type
                  </p>
                  <h2 className="mt-0.5 text-[15px] font-semibold tracking-tight text-[#1F2937]">
                    How would you like to start?
                  </h2>
                </div>
              </div>
            </header>

            <div className="grid gap-4 p-5 md:grid-cols-2">
              {/* Primary — Guided */}
              <Link
                href={canContinue ? "/scan" : "#"}
                aria-disabled={!canContinue}
                className={`group relative overflow-hidden rounded-[14px] border bg-[#162532] p-5 text-white transition-transform ${
                  canContinue
                    ? "border-[#C97A56]/40 hover:-translate-y-0.5"
                    : "cursor-not-allowed border-white/5 opacity-60"
                }`}
              >
                <div
                  aria-hidden
                  className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#C97A56]/25 blur-3xl"
                />
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#C97A56]/20 text-[#C97A56] ring-1 ring-[#C97A56]/30">
                      <ScanLine className="h-[18px] w-[18px]" />
                    </span>
                    <span className="rounded-full bg-[#C97A56] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                      Recommended
                    </span>
                  </div>
                  <h3 className="mt-4 text-[18px] font-semibold tracking-tight">
                    Guided Assessment
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-white/65">
                    Analyze movement with the camera and AI, then auto-generate a recommended
                    session.
                  </p>
                  <div className="mt-5 flex items-center justify-between text-[12px] text-white/55">
                    <span className="inline-flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[#C97A56]" />
                      ~90 seconds
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#C97A56] transition-transform group-hover:translate-x-0.5">
                      Start <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>

              {/* Secondary — Quick start */}
              <Link
                href={canContinue ? "/session" : "#"}
                aria-disabled={!canContinue}
                className={`group relative overflow-hidden rounded-[14px] border bg-white p-5 transition-transform ${
                  canContinue
                    ? "border-black/[0.08] hover:-translate-y-0.5 hover:border-[#C97A56]/40"
                    : "cursor-not-allowed opacity-60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#1F2937]/5 text-[#1F2937] ring-1 ring-black/[0.06]">
                    <Zap className="h-[18px] w-[18px]" />
                  </span>
                  <span className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                    Manual
                  </span>
                </div>
                <h3 className="mt-4 text-[18px] font-semibold tracking-tight text-[#1F2937]">
                  Quick Start Session
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-[#6B7280]">
                  Skip the scan — manually configure the protocol and start the session immediately.
                </p>
                <div className="mt-5 flex items-center justify-between text-[12px] text-[#6B7280]">
                  <span className="inline-flex items-center gap-1.5">
                    <ClipboardCheck className="h-3.5 w-3.5 text-[#C97A56]" />
                    Choose protocol manually
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#1F2937] transition-transform group-hover:translate-x-0.5">
                    Start <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </div>

            {!canContinue && (
              <div className="border-t border-black/[0.06] bg-[#F5F0EA]/50 px-5 py-3 text-[12px] text-[#6B7280]">
                {clientType === "new"
                  ? "Enter at least a client name to continue."
                  : "Select a client to continue."}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT: context rail */}
        <aside className="space-y-6">
          {/* Resume last */}
          <div className="rounded-[12px] border border-[#C97A56]/25 bg-gradient-to-b from-[#C97A56]/8 to-transparent p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#C97A56]/15 text-[#C97A56]">
                <History className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#B86A48]">
                  Resume last session
                </div>
                <div className="mt-0.5 truncate text-[14px] font-semibold text-[#1F2937]">
                  Sofia Alvarez · Protocol H3-Alpha
                </div>
                <div className="text-[12px] text-[#6B7280]">
                  Paused at 12:34 · Room 2
                </div>
              </div>
            </div>
            <Link
              href="/session"
              className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[9px] bg-[#C97A56] text-[12.5px] font-semibold text-white hover:bg-[#B86A48]"
            >
              Resume session
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Selected client preview */}
          <div className="rounded-[12px] border border-black/[0.07] bg-white">
            <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                Selected client
              </p>
              {clientType === "existing" && selected && (
                <Link
                  href={`/patients/${selected.id}`}
                  className="text-[11.5px] font-medium text-[#C97A56] hover:text-[#B86A48]"
                >
                  Open chart
                </Link>
              )}
            </div>
            <div className="p-4">
              {clientType === "existing" && selected && (
                <ExistingPreview c={selected} />
              )}
              {clientType === "new" && (
                <NewPreview name={newName} age={newAge} focus={newFocus} />
              )}
              {clientType === "guest" && <GuestPreview />}
            </div>
          </div>

          {/* Recent clients */}
          <div className="rounded-[12px] border border-black/[0.07] bg-white">
            <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                Recent clients
              </p>
              <CalendarClock className="h-3.5 w-3.5 text-[#C97A56]" />
            </div>
            <ul className="divide-y divide-black/[0.05]">
              {recentClientIds.map((id) => {
                const c = clients.find((x) => x.id === id)!
                const active = selectedId === c.id && clientType === "existing"
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setClientType("existing")
                        setSelectedId(c.id)
                      }}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        active ? "bg-[#C97A56]/6" : "hover:bg-[#F2EDE6]/60"
                      }`}
                    >
                      <div
                        aria-hidden
                        className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-[#C97A56]/70 to-[#162532]/70 ring-2 ring-white"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-semibold text-[#1F2937]">
                          {c.name}
                        </div>
                        <div className="truncate text-[11px] text-[#9CA3AF]">
                          {c.lastSession} · score {c.lastScore}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>
      </div>
    </AppShell>
  )
}

/* ---------- helpers ---------- */

function StepDot({ number }: { number: number }) {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C97A56]/12 text-[12px] font-semibold text-[#B86A48]">
      {number}
    </span>
  )
}

function SegButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: typeof Users
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-[8px] px-3 py-2.5 text-[12.5px] font-semibold transition-colors ${
        active
          ? "bg-white text-[#1F2937] shadow-[0_2px_6px_-2px_rgba(0,0,0,0.08)]"
          : "text-[#6B7280] hover:text-[#1F2937]"
      }`}
    >
      <Icon className={`h-4 w-4 ${active ? "text-[#C97A56]" : "text-[#9CA3AF]"}`} />
      {label}
    </button>
  )
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
        {label}
      </span>
      {children}
    </label>
  )
}

function ExistingPreview({ c }: { c: ClientRecord }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <div
          aria-hidden
          className="h-11 w-11 rounded-full bg-gradient-to-br from-[#C97A56]/70 to-[#162532]/70 ring-2 ring-white"
        />
        <div className="min-w-0">
          <div className="truncate text-[14.5px] font-semibold text-[#1F2937]">{c.name}</div>
          <div className="text-[11.5px] text-[#9CA3AF]">
            {c.age} years · Last session {c.lastSession}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MiniStat
          icon={HeartPulse}
          label="Last score"
          value={c.lastScore ? `${c.lastScore}` : "—"}
          tone="accent"
        />
        <MiniStat icon={Sparkles} label="Last protocol" value={c.lastProtocol} tone="muted" />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {c.tags.map((t) => (
          <span
            key={t}
            className="rounded-[6px] bg-[#F2EDE6] px-2 py-0.5 text-[11px] font-medium text-[#6B7280]"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

function NewPreview({
  name,
  age,
  focus,
}: {
  name: string
  age: string
  focus: string
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#C97A56]/12 text-[#C97A56] ring-2 ring-white">
          <UserPlus className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-[14.5px] font-semibold text-[#1F2937]">
            {name.trim() || "New client"}
          </div>
          <div className="text-[11.5px] text-[#9CA3AF]">
            {age ? `${age} years` : "Age not set"} · Intake in progress
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-[10px] border border-dashed border-black/[0.1] bg-[#F5F0EA]/40 px-3 py-2.5 text-[12.5px] text-[#6B7280]">
        {focus.trim() ? focus : "No focus notes yet. You can add details as you go."}
      </div>
    </div>
  )
}

function GuestPreview() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F0A500]/15 text-[#c47f00] ring-2 ring-white">
        <UserRound className="h-5 w-5" />
      </div>
      <div>
        <div className="text-[14.5px] font-semibold text-[#1F2937]">Guest session</div>
        <div className="mt-0.5 text-[12.5px] text-[#6B7280]">
          Nothing is persisted. Export or discard results at the end of the session.
        </div>
      </div>
    </div>
  )
}

function MiniStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof HeartPulse
  label: string
  value: string
  tone: "accent" | "muted"
}) {
  const toneCls =
    tone === "accent"
      ? "bg-[#C97A56]/10 text-[#B86A48]"
      : "bg-black/[0.04] text-[#1F2937]"
  return (
    <div className="rounded-[10px] border border-black/[0.06] bg-white p-3">
      <div className="flex items-center gap-2">
        <span className={`flex h-6 w-6 items-center justify-center rounded-[6px] ${toneCls}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
          {label}
        </span>
      </div>
      <div className="mt-1.5 truncate text-[14px] font-semibold text-[#1F2937]">{value}</div>
    </div>
  )
}
