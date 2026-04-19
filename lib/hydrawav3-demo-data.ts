// ─────────────────────────────────────────────────────────────────────────────
// Hydrawav3 · Demo Assessment Data
// Realistic fallback data for when a practitioner lands on the session-setup
// flow without having run a full camera scan. Tells a clear story: moderate
// left-side weakness (gluteus medius, VMO, rectus femoris) that produces an
// H3-Beta protocol with the Sun pad on the left.
// ─────────────────────────────────────────────────────────────────────────────

import {
  computeMuscleScores,
  type AssessmentSession,
  type ExercisePerformance,
  type MuscleScore,
} from "@/lib/leg-assessment-engine"

const DEMO_PERFORMANCES: ExercisePerformance[] = [
  {
    exerciseId: "bodyweight_squat",
    movementQuality: 64,
    symmetry: 68,
    detectedPatterns: ["knees_cave_inward", "asymmetric_weight_shift"],
    jointAngles: {
      knee_flexion: { left: 82, right: 92 },
      hip_flexion: { left: 85, right: 94 },
      ankle_dorsiflexion: { left: 18, right: 24 },
    },
    timestamp: Date.now() - 180_000,
  },
  {
    exerciseId: "reverse_lunge",
    movementQuality: 60,
    symmetry: 65,
    detectedPatterns: ["front_knee_collapses", "side_to_side_asymmetry"],
    jointAngles: {
      front_knee_flexion: { left: 84, right: 92 },
      rear_hip_extension: { left: 14, right: 19 },
      trunk_lean: { left: 8, right: 5 },
    },
    timestamp: Date.now() - 120_000,
  },
  {
    exerciseId: "single_leg_balance",
    movementQuality: 58,
    symmetry: 62,
    detectedPatterns: ["trendelenburg_sign", "knee_wobble_medial"],
    jointAngles: {
      hip_abduction_level: { left: -4, right: 1 },
      knee_stability_sway: { left: 7, right: 3 },
    },
    timestamp: Date.now() - 60_000,
  },
]

export function getDemoAssessment(): {
  performances: ExercisePerformance[]
  muscleScores: MuscleScore[]
  session: AssessmentSession
} {
  const muscleScores = computeMuscleScores(DEMO_PERFORMANCES)
  const session: AssessmentSession = {
    currentExercise: "lateral_lunge",
    completedExercises: [
      "bodyweight_squat",
      "reverse_lunge",
      "single_leg_balance",
    ],
    performances: DEMO_PERFORMANCES,
    isComplete: true,
    muscleScores,
  }
  return { performances: DEMO_PERFORMANCES, muscleScores, session }
}

export const DEMO_SESSION_METRICS = {
  movementQuality: 61,
  symmetry: 65,
  cardio: 78,
  breathing: 13,
}
