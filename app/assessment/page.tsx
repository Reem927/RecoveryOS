import Link from "next/link"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bed,
  Brain,
  CheckCircle2,
  Clock,
  Droplet,
  FileText,
  Flame,
  HeartPulse,
  Moon,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { AppShell } from "@/components/hydrawav3/app-shell"
import { AssessmentStepper, type Step } from "@/components/hydrawav3/assessment-stepper"

const steps: Step[] = [
  { label: "Consent", status: "done", meta: "Signed 09:02" },
  { label: "Intake", status: "active", meta: "In progress" },
  { label: "Camera scan", status: "todo", meta: "~90 sec" },
  { label: "Insights", status: "todo" },
  { label: "Session", status: "todo" },
]

const sorenessRegions = [
  { area: "Right shoulder", score: 6, tone: "high" },
  { area: "Upper back", score: 4, tone: "mid" },
  { area: "Neck", score: 3, tone: "mid" },
  { area: "Right elbow", score: 2, tone: "low" },
]

const painToneMap: Record<string, string> = {
  high: "bg-[#E74C3C]/12 text-[#c0392b] ring-[#E74C3C]/25",
  mid: "bg-[#F0A500]/14 text-[#c47f00] ring-[#F0A500]/25",
  low: "bg-[#27AE60]/12 text-[#1f8e4a] ring-[#27AE60]/25",
}

