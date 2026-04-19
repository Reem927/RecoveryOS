"use client"

import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Droplet,
  Flame,
  HeartPulse,
  Info,
  Play,
  Sparkles,
  Video,
  Waves,
  Wind,
  Zap,
} from "lucide-react"
import { AppShell } from "@/components/hydrawav3/app-shell"
import { AssessmentStepper, type Step } from "@/components/hydrawav3/assessment-stepper"
import type { MuscleScore } from "@/lib/leg-assessment-engine"
import { supabase } from "@/lib/supabase"
import { useSearchParams } from "next/navigation"

function InsightsContent() {
  const searchParams = useSearchParams()
  const scanId = searchParams.get("scan")

  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    async function fetchVideoUrl() {
      if (!scanId) return
      const { data } = await supabase
        .from("cv_scans")
        .select("metrics")
        .eq("id", scanId)
        .single()
      const metrics = data?.metrics as Record<string, unknown> | undefined
      if (metrics?.videoUrl) {
        setVideoUrl(metrics.videoUrl as string)
      }
    }
    fetchVideoUrl()
  }, [scanId])

  const steps: Step[] = [
    { label: "Consent", status: "done", meta: "09:02" },
    { label: "Intake", status: "done", meta: "09:04" },
    { label: "Camera scan", status: "done", meta: "09:06" },
    { label: "Insights", status: "active", meta: "Ready" },
    { label: "Session", status: "todo" },
  ]

  const defaultBreakdown = [
    {
      label: "Movement quality",
      value: 84,
      note: "Smooth scapular tracking on left side",
      icon: Activity,
      tint: "#C97A56",
    },
    {
      label: "Symmetry",
      value: 72,
      note: "7% asymmetry on right shoulder abduction",
      icon: Zap,
      tint: "#F0A500",
    },
    {
      label: "Cardio readiness",
      value: 86,
      note: "HRV 62 ms · within target band",
      icon: HeartPulse,
      tint: "#27AE60",
    },
    {
      label: "Breathing stability",
      value: 80,
      note: "14 rpm · minor chest dominance",
      icon: Wind,
      tint: "#8B5CF6",
    },
  ]

  function buildBreakdownFromScores(scores: MuscleScore[]) {
    const top4 = scores.slice(0, 4)
    const icons = [Activity, Zap, HeartPulse, Wind] as const
    const tints = ["#C97A56", "#F0A500", "#27AE60", "#8B5CF6"]
    const labels = ["Movement Quality", "Symmetry", "Cardio Readiness", "Breathing Stability"]

    return top4.map((ms, i) => ({
      label: labels[i],
      value: Math.max(0, 100 - ms.dysfunctionScore),
      note: ms.evidence[0] ?? ms.muscle.name,
      icon: icons[i],
      tint: tints[i],
    }))
  }

  const [breakdown, setBreakdown] = useState(defaultBreakdown)
  const [recoveryScore, setRecoveryScore] = useState(81)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("hw3_muscle_scores")
      if (!raw) return
      const scores: MuscleScore[] = JSON.parse(raw)
      if (!scores.length) return
      const built = buildBreakdownFromScores(scores)
      setBreakdown(built)
      const avg = Math.round(built.reduce((s, b) => s + b.value, 0) / built.length)
      setRecoveryScore(avg)
    } catch {
      // fall back to defaults
    }
  }, [])

  return (
    <AppShell
      title="Recovery insights · Alex Morgan"
      breadcrumbs={[
        { label: "Patients" },
        { label: "Alex Morgan" },
        { label: "Insights" },
      ]}
      actions={
        <Link
          href="/session-setup"
          className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#C97A56] px-4 text-[13px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(201,122,86,0.7)] hover:bg-[#B86A48]"
        >
          <Play className="h-4 w-4" />
          Start H3-Beta session
        </Link>
      }
    >
      <div className="space-y-6">
        <AssessmentStepper steps={steps} />

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="relative overflow-hidden rounded-[12px] border border-black/[0.07] bg-gradient-to-br from-[#162532] via-[#1A2E3B] to-[#162532] p-6 text-white">
            <div
              aria-hidden
              className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#C97A56]/20 blur-[100px]"
            />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
              <div className="relative mx-auto flex h-[180px] w-[180px] shrink-0 items-center justify-center">
                <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="10"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="url(#scoreGrad)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - recoveryScore / 100)}
                  />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#C97A56" />
                      <stop offset="100%" stopColor="#F0A500" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
                    Recovery
                  </span>
                  <span className="mt-1 text-[44px] font-semibold tabular-nums leading-none">
                    {recoveryScore}
                  </span>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#27AE60]/20 px-2 py-0.5 text-[11px] font-medium text-[#6ee7a7]">
                    <ArrowRight className="h-3 w-3 -rotate-45" /> +3 from last
                  </span>
                </div>
              </div>

              <div className="flex-1">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/70">
                  <Sparkles className="h-3 w-3 text-[#C97A56]" />
                  Hydrawav3 analysis complete
                </span>
                <h2 className="mt-3 text-balance text-[26px] font-semibold leading-tight tracking-tight">
                  Ready for a targeted{" "}
                  <span className="text-[#F5B08C]">mid-intensity</span> recovery session.
                </h2>
                <p className="mt-2 text-pretty text-[13px] leading-relaxed text-white/60">
                  Good cardio readiness and breathing stability, but a persistent 7% asymmetry on
                  right shoulder abduction needs attention. Pair focused scapular work with
                  parasympathetic down-regulation.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Link
                    href="/session-setup"
                    className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#C97A56] px-4 text-[13px] font-semibold text-white hover:bg-[#B86A48]"
                  >
                    <Play className="h-4 w-4" />
                    Start recommended session
                  </Link>
                  <button className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-white/15 bg-white/[0.04] px-4 text-[13px] font-medium text-white/85 hover:bg-white/[0.08]">
                    Adjust protocol
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[12px] border border-[#C97A56]/30 bg-white p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#C97A56]/12 blur-3xl"
            />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C97A56]/12 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C97A56]">
                  <Sparkles className="h-3 w-3" />
                  Recommended
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6B7280]">
                  <Clock className="h-3 w-3" />
                  18 min total
                </span>
              </div>
              <h3 className="mt-3 text-[22px] font-semibold tracking-tight text-[#1F2937]">
                Hydrawav3 · Protocol H3-Beta
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-[#6B7280]">
                Scapular stabilisation wave + vagal-down breathing. Targets asymmetry while
                preserving HRV gains.
              </p>

              <ul className="mt-5 space-y-2.5">
                {[
                  { icon: Waves, label: "Wave sequence", v: "Alpha → Beta 2.4 Hz" },
                  { icon: Flame, label: "Intensity", v: "Mid · 62% of max" },
                  { icon: Droplet, label: "Hydration cue", v: "250 ml pre-session" },
                ].map((r) => (
                  <li
                    key={r.label}
                    className="flex items-center gap-3 rounded-[10px] bg-[#F2EDE6]/70 px-3 py-2.5"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-white text-[#C97A56] ring-1 ring-black/[0.05]">
                      <r.icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                        {r.label}
                      </div>
                      <div className="truncate text-[13px] font-semibold text-[#1F2937]">
                        {r.v}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-5 rounded-[10px] border border-dashed border-[#C97A56]/30 bg-[#C97A56]/6 p-3 text-[12px] leading-relaxed text-[#8c4e32]">
                <span className="font-semibold text-[#C97A56]">Why this protocol:</span> patients
                with ≤ 10% asymmetry and HRV &gt; 55 ms respond 34% better to H3-Beta than
                H3-Alpha over 4 sessions.
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-[12px] border border-black/[0.07] bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                Recovery breakdown
              </p>
              <h3 className="mt-1 text-[16px] font-semibold tracking-tight text-[#1F2937]">
                Four dimensions drive the score
              </h3>
            </div>
            <button className="text-[12px] font-medium text-[#C97A56] hover:text-[#B86A48]">
              Download PDF report
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {breakdown.map((b) => {
              const pct = b.value
              return (
                <div
                  key={b.label}
                  className="flex flex-col gap-3 rounded-[12px] border border-black/[0.07] bg-white p-4 hover:shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
                      {b.label}
                    </span>
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-[8px]"
                      style={{ backgroundColor: `${b.tint}1F`, color: b.tint }}
                    >
                      <b.icon className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[28px] font-semibold tabular-nums text-[#1F2937]">
                      {b.value}
                    </span>
                    <span className="text-[12px] text-[#9CA3AF]">/ 100</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#F2EDE6]">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: b.tint }}
                    />
                  </div>
                  <p className="text-[12px] leading-relaxed text-[#6B7280]">{b.note}</p>
                </div>
              )
            })}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-[12px] border border-black/[0.07] bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                  Alternative protocols
                </p>
                <h3 className="mt-1 text-[16px] font-semibold tracking-tight text-[#1F2937]">
                  Swap if clinical judgment differs
                </h3>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {[
                {
                  name: "H3-Alpha",
                  tag: "Gentle",
                  time: "22 min",
                  desc: "Low-intensity mobility. Best if VAS > 6.",
                  tint: "#27AE60",
                },
                {
                  name: "H3-Beta",
                  tag: "Recommended",
                  time: "18 min",
                  desc: "Balanced stabilisation + recovery.",
                  tint: "#C97A56",
                  active: true,
                },
                {
                  name: "H3-Gamma",
                  tag: "Performance",
                  time: "14 min",
                  desc: "Higher output. Use on adherent athletes.",
                  tint: "#8B5CF6",
                },
              ].map((p) => (
                <div
                  key={p.name}
                  className={`relative flex flex-col rounded-[12px] border p-4 transition-colors ${
                    p.active
                      ? "border-[#C97A56] bg-[#C97A56]/6"
                      : "border-black/[0.07] bg-white hover:border-[#C97A56]/30"
                  }`}
                >
                  {p.active && (
                    <span className="absolute -top-2 left-4 rounded-full bg-[#C97A56] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
                      Current
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <span
                      className="rounded-[6px] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]"
                      style={{ backgroundColor: `${p.tint}22`, color: p.tint }}
                    >
                      {p.tag}
                    </span>
                    <span className="text-[11px] text-[#9CA3AF]">{p.time}</span>
                  </div>
                  <div className="mt-3 text-[16px] font-semibold tracking-tight text-[#1F2937]">
                    {p.name}
                  </div>
                  <p className="mt-1 flex-1 text-[12px] text-[#6B7280]">{p.desc}</p>
                  <button className="mt-3 inline-flex h-8 items-center justify-center rounded-[8px] border border-black/[0.07] bg-white text-[12px] font-medium text-[#374151] hover:border-[#C97A56]/40 hover:text-[#C97A56]">
                    {p.active ? "Selected" : "Use this"}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-[12px] border border-[#F0A500]/25 bg-[#F0A500]/8 p-5">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-[#c47f00]">
                <AlertTriangle className="h-4 w-4" />
                Flagged findings
              </div>
              <ul className="mt-3 space-y-2.5">
                {[
                  "Right shoulder abduction 22° below contralateral",
                  "Mild forward head posture · 2.4 cm offset",
                  "Subtle breath-hold at end-range overhead reach",
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-[12px] text-[#7a5500]">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#c47f00]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[12px] border border-black/[0.07] bg-white p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#8B5CF6]/12 text-[#8B5CF6]">
                  <Info className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <h4 className="text-[13px] font-semibold text-[#1F2937]">
                    Override & sign-off
                  </h4>
                  <p className="mt-1 text-[12px] leading-relaxed text-[#6B7280]">
                    Clinical judgment always wins. You can modify the protocol and document
                    rationale before starting.
                  </p>
                  <textarea
                    rows={3}
                    placeholder="Add practitioner note (optional)…"
                    className="mt-3 w-full resize-none rounded-[8px] border border-black/[0.08] bg-white px-3 py-2 text-[12px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/20"
                  />
                </div>
              </div>
            </div>
            {videoUrl ? (
              <div className="rounded-[12px] border border-black/[0.07] bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-[#C97A56]" />
                    <span className="text-[13px] font-semibold text-[#1F2937]">Session recording</span>
                  </div>
                  <button
                    onClick={() => setShowVideo(!showVideo)}
                    className="text-[12px] font-medium text-[#C97A56]"
                  >
                    {showVideo ? "Hide" : "Play"}
                  </button>
                </div>
                {showVideo && (
                  <video
                    src={videoUrl}
                    controls
                    className="aspect-video w-full rounded-[8px] bg-black"
                  />
                )}
              </div>
            ) : null}

            <div className="flex items-center gap-2 rounded-[10px] bg-[#1A7A45] px-4 py-3 text-[12px] font-medium text-white">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
                <CheckCircle2 className="h-3 w-3" />
              </span>
              Insights synced to Alex&apos;s chart
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#162532] text-white">Loading...</div>}>
      <InsightsContent />
    </Suspense>
  )
}