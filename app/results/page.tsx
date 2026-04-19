import Link from "next/link"
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarPlus,
  CheckCircle2,
  Download,
  HeartPulse,
  Send,
  Share2,
  Sparkles,
  Waves,
  Wind,
  Zap,
} from "lucide-react"
import { AppShell } from "@/components/hydrawav3/app-shell"
import { RecoveryTrendChart, type TrendPoint } from "@/components/hydrawav3/recovery-trend-chart"

const trend: TrendPoint[] = [
  { label: "W1", score: 54, baseline: 58 },
  { label: "W2", score: 58, baseline: 60 },
  { label: "W3", score: 62, baseline: 62 },
  { label: "W4", score: 66, baseline: 64 },
  { label: "W5", score: 71, baseline: 66 },
  { label: "W6", score: 74, baseline: 68 },
  { label: "W7", score: 78, baseline: 70 },
  { label: "W8", score: 85, baseline: 72 },
]

const comparison = [
  {
    label: "Recovery score",
    before: 81,
    after: 85,
    unit: "/ 100",
    tint: "#C97A56",
    icon: HeartPulse,
  },
  {
    label: "Asymmetry",
    before: 7,
    after: 4,
    unit: "%",
    inverse: true,
    tint: "#27AE60",
    icon: Zap,
  },
  {
    label: "Breathing coherence",
    before: 72,
    after: 88,
    unit: "%",
    tint: "#8B5CF6",
    icon: Wind,
  },
  {
    label: "Movement quality",
    before: 84,
    after: 91,
    unit: "/ 100",
    tint: "#F0A500",
    icon: Activity,
  },
]

