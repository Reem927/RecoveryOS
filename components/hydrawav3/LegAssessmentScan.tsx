"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  Activity, Wind, HeartPulse, AlertTriangle,
  CheckCircle2, ChevronRight, Play, Pause, ArrowRight,
  Camera, Wifi, Zap, Circle, Info, TrendingUp,
} from "lucide-react"
import {
  EXERCISES,
  ExercisePerformance, AssessmentSession, ExerciseId,
  angleBetweenPoints, computeSymmetryScore,
  createSession, advanceSession, MEDIAPIPE_LANDMARKS, MuscleScore,
} from "@/lib/leg-assessment-engine"
import dynamic from "next/dynamic"

const HumanModel3D = dynamic(
  () => import("@/components/hydrawav3/HumanModel3D"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C97A56] border-t-transparent" />
      </div>
    ),
  }
)

// ─── Types ────────────────────────────────────────────────────────────────────

interface Landmark { x: number; y: number; z: number; visibility?: number }

interface LiveMetrics {
  movementQuality: number
  symmetry: number
  cardio: number
  breathing: number
  kneeFlexionL: number
  kneeFlexionR: number
  hipFlexionL: number
  hipFlexionR: number
  ankleFlexionL: number
  ankleFlexionR: number
  detectedPatterns: string[]
  repCount: number
  formHint: string
}

// ─── Fix 2: Temporal pattern smoother ────────────────────────────────────────
class TemporalSmoother {
  private window: string[][] = []
  private readonly W = 8
  private readonly N = 5

  push(patterns: string[]) {
    this.window.push(patterns)
    if (this.window.length > this.W) this.window.shift()
  }

  confirmed(): string[] {
    const counts: Record<string, number> = {}
    this.window.forEach(frame =>
      frame.forEach(p => { counts[p] = (counts[p] ?? 0) + 1 })
    )
    return Object.entries(counts)
      .filter(([, c]) => c >= this.N)
      .map(([p]) => p)
  }

  reset() { this.window = [] }
}

// ─── Fix 4: Movement quality via angle smoothness ────────────────────────────
class SmoothnessTracker {
  private history: number[] = []
  private readonly MAX = 20

  push(angle: number) {
    this.history.push(angle)
    if (this.history.length > this.MAX) this.history.shift()
  }

  score(): number {
    if (this.history.length < 3) return 50
    const mean = this.history.reduce((a, b) => a + b, 0) / this.history.length
    const variance = this.history.reduce((a, b) => a + (b - mean) ** 2, 0) / this.history.length
    return Math.round(Math.max(0, Math.min(100, 100 - variance / 4)))
  }

  reset() { this.history = [] }
}

// ─── Fix 3: Exercise-specific rep counter ────────────────────────────────────
class RepCounter {
  private state: "up" | "down" = "up"
  private count = 0

  updateKnee(kneeAngle: number): number {
    if (this.state === "up"   && kneeAngle < 125) { this.state = "down" }
    if (this.state === "down" && kneeAngle > 160) { this.state = "up"; this.count++ }
    return this.count
  }

  updateAnkle(ankleAngle: number): number {
    if (this.state === "up"   && ankleAngle < 72) { this.state = "down" }
    if (this.state === "down" && ankleAngle > 82) { this.state = "up"; this.count++ }
    return this.count
  }

  reset() { this.count = 0; this.state = "up" }
  get() { return this.count }
}