export default function AssessmentPage() {
  return (
    <AppShell
      title="Pre-check · Alex Morgan"
      breadcrumbs={[
        { label: "Clients" },
        { label: "Alex Morgan" },
        { label: "Pre-check" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/patients/alex-morgan"
            className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-black/[0.07] bg-white px-3 text-[13px] font-medium text-[#374151] hover:border-black/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to chart
          </Link>
          <Link
            href="/scan"
            className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#C97A56] px-4 text-[13px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(201,122,86,0.7)] hover:bg-[#B86A48]"
          >
            Continue to scan
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        <AssessmentStepper steps={steps} />

        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <div className="space-y-6">
            {/* Subjective intake */}
            <section className="rounded-[12px] border border-black/[0.07] bg-white p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                    Subjective intake
                  </p>
                  <h3 className="mt-1 text-[18px] font-semibold tracking-tight text-[#1F2937]">
                    How is Alex feeling today?
                  </h3>
                  <p className="mt-0.5 text-[13px] text-[#6B7280]">
                    Tap to fill. Takes under a minute.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C97A56]/12 px-2.5 py-1 text-[11px] font-medium text-[#B86A48]">
                  <Clock className="h-3 w-3" />
                  Est. 45s remaining
                </span>
              </div>

              {/* Pain slider */}
              <div className="mb-6">
                <label className="mb-2 flex items-center justify-between text-[12px]">
                  <span className="font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
                    Overall pain (VAS 0–10)
                  </span>
                  <span className="tabular-nums font-semibold text-[#1F2937]">4.2</span>
                </label>
                <div className="relative h-2 rounded-full bg-gradient-to-r from-[#27AE60] via-[#F0A500] to-[#E74C3C]">
                  <div
                    className="absolute top-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2 rounded-full border-[3px] border-white bg-[#162532] shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                    style={{ left: "42%" }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[10px] text-[#9CA3AF]">
                  <span>No pain</span>
                  <span>Moderate</span>
                  <span>Severe</span>
                </div>
              </div>

              {/* Quick toggles */}
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { icon: Moon, label: "Sleep quality", value: "Fair · 6h 12m", tint: "accent" },
                  { icon: Flame, label: "Inflammation", value: "Mild warmth", tint: "warning" },
                  { icon: Droplet, label: "Hydration", value: "Good", tint: "success" },
                  { icon: Brain, label: "Mental load", value: "Low stress", tint: "success" },
                  { icon: Bed, label: "Rest days", value: "2 / week", tint: "accent" },
                  { icon: HeartPulse, label: "Resting HR", value: "62 bpm", tint: "purple" },
                ].map((item) => {
                  const tint = {
                    accent: "bg-[#C97A56]/10 text-[#C97A56]",
                    success: "bg-[#27AE60]/10 text-[#27AE60]",
                    warning: "bg-[#F0A500]/12 text-[#c47f00]",
                    purple: "bg-[#8B5CF6]/10 text-[#8B5CF6]",
                  }[item.tint as "accent" | "success" | "warning" | "purple"]
                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 rounded-[10px] border border-black/[0.07] bg-white p-3 transition-colors hover:border-[#C97A56]/30"
                    >
                      <span className={`flex h-9 w-9 items-center justify-center rounded-[8px] ${tint}`}>
                        <item.icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                          {item.label}
                        </div>
                        <div className="truncate text-[13px] font-semibold text-[#1F2937]">
                          {item.value}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Body diagram */}
            <section className="rounded-[12px] border border-black/[0.07] bg-white p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                    Soreness mapping
                  </p>
                  <h3 className="mt-1 text-[18px] font-semibold tracking-tight text-[#1F2937]">
                    Tap regions to flag discomfort
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#27AE60]/12 px-2 py-0.5 text-[#1f8e4a]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#27AE60]" /> Low
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#F0A500]/14 px-2 py-0.5 text-[#c47f00]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#F0A500]" /> Mid
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#E74C3C]/12 px-2 py-0.5 text-[#c0392b]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E74C3C]" /> High
                  </span>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
                {/* Simple body svg */}
                <div className="relative mx-auto w-[200px] rounded-[12px] bg-[#F2EDE6] p-4">
                  <svg viewBox="0 0 160 280" className="h-[260px] w-full" aria-hidden="true">
                    {/* Head */}
                    <circle cx="80" cy="30" r="20" fill="#E5DED3" stroke="#C9BFB0" strokeWidth="1.5" />
                    {/* Torso */}
                    <path
                      d="M55 55 Q80 50 105 55 L115 110 Q120 160 115 200 L95 205 L80 180 L65 205 L45 200 Q40 160 45 110 Z"
                      fill="#E5DED3"
                      stroke="#C9BFB0"
                      strokeWidth="1.5"
                    />
                    {/* Arms */}
                    <path d="M55 55 L35 75 L25 140 L35 160 L45 155 L50 110 Z" fill="#E5DED3" stroke="#C9BFB0" strokeWidth="1.5" />
                    <path d="M105 55 L125 75 L135 140 L125 160 L115 155 L110 110 Z" fill="#E5DED3" stroke="#C9BFB0" strokeWidth="1.5" />
                    {/* Legs */}
                    <path d="M65 205 L60 265 L75 270 L82 210 Z" fill="#E5DED3" stroke="#C9BFB0" strokeWidth="1.5" />
                    <path d="M95 205 L100 265 L85 270 L78 210 Z" fill="#E5DED3" stroke="#C9BFB0" strokeWidth="1.5" />

                    {/* Hotspots */}
                    <circle cx="110" cy="72" r="12" fill="#E74C3C" fillOpacity="0.25" />
                    <circle cx="110" cy="72" r="5" fill="#E74C3C" />
                    <circle cx="80" cy="95" r="9" fill="#F0A500" fillOpacity="0.3" />
                    <circle cx="80" cy="95" r="4" fill="#F0A500" />
                    <circle cx="80" cy="55" r="8" fill="#F0A500" fillOpacity="0.3" />
                    <circle cx="80" cy="55" r="4" fill="#F0A500" />
                    <circle cx="125" cy="130" r="7" fill="#27AE60" fillOpacity="0.3" />
                    <circle cx="125" cy="130" r="3.5" fill="#27AE60" />
                  </svg>
                </div>

                <ul className="space-y-2.5">
                  {sorenessRegions.map((r) => (
                    <li
                      key={r.area}
                      className="flex items-center gap-3 rounded-[10px] border border-black/[0.07] bg-white px-3 py-2.5"
                    >
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-[8px] ring-1 ring-inset ${painToneMap[r.tone]}`}
                      >
                        <span className="text-[12px] font-bold tabular-nums">{r.score}</span>
                      </span>
                      <div className="flex-1">
                        <div className="text-[13px] font-semibold text-[#1F2937]">{r.area}</div>
                        <div className="text-[11px] text-[#9CA3AF]">Pain · {r.score}/10</div>
                      </div>
                      <button className="text-[12px] font-medium text-[#C97A56] hover:text-[#B86A48]">
                        Edit
                      </button>
                    </li>
                  ))}
                  <button className="flex h-10 w-full items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-black/15 text-[12px] font-medium text-[#6B7280] hover:border-[#C97A56]/40 hover:text-[#C97A56]">
                    + Add region
                  </button>
                </ul>
              </div>
            </section>
          </div>

          {/* Right rail */}
          <div className="space-y-6">
            {/* Last session ref */}
            <section className="rounded-[12px] border border-black/[0.07] bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                  Last session
                </p>
                <span className="text-[11px] text-[#9CA3AF]">Apr 18</span>
              </div>
              <div className="space-y-3 text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280]">Recovery score</span>
                  <span className="font-semibold tabular-nums text-[#1F2937]">82</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280]">Protocol used</span>
                  <span className="font-semibold text-[#1F2937]">H3-Beta · 18 min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280]">Practitioner</span>
                  <span className="font-semibold text-[#1F2937]">Dr. Ruiz</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280]">Asymmetry</span>
                  <span className="font-semibold text-[#1F2937]">4%</span>
                </div>
              </div>
              <button className="mt-4 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[8px] border border-black/[0.07] bg-white text-[12px] font-medium text-[#374151] hover:border-black/10">
                <FileText className="h-3.5 w-3.5 text-[#C97A56]" />
                Open report
              </button>
            </section>

            {/* AI hint */}
            <section className="relative overflow-hidden rounded-[12px] border border-[#C97A56]/25 bg-gradient-to-br from-white to-[#C97A56]/[0.06] p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#C97A56]/15 text-[#C97A56]">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C97A56]">
                    Hydrawav3 assist
                  </div>
                  <h4 className="mt-1 text-[14px] font-semibold tracking-tight text-[#1F2937]">
                    Suggestion based on yesterday&apos;s data
                  </h4>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-[#6B7280]">
                    HRV dropped 8% overnight. Recommend opening the scan with
                    {" "}
                    <span className="font-semibold text-[#1F2937]">breathing calibration</span>
                    {" "}
                    before movement capture.
                  </p>
                  <button className="mt-3 text-[12px] font-semibold text-[#C97A56] hover:text-[#B86A48]">
                    Apply suggestion
                  </button>
                </div>
              </div>
            </section>

            {/* Safety */}
            <section className="rounded-[12px] border border-[#27AE60]/25 bg-[#27AE60]/8 p-4">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-[#1f8e4a]">
                <ShieldCheck className="h-4 w-4" />
                Consent verified
              </div>
              <p className="mt-1 text-[11px] text-[#1f8e4a]/80">
                Alex signed data + video consent at 09:02. Valid through May 2026.
              </p>
            </section>

            {/* Flags */}
            <section className="rounded-[12px] border border-[#E74C3C]/25 bg-[#E74C3C]/6 p-4">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-[#c0392b]">
                <AlertTriangle className="h-4 w-4" />
                Red flags to watch
              </div>
              <ul className="mt-2 space-y-1.5 text-[11px] text-[#c0392b]/90">
                <li className="flex gap-1.5">
                  <span>·</span> Sudden sharp pain during abduction &gt; 120°
                </li>
                <li className="flex gap-1.5">
                  <span>·</span> Numbness in right hand or fingers
                </li>
                <li className="flex gap-1.5">
                  <span>·</span> Resting HR below 50 bpm
                </li>
              </ul>
            </section>

            <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
              <CheckCircle2 className="h-4 w-4 text-[#27AE60]" />
              Autosaved · 3 seconds ago
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
