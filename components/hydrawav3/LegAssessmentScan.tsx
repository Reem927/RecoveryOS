"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  Activity, Wind, HeartPulse, AlertTriangle,
  CheckCircle2, ChevronRight, Play, Pause, ArrowRight,
  Camera, Wifi, Zap, Circle, Info, TrendingUp,
} from "lucide-react"
import {
  EXERCISES,
  EXERCISE_ORDER,
  ExercisePerformance, AssessmentSession, ExerciseId,
  angleBetweenPoints, computeSymmetryScore,
  createSession, advanceSession, advanceSessionSequential, MEDIAPIPE_LANDMARKS, MuscleScore,
} from "@/lib/leg-assessment-engine"
import { computeFrameConfidence, getFrameQualityMessage, AngleSmoother } from "@/lib/vision-fusion"
import { validateExerciseFrame, ThresholdRepCounter, fullBodyVisible, SquatRepCounter, LateralLungeCounter } from "@/lib/exercise-validators"
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

// ─── Lower body visibility helpers ───────────────────────────────
function visibilityOf(point: any) {
  return point?.visibility ?? point?.presence ?? 1
}

function avgVisibility(lms: Landmark[], indexes: number[]) {
  const values = indexes.map(i => visibilityOf(lms[i] ?? {}))
  return values.reduce((a, b) => a + b, 0) / Math.max(values.length, 1)
}

function lowerBodyVisible(lms: Landmark[], L: typeof MEDIAPIPE_LANDMARKS) {
  const needed = [
    L.LEFT_HIP, L.RIGHT_HIP,
    L.LEFT_KNEE, L.RIGHT_KNEE,
    L.LEFT_ANKLE, L.RIGHT_ANKLE,
    L.LEFT_HEEL, L.RIGHT_HEEL,
    L.LEFT_FOOT_INDEX, L.RIGHT_FOOT_INDEX,
  ]
  return avgVisibility(lms, needed) > 0.55
}

// ─── Calf raise counter using whole-body rise ────────────────────────────────
// When a user rises onto their toes, the entire body lifts ~3-5cm. Tracking
// the body's average Y (midpoint of shoulders + hips) is more robust than heel
// tracking, which can be occluded or ambiguous from a front-facing camera.
class CalfRaiseCounter {
  private baselineSamples: number[] = []
  private baseline: number | null = null
  private state: "down" | "up" = "down"
  private count = 0

  reset() {
    this.baselineSamples = []
    this.baseline = null
    this.state = "down"
    this.count = 0
  }

  update(bodyY: number, visible: boolean) {
    if (!visible) return this.count

    // First 15 frames of the exercise establish the standing baseline
    if (this.baselineSamples.length < 15) {
      this.baselineSamples.push(bodyY)
      this.baseline = this.baselineSamples.reduce((a, b) => a + b, 0) / this.baselineSamples.length
      return this.count
    }

    if (this.baseline == null) return this.count

    // Y axis: 0 at top of frame, so body rising = baseline - bodyY > 0
    const rise = this.baseline - bodyY

    if (this.state === "down" && rise > 0.015) {
      this.state = "up"
    }
    if (this.state === "up" && rise < 0.005) {
      this.state = "down"
      this.count += 1
    }
    return this.count
  }

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

  // Check lower body visibility for exercises that need legs
  if (!lowerBodyVisible(lms, L)) {
    patterns.push("lower_body_not_visible")
    return patterns
  }

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
    const leftFootY = (get(L.LEFT_ANKLE).y + get(L.LEFT_HEEL).y + get(L.LEFT_FOOT_INDEX).y) / 3
    const rightFootY = (get(L.RIGHT_ANKLE).y + get(L.RIGHT_HEEL).y + get(L.RIGHT_FOOT_INDEX).y) / 3
    const footLiftDelta = Math.abs(leftFootY - rightFootY)
    const leftIsLifted = leftFootY < rightFootY

    if (footLiftDelta < 0.035) {
      patterns.push("both_feet_down")
    }

