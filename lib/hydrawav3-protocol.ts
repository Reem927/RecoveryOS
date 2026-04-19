// ─────────────────────────────────────────────────────────────────────────────
// Hydrawav3 · Intelligent Protocol Builder
// Takes pre-session assessment data (muscle dysfunction scores, joint-angle
// performances, session metrics) and builds a Hydrawav3 MQTT payload that
// configures pad placement, intensity, vibration, and cycle counts for the
// specific client in front of the practitioner.
//
// Wellness language: the device "supports" and "empowers" recovery — it does
// not "treat" or "heal". Keep language consistent in reasoning strings.
// ─────────────────────────────────────────────────────────────────────────────

import type { ExercisePerformance, MuscleScore } from "@/lib/leg-assessment-engine"
import { computeWorseSide } from "@/lib/leg-assessment-engine"

export interface HydrawavPayload {
  mac: string
  sessionCount: number
  sessionPause: number
  sDelay: number
  cycle1: number
  cycle5: number
  edgeCycleDuration: number
  cycleRepetitions: number[]
  cycleDurations: number[]
  cyclePauses: number[]
  pauseIntervals: number[]
  leftFuncs: string[]
  rightFuncs: string[]
  pwmValues: { hot: number[]; cold: number[] }
  playCmd: number
  led: number
  hotDrop: number
  coldDrop: number
  vibMin: number
  vibMax: number
  totalDuration: number
}

export interface SessionMetrics {
  movementQuality: number
  symmetry: number
  cardio: number
  breathing: number
}

const DEFAULT_MAC = "74:4D:BD:A0:A3:EC"

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

function pickIntensity(movementQuality: number): { hot: number; cold: number } {
  if (movementQuality < 50) return { hot: 70, cold: 200 }
  if (movementQuality < 75) return { hot: 90, cold: 250 }
  return { hot: 110, cold: 255 }
}

function pickVibMax(cardio: number): number {
  if (cardio > 90) return 150
  if (cardio >= 70) return 200
  return 222
}

function pickCycleProfile(symmetry: number): {
  sessionCount: number
  cycleRepetitions: number[]
} {
  if (symmetry < 60) return { sessionCount: 4, cycleRepetitions: [8, 8, 4] }
  if (symmetry < 80) return { sessionCount: 3, cycleRepetitions: [6, 6, 3] }
  return { sessionCount: 2, cycleRepetitions: [4, 4, 2] }
}

function padAssignment(worseSide: "left" | "right" | "symmetric"): {
  leftFuncs: string[]
  rightFuncs: string[]
} {
  if (worseSide === "right") {
    return {
      leftFuncs: ["leftColdBlue", "leftColdBlue", "leftHotRed"],
      rightFuncs: ["rightHotRed", "rightHotRed", "rightColdBlue"],
    }
  }
  return {
    leftFuncs: ["leftHotRed", "leftHotRed", "leftColdBlue"],
    rightFuncs: ["rightColdBlue", "rightColdBlue", "rightHotRed"],
  }
}

export function buildProtocol(
  muscleScores: MuscleScore[],
  performances: ExercisePerformance[],
  sessionMetrics: SessionMetrics,
): HydrawavPayload {
  const { movementQuality, symmetry, cardio } = sessionMetrics

  const worseSide = computeWorseSide(performances)
  const { leftFuncs, rightFuncs } = padAssignment(worseSide)

  const intensity = pickIntensity(movementQuality)
  const hotPwm = clamp(intensity.hot, 50, 120)
  const coldPwm = clamp(intensity.cold, 150, 255)

  const { sessionCount, cycleRepetitions } = pickCycleProfile(symmetry)

  const cycleDurations = [3, 3, 3]
  const cyclePauses = [3, 3, 3]
  const pauseIntervals = [3, 3, 3]
  const sessionPause = 30
  const sDelay = 0
  const edgeCycleDuration = 9

  const perCycleWork = cycleRepetitions.reduce(
    (sum, reps, i) => sum + reps * (cycleDurations[i] + cyclePauses[i]),
    0,
  )
  const totalDuration =
    sessionCount * perCycleWork + sessionPause * Math.max(0, sessionCount - 1)

  const vibMax = pickVibMax(cardio)

  return {
    mac: DEFAULT_MAC,
    sessionCount,
    sessionPause,
    sDelay,
    cycle1: 1,
    cycle5: 1,
    edgeCycleDuration,
    cycleRepetitions,
    cycleDurations,
    cyclePauses,
    pauseIntervals,
    leftFuncs,
    rightFuncs,
    pwmValues: {
      hot: [hotPwm, hotPwm, hotPwm],
      cold: [coldPwm, coldPwm, coldPwm],
    },
    playCmd: 1,
    led: 1,
    hotDrop: 5,
    coldDrop: 3,
    vibMin: 15,
    vibMax,
    totalDuration,
  }
}