export default function ResultsPage() {
  return (
    <AppShell
      title="Session complete · Alex Morgan"
      breadcrumbs={[
        { label: "Clients" },
        { label: "Alex Morgan" },
        { label: "Results" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <button className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-black/[0.07] bg-white px-3 text-[13px] font-medium text-[#374151] hover:border-black/10">
            <Download className="h-4 w-4" />
            Export PDF
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#C97A56] px-4 text-[13px] font-semibold text-white hover:bg-[#B86A48]">
            <CalendarPlus className="h-4 w-4" />
            Schedule follow-up
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Success toast */}
        <div className="inline-flex items-center gap-2.5 rounded-full bg-[#1A7A45] px-4 py-2 text-[13px] font-medium text-white shadow-[0_10px_30px_-12px_rgba(26,122,69,0.5)]">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
            <CheckCircle2 className="h-3 w-3" />
          </span>
          Session complete · 18:04 elapsed · Data synced to Alex&apos;s chart
        </div>

        {/* Summary hero */}
        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="relative overflow-hidden rounded-[12px] border border-black/[0.07] bg-white p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[#27AE60]/14 blur-3xl"
            />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
              <div className="relative mx-auto flex h-[160px] w-[160px] shrink-0 items-center justify-center">
                <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#F2EDE6" strokeWidth="10" />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="#27AE60"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - 0.85)}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
                    Post-session
                  </span>
                  <span className="mt-1 text-[40px] font-semibold leading-none tabular-nums text-[#1F2937]">
                    85
                  </span>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#27AE60]/12 px-2 py-0.5 text-[11px] font-semibold text-[#1f8e4a]">
                    <ArrowUpRight className="h-3 w-3" /> +4 vs pre
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C97A56]/12 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#B86A48]">
                  <Waves className="h-3 w-3" />
                  H3-Beta · 2.4 Hz · 18 min
                </span>
                <h2 className="mt-3 text-balance text-[24px] font-semibold leading-tight tracking-tight text-[#1F2937]">
                  Strong response — asymmetry reduced from 7% to 4%.
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-[#6B7280]">
                  Alex entered coherent breathing by minute 6 and held through the Beta ramp.
                  Parasympathetic markers improved across the board. Recommend a follow-up in
                  3 days to lock in the gains.
                </p>

                <div className="mt-5 grid grid-cols-3 gap-3 text-[12px]">
                  <div className="rounded-[10px] bg-[#F2EDE6]/70 px-3 py-2">
                    <div className="text-[10px] uppercase tracking-[0.1em] text-[#9CA3AF]">
                      Duration
                    </div>
                    <div className="mt-0.5 font-semibold tabular-nums text-[#1F2937]">
                      18:04
                    </div>
                  </div>
                  <div className="rounded-[10px] bg-[#F2EDE6]/70 px-3 py-2">
                    <div className="text-[10px] uppercase tracking-[0.1em] text-[#9CA3AF]">
                      Avg HR
                    </div>
                    <div className="mt-0.5 font-semibold tabular-nums text-[#1F2937]">
                      72 bpm
                    </div>
                  </div>
                  <div className="rounded-[10px] bg-[#F2EDE6]/70 px-3 py-2">
                    <div className="text-[10px] uppercase tracking-[0.1em] text-[#9CA3AF]">
                      HRV gain
                    </div>
                    <div className="mt-0.5 font-semibold tabular-nums text-[#1F2937]">
                      +14 ms
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[12px] border border-[#C97A56]/30 bg-gradient-to-br from-white to-[#C97A56]/6 p-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C97A56]/12 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C97A56]">
              <Sparkles className="h-3 w-3" />
              Next-step suggestion
            </span>
            <h3 className="mt-3 text-[18px] font-semibold tracking-tight text-[#1F2937]">
              Book H3-Beta + scapular focus in 3 days
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-[#6B7280]">
              Clients with this response curve typically consolidate symmetry gains with one
              more H3-Beta, then shift to H3-Gamma to challenge the restored range.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#C97A56] px-4 text-[13px] font-semibold text-white hover:bg-[#B86A48]">
                <CalendarPlus className="h-4 w-4" />
                Book Apr 24 · 09:00
              </button>
              <button className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-black/[0.07] bg-white px-3 text-[13px] font-medium text-[#374151] hover:border-black/10">
                <Share2 className="h-4 w-4 text-[#C97A56]" />
                Send recap to client
              </button>
            </div>
          </div>
        </section>

        {/* Before / after */}
        <section className="rounded-[12px] border border-black/[0.07] bg-white">
          <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                Before vs after
              </p>
              <h3 className="mt-1 text-[16px] font-semibold tracking-tight text-[#1F2937]">
                Same-session change
              </h3>
            </div>
            <div className="text-[12px] text-[#6B7280]">Pre-check 09:06 → Post 09:28</div>
          </div>
          <div className="grid gap-px bg-black/[0.06] md:grid-cols-4">
            {comparison.map((c) => {
              const improved = c.inverse ? c.after < c.before : c.after > c.before
              const delta = c.after - c.before
              const display = (c.inverse ? -delta : delta) // positive if improvement
              return (
                <div key={c.label} className="bg-white p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
                      {c.label}
                    </span>
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-[8px]"
                      style={{ backgroundColor: `${c.tint}1F`, color: c.tint }}
                    >
                      <c.icon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-[0.1em] text-[#9CA3AF]">
                        Pre
                      </span>
                      <span className="mt-0.5 text-[20px] font-semibold tabular-nums text-[#9CA3AF] line-through decoration-black/10">
                        {c.before}
                        <span className="ml-0.5 text-[10px] font-normal">{c.unit}</span>
                      </span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-[#C97A56]" />
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] uppercase tracking-[0.1em] text-[#9CA3AF]">
                        Post
                      </span>
                      <span
                        className="mt-0.5 text-[22px] font-semibold tabular-nums text-[#1F2937]"
                      >
                        {c.after}
                        <span className="ml-0.5 text-[11px] font-normal text-[#9CA3AF]">
                          {c.unit}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-[6px] px-1.5 py-0.5 text-[11px] font-semibold ${
                        improved
                          ? "bg-[#27AE60]/12 text-[#1f8e4a]"
                          : "bg-[#E74C3C]/12 text-[#c0392b]"
                      }`}
                    >
                      {improved ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {display > 0 ? "+" : ""}
                      {display}
                      {c.unit ? c.unit.replace("/ 100", "") : ""} improvement
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Trend + Notes */}
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <section className="rounded-[12px] border border-black/[0.07] bg-white p-5">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                  Longitudinal trend
                </p>
                <h3 className="mt-1 text-[16px] font-semibold tracking-tight text-[#1F2937]">
                  8-week recovery trajectory
                </h3>
              </div>
              <div className="flex items-center gap-3 text-[12px] text-[#6B7280]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-4 rounded bg-[#C97A56]" /> Alex
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-4 rounded bg-[#162532]/40" /> Cohort
                </span>
              </div>
            </div>
            <RecoveryTrendChart data={trend} />
            <div className="mt-3 flex items-center gap-2 rounded-[8px] bg-[#27AE60]/8 px-3 py-2 text-[11px] text-[#1f8e4a]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Trending 12 points above cohort baseline
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-[12px] border border-black/[0.07] bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                Clinical note
              </p>
              <textarea
                rows={5}
                defaultValue="Excellent tolerance. Client reports ‘loose, not sore’ post-session. Continue H3-Beta for one more cycle, then reassess for Gamma. Home mobility: external rotation banded, 3×12 daily."
                className="mt-3 w-full resize-none rounded-[8px] border border-black/[0.08] bg-white px-3 py-2 text-[12px] text-[#1F2937] focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/20"
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] text-[#9CA3AF]">Signed by Dr. Ruiz</span>
                <button className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-[#1F2937] px-3 text-[12px] font-semibold text-white hover:bg-[#0F1E28]">
                  <Send className="h-3.5 w-3.5" />
                  Save &amp; sign
                </button>
              </div>
            </div>

            <div className="rounded-[12px] border border-black/[0.07] bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                Client communication
              </p>
              <div className="mt-3 space-y-2 text-[12px]">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-black/15 text-[#C97A56] accent-[#C97A56]"
                  />
                  Send session summary email
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-black/15 text-[#C97A56] accent-[#C97A56]"
                  />
                  Attach home exercise plan
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-black/15 text-[#C97A56] accent-[#C97A56]"
                  />
                  Book next visit automatically
                </label>
              </div>
              <Link
                href="/patients/alex-morgan"
                className="mt-4 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[8px] border border-black/[0.07] bg-white text-[12px] font-medium text-[#374151] hover:border-black/10"
              >
                View long-term progress
              </Link>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  )
}
