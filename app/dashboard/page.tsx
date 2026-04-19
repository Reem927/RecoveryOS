<<<<<<< HEAD
import { redirect } from "next/navigation"

export default function DashboardRedirectPage() {
  redirect("/")
}
=======
import Link from "next/link"
import {
  Activity,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  HeartPulse,
  MoreHorizontal,
  Plus,
  ScanLine,
  Users,
  Waves,
} from "lucide-react"
import { AppShell } from "@/components/hydrawav3/app-shell"
import { StatCard } from "@/components/hydrawav3/stat-card"

const todaysSchedule = [
  {
    time: "09:00",
    name: "Alex Morgan",
    status: "Pre-check ready",
    statusTone: "accent",
    reason: "Post-op shoulder · Week 4",
    href: "/patients/alex-morgan",
  },
  {
    time: "10:15",
    name: "Priya Chandra",
    status: "Scanned",
    statusTone: "success",
    reason: "Marathon recovery · Low HRV",
  },
  {
    time: "11:30",
    name: "Marcus Lee",
    status: "Awaiting intake",
    statusTone: "warning",
    reason: "New patient · Lower back",
  },
  {
    time: "13:00",
    name: "Sofia Alvarez",
    status: "In session",
    statusTone: "live",
    reason: "Protocol H3-Alpha · 00:12:34",
  },
  {
    time: "14:30",
    name: "Jordan Reyes",
    status: "Scheduled",
    statusTone: "muted",
    reason: "Cervical mobility reassessment",
  },
]

const statusStyles: Record<string, string> = {
  accent: "bg-[#C97A56]/12 text-[#B86A48]",
  success: "bg-[#27AE60]/12 text-[#1f8e4a]",
  warning: "bg-[#F0A500]/14 text-[#c47f00]",
  live: "bg-[#E74C3C]/12 text-[#c0392b]",
  muted: "bg-[#1F2937]/6 text-[#374151]",
}

const recentScans = [
  {
    patient: "Priya Chandra",
    score: 78,
    delta: "+6",
    protocol: "H3-Beta · 18 min",
    time: "12m ago",
  },
  {
    patient: "David Park",
    score: 64,
    delta: "-3",
    protocol: "H3-Alpha · 22 min",
    time: "41m ago",
  },
  {
    patient: "Amira Hassan",
    score: 91,
    delta: "+9",
    protocol: "H3-Gamma · 14 min",
    time: "2h ago",
  },
  {
    patient: "Tomás Oliveira",
    score: 72,
    delta: "+2",
    protocol: "H3-Beta · 18 min",
    time: "3h ago",
  },
]

