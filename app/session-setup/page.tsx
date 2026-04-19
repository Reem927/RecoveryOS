"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
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
import { useActiveSession } from "@/lib/active-session"

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
]

export default function SessionSetupPage() {
  const router = useRouter()
  const { startSession } = useActiveSession()

  const [clientType, setClientType] = useState<ClientType>("existing")
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string>("alex-morgan")
  const [newName, setNewName] = useState("")
  const [newAge, setNewAge] = useState("")
  const [newFocus, setNewFocus] = useState("")

  const filteredClients = useMemo(() => {
    const q = query.trim().toLowerCase()

    if (!q) {
      return clients
    }

    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(q) ||
        client.tags.some((tag) => tag.toLowerCase().includes(q)),
    )
  }, [query])

  const selectedClient =
    clients.find((client) => client.id === selectedId) ?? clients[0]

  const canContinue =
    clientType === "guest" ||
    (clientType === "existing" && Boolean(selectedClient)) ||
    (clientType === "new" && newName.trim().length > 0)

  const getPatientForSession = () => {
    if (clientType === "existing") {
      return {
        patientId: selectedClient.id,
        patientName: selectedClient.name,
      }
    }

    if (clientType === "new") {
      return {
        patientId: `new-${Date.now()}`,
        patientName: newName.trim() || "New client",
      }
    }

    return {
      patientId: "guest",
      patientName: "Guest session",
    }
  }

  const handleQuickStart = () => {
    if (!canContinue) return

    const patient = getPatientForSession()

    startSession({
      patientId: patient.patientId,
      patientName: patient.patientName,
      protocol: "H3-Beta · 18 min",
      room: "Room 2",
    })

    router.push("/session")
  }

  return (
    <AppShell
      title="Session setup"
      eyebrow="Step 1 of 2 · Prepare session"
      actions={
        <Link
          href="/dashboard"
          className="inline-flex h-10 items-center rounded-[10px] border border-black/[0.07] bg-white px-3 text-[12.5px] font-medium text-[#374151] hover:border-black/10"
        >
          Cancel
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-6">
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
            </header>

            <div className="p-5">
              <div className="grid grid-cols-3 gap-2 rounded-[10px] border border-black/[0.06] bg-[#F5F0EA] p-1">
                <ClientTypeButton
                  active={clientType === "existing"}
                  onClick={() => setClientType("existing")}
                  label="Existing client"
                  icon={<Users className="h-4 w-4" />}
                />

                <ClientTypeButton
                  active={clientType === "new"}
                  onClick={() => setClientType("new")}
                  label="New client"
                  icon={<UserPlus className="h-4 w-4" />}
                />

                <ClientTypeButton
                  active={clientType === "guest"}
                  onClick={() => setClientType("guest")}
                  label="Guest session"
                  icon={<UserRound className="h-4 w-4" />}
                />
              </div>

              {clientType === "existing" && (
                <div className="mt-5 space-y-4">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search clients by name or tag..."
                      className="h-11 w-full rounded-[10px] border border-black/[0.07] bg-white pl-9 pr-3 text-[14px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/15"
                    />
                  </div>

                  <ul className="max-h-[360px] divide-y divide-black/[0.05] overflow-y-auto rounded-[10px] border border-black/[0.06]">
                    {filteredClients.map((client) => {
                      const active = selectedId === client.id

                      return (
                        <li key={client.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedId(client.id)}
                            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                              active
                                ? "bg-[#C97A56]/10"
                                : "hover:bg-[#F2EDE6]/60"
                            }`}
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#C97A56]/70 to-[#162532]/70 text-[12px] font-semibold text-white ring-2 ring-white">
                              {client.name
                                .split(" ")
                                .map((part) => part[0])
                                .join("")
                                .slice(0, 2)}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <div className="truncate text-[13.5px] font-semibold text-[#1F2937]">
                                  {client.name}
                                </div>
                                <span className="text-[11px] text-[#9CA3AF]">
                                  · {client.age}y
                                </span>
                              </div>

                              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                                <span className="text-[11px] text-[#6B7280]">
                                  Last session: {client.lastSession}
                                </span>

                                {client.tags.slice(0, 2).map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-[5px] bg-[#F2EDE6] px-1.5 py-0.5 text-[10.5px] font-medium text-[#6B7280]"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-full border ${
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

              {clientType === "new" && (
                <div className="mt-5 space-y-4 rounded-[10px] border border-dashed border-black/[0.1] bg-[#F5F0EA]/50 p-5">
                  <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                    <Info className="h-3.5 w-3.5 text-[#C97A56]" />
                    Minimal intake. You can complete the full chart after the
                    session.
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                        Full name
                      </span>
                      <input
                        value={newName}
                        onChange={(event) => setNewName(event.target.value)}
                        placeholder="e.g. Jordan Reyes"
                        className="h-11 w-full rounded-[10px] border border-black/[0.07] bg-white px-3.5 text-[14px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/15"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                        Age
                      </span>
                      <input
                        value={newAge}
                        onChange={(event) => setNewAge(event.target.value)}
                        inputMode="numeric"
                        placeholder="34"
                        className="h-11 w-full rounded-[10px] border border-black/[0.07] bg-white px-3.5 text-[14px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/15"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                      Notes / focus area
                    </span>
                    <textarea
                      value={newFocus}
                      onChange={(event) => setNewFocus(event.target.value)}
                      rows={3}
                      placeholder="e.g. Post-op shoulder, limited external rotation."
                      className="w-full rounded-[10px] border border-black/[0.07] bg-white px-3.5 py-2.5 text-[13.5px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/15"
                    />
                  </label>
                </div>
              )}

              {clientType === "guest" && (
                <div className="mt-5 flex items-start gap-3 rounded-[10px] border border-[#F0A500]/25 bg-[#F0A500]/10 p-4">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#F0A500]/20 text-[#c47f00]">
                    <Info className="h-4 w-4" />
                  </span>

                  <div>
                    <div className="text-[13.5px] font-semibold text-[#1F2937]">
                      Proceeding as guest
                    </div>
                    <div className="mt-0.5 text-[12.5px] text-[#6B7280]">
                      No history will be saved. Results remain on this device
                      for this session only.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

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
              <Link
                href={canContinue ? "/scan" : "#"}
                aria-disabled={!canContinue}
                className={`group relative overflow-hidden rounded-[14px] border bg-[#162532] p-5 text-white transition-transform ${
                  canContinue
                    ? "border-[#C97A56]/40 hover:-translate-y-0.5"
                    : "pointer-events-none cursor-not-allowed border-white/5 opacity-60"
                }`}
              >
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
                  Analyze movement with the camera and AI, then auto-generate a
                  recommended session.
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
              </Link>

              <button
                type="button"
                onClick={handleQuickStart}
                disabled={!canContinue}
                className={`group relative overflow-hidden rounded-[14px] border bg-white p-5 text-left transition-transform ${
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
                  Skip the scan and start the session immediately with the
                  default protocol.
                </p>

                <div className="mt-5 flex items-center justify-between text-[12px] text-[#6B7280]">
                  <span className="inline-flex items-center gap-1.5">
                    <ClipboardCheck className="h-3.5 w-3.5 text-[#C97A56]" />
                    H3-Beta · 18 min
                  </span>

                  <span className="inline-flex items-center gap-1 font-semibold text-[#1F2937] transition-transform group-hover:translate-x-0.5">
                    Start <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </button>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[12px] border border-black/[0.07] bg-white">
            <div className="border-b border-black/[0.06] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                Selected client
              </p>
            </div>

            <div className="p-4">
              {clientType === "existing" && (
                <ClientPreview client={selectedClient} />
              )}

              {clientType === "new" && (
                <div>
                  <div className="text-[14.5px] font-semibold text-[#1F2937]">
                    {newName.trim() || "New client"}
                  </div>
                  <div className="mt-1 text-[12.5px] text-[#6B7280]">
                    {newAge ? `${newAge} years` : "Age not set"} · Intake in
                    progress
                  </div>
                  <div className="mt-4 rounded-[10px] border border-dashed border-black/[0.1] bg-[#F5F0EA]/40 px-3 py-2.5 text-[12.5px] text-[#6B7280]">
                    {newFocus.trim()
                      ? newFocus
                      : "No focus notes yet. You can add details as you go."}
                  </div>
                </div>
              )}

              {clientType === "guest" && (
                <div>
                  <div className="text-[14.5px] font-semibold text-[#1F2937]">
                    Guest session
                  </div>
                  <div className="mt-1 text-[12.5px] text-[#6B7280]">
                    Results can be reviewed at the end of the session.
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[12px] border border-[#C97A56]/25 bg-gradient-to-b from-[#C97A56]/10 to-transparent p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#B86A48]">
              Fast path
            </div>
            <h3 className="mt-1 text-[15px] font-semibold text-[#1F2937]">
              Start from the sidebar too
            </h3>
            <p className="mt-1 text-[12.5px] leading-relaxed text-[#6B7280]">
              The sidebar Start Live Session button uses Alex Morgan and the
              default H3-Beta protocol.
            </p>
          </section>
        </aside>
      </div>
    </AppShell>
  )
}

function StepDot({ number }: { number: number }) {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C97A56]/12 text-[12px] font-semibold text-[#B86A48]">
      {number}
    </span>
  )
}

function ClientTypeButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean
  onClick: () => void
  label: string
  icon: React.ReactNode
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
      <span className={active ? "text-[#C97A56]" : "text-[#9CA3AF]"}>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  )
}

function ClientPreview({ client }: { client: ClientRecord }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#C97A56]/70 to-[#162532]/70 text-[12px] font-semibold text-white ring-2 ring-white">
          {client.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)}
        </div>

        <div className="min-w-0">
          <div className="truncate text-[14.5px] font-semibold text-[#1F2937]">
            {client.name}
          </div>
          <div className="text-[11.5px] text-[#9CA3AF]">
            {client.age} years · Last session {client.lastSession}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[10px] border border-black/[0.06] bg-white p-3">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
            Last score
          </div>
          <div className="mt-1 text-[16px] font-semibold text-[#1F2937]">
            {client.lastScore || "—"}
          </div>
        </div>

        <div className="rounded-[10px] border border-black/[0.06] bg-white p-3">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
            Last protocol
          </div>
          <div className="mt-1 truncate text-[13px] font-semibold text-[#1F2937]">
            {client.lastProtocol}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {client.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-[6px] bg-[#F2EDE6] px-2 py-0.5 text-[11px] font-medium text-[#6B7280]"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}