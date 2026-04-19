import {
  Activity,
  ArrowUpRight,
  CalendarCheck,
  CheckCircle2,
  Dumbbell,
  HeartPulse,
  Info,
  Play,
  Sparkles,
  Waves,
} from "lucide-react"
import { RecoveryTrendChart } from "@/components/hydrawav3/recovery-trend-chart"

const milestones = [
  { label: "Baseline established", date: "Mar 4", done: true },
  { label: "Week 2 reassessment", date: "Mar 18", done: true },
  { label: "Range of motion target 80°", date: "Apr 8", done: true },
  { label: "Return to sport clearance", date: "May 6", done: false },
]

const exercises = [
  {
    name: "Scapular wall slides",
    sets: "3 × 12",
    tone: "Mobility",
    minutes: 4,
  },
  {
    name: "Banded external rotation",
    sets: "3 × 15",
    tone: "Strength",
    minutes: 6,
  },
  {
    name: "Thoracic rotation",
    sets: "2 × 10 / side",
    tone: "Mobility",
    minutes: 3,
  },
]

const timeline = [
  {
    date: "Yesterday",
    title: "Session completed",
    detail: "Protocol H3-Alpha · 22 min · Recovery score 78 (+6)",
    tone: "success",
  },
  {
    date: "Mar 29",
    title: "Scan report ready",
    detail: "Range of motion improved 12% week over week",
    tone: "accent",
  },
  {
    date: "Mar 22",
    title: "New home exercises",
    detail: "Dr. Ruiz added 2 new exercises to your program",
    tone: "muted",
  },
]

const toneStyles: Record<string, string> = {
  success: "bg-[#27AE60]/12 text-[#1f8e4a]",
  accent: "bg-[#C97A56]/12 text-[#B86A48]",
  muted: "bg-black/[0.05] text-[#374151]",
}