    if (Math.abs(get(L.LEFT_HIP).y - get(L.RIGHT_HIP).y) > 0.04) {
      patterns.push("trendelenburg_sign")
    }

    const supportAnkleX = leftIsLifted ? get(L.RIGHT_ANKLE).x : get(L.LEFT_ANKLE).x
    const supportKneeX = leftIsLifted ? get(L.RIGHT_KNEE).x : get(L.LEFT_KNEE).x

    if (Math.abs(supportKneeX - supportAnkleX) > 0.06) {
      patterns.push("knee_wobble_medial")
    }

    const shoulderMid = (get(L.LEFT_SHOULDER).x + get(L.RIGHT_SHOULDER).x) / 2
    const supportHipX = leftIsLifted ? get(L.RIGHT_HIP).x : get(L.LEFT_HIP).x

    if (Math.abs(shoulderMid - supportHipX) > 0.08) {
      patterns.push("it_band_tightness")
    }
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

  if (exerciseId === "lateral_lunge") {
    const kneeDiff = Math.abs(angles.lKnee - angles.rKnee)
    const hipShift = Math.abs(get(L.LEFT_HIP).x - get(L.RIGHT_HIP).x)
    if (kneeDiff < 18) patterns.push("side_to_side_asymmetry")
    if (hipShift < 0.04) patterns.push("insufficient_lateral_shift")
  }

  return patterns
}