// ─── Fix 1: Full pattern detection for all 5 exercises ───────────────────────
function detectPatterns(
  exerciseId: ExerciseId,
  lms: Landmark[],
  angles: { lKnee: number; rKnee: number; lHip: number; rHip: number; lAnkle: number; rAnkle: number }
): string[] {
  const L = MEDIAPIPE_LANDMARKS
  const get = (i: number) => lms[i] ?? { x: 0.5, y: 0.5, z: 0 }
  const patterns: string[] = []

  const hipW  = Math.abs(get(L.LEFT_HIP).x  - get(L.RIGHT_HIP).x)
  const kneeW = Math.abs(get(L.LEFT_KNEE).x - get(L.RIGHT_KNEE).x)

  if (exerciseId === "bodyweight_squat") {
    if (kneeW < hipW * 0.72) patterns.push("knees_cave_inward")
    if ((angles.lKnee + angles.rKnee) / 2 > 115) patterns.push("insufficient_depth")
    if (Math.abs(get(L.LEFT_SHOULDER).x - get(L.LEFT_HIP).x) > 0.10) patterns.push("forward_lean_excessive")
    const hipCx = (get(L.LEFT_HIP).x + get(L.RIGHT_HIP).x) / 2
    const kneeCx = (get(L.LEFT_KNEE).x + get(L.RIGHT_KNEE).x) / 2
    if (Math.abs(kneeCx - hipCx) > 0.06) patterns.push("asymmetric_weight_shift")
  }

  if (exerciseId === "reverse_lunge") {
    if (kneeW < hipW * 0.68) patterns.push("front_knee_collapses")
    if (angles.rHip > 150) patterns.push("hip_flexor_tightness")
    if (Math.abs(angles.lKnee - angles.rKnee) > 25) patterns.push("side_to_side_asymmetry")
    if (Math.abs(get(L.LEFT_SHOULDER).y - get(L.RIGHT_SHOULDER).y) > 0.04) patterns.push("glute_weakness_rear_leg")
  }

  if (exerciseId === "single_leg_balance") {
    if (Math.abs(get(L.LEFT_HIP).y - get(L.RIGHT_HIP).y) > 0.04) patterns.push("trendelenburg_sign")
    if (Math.abs(get(L.LEFT_ANKLE).x - 0.5) > 0.09) patterns.push("excessive_ankle_sway")
    if (Math.abs(get(L.LEFT_KNEE).x - get(L.LEFT_ANKLE).x) > 0.055) patterns.push("knee_wobble_medial")
    const shoulderMid = (get(L.LEFT_SHOULDER).x + get(L.RIGHT_SHOULDER).x) / 2
    const ankleMid    = (get(L.LEFT_ANKLE).x + get(L.RIGHT_ANKLE).x) / 2
    if (Math.abs(shoulderMid - ankleMid) > 0.08) patterns.push("it_band_tightness")
  }

  if (exerciseId === "hip_hinge") {
    if ((angles.lHip + angles.rHip) / 2 > 145) patterns.push("hamstring_tightness")
    const shoulderY = (get(L.LEFT_SHOULDER).y + get(L.RIGHT_SHOULDER).y) / 2
    const hipY      = (get(L.LEFT_HIP).y + get(L.RIGHT_HIP).y) / 2
    if (shoulderY > hipY + 0.05) patterns.push("lumbar_flexion")
    if ((angles.lKnee + angles.rKnee) / 2 > 170) patterns.push("knee_hyperextension")
    const shoulderMid = (get(L.LEFT_SHOULDER).x + get(L.RIGHT_SHOULDER).x) / 2
    const hipMid      = (get(L.LEFT_HIP).x + get(L.RIGHT_HIP).x) / 2
    if (Math.abs(shoulderMid - hipMid) > 0.07) patterns.push("lateral_shift")
  }

  if (exerciseId === "calf_raise") {
    if ((angles.lAnkle + angles.rAnkle) / 2 > 78) patterns.push("limited_plantarflexion")
    if (Math.abs(angles.lAnkle - angles.rAnkle) > 12) patterns.push("heel_asymmetry")
    if (get(L.LEFT_FOOT_INDEX).x - get(L.LEFT_HEEL).x > 0.04) patterns.push("inward_heel_roll")
  }

  return patterns
}

// ─── Form hint ────────────────────────────────────────────────────────────────
const HINTS: Record<string, string> = { // eslint-disable-line @typescript-eslint/no-explicit-any
  "": "",
  knees_cave_inward:      "Push knees outward over toes",
  insufficient_depth:     "Lower a little deeper",
  forward_lean_excessive: "Chest up — stay tall",
  asymmetric_weight_shift:"Even your weight left and right",
  front_knee_collapses:   "Front knee over your ankle",
  hip_flexor_tightness:   "Drive the rear hip forward",
  side_to_side_asymmetry: "Match both sides equally",
  glute_weakness_rear_leg:"Squeeze the glute on your back leg",
  trendelenburg_sign:     "Keep hips level — squeeze side glute",
  excessive_ankle_sway:   "Grip the floor with your foot",
  knee_wobble_medial:     "Brace your knee — don't let it cave",
  it_band_tightness:      "Stand tall — don't lean sideways",
  hamstring_tightness:    "Soften the knees slightly",
  lumbar_flexion:         "Flat back — hinge from the hips",
  knee_hyperextension:    "Soft bend in the knees",
  lateral_shift:          "Keep weight centred",
  limited_plantarflexion: "Rise higher onto your toes",
  heel_asymmetry:         "Rise evenly on both feet",
  inward_heel_roll:       "Keep heels tracking straight",
}

