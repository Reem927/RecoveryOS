"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Activity,
  ArrowRight,
  Flame,
  HeartPulse,
  Play,
  Settings2,
  Sparkles,
  Target,
  Timer,
  Waves,
  X,
  Zap,
} from "lucide-react"
import { AppShell } from "@/components/hydrawav3/app-shell"
import { AssessmentStepper, type Step } from "@/components/hydrawav3/assessment-stepper"
import { useActiveSession } from "@/lib/active-session"
import {
  buildProtocol,
  buildProtocolReasoning,
  getProtocolName,
  type HydrawavPayload,
  type SessionMetrics,
} from "@/lib/hydrawav3-protocol"
import { getClient } from "@/lib/hydrawav3-client"
import { DEMO_SESSION_METRICS, getDemoAssessment } from "@/lib/hydrawav3-demo-data"
import {
  computeWorseSide,
  type AssessmentSession,
  type ExercisePerformance,
  type MuscleScore,
} from "@/lib/leg-assessment-engine"

const DEFAULT_METRICS: SessionMetrics = {
  movementQuality: 70,
  symmetry: 75,
  cardio: 74,
  breathing: 12,
}

function deriveMetricsFromPerformances(
  performances: ExercisePerformance[],
): SessionMetrics {
  if (performances.length === 0) return DEFAULT_METRICS
  const mq =
    performances.reduce((s, p) => s + p.movementQuality, 0) / performances.length
  const sym =
    performances.reduce((s, p) => s + p.symmetry, 0) / performances.length
  return {
    movementQuality: Math.round(mq),
    symmetry: Math.round(sym),
    cardio: DEFAULT_METRICS.cardio,
    breathing: DEFAULT_METRICS.breathing,
  }
}

function deriveRecoveryScore(scores: MuscleScore[]): number {
  if (scores.length === 0) return 81
  const top4 = scores.slice(0, 4)
  const avg =
    top4.reduce((s, m) => s + Math.max(0, 100 - m.dysfunctionScore), 0) /
    top4.length
  return Math.round(avg)
}