export default function ClientDashboard() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[16px] border border-black/[0.07] bg-[#162532] p-6 text-white sm:p-8">
        <div
          aria-hidden
          className="absolute -right-16 -top-16 h-60 w-60 rounded-full bg-[#C97A56]/25 blur-3xl"
        />
        <div className="relative grid gap-6 md:grid-cols-[1.6fr_1fr] md:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
              Good afternoon, Alex
            </p>
            <h1 className="mt-2 text-balance text-[28px] font-semibold leading-[1.1] tracking-tight sm:text-[32px]">
              You&apos;re{" "}
              <span className="text-[#C97A56]">78% recovered</span> — ahead of schedule for
              week 4.
            </h1>
            <p className="mt-3 max-w-lg text-[13.5px] leading-relaxed text-white/60">
              Keep it steady. Your next in-clinic session is Thursday at 10:15 with Dr. Ruiz.
              Three home exercises are waiting for you today.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#C97A56] px-4 text-[13px] font-semibold text-white shadow-[0_8px_22px_-10px_rgba(201,122,86,0.7)] hover:bg-[#B86A48]"
              >
                <Play className="h-4 w-4" />
                Start today&apos;s exercises
              </button>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11.5px] text-white/70">
                <CalendarCheck className="h-3.5 w-3.5 text-[#C97A56]" />
                Next visit · Thu, Apr 24 · 10:15
              </div>
            </div>
          </div>

          {/* Ring */}
          <div className="flex justify-center md:justify-end">
            <RecoveryRing score={78} delta="+6" />
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ClientStat
          label="Range of motion"
          value="112°"
          delta="+8°"
          icon={Activity}
          footnote="Target 130°"
          tone="accent"
        />
        <ClientStat
          label="Symmetry"
          value="94%"
          delta="+3%"
          icon={HeartPulse}
          footnote="Left / right balance"
          tone="success"
        />
        <ClientStat
          label="Sessions completed"
          value="11"
          delta="+2"
          icon={Waves}
          footnote="of 20 planned"
          tone="purple"
        />
        <ClientStat
          label="Exercise adherence"
          value="86%"
          delta="+4%"
          icon={Sparkles}
          footnote="Last 14 days"
          tone="warning"
        />
      </section>

      {/* Main grid */}
      <section className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        {/* Chart */}
        <div className="rounded-[14px] border border-black/[0.07] bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                Recovery score
              </p>
              <h2 className="mt-1 text-[16px] font-semibold tracking-tight text-[#1F2937]">
                Last 12 weeks
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#27AE60]/10 px-2.5 py-1 text-[11.5px] font-medium text-[#1f8e4a]">
              <ArrowUpRight className="h-3 w-3" />
              Trending up
            </span>
          </div>
          <RecoveryTrendChart data={[]} />
        </div>

        {/* Timeline */}
        <div className="rounded-[14px] border border-black/[0.07] bg-white">
          <div className="border-b border-black/[0.06] px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
              Recent activity
            </p>
            <h2 className="mt-1 text-[15px] font-semibold tracking-tight text-[#1F2937]">
              From your clinic
            </h2>
          </div>
          <ul className="divide-y divide-black/[0.05]">
            {timeline.map((t) => (
              <li key={t.title} className="flex items-start gap-3 px-5 py-3.5">
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] ${
                    toneStyles[t.tone]
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="truncate text-[13.5px] font-semibold text-[#1F2937]">
                      {t.title}
                    </div>
                    <span className="shrink-0 text-[11px] text-[#9CA3AF]">{t.date}</span>
                  </div>
                  <div className="mt-0.5 text-[12.5px] text-[#6B7280]">{t.detail}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Exercises + milestones */}
      <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Exercises */}
        <div className="rounded-[14px] border border-black/[0.07] bg-white">
          <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#C97A56]/12 text-[#B86A48]">
                <Dumbbell className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                  Home program
                </p>
                <h2 className="text-[15px] font-semibold tracking-tight text-[#1F2937]">
                  Today&apos;s exercises
                </h2>
              </div>
            </div>
            <span className="text-[11.5px] text-[#6B7280]">~13 min total</span>
          </div>
          <ul className="divide-y divide-black/[0.05]">
            {exercises.map((e) => (
              <li
                key={e.name}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[#F2EDE6]/60"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#F2EDE6] text-[#C97A56]">
                  <Play className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-semibold text-[#1F2937]">
                    {e.name}
                  </div>
                  <div className="truncate text-[12px] text-[#6B7280]">
                    {e.sets} · {e.minutes} min
                  </div>
                </div>
                <span className="hidden rounded-[6px] bg-[#F2EDE6] px-2 py-0.5 text-[11px] font-medium text-[#6B7280] sm:inline-flex">
                  {e.tone}
                </span>
                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-1 rounded-[8px] border border-black/[0.07] bg-white px-2.5 text-[12px] font-medium text-[#1F2937] transition-colors hover:border-[#C97A56]/40 hover:text-[#C97A56]"
                >
                  Start
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Milestones */}
        <div className="rounded-[14px] border border-black/[0.07] bg-white">
          <div className="border-b border-black/[0.06] px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
              Your recovery plan
            </p>
            <h2 className="mt-1 text-[15px] font-semibold tracking-tight text-[#1F2937]">
              Milestones
            </h2>
          </div>
          <ol className="relative ml-5 space-y-4 px-5 py-5">
            <span
              aria-hidden
              className="absolute left-[14px] top-6 bottom-6 w-px bg-black/[0.08]"
            />
            {milestones.map((m) => (
              <li key={m.label} className="relative flex items-center gap-3">
                <span
                  className={`relative z-10 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white ${
                    m.done ? "bg-[#27AE60]" : "bg-black/[0.12]"
                  }`}
                >
                  {m.done && <CheckCircle2 className="h-3 w-3 text-white" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div
                    className={`truncate text-[13.5px] font-semibold ${
                      m.done ? "text-[#1F2937]" : "text-[#6B7280]"
                    }`}
                  >
                    {m.label}
                  </div>
                  <div className="text-[11.5px] text-[#9CA3AF]">{m.date}</div>
                </div>
              </li>
            ))}
          </ol>
          <div className="flex items-start gap-2 border-t border-black/[0.06] bg-[#F5F0EA]/50 px-5 py-3 text-[12px] text-[#6B7280]">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C97A56]" />
            Only your practitioner can update milestones. Message Dr. Ruiz if anything feels off.
          </div>
        </div>
      </section>
    </div>
  )
}

function RecoveryRing({ score, delta }: { score: number; delta: string }) {
  const size = 180
  const stroke = 14
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = (score / 100) * c
  return (
    <div className="relative flex h-[180px] w-[180px] items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#C97A56"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
          Recovery
        </span>
        <span className="mt-0.5 text-[40px] font-semibold leading-none tracking-tight">
          {score}
        </span>
        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#27AE60]/15 px-2 py-0.5 text-[11px] font-semibold text-[#34d399]">
          <ArrowUpRight className="h-3 w-3" />
          {delta} this week
        </span>
      </div>
    </div>
  )
}

function ClientStat({
  label,
  value,
  delta,
  footnote,
  icon: Icon,
  tone,
}: {
  label: string
  value: string
  delta: string
  footnote: string
  icon: typeof Activity
  tone: "accent" | "success" | "purple" | "warning"
}) {
  const tintMap: Record<string, string> = {
    accent: "bg-[#C97A56]/12 text-[#B86A48]",
    success: "bg-[#27AE60]/12 text-[#1f8e4a]",
    purple: "bg-[#8b5cf6]/12 text-[#6d28d9]",
    warning: "bg-[#F0A500]/14 text-[#c47f00]",
  }
  return (
    <div className="rounded-[12px] border border-black/[0.07] bg-white p-4">
      <div className="flex items-center justify-between">
        <span className={`flex h-8 w-8 items-center justify-center rounded-[8px] ${tintMap[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="rounded-full bg-[#27AE60]/10 px-2 py-0.5 text-[10.5px] font-semibold text-[#1f8e4a]">
          {delta}
        </span>
      </div>
      <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
        {label}
      </div>
      <div className="mt-1 text-[24px] font-semibold tracking-tight text-[#1F2937]">{value}</div>
      <div className="mt-0.5 text-[11.5px] text-[#6B7280]">{footnote}</div>
    </div>
  )
}
