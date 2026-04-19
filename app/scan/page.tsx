import Link from "next/link"
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Circle,
  Gauge,
  HeartPulse,
  Info,
  Maximize2,
  Move3d,
  Pause,
  RotateCw,
  Ruler,
  ShieldCheck,
  Sparkles,
  Sun,
  Wind,
  Wifi,
} from "lucide-react"
import { AppShell } from "@/components/hydrawav3/app-shell"
import { AssessmentStepper, type Step } from "@/components/hydrawav3/assessment-stepper"

const steps: Step[] = [
  { label: "Consent", status: "done", meta: "09:02" },
  { label: "Intake", status: "done", meta: "09:04" },
  { label: "Camera scan", status: "active", meta: "Capturing…" },
  { label: "Insights", status: "todo" },
  { label: "Session", status: "todo" },
]

export default function ScanPage() {
  return (
    <AppShell
      title="Camera scan · Alex Morgan"
      breadcrumbs={[
        { label: "Patients" },
        { label: "Alex Morgan" },
        { label: "Scan" },
      ]}
      actions={
        <Link
          href="/insights"
          className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#C97A56] px-4 text-[13px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(201,122,86,0.7)] hover:bg-[#B86A48]"
        >
          Generate insights
          <ArrowRight className="h-4 w-4" />
        </Link>
      }
    >
      <div className="space-y-6">
        <AssessmentStepper steps={steps} />

        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          {/* Camera viewport */}
          <section className="overflow-hidden rounded-[12px] border border-black/[0.07] bg-[#0F1E28]">
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 text-white/80">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E74C3C] opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#E74C3C]" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Live capture · Room 2
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-white/60">
                <span className="tabular-nums">00:42 / 01:30</span>
                <span className="h-3 w-px bg-white/15" />
                <span className="inline-flex items-center gap-1.5">
                  <Wifi className="h-3 w-3 text-[#27AE60]" /> 60 fps · 4K
                </span>
              </div>
            </div>

            <div className="relative aspect-[4/3] w-full bg-[#0F1E28]">
              {/* camera scene */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#1A2E3B] to-[#0F1E28]" />
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(201,122,86,0.18),transparent_60%),radial-gradient(circle_at_50%_90%,rgba(139,92,246,0.12),transparent_60%)]"
              />

              {/* subject silhouette */}
              <svg
                viewBox="0 0 400 300"
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="xMidYMid meet"
                aria-hidden
              >
                {/* Body silhouette */}
                <g fill="#162532" stroke="#1A2E3B" strokeWidth="1">
                  <ellipse cx="200" cy="70" rx="22" ry="26" />
                  <path d="M160 100 Q200 92 240 100 L255 170 Q260 220 250 260 L220 270 L210 220 L200 180 L190 220 L180 270 L150 260 Q140 220 145 170 Z" />
                  <path d="M160 100 L130 130 L110 200 L120 220 L135 215 L150 150 Z" />
                  <path d="M240 100 L270 130 L290 200 L280 220 L265 215 L250 150 Z" />
                </g>

                {/* Pose landmarks */}
                <g>
                  {/* skeleton */}
                  {[
                    ["200", "70", "200", "110"],
                    ["160", "110", "240", "110"],
                    ["160", "110", "130", "170"],
                    ["240", "110", "270", "170"],
                    ["130", "170", "135", "220"],
                    ["270", "170", "265", "220"],
                    ["200", "110", "200", "185"],
                    ["200", "185", "180", "260"],
                    ["200", "185", "220", "260"],
                  ].map(([x1, y1, x2, y2], i) => (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#C97A56"
                      strokeWidth="2"
                      strokeLinecap="round"
                      opacity="0.9"
                    />
                  ))}
                  {[
                    ["200", "70"],
                    ["200", "110"],
                    ["160", "110"],
                    ["240", "110"],
                    ["130", "170"],
                    ["270", "170"],
                    ["135", "220"],
                    ["265", "220"],
                    ["200", "185"],
                    ["180", "260"],
                    ["220", "260"],
                  ].map(([cx, cy], i) => (
                    <g key={i}>
                      <circle cx={cx} cy={cy} r="6" fill="#C97A56" fillOpacity="0.2" />
                      <circle cx={cx} cy={cy} r="3" fill="#C97A56" />
                    </g>
                  ))}
                  {/* Asymmetry warning */}
                  <circle cx="240" cy="110" r="14" fill="none" stroke="#F0A500" strokeWidth="1.5" strokeDasharray="3 3" />
                </g>

                {/* Guide box */}
                <rect
                  x="60"
                  y="30"
                  width="280"
                  height="240"
                  fill="none"
                  stroke="#ffffff"
                  strokeOpacity="0.18"
                  strokeWidth="1"
                  strokeDasharray="6 6"
                  rx="8"
                />
              </svg>

              {/* Top-left metric chip */}
              <div className="absolute left-4 top-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md">
                  <Camera className="h-3 w-3 text-[#C97A56]" />
                  Pose · 17/17 keypoints
                </div>
                <div className="flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md">
                  <Sun className="h-3 w-3 text-[#F0A500]" />
                  Lighting optimal
                </div>
              </div>

              {/* Heart rate overlay */}
              <div className="absolute right-4 top-4 rounded-[12px] bg-black/45 p-3 text-white backdrop-blur-md ring-1 ring-white/10">
                <div className="flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-[#E74C3C]" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60">
                    rPPG
                  </span>
                </div>
                <div className="mt-0.5 flex items-baseline gap-1">
                  <span className="text-[22px] font-semibold tabular-nums">68</span>
                  <span className="text-[11px] text-white/50">bpm</span>
                </div>
                <svg viewBox="0 0 120 24" className="mt-1 h-5 w-[120px]">
                  <polyline
                    points="0,12 10,12 16,4 22,20 28,10 34,12 60,12 66,4 72,20 78,10 84,12 120,12"
                    fill="none"
                    stroke="#E74C3C"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>

              {/* Asymmetry callout */}
              <div className="absolute left-4 bottom-16 max-w-[200px] rounded-[10px] bg-[#F0A500]/20 px-3 py-2 text-[11px] text-[#F0A500] backdrop-blur-md ring-1 ring-[#F0A500]/30">
                Asymmetry detected at right shoulder · 7%
              </div>

              {/* Progress bar */}
              <div className="absolute inset-x-0 bottom-0 bg-black/50 px-4 py-3 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C97A56] text-white hover:bg-[#B86A48]">
                    <Pause className="h-4 w-4" />
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[11px] text-white/70">
                      <span>Squat hold · 3 of 6 movements</span>
                      <span className="tabular-nums">47%</span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#C97A56] to-[#F0A500]"
                        style={{ width: "47%" }}
                      />
                    </div>
                  </div>
                  <button className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white hover:bg-white/[0.12]">
                    <RotateCw className="h-4 w-4" />
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white hover:bg-white/[0.12]">
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Movement protocol */}
            <div className="flex items-center gap-2 border-t border-white/5 bg-[#0F1E28] px-4 py-3 text-[11px] text-white/60">
              <span className="font-semibold uppercase tracking-[0.14em] text-white/70">
                Protocol
              </span>
              <span className="text-white/40">·</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { label: "Stand neutral", done: true },
                  { label: "Shoulder abduction", done: true },
                  { label: "Squat hold", done: false, active: true },
                  { label: "Balance left", done: false },
                  { label: "Balance right", done: false },
                  { label: "Reach overhead", done: false },
                ].map((m) => (
                  <span
                    key={m.label}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      m.done
                        ? "bg-[#27AE60]/20 text-[#6ee7a7]"
                        : m.active
                          ? "bg-[#C97A56]/25 text-[#F5B08C]"
                          : "bg-white/[0.06] text-white/50"
                    }`}
                  >
                    {m.done ? (
                      <CheckCircle2 className="h-2.5 w-2.5" />
                    ) : (
                      <Circle className="h-2.5 w-2.5" />
                    )}
                    {m.label}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Right rail — live readouts */}
          <section className="space-y-4">
            {/* Vitals */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Heart rate",
                  value: "68",
                  unit: "bpm",
                  icon: HeartPulse,
                  tint: "bg-[#E74C3C]/12 text-[#c0392b]",
                  delta: "−2 from baseline",
                },
                {
                  label: "Breathing",
                  value: "14",
                  unit: "rpm",
                  icon: Wind,
                  tint: "bg-[#8B5CF6]/12 text-[#8B5CF6]",
                  delta: "Within range",
                },
                {
                  label: "HRV",
                  value: "62",
                  unit: "ms",
                  icon: Gauge,
                  tint: "bg-[#C97A56]/12 text-[#C97A56]",
                  delta: "+8 ms",
                },
                {
                  label: "Posture",
                  value: "94",
                  unit: "/ 100",
                  icon: Move3d,
                  tint: "bg-[#27AE60]/12 text-[#1f8e4a]",
                  delta: "Excellent",
                },
              ].map((v) => (
                <div
                  key={v.label}
                  className="rounded-[12px] border border-black/[0.07] bg-white p-4"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
                      {v.label}
                    </span>
                    <span className={`flex h-7 w-7 items-center justify-center rounded-[8px] ${v.tint}`}>
                      <v.icon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-[22px] font-semibold tabular-nums text-[#1F2937]">
                      {v.value}
                    </span>
                    <span className="text-[11px] text-[#9CA3AF]">{v.unit}</span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-[#6B7280]">{v.delta}</div>
                </div>
              ))}
            </div>

            {/* ROM */}
            <div className="rounded-[12px] border border-black/[0.07] bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                    Range of motion
                  </p>
                  <h3 className="mt-1 text-[15px] font-semibold tracking-tight text-[#1F2937]">
                    Live joint angles
                  </h3>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#C97A56]/12 text-[#C97A56]">
                  <Ruler className="h-4 w-4" />
                </span>
              </div>
              <ul className="space-y-3">
                {[
                  { joint: "Shoulder abduction · R", v: 148, target: 170, tone: "#F0A500" },
                  { joint: "Shoulder abduction · L", v: 172, target: 170, tone: "#27AE60" },
                  { joint: "Hip flexion", v: 118, target: 120, tone: "#27AE60" },
                  { joint: "Knee flexion", v: 132, target: 135, tone: "#27AE60" },
                ].map((j) => {
                  const pct = Math.min(100, (j.v / (j.target + 10)) * 100)
                  return (
                    <li key={j.joint}>
                      <div className="mb-1 flex items-center justify-between text-[12px]">
                        <span className="text-[#374151]">{j.joint}</span>
                        <span className="tabular-nums font-semibold text-[#1F2937]">
                          {j.v}° <span className="text-[#9CA3AF]">/ {j.target}°</span>
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[#F2EDE6]">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: j.tone }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Capture quality */}
            <div className="rounded-[12px] border border-black/[0.07] bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                Capture quality
              </p>
              <ul className="mt-3 space-y-2.5 text-[12px]">
                {[
                  { label: "Subject in frame", ok: true },
                  { label: "Lighting above 120 lux", ok: true },
                  { label: "Tripod stable", ok: true },
                  { label: "Background clear", ok: false },
                ].map((item) => (
                  <li key={item.label} className="flex items-center gap-2">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        item.ok ? "bg-[#27AE60]/15 text-[#1f8e4a]" : "bg-[#F0A500]/15 text-[#c47f00]"
                      }`}
                    >
                      {item.ok ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <Info className="h-3 w-3" />
                      )}
                    </span>
                    <span className="text-[#374151]">{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Privacy */}
            <div className="flex items-start gap-3 rounded-[12px] border border-[#27AE60]/25 bg-[#27AE60]/8 p-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#1f8e4a]" />
              <div className="text-[11px] leading-relaxed text-[#1f8e4a]/90">
                <span className="font-semibold text-[#1f8e4a]">On-device processing.</span> Video
                stays in the clinic. Only anonymised landmarks sync to the chart.
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-[10px] bg-white p-3 text-[11px] text-[#6B7280] ring-1 ring-black/[0.07]">
              <Sparkles className="h-3.5 w-3.5 text-[#C97A56]" />
              Model v3.2 · Confidence 97%
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  )
}