export default function SessionSetupPage() {
  const router = useRouter()
  const { startSession } = useActiveSession()

  const [muscleScores, setMuscleScores] = useState<MuscleScore[]>([])
  const [performances, setPerformances] = useState<ExercisePerformance[]>([])
  const [metrics, setMetrics] = useState<SessionMetrics>(DEFAULT_METRICS)
  const [ready, setReady] = useState(false)
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [hotOverride, setHotOverride] = useState<number | null>(null)
  const [vibOverride, setVibOverride] = useState<number | null>(null)
  const [starting, setStarting] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const rawScores = localStorage.getItem("hw3_muscle_scores")
      const rawSession = localStorage.getItem("hw3_session")

      let loadedScores: MuscleScore[] | null = null
      let loadedPerformances: ExercisePerformance[] | null = null

      if (rawScores) {
        const parsed = JSON.parse(rawScores) as MuscleScore[]
        if (Array.isArray(parsed) && parsed.length > 0) loadedScores = parsed
      }
      if (rawSession) {
        const parsed = JSON.parse(rawSession) as AssessmentSession
        if (parsed?.performances && parsed.performances.length > 0) {
          loadedPerformances = parsed.performances
        }
      }

      // Fallback to demo data so the flow always presents a complete story.
      if (!loadedScores || !loadedPerformances) {
        const demo = getDemoAssessment()
        loadedScores = loadedScores ?? demo.muscleScores
        loadedPerformances = loadedPerformances ?? demo.performances
        setMetrics(DEMO_SESSION_METRICS)
      } else {
        setMetrics(deriveMetricsFromPerformances(loadedPerformances))
      }

      setMuscleScores(loadedScores)
      setPerformances(loadedPerformances)
    } catch {
      const demo = getDemoAssessment()
      setMuscleScores(demo.muscleScores)
      setPerformances(demo.performances)
      setMetrics(DEMO_SESSION_METRICS)
    } finally {
      setReady(true)
    }
  }, [])

  const worseSide = useMemo(
    () => computeWorseSide(performances),
    [performances],
  )

  const basePayload = useMemo(
    () => buildProtocol(muscleScores, performances, metrics),
    [muscleScores, performances, metrics],
  )

  const payload: HydrawavPayload = useMemo(() => {
    if (hotOverride === null && vibOverride === null) return basePayload
    const hot = hotOverride ?? basePayload.pwmValues.hot[0]
    return {
      ...basePayload,
      pwmValues: {
        hot: basePayload.pwmValues.hot.map(() => hot),
        cold: basePayload.pwmValues.cold,
      },
      vibMax: vibOverride ?? basePayload.vibMax,
    }
  }, [basePayload, hotOverride, vibOverride])

  const protocolName = getProtocolName(payload)
  const reasoning = useMemo(
    () => buildProtocolReasoning(muscleScores, worseSide, payload),
    [muscleScores, worseSide, payload],
  )
  const recoveryScore = useMemo(
    () => deriveRecoveryScore(muscleScores),
    [muscleScores],
  )

  const intensityLabel =
    protocolName === "H3-Alpha"
      ? "Gentle"
      : protocolName === "H3-Beta"
        ? "Moderate"
        : "Performance"
  const sunSide =
    worseSide === "symmetric"
      ? "left"
      : (worseSide as "left" | "right")
  const moonSide = sunSide === "left" ? "right" : "left"
  const durationMin = Math.max(1, Math.round(payload.totalDuration / 60))

  const steps: Step[] = [
    { label: "Consent", status: "done" },
    { label: "Intake", status: "done" },
    { label: "Camera scan", status: "done" },
    { label: "Insights", status: "done" },
    { label: "Session", status: "active", meta: "Review protocol" },
  ]

  const handleStart = async () => {
    if (starting) return
    setStarting(true)
    setStartError(null)
    try {
      localStorage.setItem("hw3_active_payload", JSON.stringify(payload))
      const client = getClient()
      const result = await client.startSession(payload)
      if (!result.success) {
        setStartError(result.message)
        setStarting(false)
        return
      }
      startSession({
        patientId: "alex-morgan",
        patientName: "Alex Morgan",
        protocol: `${protocolName} · ${durationMin} min`,
        room: "Room 2",
      })
      router.push("/session")
    } catch (err) {
      setStartError(err instanceof Error ? err.message : "Failed to start session")
      setStarting(false)
    }
  }

  return (
    <AppShell
      title="Session setup · Alex Morgan"
      eyebrow="Step 5 · Review and start"
      breadcrumbs={[
        { label: "Patients", href: "/patients" },
        { label: "Alex Morgan" },
        { label: "Session setup" },
      ]}
      actions={
        <Link
          href="/insights"
          className="inline-flex h-10 items-center rounded-[10px] border border-black/[0.07] bg-white px-3 text-[12.5px] font-medium text-[#374151] hover:border-black/10"
        >
          Back to insights
        </Link>
      }
    >
      <div className="space-y-6">
        <AssessmentStepper steps={steps} />

        {/* Hero: protocol name + recovery score */}
        <section className="relative overflow-hidden rounded-[12px] border border-black/[0.07] bg-gradient-to-br from-[#162532] via-[#1A2E3B] to-[#162532] p-6 text-white">
          <div
            aria-hidden
            className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#C97A56]/20 blur-[100px]"
          />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="relative flex h-[120px] w-[120px] shrink-0 items-center justify-center">
                <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="url(#setupScoreGrad)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - recoveryScore / 100)}
                  />
                  <defs>
                    <linearGradient id="setupScoreGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#C97A56" />
                      <stop offset="100%" stopColor="#F0A500" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
                    Recovery
                  </span>
                  <span className="mt-0.5 text-[32px] font-semibold tabular-nums leading-none">
                    {recoveryScore}
                  </span>
                </div>
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/70">
                  <Sparkles className="h-3 w-3 text-[#C97A56]" />
                  Protocol generated from assessment
                </span>
                <h2 className="mt-3 text-[30px] font-semibold leading-tight tracking-tight">
                  Hydrawav3 · <span className="text-[#F5B08C]">{protocolName}</span>
                </h2>
                <p className="mt-1 text-[13px] leading-relaxed text-white/60">
                  {intensityLabel} intensity · {durationMin} min · {payload.sessionCount} cycle
                  {payload.sessionCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setAdjustOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-white/15 bg-white/[0.04] px-4 text-[13px] font-medium text-white/85 hover:bg-white/[0.08]"
              >
                <Settings2 className="h-4 w-4" />
                Adjust protocol
              </button>
              <button
                type="button"
                onClick={handleStart}
                disabled={starting || !ready}
                className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#C97A56] px-4 text-[13px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(201,122,86,0.7)] hover:bg-[#B86A48] disabled:opacity-60"
              >
                <Play className="h-4 w-4" />
                {starting ? "Starting…" : "Start session"}
                {!starting && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {startError && (
            <div className="relative mt-4 rounded-[10px] border border-[#E74C3C]/30 bg-[#E74C3C]/10 px-4 py-2 text-[12px] text-[#f5b8b0]">
              {startError}
            </div>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Pad placement */}
          <section className="rounded-[12px] border border-black/[0.07] bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                  Pad placement
                </p>
                <h3 className="mt-1 text-[16px] font-semibold tracking-tight text-[#1F2937]">
                  Where to place the belt
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C97A56]/12 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#B86A48]">
                <Target className="h-3 w-3" />
                {worseSide === "symmetric" ? "Balanced" : `${sunSide} side focus`}
              </span>
            </div>

            <div className="mt-5 flex items-center justify-center">
              <BodyDiagram sunSide={sunSide} moonSide={moonSide} />
            </div>

            <ul className="mt-5 space-y-2.5">
              <li className="flex items-center gap-3 rounded-[10px] bg-[#FFF3ED] px-3 py-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#C97A56] text-white">
                  <Flame className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#B86A48]">
                    Sun pad · {sunSide}
                  </div>
                  <div className="text-[13px] text-[#1F2937]">
                    Warmth supports tissue preparation
                  </div>
                </div>
              </li>
              <li className="flex items-center gap-3 rounded-[10px] bg-[#EEF4FA] px-3 py-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#4F8FBF] text-white">
                  <Waves className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2E6591]">
                    Moon pad · {moonSide}
                  </div>
                  <div className="text-[13px] text-[#1F2937]">
                    Cool tone supports nervous system calming
                  </div>
                </div>
              </li>
            </ul>
          </section>

          {/* Reasoning */}
          <section className="rounded-[12px] border border-black/[0.07] bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
              Why this protocol
            </p>
            <h3 className="mt-1 text-[16px] font-semibold tracking-tight text-[#1F2937]">
              Built from the camera scan
            </h3>
            <ul className="mt-4 space-y-3">
              {reasoning.map((r, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C97A56]/12 text-[#C97A56]">
                    <Sparkles className="h-3 w-3" />
                  </span>
                  <p className="text-[13px] leading-relaxed text-[#374151]">{r}</p>
                </li>
              ))}
            </ul>

            {muscleScores.length > 0 && (
              <div className="mt-5 rounded-[10px] border border-dashed border-[#C97A56]/30 bg-[#C97A56]/6 p-3 text-[12px] leading-relaxed text-[#8c4e32]">
                <span className="font-semibold text-[#C97A56]">Top focus muscles: </span>
                {muscleScores
                  .slice(0, 3)
                  .map((m) => m.muscle.name)
                  .join(" · ")}
              </div>
            )}
          </section>
        </div>

        {/* Parameter cards */}
        <section className="rounded-[12px] border border-black/[0.07] bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                Protocol parameters
              </p>
              <h3 className="mt-1 text-[16px] font-semibold tracking-tight text-[#1F2937]">
                What the device is set to
              </h3>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ParamCard
              icon={Flame}
              tint="#C97A56"
              label="Intensity"
              value={intensityLabel}
              note={`pwm hot ${payload.pwmValues.hot[0]}`}
            />
            <ParamCard
              icon={Zap}
              tint="#F0A500"
              label="Vibration"
              value={
                payload.vibMax <= 150
                  ? "Calming"
                  : payload.vibMax <= 200
                    ? "Moderate"
                    : "Energising"
              }
              note={`vibMax ${payload.vibMax}`}
            />
            <ParamCard
              icon={Activity}
              tint="#27AE60"
              label="Cycles"
              value={`${payload.sessionCount} × ${payload.cycleRepetitions.join("/")}`}
              note={`edge ${payload.edgeCycleDuration}s`}
            />
            <ParamCard
              icon={Timer}
              tint="#8B5CF6"
              label="Duration"
              value={`${durationMin} min`}
              note={`${payload.totalDuration}s total`}
            />
          </div>
        </section>
      </div>

      {adjustOpen && (
        <AdjustModal
          hot={hotOverride ?? basePayload.pwmValues.hot[0]}
          vib={vibOverride ?? basePayload.vibMax}
          onHotChange={setHotOverride}
          onVibChange={setVibOverride}
          onReset={() => {
            setHotOverride(null)
            setVibOverride(null)
          }}
          onClose={() => setAdjustOpen(false)}
        />
      )}
    </AppShell>
  )
}