export function getProtocolName(payload: HydrawavPayload): string {
  const hot = payload.pwmValues.hot[0] ?? 90
  if (hot < 80) return "H3-Alpha"
  if (hot < 100) return "H3-Beta"
  return "H3-Gamma"
}

export function buildProtocolReasoning(
  muscleScores: MuscleScore[],
  worseSide: "left" | "right" | "symmetric",
  payload: HydrawavPayload,
): string[] {
  const reasoning: string[] = []

  const topMuscles = muscleScores
    .filter((m) => m.dysfunctionScore > 20)
    .slice(0, 2)
    .map((m) => m.muscle.name)

  const lowSymmetry = payload.sessionCount >= 4

  if (worseSide === "symmetric") {
    if (lowSymmetry) {
      reasoning.push(
        topMuscles.length > 0
          ? `Both sides show restricted patterns around ${topMuscles.join(" and ")} — Sun pad defaults to the left so warmth supports tissue preparation on that side.`
          : "Both sides show restricted patterns — Sun pad defaults to the left so warmth supports tissue preparation on that side.",
      )
    } else {
      reasoning.push(
        topMuscles.length > 0
          ? `Balanced range of motion — Sun pad placement defaults to the left to support ${topMuscles.join(" and ")}.`
          : "Balanced range of motion — default Sun/Moon pairing applied for general recovery support.",
      )
    }
    reasoning.push(
      "Moon pad on the right — cool-blue tone supports nervous system calming.",
    )
  } else {
    const sunSide = worseSide
    const moonSide = worseSide === "left" ? "right" : "left"
    reasoning.push(
      topMuscles.length > 0
        ? `Sun pad on the ${sunSide} — ${topMuscles.join(" and ")} showed the highest dysfunction signals, so warmth supports tissue preparation on that side.`
        : `Sun pad on the ${sunSide} — less range of motion on this side, so warmth supports tissue preparation.`,
    )
    reasoning.push(
      `Moon pad on the ${moonSide} — cool-blue tone supports nervous system calming on the compensating side.`,
    )
  }

  const protocolName = getProtocolName(payload)
  const intensityLabel =
    protocolName === "H3-Alpha"
      ? "gentle"
      : protocolName === "H3-Beta"
        ? "moderate"
        : "performance-level"
  reasoning.push(
    `Intensity set to ${intensityLabel} (${protocolName}) — matched to movement quality from the camera scan.`,
  )

  if (payload.vibMax <= 150) {
    reasoning.push(
      `Vibration capped at ${payload.vibMax} — elevated heart rate during the scan, so the protocol leans calming to support parasympathetic recovery.`,
    )
  } else if (payload.sessionCount >= 4) {
    reasoning.push(
      `${payload.sessionCount} cycles with extended repetitions — low symmetry during the scan, so additional repetitions help support balanced recovery.`,
    )
  } else if (payload.sessionCount <= 2) {
    reasoning.push(
      `${payload.sessionCount} cycles — strong symmetry means a shorter protocol is enough to support maintenance.`,
    )
  }

  return reasoning
}