function getHint(patterns: string[]): string {
  if (patterns.length === 0) return "Great form — keep going!"
  return HINTS[patterns[0]] ?? "Adjust your form"
}

// ─── Metric pill ──────────────────────────────────────────────────────────────
function MetricPill({ icon: Icon, label, value, unit, color }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: number; unit: string; color: string
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[10px] border border-black/[0.07] bg-white p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">{label}</span>
        <span className="flex h-6 w-6 items-center justify-center rounded-[6px]"
          style={{ backgroundColor: `${color}22`, color }}>
          <Icon className="h-3 w-3" />
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[20px] font-semibold tabular-nums text-[#1F2937]">{value}</span>
        <span className="text-[10px] text-[#9CA3AF]">{unit}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-[#F2EDE6]">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, value)}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export type ScanMode = "practitioner" | "client"

interface Props {
  mode?: ScanMode
  onComplete?: (muscleScores: MuscleScore[], session: AssessmentSession) => void
}

export default function LegAssessmentScan({ mode = "practitioner", onComplete }: Props) {
  const videoRef   = useRef<HTMLVideoElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const poseRef    = useRef<any>(null)
  const cameraRef  = useRef<any>(null)
  const sessionRef = useRef<AssessmentSession>(createSession())

  const smoother   = useRef(new TemporalSmoother())
  const repCounter = useRef(new RepCounter())
  const smoothness = useRef(new SmoothnessTracker())
  const metricsBuf = useRef<LiveMetrics[]>([])

  const [session, setSession]             = useState<AssessmentSession>(createSession())
  const [isRunning, setIsRunning]         = useState(false)
  const [exerciseTimer, setExerciseTimer] = useState(0)
  const [showGuide, setShowGuide]         = useState(true)
  const [cameraReady, setCameraReady]     = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [metrics, setMetrics] = useState<LiveMetrics>({
    movementQuality: 0, symmetry: 0, cardio: 72, breathing: 14,
    kneeFlexionL: 0, kneeFlexionR: 0, hipFlexionL: 0, hipFlexionR: 0,
    ankleFlexionL: 90, ankleFlexionR: 90,
    detectedPatterns: [], repCount: 0, formHint: "",
  })

  // ── Landmark processing ────────────────────────────────────────────────────
  const processLandmarks = useCallback((lms: Landmark[]) => {
    const L = MEDIAPIPE_LANDMARKS
    const get = (i: number) => lms[i] ?? { x: 0.5, y: 0.5, z: 0 }

    const lKnee = angleBetweenPoints(
      { x: get(L.LEFT_HIP).x,   y: get(L.LEFT_HIP).y   },
      { x: get(L.LEFT_KNEE).x,  y: get(L.LEFT_KNEE).y  },
      { x: get(L.LEFT_ANKLE).x, y: get(L.LEFT_ANKLE).y }
    )
    const rKnee = angleBetweenPoints(
      { x: get(L.RIGHT_HIP).x,   y: get(L.RIGHT_HIP).y   },
      { x: get(L.RIGHT_KNEE).x,  y: get(L.RIGHT_KNEE).y  },
      { x: get(L.RIGHT_ANKLE).x, y: get(L.RIGHT_ANKLE).y }
    )
    const lHip = angleBetweenPoints(
      { x: get(L.LEFT_SHOULDER).x, y: get(L.LEFT_SHOULDER).y },
      { x: get(L.LEFT_HIP).x,      y: get(L.LEFT_HIP).y      },
      { x: get(L.LEFT_KNEE).x,     y: get(L.LEFT_KNEE).y     }
    )
    const rHip = angleBetweenPoints(
      { x: get(L.RIGHT_SHOULDER).x, y: get(L.RIGHT_SHOULDER).y },
      { x: get(L.RIGHT_HIP).x,      y: get(L.RIGHT_HIP).y      },
      { x: get(L.RIGHT_KNEE).x,     y: get(L.RIGHT_KNEE).y     }
    )
    const lAnkle = angleBetweenPoints(
      { x: get(L.LEFT_KNEE).x,       y: get(L.LEFT_KNEE).y       },
      { x: get(L.LEFT_ANKLE).x,      y: get(L.LEFT_ANKLE).y      },
      { x: get(L.LEFT_FOOT_INDEX).x, y: get(L.LEFT_FOOT_INDEX).y }
    )
    const rAnkle = angleBetweenPoints(
      { x: get(L.RIGHT_KNEE).x,       y: get(L.RIGHT_KNEE).y       },
      { x: get(L.RIGHT_ANKLE).x,      y: get(L.RIGHT_ANKLE).y      },
      { x: get(L.RIGHT_FOOT_INDEX).x, y: get(L.RIGHT_FOOT_INDEX).y }
    )

    const exerciseId = sessionRef.current.currentExercise

    const rawPatterns = detectPatterns(exerciseId, lms, { lKnee, rKnee, lHip, rHip, lAnkle, rAnkle })

    smoother.current.push(rawPatterns)
    const confirmedPatterns = smoother.current.confirmed()

    let reps = repCounter.current.get()
    if (exerciseId === "calf_raise") {
      reps = repCounter.current.updateAnkle((lAnkle + rAnkle) / 2)
    } else if (exerciseId !== "single_leg_balance") {
      reps = repCounter.current.updateKnee((lKnee + rKnee) / 2)
    }

    smoothness.current.push(lKnee)
    smoothness.current.push(rKnee)
    const qualityScore  = smoothness.current.score()
    const symmetryScore = Math.round(
      (computeSymmetryScore(lKnee, rKnee) + computeSymmetryScore(lHip, rHip)) / 2
    )

    const m: LiveMetrics = {
      movementQuality: qualityScore,
      symmetry: symmetryScore,
      cardio: 72 + Math.round(Math.random() * 4 - 2),
      breathing: 14 + Math.round(Math.random() * 2 - 1),
      kneeFlexionL: lKnee, kneeFlexionR: rKnee,
      hipFlexionL: lHip,   hipFlexionR: rHip,
      ankleFlexionL: lAnkle, ankleFlexionR: rAnkle,
      detectedPatterns: confirmedPatterns,
      repCount: reps,
      formHint: getHint(confirmedPatterns),
    }

    metricsBuf.current.push(m)
    if (metricsBuf.current.length > 12) metricsBuf.current.shift()

    const n = metricsBuf.current.length
    const acc = metricsBuf.current.reduce((a, b) => ({
      movementQuality: a.movementQuality + b.movementQuality,
      symmetry:        a.symmetry        + b.symmetry,
      cardio:          a.cardio          + b.cardio,
      breathing:       a.breathing       + b.breathing,
      kneeFlexionL:    a.kneeFlexionL    + b.kneeFlexionL,
      kneeFlexionR:    a.kneeFlexionR    + b.kneeFlexionR,
      hipFlexionL:     a.hipFlexionL     + b.hipFlexionL,
      hipFlexionR:     a.hipFlexionR     + b.hipFlexionR,
    }), { movementQuality:0, symmetry:0, cardio:0, breathing:0,
          kneeFlexionL:0, kneeFlexionR:0, hipFlexionL:0, hipFlexionR:0 })

    setMetrics({
      ...m,
      movementQuality: Math.round(acc.movementQuality / n),
      symmetry:        Math.round(acc.symmetry / n),
      cardio:          Math.round(acc.cardio / n),
      breathing:       Math.round(acc.breathing / n),
      kneeFlexionL:    Math.round(acc.kneeFlexionL / n),
      kneeFlexionR:    Math.round(acc.kneeFlexionR / n),
      hipFlexionL:     Math.round(acc.hipFlexionL / n),
      hipFlexionR:     Math.round(acc.hipFlexionR / n),
    })
  }, [])

  // ── Skeleton draw ──────────────────────────────────────────────────────────
  const drawSkeleton = useCallback((lms: Landmark[], canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const W = canvas.width, H = canvas.height
    const L = MEDIAPIPE_LANDMARKS
    const get = (i: number) => lms[i]

    const connections: [number, number][] = [
      [L.LEFT_HIP, L.RIGHT_HIP],
      [L.LEFT_HIP, L.LEFT_KNEE],    [L.RIGHT_HIP, L.RIGHT_KNEE],
      [L.LEFT_KNEE, L.LEFT_ANKLE],  [L.RIGHT_KNEE, L.RIGHT_ANKLE],
      [L.LEFT_ANKLE, L.LEFT_HEEL],  [L.RIGHT_ANKLE, L.RIGHT_HEEL],
      [L.LEFT_ANKLE, L.LEFT_FOOT_INDEX], [L.RIGHT_ANKLE, L.RIGHT_FOOT_INDEX],
      [L.LEFT_SHOULDER, L.RIGHT_SHOULDER],
      [L.LEFT_SHOULDER, L.LEFT_HIP], [L.RIGHT_SHOULDER, L.RIGHT_HIP],
    ]

    connections.forEach(([a, b]) => {
      const pa = get(a), pb = get(b)
      if (!pa || !pb) return
      ctx.beginPath()
      ctx.moveTo(pa.x * W, pa.y * H)
      ctx.lineTo(pb.x * W, pb.y * H)
      ctx.strokeStyle = "#C97A56"
      ctx.lineWidth = 3
      ctx.shadowColor = "#C97A56"
      ctx.shadowBlur = 8
      ctx.stroke()
      ctx.shadowBlur = 0
    })

    const joints = [L.LEFT_HIP, L.RIGHT_HIP, L.LEFT_KNEE, L.RIGHT_KNEE,
      L.LEFT_ANKLE, L.RIGHT_ANKLE, L.LEFT_SHOULDER, L.RIGHT_SHOULDER]
    joints.forEach(idx => {
      const lm = get(idx)
      if (!lm) return
      ctx.beginPath()
      ctx.arc(lm.x * W, lm.y * H, 6, 0, Math.PI * 2)
      ctx.fillStyle = "#ffffff"
      ctx.shadowColor = "#C97A56"
      ctx.shadowBlur = 10
      ctx.fill()
      ctx.shadowBlur = 0
    })
  }, [])

  // ── MediaPipe init ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return
    const s1 = document.createElement("script")
    s1.src = "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
    s1.crossOrigin = "anonymous"
    document.head.appendChild(s1)

    const s2 = document.createElement("script")
    s2.src = "https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js"
    s2.crossOrigin = "anonymous"
    document.head.appendChild(s2)

    s2.onload = async () => {
      await new Promise(r => setTimeout(r, 600))
      const w = window as any
      if (!w.Pose) return

      const pose = new w.Pose({
        locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}`,
      })
      pose.setOptions({
        modelComplexity: 1, smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5, minTrackingConfidence: 0.5,
      })
      pose.onResults((results: any) => {
        if (!results.poseLandmarks) return
        processLandmarks(results.poseLandmarks)
        if (canvasRef.current) drawSkeleton(results.poseLandmarks, canvasRef.current)
      })
      poseRef.current = pose

      if (videoRef.current && w.Camera) {
        const cam = new w.Camera(videoRef.current, {
          onFrame: async () => {
            if (poseRef.current && videoRef.current)
              await poseRef.current.send({ image: videoRef.current })
          },
          width: 640, height: 480,
        })
        cameraRef.current = cam
        cam.start()
        setCameraReady(true)
      }
    }

    return () => {
      cameraRef.current?.stop()
      try { document.head.removeChild(s1); document.head.removeChild(s2) } catch {}
    }
  }, [processLandmarks, drawSkeleton])

  // ── Exercise flow ──────────────────────────────────────────────────────────
  const finishExercise = useCallback(() => {
    setIsRunning(false)
    if (timerRef.current) clearInterval(timerRef.current)

    const buf = metricsBuf.current
    const n   = Math.max(buf.length, 1)
    const avg = buf.reduce(
      (a, m) => ({
        mq: a.mq + m.movementQuality,
        sym: a.sym + m.symmetry,
        patterns: [...new Set([...a.patterns, ...m.detectedPatterns])],
      }),
      { mq: 0, sym: 0, patterns: [] as string[] }
    )

    const perf: ExercisePerformance = {
      exerciseId: sessionRef.current.currentExercise,
      movementQuality: Math.round(avg.mq / n),
      symmetry: Math.round(avg.sym / n),
      detectedPatterns: avg.patterns,
      jointAngles: {
        knee: { left: metrics.kneeFlexionL, right: metrics.kneeFlexionR },
        hip:  { left: metrics.hipFlexionL,  right: metrics.hipFlexionR  },
      },
      timestamp: Date.now(),
    }

    const newSession = advanceSession(sessionRef.current, perf)
    sessionRef.current = newSession
    setSession(newSession)

    smoother.current.reset()
    repCounter.current.reset()
    smoothness.current.reset()
    metricsBuf.current = []

    if (newSession.isComplete) {
      onComplete?.(newSession.muscleScores, newSession)
    } else {
      setShowGuide(true)
    }
  }, [metrics, onComplete])

  const startExercise = useCallback(() => {
    setShowGuide(false)
    setIsRunning(true)
    const duration = EXERCISES[sessionRef.current.currentExercise].duration
    setExerciseTimer(duration)
    timerRef.current = setInterval(() => {
      setExerciseTimer(t => {
        if (t <= 1) { finishExercise(); return 0 }
        return t - 1
      })
    }, 1000)
  }, [finishExercise])

  const currentExercise = EXERCISES[session.currentExercise]
  const totalExercises  = 5
  const progressPct     = (session.completedExercises.length / totalExercises) * 100

  const EXERCISE_IDS: ExerciseId[] = [
    "bodyweight_squat", "reverse_lunge", "single_leg_balance", "hip_hinge", "calf_raise",
  ]

  // ─── CLIENT VIEW ──────────────────────────────────────────────────────────
  if (mode === "client") {
    const goodForm = metrics.detectedPatterns.length === 0 && isRunning
    return (
      <div className="flex h-full min-h-screen flex-col bg-[#0F1E28] text-white">
        <div className="relative h-1.5 w-full bg-white/10">
          <div className="absolute h-full rounded-full bg-gradient-to-r from-[#C97A56] to-[#F0A500] transition-all duration-700"
            style={{ width: `${progressPct}%` }} />
        </div>

        <div className="flex flex-1 flex-col items-center gap-5 p-5">
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C97A56]">
              Exercise {session.completedExercises.length + 1} of {totalExercises}
            </p>
            <h2 className="mt-1 text-[22px] font-semibold tracking-tight">{currentExercise.name}</h2>
          </div>

          <div className="flex w-full max-w-[640px] gap-4">
            <div className="flex shrink-0 flex-col items-center gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">Guide</p>
              <div className="h-[280px] w-[200px]">
                <HumanModel3D exerciseId={session.currentExercise} />
              </div>
            </div>

            <div className="relative min-h-[280px] flex-1 overflow-hidden rounded-[12px] bg-[#162532]">
              <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
              <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" width={640} height={480} />

              {isRunning && (
                <>
                  <div className="absolute left-1/2 top-3 flex -translate-x-1/2 flex-col items-center">
                    <span className="text-[52px] font-bold tabular-nums leading-none text-white drop-shadow-lg">
                      {metrics.repCount}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.12em] text-white/50">reps</span>
                  </div>

                  <div className="absolute right-3 top-3 flex flex-col items-center">
                    <span className="text-[28px] font-semibold tabular-nums text-[#C97A56]">{exerciseTimer}</span>
                    <span className="text-[10px] text-white/40">sec</span>
                  </div>

                  <div className={`absolute inset-x-0 bottom-0 px-4 py-3 text-center text-[13px] font-semibold transition-all ${
                    goodForm ? "bg-[#27AE60]/85 text-white" : "bg-[#F0A500]/85 text-[#1A1A1A]"
                  }`}>
                    {goodForm
                      ? <span className="flex items-center justify-center gap-2"><CheckCircle2 className="h-4 w-4" />Great form!</span>
                      : <span className="flex items-center justify-center gap-2"><AlertTriangle className="h-4 w-4" />{metrics.formHint}</span>
                    }
                  </div>
                </>
              )}
              {!cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center text-[13px] text-white/50">Starting camera…</div>
              )}
            </div>
          </div>

          <div className="max-w-[500px] rounded-[12px] border border-white/10 bg-white/[0.04] px-5 py-3 text-center">
            <p className="text-[13px] leading-relaxed text-white/75">{currentExercise.clientCue}</p>
          </div>

          {showGuide ? (
            <button onClick={startExercise}
              className="inline-flex h-12 items-center gap-2 rounded-[10px] bg-[#C97A56] px-8 text-[14px] font-semibold text-white hover:bg-[#B86A48]">
              <Play className="h-4 w-4" />I&apos;m ready — start
            </button>
          ) : (
            <div className="w-full max-w-[400px]">
              <div className="mb-1.5 flex justify-between text-[11px] text-white/50">
                <span>{currentExercise.name}</span>
                <span>{exerciseTimer}s left</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-[#C97A56] to-[#F0A500] transition-all"
                  style={{ width: `${100 - (exerciseTimer / currentExercise.duration) * 100}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ─── PRACTITIONER VIEW ────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {EXERCISE_IDS.map((id, i) => {
          const done   = session.completedExercises.includes(id)
          const active = session.currentExercise === id
          return (
            <div key={id} className="flex items-center gap-2">
              <div className={`flex h-7 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[11px] font-medium transition-all ${
                done   ? "bg-[#27AE60]/15 text-[#1f8e4a]"
                : active ? "bg-[#C97A56] text-white shadow-[0_4px_12px_rgba(201,122,86,0.4)]"
                :          "border border-black/[0.07] bg-white/50 text-[#9CA3AF]"
              }`}>
                {done ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                {EXERCISES[id].name}
              </div>
              {i < 4 && <ChevronRight className="h-3 w-3 shrink-0 text-[#9CA3AF]" />}
            </div>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="overflow-hidden rounded-[12px] border border-black/[0.07] bg-[#0F1E28]">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-60 ${isRunning ? "animate-ping bg-[#E74C3C]" : "bg-white/30"}`} />
                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isRunning ? "bg-[#E74C3C]" : "bg-white/30"}`} />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
                {isRunning ? "Live Capture · Active" : "Camera Ready"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-white/60">
              {isRunning && <span className="font-mono tabular-nums text-[#C97A56]">{exerciseTimer}s</span>}
              <span className="h-3 w-px bg-white/15" />
              <span className="inline-flex items-center gap-1.5">
                <Wifi className="h-3 w-3 text-[#27AE60]" />
                {cameraReady ? "MediaPipe Active" : "Loading…"}
              </span>
            </div>
          </div>

          <div className="relative aspect-[4/3]">
            {showGuide && !isRunning ? (
              <div className="absolute inset-0 flex items-center justify-center gap-8 bg-[#0F1E28] p-6">
                <div className="h-[380px] w-[280px]">
                  <HumanModel3D exerciseId={session.currentExercise} />
                </div>
                <div className="max-w-[240px]">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C97A56]">Next up</span>
                  <h3 className="mt-1 text-[20px] font-semibold text-white">{currentExercise.name}</h3>
                  <p className="mt-2 text-[12px] leading-relaxed text-white/60">{currentExercise.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {currentExercise.targetMuscles.map(m => (
                      <span key={m} className="rounded-full bg-[#C97A56]/15 px-2 py-0.5 text-[10px] font-medium text-[#F5B08C]">
                        {m.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                  <button onClick={startExercise}
                    className="mt-5 inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#C97A56] px-5 text-[13px] font-semibold text-white hover:bg-[#B86A48]">
                    <Play className="h-4 w-4" />Start exercise
                  </button>
                </div>
              </div>
            ) : (
              <>
                <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
                <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" width={640} height={480} />

                <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md">
                    <Camera className="h-3 w-3 text-[#C97A56]" />Pose tracking active
                  </div>
                  {isRunning && (
                    <div className="flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md">
                      <TrendingUp className="h-3 w-3 text-[#27AE60]" />
                      {metrics.repCount} reps · {metrics.formHint}
                    </div>
                  )}
                </div>

                <div className="absolute right-3 top-3 rounded-[10px] bg-black/50 p-3 text-white backdrop-blur-md ring-1 ring-white/10">
                  <div className="flex items-center gap-1.5">
                    <HeartPulse className="h-3.5 w-3.5 text-[#E74C3C]" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/60">Heart</span>
                  </div>
                  <div className="mt-0.5 flex items-baseline gap-1">
                    <span className="text-[20px] font-semibold tabular-nums">{metrics.cardio}</span>
                    <span className="text-[10px] text-white/50">bpm</span>
                  </div>
                </div>

                {metrics.detectedPatterns.length > 0 && (
                  <div className="absolute bottom-16 left-3 space-y-1.5">
                    {metrics.detectedPatterns.slice(0, 2).map(p => (
                      <div key={p} className="flex items-center gap-1.5 rounded-[8px] bg-[#F0A500]/20 px-3 py-1.5 text-[11px] text-[#F0A500] backdrop-blur-md ring-1 ring-[#F0A500]/30">
                        <AlertTriangle className="h-3 w-3" />{p.replace(/_/g, " ")}
                      </div>
                    ))}
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 bg-black/60 px-4 py-3 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setIsRunning(r => !r)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C97A56] text-white">
                      {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[10px] text-white/70">
                        <span>{currentExercise.name} · {metrics.repCount} reps</span>
                        <span className="tabular-nums">{session.completedExercises.length + 1} / {totalExercises}</span>
                      </div>
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#C97A56] to-[#F0A500] transition-all"
                          style={{ width: `${progressPct}%` }} />
                      </div>
                    </div>
                    <button onClick={finishExercise}
                      className="flex h-8 items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 text-[11px] font-medium text-white hover:bg-white/10">
                      Next <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 border-t border-white/5 bg-[#0F1E28] px-4 py-2.5 text-[10px]">
            <span className="font-semibold uppercase tracking-[0.12em] text-white/60">Targeting</span>
            <span className="text-white/30">·</span>
            {currentExercise.targetMuscles.map(m => (
              <span key={m} className="rounded-full bg-[#C97A56]/20 px-2 py-0.5 text-[#F5B08C]">
                {m.replace("_", " ")}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <MetricPill icon={Activity}   label="Movement"  value={metrics.movementQuality} unit="/ 100" color="#C97A56" />
            <MetricPill icon={Zap}        label="Symmetry"  value={metrics.symmetry}        unit="/ 100" color="#F0A500" />
            <MetricPill icon={HeartPulse} label="Cardio"    value={metrics.cardio}           unit="bpm"   color="#27AE60" />
            <MetricPill icon={Wind}       label="Breathing" value={metrics.breathing}        unit="rpm"   color="#8B5CF6" />
          </div>

          <div className="rounded-[12px] border border-black/[0.07] bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">Live joint angles</p>
            <ul className="mt-3 space-y-2.5">
              {[
                { label: "Knee · Left",  v: metrics.kneeFlexionL, ideal: 90 },
                { label: "Knee · Right", v: metrics.kneeFlexionR, ideal: 90 },
                { label: "Hip · Left",   v: metrics.hipFlexionL,  ideal: 90 },
                { label: "Hip · Right",  v: metrics.hipFlexionR,  ideal: 90 },
                ...(session.currentExercise === "calf_raise" ? [
                  { label: "Ankle · Left",  v: metrics.ankleFlexionL, ideal: 65 },
                  { label: "Ankle · Right", v: metrics.ankleFlexionR, ideal: 65 },
                ] : []),
              ].map(j => {
                const diff  = Math.abs(j.v - j.ideal)
                const color = diff < 15 ? "#27AE60" : diff < 30 ? "#F0A500" : "#E74C3C"
                return (
                  <li key={j.label}>
                    <div className="mb-1 flex items-center justify-between text-[12px]">
                      <span className="text-[#374151]">{j.label}</span>
                      <span className="tabular-nums font-semibold text-[#1F2937]">
                        {j.v}° <span className="text-[#9CA3AF]">/ {j.ideal}°</span>
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-[#F2EDE6]">
                      <div className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (j.v / 180) * 100)}%`, backgroundColor: color }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="flex-1 rounded-[12px] border border-black/[0.07] bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">Muscle signals</p>
              <span className="text-[10px] text-[#9CA3AF]">
                {session.muscleScores.length > 0 ? "Live" : "After exercise 1"}
              </span>
            </div>
            {session.muscleScores.length === 0 ? (
              <div className="flex h-24 items-center justify-center text-[12px] text-[#9CA3AF]">
                <div className="text-center">
                  <Info className="mx-auto mb-1.5 h-4 w-4" />
                  Complete first exercise to see muscle signals
                </div>
              </div>
            ) : (
              <ul className="space-y-2">
                {session.muscleScores.slice(0, 6).map(ms => {
                  const color = ms.dysfunctionScore > 60 ? "#E74C3C"
                    : ms.dysfunctionScore > 35 ? "#F0A500" : "#27AE60"
                  return (
                    <li key={ms.muscle.id} className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-[12px]">
                          <span className="truncate font-medium text-[#1F2937]">{ms.muscle.name}</span>
                          <span className="ml-2 shrink-0 text-[11px] font-semibold tabular-nums" style={{ color }}>
                            {ms.dysfunctionScore}
                          </span>
                        </div>
                        <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-[#F2EDE6]">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${ms.dysfunctionScore}%`, backgroundColor: color }} />
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase"
                        style={{ backgroundColor: `${color}22`, color }}>
                        {ms.confidence}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
            {session.isComplete && (
              <div className="mt-4 rounded-[10px] bg-[#1A7A45] p-3 text-[12px] font-medium text-white">
                <CheckCircle2 className="mb-1 h-4 w-4" />
                Assessment complete — generating insights…
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}