import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  HeartPulse,
  LineChart,
  Mail,
  Phone,
  ScanLine,
  Target,
  TrendingUp,
  Waves,
} from "lucide-react"
import { AppShell } from "@/components/hydrawav3/app-shell"
import { StatCard } from "@/components/hydrawav3/stat-card"
import { RecoveryTrendChart } from "@/components/hydrawav3/recovery-trend-chart"
import { getPatient, type CareStatus } from "@/lib/patients"

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

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const patient = getPatient(id)
  if (!patient) notFound()

  const hasHistory = patient.sessions.length > 0
  const hasTrend = patient.trend.length > 0
  const firstScore = hasTrend ? patient.trend[0].score : 0
  const latestScore = hasTrend ? patient.trend[patient.trend.length - 1].score : 0
  const liftedBy = hasTrend ? latestScore - firstScore : 0

  return (
    <AppShell
      title={patient.name}
      breadcrumbs={[
        { label: "Patients", href: "/patients" },
        { label: patient.name },
      ]}
      actions={
        <Link
          href="/assessment"
          className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#C97A56] px-4 text-[13px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(201,122,86,0.7)] hover:bg-[#B86A48]"
        >
          <ScanLine className="h-4 w-4" />
          Start pre-check
        </Link>
      }
    >
      <div className="space-y-6">
        <Link
          href="/patients"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#6B7280] transition-colors hover:text-[#C97A56]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All patients
        </Link>

        {/* Patient header */}
        <section className="overflow-hidden rounded-[12px] border border-black/[0.07] bg-white">
          <div className="relative h-28 bg-gradient-to-r from-[#162532] via-[#1A2E3B] to-[#162532]">
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(201,122,86,0.25),transparent_50%)]"
            />
          </div>
          <div className="flex flex-col gap-4 px-6 pb-5 md:flex-row md:items-end md:justify-between">
            <div className="-mt-10 flex items-end gap-4">
              <div
                aria-hidden
                className="h-20 w-20 shrink-0 rounded-[16px] border-4 border-white bg-gradient-to-br from-[#C97A56] to-[#7a3d22] shadow-lg"
              />
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-[22px] font-semibold tracking-tight text-[#1F2937]">
                    {patient.name}
                  </h2>
                  <span
                    className={`rounded-[6px] px-2 py-0.5 text-[11px] font-medium ${statusTone[patient.status]}`}
                  >
                    {statusLabel[patient.status]}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-[#6B7280]">
                  {patient.age} · {patient.sex} · {patient.focus} · Referred by {patient.referredBy}
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[12px] text-[#6B7280]">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> {patient.email}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> {patient.phone}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" /> Next: {patient.nextAppointment}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pb-1">
              <button className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-black/[0.07] bg-white px-3 text-[13px] font-medium text-[#374151] hover:border-black/10">
                <FileText className="h-4 w-4 text-[#C97A56]" />
                Notes
              </button>
              <button className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-black/[0.07] bg-white px-3 text-[13px] font-medium text-[#374151] hover:border-black/10">
                <ClipboardCheck className="h-4 w-4 text-[#C97A56]" />
                Intake form
              </button>
              <Link
                href="/session"
                className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#162532] px-3 text-[13px] font-semibold text-white hover:bg-[#0F1E28]"
              >
                <Waves className="h-4 w-4" />
                Start session
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Recovery score"
            value={patient.stats.recoveryScore || "—"}
            unit={patient.stats.recoveryScore ? "/ 100" : undefined}
            delta={patient.stats.scoreDelta}
            trend="up"
            icon={HeartPulse}
            tint="accent"
            footnote="8-week trend"
          />
          <StatCard
            label="Range of motion"
            value={patient.stats.rangeOfMotion}
            delta={patient.stats.romDelta}
            trend="up"
            icon={Activity}
            tint="success"
            footnote={patient.focus}
          />
          <StatCard
            label="Asymmetry index"
            value={patient.stats.asymmetry}
            delta={patient.stats.asymmetryDelta}
            trend="up"
            icon={TrendingUp}
            tint="purple"
            footnote="Target < 5%"
          />
          <StatCard
            label="Sessions completed"
            value={patient.stats.sessionsCompleted}
            delta={`of ${patient.stats.sessionsPlanned}`}
            trend="up"
            icon={Waves}
            tint="warning"
            footnote={`Plan of ${patient.stats.sessionsPlanned}`}
          />
        </section>

        {/* Progress: chart + goals */}
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <section className="rounded-[12px] border border-black/[0.07] bg-white p-5">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                  Progress · Recovery trajectory
                </p>
                <h3 className="mt-1 text-[16px] font-semibold tracking-tight text-[#1F2937]">
                  Score vs baseline cohort
                </h3>
                {hasTrend && (
                  <p className="mt-1 text-[12.5px] text-[#6B7280]">
                    {liftedBy >= 0 ? "+" : ""}
                    {liftedBy} points over 8 weeks · currently {latestScore}/100
                  </p>
                )}
              </div>
              <div className="hidden items-center gap-3 text-[12px] text-[#6B7280] md:flex">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-4 rounded bg-[#C97A56]" /> {patient.name.split(" ")[0]}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-4 rounded bg-[#162532]/40" /> Baseline
                </span>
              </div>
            </div>
            {hasTrend ? (
              <RecoveryTrendChart data={patient.trend} />
            ) : (
              <div className="flex h-[220px] flex-col items-center justify-center rounded-[10px] border border-dashed border-black/[0.08] bg-[#F2EDE6]/40 text-center">
                <LineChart className="mb-2 h-5 w-5 text-[#9CA3AF]" />
                <p className="text-[13px] font-medium text-[#1F2937]">
                  No trend data yet
                </p>
                <p className="mt-1 max-w-xs text-[12px] text-[#6B7280]">
                  Complete the first pre-session assessment to start tracking this patient&apos;s recovery.
                </p>
              </div>
            )}
          </section>

          <section className="rounded-[12px] border border-black/[0.07] bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                  Care goals
                </p>
                <h3 className="mt-1 text-[16px] font-semibold tracking-tight text-[#1F2937]">
                  12-week plan
                </h3>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#C97A56]/12 text-[#C97A56]">
                <Target className="h-4 w-4" />
              </span>
            </div>

            <ul className="space-y-4">
              {patient.goals.map((g) => (
                <li key={g.label}>
                  <div className="mb-1.5 flex items-center justify-between text-[13px]">
                    <span className="font-medium text-[#1F2937]">{g.label}</span>
                    <span className="tabular-nums text-[#6B7280]">{g.progress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#F2EDE6]">
                    <div
                      className="h-full rounded-full bg-[#C97A56]"
                      style={{ width: `${g.progress}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>

            {patient.flag && (
              <div className="mt-5 flex items-start gap-3 rounded-[10px] border border-[#F0A500]/25 bg-[#F0A500]/8 p-3 text-[12px] text-[#6B7280]">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#F0A500]" />
                <p>{patient.flag}</p>
              </div>
            )}
          </section>
        </div>

        {/* Session history */}
        <section className="rounded-[12px] border border-black/[0.07] bg-white">
          <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                Session history
              </p>
              <h3 className="mt-1 text-[16px] font-semibold tracking-tight text-[#1F2937]">
                Recent sessions
              </h3>
            </div>
            <Link
              href="/session-setup"
              className="text-[12px] font-medium text-[#C97A56] hover:text-[#B86A48]"
            >
              Plan next session
            </Link>
          </div>
          {hasHistory ? (
            <ul className="divide-y divide-black/[0.05]">
              {patient.sessions.map((s) => (
                <li key={s.date} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-16 shrink-0">
                    <div className="text-[13px] font-semibold text-[#1F2937]">{s.date}</div>
                    <div className="text-[11px] text-[#9CA3AF]">2026</div>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#F2EDE6] text-[13px] font-semibold text-[#1F2937]">
                    {s.score}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-[#1F2937]">
                        {s.protocol}
                      </span>
                      <span
                        className={`rounded-[6px] px-1.5 py-0.5 text-[10px] font-semibold ${
                          s.delta.startsWith("+")
                            ? "bg-[#27AE60]/12 text-[#1f8e4a]"
                            : "bg-[#1F2937]/8 text-[#374151]"
                        }`}
                      >
                        {s.delta}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[12px] text-[#6B7280]">{s.notes}</p>
                  </div>
                  <button className="inline-flex h-8 items-center gap-1 rounded-[8px] border border-black/[0.07] bg-white px-2.5 text-[12px] font-medium text-[#1F2937] hover:border-[#C97A56]/40 hover:text-[#C97A56]">
                    Report
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#F2EDE6]">
                <ScanLine className="h-5 w-5 text-[#C97A56]" />
              </div>
              <p className="text-[13.5px] font-medium text-[#1F2937]">No sessions yet</p>
              <p className="mt-1 text-[12px] text-[#6B7280]">
                Begin with a guided assessment to establish a baseline.
              </p>
              <Link
                href="/assessment"
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-[9px] bg-[#C97A56] px-3 text-[12.5px] font-semibold text-white hover:bg-[#B86A48]"
              >
                Start pre-check
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
          {hasHistory && (
            <div className="flex items-center gap-2 rounded-b-[12px] bg-[#27AE60]/6 px-5 py-3 text-[12px] text-[#1f8e4a]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Adherence {patient.stats.adherence}% · On track for goal date of {patient.stats.goalDate}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  )
}

export function generateStaticParams() {
  return [
    "alex-morgan",
    "priya-chandra",
    "marcus-lee",
    "sofia-alvarez",
    "amira-hassan",
    "tomas-oliveira",
    "jordan-reyes",
  ].map((id) => ({ id }))
}
