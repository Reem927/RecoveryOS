import Link from "next/link"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  HeartPulse,
  Mail,
  Phone,
  ScanLine,
  Target,
  TrendingUp,
  Waves,
} from "lucide-react"
import { AppShell } from "@/components/hydrawav3/app-shell"
import { StatCard } from "@/components/hydrawav3/stat-card"
import { RecoveryTrendChart, type TrendPoint } from "@/components/hydrawav3/recovery-trend-chart"

const trendData: TrendPoint[] = [
  { label: "W1", score: 54, baseline: 58 },
  { label: "W2", score: 58, baseline: 60 },
  { label: "W3", score: 62, baseline: 62 },
  { label: "W4", score: 66, baseline: 64 },
  { label: "W5", score: 71, baseline: 66 },
  { label: "W6", score: 74, baseline: 68 },
  { label: "W7", score: 78, baseline: 70 },
  { label: "W8", score: 82, baseline: 72 },
]

const sessions = [
  {
    date: "Apr 18",
    protocol: "H3-Beta · 18 min",
    score: 82,
    delta: "+4",
    notes: "Full ROM restored on abduction. Asymmetry 7% → 4%.",
  },
  {
    date: "Apr 11",
    protocol: "H3-Beta · 18 min",
    score: 78,
    delta: "+4",
    notes: "HRV baseline improving. Slight stiffness post-session.",
  },
  {
    date: "Apr 04",
    protocol: "H3-Alpha · 22 min",
    score: 74,
    delta: "+3",
    notes: "Breathing rate stabilised. Good posture control.",
  },
  {
    date: "Mar 28",
    protocol: "H3-Alpha · 22 min",
    score: 71,
    delta: "+5",
    notes: "First scan after acute flare-up. Scapular tracking poor.",
  },
]

const goals = [
  { label: "Regain full shoulder abduction", progress: 82 },
  { label: "Reduce pain VAS below 3", progress: 64 },
  { label: "Restore symmetry > 95%", progress: 58 },
]

export default function PatientDetailPage() {
  return (
    <AppShell
      title="Alex Morgan"
      breadcrumbs={[{ label: "Patients" }, { label: "Alex Morgan" }]}
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
                    Alex Morgan
                  </h2>
                  <span className="rounded-[6px] bg-[#27AE60]/12 px-2 py-0.5 text-[11px] font-medium text-[#1f8e4a]">
                    Active care
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-[#6B7280]">
                  34 · Male · Post-op right shoulder · Referred by Dr. Okafor
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[12px] text-[#6B7280]">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> alex.morgan@mail.co
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> +1 (415) 555-0142
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" /> Next: Today · 09:00
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

        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-[10px] border border-black/[0.07] bg-white p-1 text-[13px]">
          {[
            { label: "Overview", active: true },
            { label: "History" },
            { label: "Vitals" },
            { label: "Protocols" },
            { label: "Notes" },
          ].map((t) => (
            <button
              key={t.label}
              className={`rounded-[8px] px-3 py-1.5 font-medium transition-colors ${
                t.active
                  ? "bg-[#C97A56] text-white"
                  : "text-[#6B7280] hover:bg-[#F2EDE6]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Recovery score"
            value="82"
            unit="/ 100"
            delta="+8"
            trend="up"
            icon={HeartPulse}
            tint="accent"
            footnote="8-week trend"
          />
          <StatCard
            label="Range of motion"
            value="148°"
            delta="+12°"
            trend="up"
            icon={Activity}
            tint="success"
            footnote="Abduction, right"
          />
          <StatCard
            label="Asymmetry index"
            value="4%"
            delta="-3%"
            trend="up"
            icon={TrendingUp}
            tint="purple"
            footnote="Target < 5%"
          />
          <StatCard
            label="Sessions completed"
            value="18"
            delta="+2"
            trend="up"
            icon={Waves}
            tint="warning"
            footnote="Plan of 24"
          />
        </section>

        {/* Chart + Goals */}
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <section className="rounded-[12px] border border-black/[0.07] bg-white p-5">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                  Recovery trajectory
                </p>
                <h3 className="mt-1 text-[16px] font-semibold tracking-tight text-[#1F2937]">
                  Score vs baseline cohort
                </h3>
              </div>
              <div className="flex items-center gap-3 text-[12px] text-[#6B7280]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-4 rounded bg-[#C97A56]" /> Alex
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-4 rounded bg-[#162532]/40" /> Baseline
                </span>
              </div>
            </div>
            <RecoveryTrendChart data={trendData} />
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
              {goals.map((g) => (
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

            <div className="mt-5 flex items-start gap-3 rounded-[10px] border border-[#F0A500]/25 bg-[#F0A500]/8 p-3 text-[12px] text-[#6B7280]">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#F0A500]" />
              <p>
                Asymmetry flagged on scapular tracking last session. Consider adjusting to{" "}
                <span className="font-medium text-[#1F2937]">H3-Gamma</span> protocol.
              </p>
            </div>
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
              href="/progress"
              className="text-[12px] font-medium text-[#C97A56] hover:text-[#B86A48]"
            >
              View progress dashboard
            </Link>
          </div>
          <ul className="divide-y divide-black/[0.05]">
            {sessions.map((s) => (
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
                    <span className="rounded-[6px] bg-[#27AE60]/12 px-1.5 py-0.5 text-[10px] font-semibold text-[#1f8e4a]">
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
          <div className="flex items-center gap-2 rounded-b-[12px] bg-[#27AE60]/6 px-5 py-3 text-[12px] text-[#1f8e4a]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Adherence 96% · On track for goal date of Jun 15, 2026
          </div>
        </section>
      </div>
    </AppShell>
  )
}