// ─── Form hint ────────────────────────────────────────────────────────────────
const HINTS: Record<string, string> = { // eslint-disable-line @typescript-eslint/no-explicit-any
  "": "",
  lower_body_not_visible: "Step back — keep hips, knees, ankles, and feet visible",
  both_feet_down: "Lift one foot slightly off the floor",
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
  const angleSmoother = useRef(new AngleSmoother(8))
  const calfCounter = useRef(new CalfRaiseCounter())

  // Exercise-specific rep counters
  const repCountersRef = useRef({
    bodyweight_squat: new ThresholdRepCounter(65, 25, "increase"),
    reverse_lunge: new ThresholdRepCounter(55, 22, "increase"),
    hip_hinge: new ThresholdRepCounter(35, 12, "increase"),
    lateral_lunge: new ThresholdRepCounter(0.055, 0.025, "increase"),
  })

  // Squat-specific counter
  const squatCounter = useRef(new SquatRepCounter())

  // Lateral lunge-specific counter
  const lateralLungeCounter = useRef(new LateralLungeCounter())

  // Balance hold timer refs
  const validHoldSecondsRef = useRef(0)
  const lastHoldTickRef = useRef<number | null>(null)

  const isRunningRef = useRef(false)
  const isFinishingRef = useRef(false)
  const activeExerciseRef = useRef<ExerciseId | null>(null)

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

  // Sync isRunningRef with isRunning state
  useEffect(() => {
    isRunningRef.current = isRunning
  }, [isRunning])

  // Auto-finish when rep target is reached
  useEffect(() => {
    if (!isRunning) return
    const exercise = EXERCISES[session.currentExercise]
    if (exercise.completionMode !== "reps") return
    if (metrics.repCount < exercise.reps) return
    finishExercise()
  }, [isRunning, metrics.repCount, session.currentExercise])

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

    // Compute frame confidence
    const hasLowerBody = !!(lms[L.LEFT_ANKLE] && lms[L.RIGHT_ANKLE])
    const avgVisibility = lms.slice(23, 33).reduce((s, lm) => s + (lm.visibility ?? 0.5), 0) / 10
    const centered = Math.abs(get(L.LEFT_HIP).x - 0.5) < 0.2
    const frameConfidence = computeFrameConfidence({
      landmarkVisibility: avgVisibility,
      lowerBodyVisible: hasLowerBody,
      centered,
      lightingOk: true,
    })

    // Only process CV scoring when exercise is actually running
    if (!isRunningRef.current) {
      setMetrics(prev => ({
        ...prev,
        kneeFlexionL: lKnee,
        kneeFlexionR: rKnee,
        hipFlexionL: lHip,
        hipFlexionR: rHip,
        ankleFlexionL: lAnkle,
        ankleFlexionR: rAnkle,
        detectedPatterns: [],
        repCount: 0,
        formHint: "Press start when ready",
      }))
      return
    }

    const rawPatterns = detectPatterns(exerciseId, lms, { lKnee, rKnee, lHip, rHip, lAnkle, rAnkle })

    // Skip low-confidence frames only for exercises that need calibration
    const needsCalibration = exerciseId !== "lateral_lunge"
    if (needsCalibration && frameConfidence < 70) {
      setMetrics(prev => ({
        ...prev,
        formHint: getFrameQualityMessage(frameConfidence, hasLowerBody),
        movementQuality: Math.round(prev.movementQuality * 0.95),
      }))
      return
    }

    // Smooth angles using temporal fusion
    angleSmoother.current.push([lKnee, rKnee, lHip, rHip, lAnkle, rAnkle])
    const [slKnee, srKnee, slHip, srHip, ,] = angleSmoother.current.get()
    const smoothLKnee = slKnee || lKnee
    const smoothRKnee = srKnee || rKnee
    const smoothLHip = slHip || lHip
    const smoothRHip = srHip || rHip

    // Gate: full body must be visible before any scoring
    if (isRunningRef.current) {
      const bodyCheck = fullBodyVisible(lms)
      if (!bodyCheck.visible) {
        setMetrics(prev => ({
          ...prev,
          kneeFlexionL: smoothLKnee, kneeFlexionR: smoothRKnee,
          hipFlexionL: smoothLHip, hipFlexionR: smoothRHip,
          ankleFlexionL: lAnkle, ankleFlexionR: rAnkle,
          detectedPatterns: ["full_body_not_visible"],
          formHint: bodyCheck.reason,
        }))
        return
      }
    }

    // Run exercise-specific validation
    const validation = validateExerciseFrame({
      exerciseId,
      landmarks: lms,
      angles: {
        kneeL: smoothLKnee,
        kneeR: smoothRKnee,
        hipL: smoothLHip,
        hipR: smoothRHip,
        ankleL: lAnkle,
        ankleR: rAnkle,
      },
    })

    if (!validation.ready || !validation.validFrame) {
      setMetrics(prev => ({
        ...prev,
        kneeFlexionL: smoothLKnee, kneeFlexionR: smoothRKnee,
        hipFlexionL: smoothLHip, hipFlexionR: smoothRHip,
        ankleFlexionL: lAnkle, ankleFlexionR: rAnkle,
        detectedPatterns: validation.patterns,
        formHint: validation.formHint,
      }))
      return
    }

    // Handle balance hold timing separately
    if (exerciseId === "single_leg_balance") {
      const now = performance.now()
      if (lastHoldTickRef.current == null) {
        lastHoldTickRef.current = now
      }
      const delta = (now - lastHoldTickRef.current) / 1000
      lastHoldTickRef.current = now
      if (validation.ready && validation.validFrame) {
        validHoldSecondsRef.current += delta
      }
      setExerciseTimer(prev => Math.max(0, EXERCISES[exerciseId].duration - Math.floor(validHoldSecondsRef.current)))
      if (validHoldSecondsRef.current >= EXERCISES[exerciseId].duration) {
        finishExercise()
        return
      }
    }

    // Use exercise-specific rep counters
    let reps = metrics.repCount
    if (exerciseId === "bodyweight_squat") {
      const avgKnee = (smoothLKnee + smoothRKnee) / 2
      const hipY = (get(L.LEFT_HIP).y + get(L.RIGHT_HIP).y) / 2
      const ankleY = (get(L.LEFT_ANKLE).y + get(L.RIGHT_ANKLE).y) / 2
      const hipDropSignal = ankleY - hipY
      reps = squatCounter.current.update(
        avgKnee,
        hipDropSignal,
        validation.ready && validation.validFrame
      )
    } else if (exerciseId === "reverse_lunge") {
      reps = repCountersRef.current.reverse_lunge.update(validation.repSignal)
    } else if (exerciseId === "hip_hinge") {
      reps = repCountersRef.current.hip_hinge.update(validation.repSignal)
    } else if (exerciseId === "lateral_lunge") {
      reps = lateralLungeCounter.current.update(
        validation.debug.lateralShift as number,
        validation.ready && validation.validFrame
      )
    }

    smoother.current.push(validation.patterns)
    const confirmedPatterns = smoother.current.confirmed()

    smoothness.current.push(smoothLKnee)
    smoothness.current.push(smoothRKnee)
    const qualityScore  = smoothness.current.score()
    const symmetryScore = Math.round(
      (computeSymmetryScore(smoothLKnee, smoothRKnee) + computeSymmetryScore(smoothLHip, smoothRHip)) / 2
    )

    const m: LiveMetrics = {
      movementQuality: qualityScore,
      symmetry: symmetryScore,
      cardio: 72 + Math.round(Math.random() * 4 - 2),
      breathing: 14 + Math.round(Math.random() * 2 - 1),
      kneeFlexionL: smoothLKnee, kneeFlexionR: smoothRKnee,
      hipFlexionL: smoothLHip,   hipFlexionR: smoothRHip,
      ankleFlexionL: lAnkle,   ankleFlexionR: rAnkle,
      detectedPatterns: validation.patterns.length > 0 ? validation.patterns : confirmedPatterns,
      repCount: reps,
      formHint: validation.formHint,
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

  // ── Full body skeleton draw ──────────────────────────────────────────────
  const FULL_BODY_CONNECTIONS: [number, number][] = [
    // torso
    [11, 12], [11, 23], [12, 24], [23, 24],
    // left arm
    [11, 13], [13, 15], [15, 17], [15, 19], [15, 21],
    // right arm
    [12, 14], [14, 16], [16, 18], [16, 20], [16, 22],
    // left leg
    [23, 25], [25, 27], [27, 29], [29, 31], [27, 31],
    // right leg
    [24, 26], [26, 28], [28, 30], [30, 32], [28, 32],
  ]

  function drawFullBodySkeleton(ctx: CanvasRenderingContext2D, landmarks: Landmark[], width: number, height: number) {
    ctx.clearRect(0, 0, width, height)

    ctx.lineWidth = 5
    ctx.strokeStyle = "rgba(201,122,86,0.85)"
    ctx.fillStyle = "rgba(255,255,255,0.95)"

    for (const [a, b] of FULL_BODY_CONNECTIONS) {
      const pa = landmarks[a]
      const pb = landmarks[b]
      if (!pa || !pb) continue

      const va = pa.visibility ?? 1
      const vb = pb.visibility ?? 1
      if (va < 0.45 || vb < 0.45) continue

      ctx.beginPath()
      ctx.moveTo(pa.x * width, pa.y * height)
      ctx.lineTo(pb.x * width, pb.y * height)
      ctx.stroke()
    }

    for (let i = 0; i < landmarks.length; i++) {
      const p = landmarks[i]
      if (!p) continue
      if ((p.visibility ?? 1) < 0.45) continue
      if (i >= 13 && i <= 22) continue // skip hands for now

      const radius = [11, 12, 23, 24, 25, 26, 27, 28].includes(i) ? 8 : 6
      ctx.beginPath()
      ctx.arc(p.x * width, p.y * height, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const drawSkeleton = useCallback((lms: Landmark[], canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const width = rect.width
    const height = rect.height
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
    }
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    drawFullBodySkeleton(ctx, lms, width, height)
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
    const finishingExerciseId = activeExerciseRef.current
    if (!finishingExerciseId) return
    if (isFinishingRef.current) return
    if (finishingExerciseId !== sessionRef.current.currentExercise) return
    if (sessionRef.current.completedExercises.includes(finishingExerciseId)) return

    isFinishingRef.current = true
    activeExerciseRef.current = null
    isRunningRef.current = false
    setIsRunning(false)
    setExerciseTimer(0)

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    const buf = metricsBuf.current
    const n = Math.max(buf.length, 1)
    const avg = buf.reduce(
      (a, m) => ({
        mq: a.mq + m.movementQuality,
        sym: a.sym + m.symmetry,
        patterns: [...new Set([...a.patterns, ...m.detectedPatterns])],
      }),
      { mq: 0, sym: 0, patterns: [] as string[] }
    )

    const perf: ExercisePerformance = {
      exerciseId: finishingExerciseId,
      movementQuality: Math.round(avg.mq / n),
      symmetry: Math.round(avg.sym / n),
      detectedPatterns: avg.patterns,
      jointAngles: {
        knee: { left: metrics.kneeFlexionL, right: metrics.kneeFlexionR },
        hip:  { left: metrics.hipFlexionL,  right: metrics.hipFlexionR  },
      },
      timestamp: Date.now(),
    }

    const newSession = mode === "client"
      ? advanceSessionSequential(sessionRef.current, perf)
      : advanceSession(sessionRef.current, perf)

    sessionRef.current = newSession
    setSession(newSession)

    resetTrackers()

    if (newSession.isComplete) {
      const handler = (window as any).__handleComplete
      if (handler) {
        handler(newSession.muscleScores, newSession)
      } else {
        onComplete?.(newSession.muscleScores, newSession)
      }
    } else {
      setShowGuide(true)
    }

    setTimeout(() => {
      isFinishingRef.current = false
    }, 250)
  }, [metrics, onComplete])

  const resetTrackers = useCallback(() => {
    smoother.current.reset()
    repCounter.current.reset()
    smoothness.current.reset()
    metricsBuf.current = []
    angleSmoother.current.reset()
    calfCounter.current.reset()
    squatCounter.current.reset()
    lateralLungeCounter.current.reset()
    Object.values(repCountersRef.current).forEach(counter => counter.reset())
    validHoldSecondsRef.current = 0
    lastHoldTickRef.current = null
  }, [])

  const startExercise = useCallback(() => {
    if (isRunningRef.current || isFinishingRef.current) return

    const exerciseId = sessionRef.current.currentExercise
    const exercise = EXERCISES[exerciseId]

    activeExerciseRef.current = exerciseId
    isRunningRef.current = true

    resetTrackers()
    setShowGuide(false)
    setIsRunning(true)
    setExerciseTimer(exercise.duration)

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (exercise.completionMode === "time") {
      timerRef.current = setInterval(() => {
        setExerciseTimer(t => {
          if (t <= 1) { finishExercise(); return 0 }
          return t - 1
        })
      }, 1000)
    }
  }, [finishExercise, resetTrackers])

  const currentExerciseId = session.currentExercise
  const currentExercise = EXERCISES[currentExerciseId]
  const totalExercises = EXERCISE_ORDER.length
  const currentIndex = Math.max(0, EXERCISE_ORDER.indexOf(currentExerciseId))
  const progressPct = ((currentIndex + 1) / totalExercises) * 100

  // ─── CLIENT VIEW ──────────────────────────────────────────────────────────
  if (mode === "client") {
    const blockingPatterns = [
      "full_body_not_visible",
      "lower_body_not_visible",
      "both_feet_down",
      "not_in_lunge_position",
      "not_hinging",
    ]
    const goodForm =
      isRunning &&
      !metrics.detectedPatterns.some(p => blockingPatterns.includes(p)) &&
      metrics.formHint.toLowerCase().includes("good")
    const isBalance = session.currentExercise === "single_leg_balance"
    return (
      <div className="flex min-h-[calc(100dvh-60px)] w-full flex-col bg-[#0B1820] text-white">
        <div className="h-1.5 w-full bg-white/10">
          <div
            className="h-full bg-[#C97A56] transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="mx-auto grid w-full max-w-[1500px] flex-1 grid-cols-1 items-center gap-8 px-8 py-8 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="flex flex-col items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.035] p-5">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
              Guide
            </p>

            <div className="h-[440px] w-full">
              <HumanModel3D exerciseId={session.currentExercise} zoom={1.35} />
            </div>

            <p className="mt-4 text-center text-[13px] leading-relaxed text-white/60">
              Watch the movement first, then copy it slowly.
            </p>
          </aside>

          <section className="flex flex-col items-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C97A56]">
              Exercise {currentIndex + 1} of {totalExercises}
            </p>

            <h1 className="mt-2 text-center text-[28px] font-semibold tracking-tight text-white">
              {currentExercise.name}
            </h1>

            <div className="relative mt-6 aspect-video w-full max-w-[980px] overflow-hidden rounded-[20px] bg-black shadow-[0_28px_80px_rgba(0,0,0,0.45)]">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                playsInline
                muted
              />

              <canvas
                ref={canvasRef}
                className="absolute inset-0 h-full w-full"
              />

              {process.env.NODE_ENV !== "production" && (
                <div className="absolute bottom-3 left-3 rounded-[10px] bg-black/70 px-3 py-2 text-[11px] text-white/80">
                  <div>Exercise: {session.currentExercise}</div>
                  <div>Running: {String(isRunning)}</div>
                  <div>Hint: {metrics.formHint}</div>
                  <div>Reps: {metrics.repCount}</div>
                  <div>Timer: {exerciseTimer}s</div>
                  <div>Patterns: {metrics.detectedPatterns.join(", ") || "none"}</div>
                </div>
              )}

              {isRunning && (
                <>
                  {isBalance ? (
                    <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                      <span className="text-[72px] font-bold tabular-nums leading-none text-white drop-shadow-lg">
                        {exerciseTimer}
                      </span>
                      <span className="text-[13px] uppercase tracking-[0.12em] text-white/50">seconds</span>
                    </div>
                  ) : (
                    <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                      <span className="text-[72px] font-bold tabular-nums leading-none text-white drop-shadow-lg">
                        {metrics.repCount}
                        <span className="text-[28px] text-white/50"> / {currentExercise.reps}</span>
                      </span>
                      <span className="text-[13px] uppercase tracking-[0.12em] text-white/50">reps</span>
                    </div>
                  )}

                  <div className={`absolute inset-x-0 bottom-0 px-6 py-4 text-center text-[15px] font-semibold transition-all ${
                    goodForm ? "bg-[#27AE60]/90 text-white" : "bg-[#F0A500]/90 text-[#1A1A1A]"
                  }`}>
                    {goodForm
                      ? <span className="flex items-center justify-center gap-2"><CheckCircle2 className="h-5 w-5" />Great form!</span>
                      : <span className="flex items-center justify-center gap-2"><AlertTriangle className="h-5 w-5" />{metrics.formHint}</span>
                    }
                  </div>
                </>
              )}

              {!cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center text-[14px] text-white/50">Starting camera…</div>
              )}
            </div>

            <div className="mt-5 max-w-[820px] rounded-[12px] border border-white/10 bg-white/[0.04] px-6 py-4 text-center text-[15px] leading-relaxed text-white/75">
              {currentExercise.clientCue}
            </div>
          </section>
        </div>

        {showGuide ? (
          <div className="fixed inset-x-0 bottom-0 border-t border-white/10 bg-[#0F1E28] p-4">
            <div className="mx-auto max-w-[400px]">
              <button onClick={startExercise}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-[12px] bg-[#C97A56] text-[15px] font-semibold text-white hover:bg-[#B86A48]">
                <Play className="h-5 w-5" />I&apos;m ready — start
              </button>
            </div>
          </div>
        ) : (
          <div className="fixed inset-x-0 bottom-0 border-t border-white/10 bg-[#0F1E28] p-4">
            <div className="mx-auto max-w-[980px]">
              <div className="mb-2 flex justify-between text-[12px] text-white/50">
                <span>{currentExercise.name}</span>
                <span>{exerciseTimer}s left</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-[#C97A56] transition-all"
                  style={{ width: `${100 - (exerciseTimer / currentExercise.duration) * 100}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ─── PRACTITIONER VIEW ────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {EXERCISE_ORDER.map((id, i) => {
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
                ...(session.currentExercise === "lateral_lunge" ? [
                  { label: "Ankle · Left",  v: metrics.ankleFlexionL, ideal: 90 },
                  { label: "Ankle · Right", v: metrics.ankleFlexionR, ideal: 90 },
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