function ParamCard({
  icon: Icon,
  tint,
  label,
  value,
  note,
}: {
  icon: React.ComponentType<{ className?: string }>
  tint: string
  label: string
  value: string
  note: string
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[12px] border border-black/[0.07] bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
          {label}
        </span>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-[8px]"
          style={{ backgroundColor: `${tint}1F`, color: tint }}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div>
        <div className="text-[20px] font-semibold tabular-nums text-[#1F2937]">{value}</div>
        <div className="mt-0.5 text-[11px] text-[#9CA3AF]">{note}</div>
      </div>
    </div>
  )
}

function BodyDiagram({
  sunSide,
  moonSide,
}: {
  sunSide: "left" | "right"
  moonSide: "left" | "right"
}) {
  // Viewer sees the client as if facing them: client's LEFT leg sits on the
  // viewer's RIGHT, and vice versa. We mirror so L/R labels match client anatomy.
  const leftIsSun = sunSide === "left"
  const rightLegFill = leftIsSun ? "url(#sunGrad)" : "url(#moonGrad)"   // client left
  const leftLegFill = leftIsSun ? "url(#moonGrad)" : "url(#sunGrad)"    // client right
  const leftGlowOpacity = leftIsSun ? 0 : 1
  const rightGlowOpacity = leftIsSun ? 1 : 0

  return (
    <svg viewBox="0 0 220 340" className="h-[260px] w-auto">
      <defs>
        <linearGradient id="sunGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5B876" />
          <stop offset="50%" stopColor="#E8925D" />
          <stop offset="100%" stopColor="#B86A48" />
        </linearGradient>
        <linearGradient id="moonGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9CC9E5" />
          <stop offset="50%" stopColor="#6DA5C9" />
          <stop offset="100%" stopColor="#3F7A9F" />
        </linearGradient>
        <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EADDCC" />
          <stop offset="100%" stopColor="#D6C6B0" />
        </linearGradient>
        <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#F0A500" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#F0A500" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="moonGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#4F8FBF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#4F8FBF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ambient glows behind the sun/moon side */}
      <ellipse
        cx="70"
        cy="230"
        rx="60"
        ry="90"
        fill={leftIsSun ? "url(#moonGlow)" : "url(#sunGlow)"}
        opacity={leftIsSun ? 0.9 : 1}
      />
      <ellipse
        cx="150"
        cy="230"
        rx="60"
        ry="90"
        fill={leftIsSun ? "url(#sunGlow)" : "url(#moonGlow)"}
      />

      {/* head */}
      <circle cx="110" cy="34" r="20" fill="url(#skinGrad)" />
      <ellipse cx="110" cy="54" rx="10" ry="6" fill="url(#skinGrad)" />

      {/* shoulders + torso */}
      <path
        d="M 68 72 Q 110 62 152 72 L 148 92 Q 110 86 72 92 Z"
        fill="url(#skinGrad)"
      />
      <path
        d="M 72 92 Q 110 86 148 92 L 144 168 Q 110 176 76 168 Z"
        fill="url(#skinGrad)"
      />

      {/* arms */}
      <path
        d="M 68 72 Q 56 90 54 130 Q 54 150 60 170 L 66 170 Q 70 150 70 130 Q 72 100 78 82 Z"
        fill="url(#skinGrad)"
      />
      <path
        d="M 152 72 Q 164 90 166 130 Q 166 150 160 170 L 154 170 Q 150 150 150 130 Q 148 100 142 82 Z"
        fill="url(#skinGrad)"
      />

      {/* pelvis */}
      <path
        d="M 76 168 Q 110 176 144 168 L 138 186 Q 110 192 82 186 Z"
        fill="url(#skinGrad)"
      />

      {/* viewer-left leg (= client RIGHT) */}
      <path
        d="M 82 186 Q 78 240 76 300 L 96 308 Q 102 250 100 188 Z"
        fill={leftLegFill}
        opacity="0.96"
      />
      <ellipse cx="89" cy="308" rx="14" ry="5" fill="#1F2937" opacity="0.25" />

      {/* viewer-right leg (= client LEFT) */}
      <path
        d="M 120 188 Q 118 250 124 308 L 144 300 Q 142 240 138 186 Z"
        fill={rightLegFill}
        opacity="0.96"
      />
      <ellipse cx="131" cy="308" rx="14" ry="5" fill="#1F2937" opacity="0.25" />

      {/* focus ring on SUN side leg */}
      <ellipse
        cx="89"
        cy="250"
        rx="28"
        ry="70"
        fill="none"
        stroke="#F0A500"
        strokeWidth="1.5"
        strokeDasharray="3 4"
        opacity={leftIsSun ? 0 : 0.7}
      />
      <ellipse
        cx="131"
        cy="250"
        rx="28"
        ry="70"
        fill="none"
        stroke="#F0A500"
        strokeWidth="1.5"
        strokeDasharray="3 4"
        opacity={leftIsSun ? 0.7 : 0}
      />

      {/* client LEFT label (viewer right) */}
      <g transform="translate(175, 240)">
        <rect x="-26" y="-12" width="52" height="24" rx="12" fill="white" stroke="#E5DCCF" />
        <text
          x="0"
          y="4"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={leftIsSun ? "#C97A56" : "#4F8FBF"}
        >
          L · {leftIsSun ? "SUN" : "MOON"}
        </text>
      </g>

      {/* client RIGHT label (viewer left) */}
      <g transform="translate(45, 240)">
        <rect x="-26" y="-12" width="52" height="24" rx="12" fill="white" stroke="#E5DCCF" />
        <text
          x="0"
          y="4"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={leftIsSun ? "#4F8FBF" : "#C97A56"}
        >
          R · {leftIsSun ? "MOON" : "SUN"}
        </text>
      </g>

      {/* connector lines */}
      <path
        d="M 153 240 Q 165 240 170 240"
        stroke="#C97A56"
        strokeWidth="1"
        strokeDasharray="2 3"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M 67 240 Q 55 240 50 240"
        stroke="#4F8FBF"
        strokeWidth="1"
        strokeDasharray="2 3"
        fill="none"
        opacity="0.6"
      />
    </svg>
  )
}