export default function DashboardPage() {
  return (
    <AppShell
      title="Good morning, Dr. Ruiz"
      eyebrow="Monday · 21 April 2026"
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
        {/* Hero summary */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Patients today"
            value={12}
            delta="+2"
            trend="up"
            icon={Users}
            tint="accent"
            footnote="4 new intakes"
          />
          <StatCard
            label="Avg recovery score"
            value="78"
            unit="/ 100"
            delta="+4.2%"
            trend="up"
            icon={HeartPulse}
            tint="success"
            footnote="vs last week"
          />
          <StatCard
            label="Sessions completed"
            value={37}
            delta="+11"
            trend="up"
            icon={Waves}
            tint="purple"
            footnote="This week"
          />
          <StatCard
            label="Pre-checks pending"
            value={3}
            delta="-1"
            trend="down"
            icon={ClipboardCheck}
            tint="warning"
            footnote="Clear before 13:00"
          />
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Schedule */}
          <section className="rounded-[12px] border border-black/[0.07] bg-white">
            <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                  Today&apos;s schedule
                </p>
                <h2 className="mt-1 text-[16px] font-semibold tracking-tight text-[#1F2937]">
                  5 patients · 2h 45m booked
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex h-9 items-center gap-1.5 rounded-[8px] border border-black/[0.07] bg-white px-3 text-[12px] font-medium text-[#374151] hover:border-black/10">
                  <CalendarClock className="h-3.5 w-3.5 text-[#C97A56]" />
                  Day view
                </button>
                <button
                  type="button"
                  aria-label="More"
                  className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-black/[0.07] bg-white text-[#374151] hover:border-black/10"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            <ul className="divide-y divide-black/[0.05]">
              {todaysSchedule.map((slot) => (
                <li
                  key={slot.time + slot.name}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[#F2EDE6]/60"
                >
                  <div className="w-14 shrink-0 text-[13px] font-semibold tabular-nums text-[#1F2937]">
                    {slot.time}
                  </div>
                  <div
                    aria-hidden
                    className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-[#C97A56]/60 to-[#162532]/70 ring-2 ring-white"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-semibold text-[#1F2937]">
                      {slot.name}
                    </div>
                    <div className="truncate text-[12px] text-[#6B7280]">{slot.reason}</div>
                  </div>
                  <span
                    className={`hidden rounded-[6px] px-2 py-1 text-[11px] font-medium md:inline-flex ${statusStyles[slot.statusTone]}`}
                  >
                    {slot.statusTone === "live" && (
                      <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-[#E74C3C]" />
                    )}
                    {slot.status}
                  </span>
                  <Link
                    href={slot.href ?? "#"}
                    className="inline-flex h-8 items-center gap-1 rounded-[8px] border border-black/[0.07] bg-white px-2.5 text-[12px] font-medium text-[#1F2937] transition-colors hover:border-[#C97A56]/40 hover:text-[#C97A56]"
                  >
                    Open
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Right rail */}
          <section className="space-y-6">
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
                  Next: Alex Morgan
                </h3>
                <p className="mt-1 text-[13px] text-white/60">
                  Post-op shoulder · Week 4 of 12. Pre-check can be completed in ~90 seconds.
                </p>
                <div className="mt-5 flex items-center gap-2">
                  <Link
                    href="/session-setup"
                    className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#C97A56] px-4 text-[13px] font-semibold text-white hover:bg-[#B86A48]"
                  >
                    <ScanLine className="h-4 w-4" />
                    Set up session
                  </Link>
                  <Link
                    href="/patients/alex-morgan"
                    className="inline-flex h-10 items-center rounded-[10px] border border-white/15 bg-white/[0.04] px-3 text-[13px] font-medium text-white/80 hover:bg-white/[0.08]"
                  >
                    View chart
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent scans */}
            <div className="rounded-[12px] border border-black/[0.07] bg-white">
              <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                    Recent scans
                  </p>
                  <h3 className="mt-1 text-[15px] font-semibold tracking-tight text-[#1F2937]">
                    Latest recovery scores
                  </h3>
                </div>
                <Link
                  href="/patients"
                  className="text-[12px] font-medium text-[#C97A56] hover:text-[#B86A48]"
                >
                  View all
                </Link>
              </div>
              <ul className="divide-y divide-black/[0.05]">
                {recentScans.map((row) => {
                  const deltaPositive = row.delta.startsWith("+")
                  return (
                    <li
                      key={row.patient}
                      className="flex items-center gap-3 px-5 py-3"
                    >
                      <div className="relative flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#F2EDE6] text-[13px] font-semibold text-[#1F2937]">
                        {row.score}
                        <span
                          className={`absolute -right-1 -top-1 rounded-full px-1 text-[9px] font-semibold ${
                            deltaPositive
                              ? "bg-[#27AE60] text-white"
                              : "bg-[#E74C3C] text-white"
                          }`}
                        >
                          {row.delta}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-semibold text-[#1F2937]">
                          {row.patient}
                        </div>
                        <div className="truncate text-[11px] text-[#9CA3AF]">
                          {row.protocol}
                        </div>
                      </div>
                      <span className="text-[11px] text-[#9CA3AF]">{row.time}</span>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* System status */}
            <div className="flex items-center gap-3 rounded-[12px] border border-[#27AE60]/20 bg-[#27AE60]/8 px-4 py-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1A7A45] text-white">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
              <div className="flex-1">
                <div className="text-[12px] font-semibold text-[#1F2937]">
                  Camera & sensors calibrated
                </div>
                <div className="text-[11px] text-[#6B7280]">
                  Room 2 · Last check 4 minutes ago
                </div>
              </div>
              <Activity className="h-4 w-4 text-[#27AE60]" />
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  )
}
>>>>>>> 33b5f22 (added landing page and fixed bugs)