function AdjustModal({
  hot,
  vib,
  onHotChange,
  onVibChange,
  onReset,
  onClose,
}: {
  hot: number
  vib: number
  onHotChange: (v: number) => void
  onVibChange: (v: number) => void
  onReset: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-[14px] border border-black/[0.07] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-semibold tracking-tight text-[#1F2937]">
            Adjust protocol
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#9CA3AF] hover:bg-black/5"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-semibold text-[#374151]">Intensity (pwm hot)</label>
              <span className="text-[12px] tabular-nums text-[#1F2937]">{hot}</span>
            </div>
            <input
              type="range"
              min={50}
              max={120}
              step={5}
              value={hot}
              onChange={(e) => onHotChange(Number(e.target.value))}
              className="mt-2 w-full accent-[#C97A56]"
            />
            <div className="mt-1 flex justify-between text-[10px] text-[#9CA3AF]">
              <span>Gentle</span>
              <span>Moderate</span>
              <span>Peak</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-semibold text-[#374151]">Vibration (vibMax)</label>
              <span className="text-[12px] tabular-nums text-[#1F2937]">{vib}</span>
            </div>
            <input
              type="range"
              min={100}
              max={255}
              step={5}
              value={vib}
              onChange={(e) => onVibChange(Number(e.target.value))}
              className="mt-2 w-full accent-[#C97A56]"
            />
            <div className="mt-1 flex justify-between text-[10px] text-[#9CA3AF]">
              <span>Calming</span>
              <span>Moderate</span>
              <span>Energising</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-9 items-center rounded-[8px] border border-black/[0.07] bg-white px-3 text-[12px] font-medium text-[#374151] hover:border-black/10"
          >
            Reset to auto
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center rounded-[8px] bg-[#C97A56] px-4 text-[12px] font-semibold text-white hover:bg-[#B86A48]"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-[11px] text-[#9CA3AF]">
          <HeartPulse className="h-3 w-3" />
          Adjustments stay within safe clinical ranges.
        </div>
      </div>
    </div>
  )
}
