// ─────────────────────────────────────────────────────────────────────────────
// Hydrawav3 · Leg Muscle Assessment Decision Tree
// Biology-based exercise sequencing to identify which of the 20 major leg
// muscles are dysfunctional, using computer vision joint-angle data.
// ─────────────────────────────────────────────────────────────────────────────

export type MuscleGroup =
  | "quadriceps"        // Rectus Femoris, Vastus Medialis, Vastus Lateralis, Vastus Intermedius
  | "hamstrings"        // Biceps Femoris, Semimembranosus, Semitendinosus
  | "glutes"            // Gluteus Maximus, Gluteus Medius, Gluteus Minimus
  | "hip_flexors"       // Iliopsoas, Pectineus, Sartorius, Tensor Fasciae Latae
  | "calves"            // Gastrocnemius, Soleus, Tibialis Anterior
  | "adductors"         // Adductor Longus, Gracilis
  | "it_band"           // Iliotibial Tract (lateral stabilizer)

export interface Muscle {
  id: string
  name: string
  group: MuscleGroup
  anatomicalRole: string
}

export const LEG_MUSCLES: Muscle[] = [
  // ANTERIOR
  { id: "rectus_femoris",    name: "Rectus Femoris",    group: "quadriceps",  anatomicalRole: "Knee extension + hip flexion" },
  { id: "vastus_medialis",   name: "Vastus Medialis",   group: "quadriceps",  anatomicalRole: "Knee extension, terminal lock" },
  { id: "vastus_lateralis",  name: "Vastus Lateralis",  group: "quadriceps",  anatomicalRole: "Knee extension, lateral stability" },
  { id: "vastus_intermedius",name: "Vastus Intermedius",group: "quadriceps",  anatomicalRole: "Deep knee extension" },
  { id: "sartorius",         name: "Sartorius",         group: "hip_flexors", anatomicalRole: "Hip flexion + knee flexion + lateral rotation" },
  { id: "pectineus",         name: "Pectineus",         group: "hip_flexors", anatomicalRole: "Hip flexion + adduction" },
  { id: "adductor_longus",   name: "Adductor Longus",   group: "adductors",   anatomicalRole: "Hip adduction + flexion" },
  { id: "gracilis",          name: "Gracilis",           group: "adductors",   anatomicalRole: "Hip adduction + knee flexion" },
  // LATERAL
  { id: "tensor_fasciae",    name: "Tensor Fasciae Latae", group: "it_band",  anatomicalRole: "Hip abduction + IT band tension" },
  { id: "it_band",           name: "Iliotibial Tract",  group: "it_band",     anatomicalRole: "Lateral knee stabilizer" },
  // POSTERIOR
  { id: "gluteus_maximus",   name: "Gluteus Maximus",   group: "glutes",      anatomicalRole: "Hip extension + external rotation" },
  { id: "gluteus_medius",    name: "Gluteus Medius",    group: "glutes",      anatomicalRole: "Hip abduction + pelvic stability" },
  { id: "gluteus_minimus",   name: "Gluteus Minimus",   group: "glutes",      anatomicalRole: "Hip abduction + internal rotation" },
  { id: "biceps_femoris",    name: "Biceps Femoris",    group: "hamstrings",  anatomicalRole: "Knee flexion + hip extension" },
  { id: "semimembranosus",   name: "Semimembranosus",   group: "hamstrings",  anatomicalRole: "Knee flexion + internal rotation" },
  { id: "semitendinosus",    name: "Semitendinosus",    group: "hamstrings",  anatomicalRole: "Knee flexion + hip extension" },
  { id: "gastrocnemius",     name: "Gastrocnemius",     group: "calves",      anatomicalRole: "Plantarflexion + knee flexion" },
  { id: "soleus",            name: "Soleus",             group: "calves",      anatomicalRole: "Plantarflexion (postural)" },
  { id: "tibialis_anterior", name: "Tibialis Anterior", group: "calves",      anatomicalRole: "Dorsiflexion + foot inversion" },
  { id: "peroneus_longus",   name: "Peroneus Longus",   group: "calves",      anatomicalRole: "Plantarflexion + eversion" },
]

// ─────────────────────────────────────────────────────────────────────────────
// Exercise Definitions
// Each exercise stresses specific muscles and reveals dysfunction via CV metrics
// ─────────────────────────────────────────────────────────────────────────────

export type ExerciseId =
  | "bodyweight_squat"
  | "reverse_lunge"
  | "single_leg_balance"
  | "hip_hinge"
  | "lateral_lunge"

export interface Exercise {
  id: ExerciseId
  name: string
  duration: number        // seconds
  reps: number
  completionMode: "reps" | "time"
  description: string
  clientCue: string       // what the client sees
  targetMuscles: MuscleGroup[]
  // What CV angles we watch
  keyAngles: {
    joint: string
    idealMin: number
    idealMax: number
    asymmetryThreshold: number   // % difference L vs R that flags dysfunction
  }[]
  // Biology: what deviations reveal about which muscles
  dysfunctionMap: {
    pattern: string
    impliedMuscles: string[]   // muscle ids
    severity: "low" | "medium" | "high"
  }[]
}

export const EXERCISES: Record<ExerciseId, Exercise> = {
  bodyweight_squat: {
    id: "bodyweight_squat",
    name: "Bodyweight Squat",
    duration: 45,
    reps: 5,
    completionMode: "reps",
    description: "Feet shoulder-width, descend until thighs parallel, return to stand",
    clientCue: "Complete 5 slow, controlled squats. Keep your chest tall and knees over your toes.",
    targetMuscles: ["quadriceps", "glutes", "hamstrings", "calves"],
    keyAngles: [
      { joint: "knee_flexion",  idealMin: 80,  idealMax: 100, asymmetryThreshold: 8  },
      { joint: "hip_flexion",   idealMin: 85,  idealMax: 100, asymmetryThreshold: 8  },
      { joint: "ankle_dorsiflexion", idealMin: 15, idealMax: 35, asymmetryThreshold: 10 },
    ],
    dysfunctionMap: [
      {
        pattern: "knees_cave_inward",
        impliedMuscles: ["gluteus_medius", "gluteus_minimus", "vastus_medialis", "tensor_fasciae"],
        severity: "high",
      },
      {
        pattern: "insufficient_depth",
        impliedMuscles: ["gastrocnemius", "soleus", "tibialis_anterior", "rectus_femoris"],
        severity: "medium",
      },
      {
        pattern: "forward_lean_excessive",
        impliedMuscles: ["gluteus_maximus", "biceps_femoris", "semimembranosus"],
        severity: "medium",
      },
      {
        pattern: "asymmetric_weight_shift",
        impliedMuscles: ["gluteus_medius", "vastus_lateralis", "it_band"],
        severity: "high",
      },
    ],
  },

  reverse_lunge: {
    id: "reverse_lunge",
    name: "Reverse Lunge",
    duration: 60,
    reps: 5,
    completionMode: "reps",
    description: "Step backward, lower rear knee toward floor, return. Alternate legs.",
    clientCue: "Step one foot back and lower your back knee toward the floor. Keep your front knee over your ankle. Complete 5 reps.",
    targetMuscles: ["quadriceps", "glutes", "hamstrings", "hip_flexors"],
    keyAngles: [
      { joint: "front_knee_flexion",  idealMin: 85,  idealMax: 95,  asymmetryThreshold: 7  },
      { joint: "rear_hip_extension",  idealMin: 15,  idealMax: 25,  asymmetryThreshold: 10 },
      { joint: "trunk_lean",          idealMin: 0,   idealMax: 10,  asymmetryThreshold: 5  },
    ],
    dysfunctionMap: [
      {
        pattern: "front_knee_collapses",
        impliedMuscles: ["gluteus_medius", "vastus_medialis", "gracilis"],
        severity: "high",
      },
      {
        pattern: "hip_flexor_tightness",
        impliedMuscles: ["rectus_femoris", "sartorius", "pectineus", "tensor_fasciae"],
        severity: "medium",
      },
      {
        pattern: "glute_weakness_rear_leg",
        impliedMuscles: ["gluteus_maximus", "biceps_femoris", "semitendinosus"],
        severity: "high",
      },
      {
        pattern: "side_to_side_asymmetry",
        impliedMuscles: ["gluteus_medius", "adductor_longus", "gracilis"],
        severity: "medium",
      },
    ],
  },

  single_leg_balance: {
    id: "single_leg_balance",
    name: "Single-Leg Balance",
    duration: 20,
    reps: 0,
    completionMode: "time",
    description: "Stand on one leg for 20 seconds. Repeat both sides.",
    clientCue: "Stand on one leg and hold for 20 seconds. Keep your hips level and arms at your sides.",
    targetMuscles: ["glutes", "calves", "it_band", "adductors"],
    keyAngles: [
      { joint: "hip_abduction_level",   idealMin: -3, idealMax: 3,  asymmetryThreshold: 5  },
      { joint: "knee_stability_sway",   idealMin: 0,  idealMax: 5,  asymmetryThreshold: 8  },
      { joint: "ankle_sway",            idealMin: 0,  idealMax: 8,  asymmetryThreshold: 10 },
    ],
    dysfunctionMap: [
      {
        pattern: "trendelenburg_sign",   // hip drops on lifted side
        impliedMuscles: ["gluteus_medius", "gluteus_minimus", "tensor_fasciae"],
        severity: "high",
      },
      {
        pattern: "excessive_ankle_sway",
        impliedMuscles: ["tibialis_anterior", "peroneus_longus", "gastrocnemius", "soleus"],
        severity: "medium",
      },
      {
        pattern: "knee_wobble_medial",
        impliedMuscles: ["vastus_medialis", "gracilis", "sartorius"],
        severity: "high",
      },
      {
        pattern: "it_band_tightness",    // lateral trunk lean
        impliedMuscles: ["it_band", "tensor_fasciae", "vastus_lateralis"],
        severity: "medium",
      },
    ],
  },

  hip_hinge: {
    id: "hip_hinge",
    name: "Hip Hinge (Deadlift Pattern)",
    duration: 45,
    reps: 5,
    completionMode: "reps",
    description: "Feet hip-width, hinge at hips pushing them back, lower torso to 45°, return.",
    clientCue: "Push your hips back like closing a drawer. Keep your back flat and lower your chest toward your knees. Complete 5 reps.",
    targetMuscles: ["hamstrings", "glutes", "calves"],
    keyAngles: [
      { joint: "hip_flexion_hinge",     idealMin: 40,  idealMax: 60,  asymmetryThreshold: 8  },
      { joint: "knee_soft_bend",        idealMin: 10,  idealMax: 20,  asymmetryThreshold: 8  },
      { joint: "spine_neutral_angle",   idealMin: 0,   idealMax: 15,  asymmetryThreshold: 5  },
    ],
    dysfunctionMap: [
      {
        pattern: "hamstring_tightness",   // early knee bend, cant hinge deep
        impliedMuscles: ["biceps_femoris", "semimembranosus", "semitendinosus"],
        severity: "high",
      },
      {
        pattern: "lumbar_flexion",        // lower back rounds
        impliedMuscles: ["gluteus_maximus", "biceps_femoris"],
        severity: "high",
      },
      {
        pattern: "knee_hyperextension",
        impliedMuscles: ["gastrocnemius", "soleus", "vastus_intermedius"],
        severity: "medium",
      },
      {
        pattern: "lateral_shift",
        impliedMuscles: ["gluteus_medius", "adductor_longus"],
        severity: "medium",
      },
    ],
  },

  lateral_lunge: {
    id: "lateral_lunge",
    name: "Lateral Lunge",
    duration: 45,
    reps: 5,
    completionMode: "reps",
    description: "Step to the side, bend one knee, keep the other leg long, then return to center.",
    clientCue: "Complete 5 slow side lunges. Step wide, bend one knee, keep the opposite leg long, then return to center.",
    targetMuscles: ["quadriceps", "glutes", "hamstrings", "adductors"],
    keyAngles: [
      { joint: "knee", idealMin: 90, idealMax: 140, asymmetryThreshold: 15 },
      { joint: "hip", idealMin: 70, idealMax: 130, asymmetryThreshold: 15 },
    ],
    dysfunctionMap: [
      { pattern: "insufficient_lateral_shift", impliedMuscles: ["glutes", "adductors"], severity: "medium" },
      { pattern: "knee_caves_inward", impliedMuscles: ["glutes", "quadriceps"], severity: "high" },
      { pattern: "side_to_side_asymmetry", impliedMuscles: ["glutes", "adductors"], severity: "medium" },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Exercise Performance Score (output from CV analysis)
// ─────────────────────────────────────────────────────────────────────────────

export interface ExercisePerformance {
  exerciseId: ExerciseId
  movementQuality: number        // 0–100: how smooth/controlled the movement was
  symmetry: number               // 0–100: left vs right comparison
  detectedPatterns: string[]     // dysfunction patterns observed
  jointAngles: Record<string, { left: number; right: number }>
  timestamp: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Decision Tree
//
// Biology rationale:
// 1. Squat → screens everything globally (quads, glutes, hamstrings, calves)
//    - If GOOD (>75 both metrics): → Reverse Lunge (unilateral stress)
//    - If QUAD issue (knee cave, insufficient depth): → Single-leg Balance (isolates hip abductors)
//    - If POSTERIOR issue (forward lean, glute weakness): → Hip Hinge (isolates posterior chain)
//
// 2. Reverse Lunge → reveals hip flexor tightness + unilateral glute weakness
//    - If GOOD: → Calf Raise (fine-tune distal chain)
//    - If HIP FLEXOR issue: → Hip Hinge (confirms posterior chain)
//    - If GLUTE/ADDUCTOR issue: → Single-leg Balance (confirms hip stability)
//
// 3. Single-leg Balance → reveals neuromuscular stability (glute med, ankle stabilizers)
//    - Always → Calf Raise (complete distal assessment)
//
// 4. Hip Hinge → reveals hamstring/glute posterior chain
//    - Always → Calf Raise (complete distal assessment)
//
// 5. Calf Raise → always last (distal chain, no downstream exercises)
// ─────────────────────────────────────────────────────────────────────────────

export interface DecisionNode {
  exerciseId: ExerciseId
  next: (perf: ExercisePerformance) => ExerciseId | null
}

export const DECISION_TREE: Record<ExerciseId, DecisionNode> = {
  bodyweight_squat: {
    exerciseId: "bodyweight_squat",
    next: (perf) => {
      const hasQuadPattern = perf.detectedPatterns.some(p =>
        ["knees_cave_inward", "insufficient_depth"].includes(p)
      )
      const hasPosteriorPattern = perf.detectedPatterns.some(p =>
        ["forward_lean_excessive", "asymmetric_weight_shift"].includes(p)
      )
      const isGood = perf.movementQuality >= 75 && perf.symmetry >= 75

      if (isGood) return "reverse_lunge"
      if (hasQuadPattern && !hasPosteriorPattern) return "single_leg_balance"
      if (hasPosteriorPattern) return "hip_hinge"
      return "reverse_lunge" // default: always progress
    },
  },
  reverse_lunge: {
    exerciseId: "reverse_lunge",
    next: (perf) => {
      const hasHipFlexorPattern = perf.detectedPatterns.includes("hip_flexor_tightness")
      const hasGlutePattern = perf.detectedPatterns.some(p =>
        ["glute_weakness_rear_leg", "front_knee_collapses", "side_to_side_asymmetry"].includes(p)
      )
      const isGood = perf.movementQuality >= 75 && perf.symmetry >= 75

      if (isGood) return "lateral_lunge"
      if (hasHipFlexorPattern) return "hip_hinge"
      if (hasGlutePattern) return "single_leg_balance"
      return "lateral_lunge"
    },
  },
  single_leg_balance: {
    exerciseId: "single_leg_balance",
    next: () => "lateral_lunge",
  },
  hip_hinge: {
    exerciseId: "hip_hinge",
    next: () => "lateral_lunge",
  },
  lateral_lunge: {
    exerciseId: "lateral_lunge",
    next: () => null, // assessment complete
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Muscle Dysfunction Accumulator
// Collects evidence across all exercises and ranks muscles by dysfunction score
// ─────────────────────────────────────────────────────────────────────────────

export interface MuscleScore {
  muscle: Muscle
  dysfunctionScore: number    // 0–100, higher = more likely dysfunctional
  evidence: string[]          // human-readable reasons
  confidence: "low" | "medium" | "high"
}

export function computeMuscleScores(performances: ExercisePerformance[]): MuscleScore[] {
  const scores: Record<string, { score: number; evidence: string[] }> = {}

  // Init all muscles at 0
  LEG_MUSCLES.forEach(m => { scores[m.id] = { score: 0, evidence: [] } })

  performances.forEach(perf => {
    const exercise = EXERCISES[perf.exerciseId]

    perf.detectedPatterns.forEach(pattern => {
      const mapping = exercise.dysfunctionMap.find(d => d.pattern === pattern)
      if (!mapping) return

      const weight = mapping.severity === "high" ? 35 : mapping.severity === "medium" ? 20 : 10
      // Quality penalty: worse performance = stronger signal
      const qualityMultiplier = 1 + (1 - perf.movementQuality / 100)

      mapping.impliedMuscles.forEach(muscleId => {
        if (!scores[muscleId]) return
        scores[muscleId].score += weight * qualityMultiplier
        scores[muscleId].evidence.push(
          `${exercise.name}: ${pattern.replace(/_/g, " ")} detected`
        )
      })
    })

    // Asymmetry bonus — amplifies signal when left/right mismatch is severe
    if (perf.symmetry < 70) {
      exercise.targetMuscles.forEach(group => {
        LEG_MUSCLES
          .filter(m => m.group === group)
          .forEach(m => {
            scores[m.id].score += 10
            scores[m.id].evidence.push(`${exercise.name}: significant L/R asymmetry (${perf.symmetry}%)`)
          })
      })
    }
  })

  // Cap at 100 and compute confidence
  return LEG_MUSCLES.map(muscle => {
    const raw = Math.min(100, scores[muscle.id].score)
    const confidence: MuscleScore["confidence"] =
      performances.length >= 3 && raw > 40 ? "high"
      : raw > 20 ? "medium"
      : "low"

    return {
      muscle,
      dysfunctionScore: Math.round(raw),
      evidence: scores[muscle.id].evidence,
      confidence,
    }
  }).sort((a, b) => b.dysfunctionScore - a.dysfunctionScore)
}

// ─────────────────────────────────────────────────────────────────────────────
// Session State Machine
// ─────────────────────────────────────────────────────────────────────────────

export interface AssessmentSession {
  currentExercise: ExerciseId
  completedExercises: ExerciseId[]
  performances: ExercisePerformance[]
  isComplete: boolean
  muscleScores: MuscleScore[]
}

export function createSession(): AssessmentSession {
  return {
    currentExercise: "bodyweight_squat",
    completedExercises: [],
    performances: [],
    isComplete: false,
    muscleScores: [],
  }
}

export function advanceSession(
  session: AssessmentSession,
  performance: ExercisePerformance
): AssessmentSession {
  const updatedPerformances = [...session.performances, performance]
  const node = DECISION_TREE[session.currentExercise]
  const nextExercise = node.next(performance)
  const muscleScores = computeMuscleScores(updatedPerformances)

  return {
    currentExercise: nextExercise ?? session.currentExercise,
    completedExercises: [...session.completedExercises, session.currentExercise],
    performances: updatedPerformances,
    isComplete: nextExercise === null,
    muscleScores,
  }
}

// Sequential exercise order (fixed 1→2→3→4→5)
export const EXERCISE_ORDER: ExerciseId[] = [
  "bodyweight_squat",
  "reverse_lunge",
  "single_leg_balance",
  "hip_hinge",
  "lateral_lunge",
]

export function getSequentialNextExercise(current: ExerciseId): ExerciseId | null {
  const index = EXERCISE_ORDER.indexOf(current)
  if (index === -1) return null
  return EXERCISE_ORDER[index + 1] ?? null
}

export function advanceSessionSequential(
  session: AssessmentSession,
  performance: ExercisePerformance
): AssessmentSession {
  const updatedPerformances = [...session.performances, performance]
  const nextExercise = getSequentialNextExercise(session.currentExercise)
  const muscleScores = computeMuscleScores(updatedPerformances)

  return {
    currentExercise: nextExercise ?? session.currentExercise,
    completedExercises: [...session.completedExercises, session.currentExercise],
    performances: updatedPerformances,
    isComplete: nextExercise === null,
    muscleScores,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CV Angle Utilities (used by MediaPipe landmark processing)
// ─────────────────────────────────────────────────────────────────────────────

export function angleBetweenPoints(
  a: { x: number; y: number },
  b: { x: number; y: number }, // vertex
  c: { x: number; y: number }
): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
  let angle = Math.abs((radians * 180.0) / Math.PI)
  if (angle > 180) angle = 360 - angle
  return Math.round(angle)
}

export function computeSymmetryScore(leftAngle: number, rightAngle: number): number {
  if (leftAngle === 0 && rightAngle === 0) return 100
  const diff = Math.abs(leftAngle - rightAngle)
  const avg = (leftAngle + rightAngle) / 2
  const pct = (diff / avg) * 100
  return Math.round(Math.max(0, 100 - pct * 3))
}

// ─────────────────────────────────────────────────────────────────────────────
// Worse-Side Detection
// Averages left vs right joint angles across all performances. The side with
// the lower average range of motion is "worse" (more restricted). Used by the
// Hydrawav3 protocol builder to decide Sun/Moon pad placement.
// ─────────────────────────────────────────────────────────────────────────────

export function computeWorseSide(
  performances: ExercisePerformance[],
): "left" | "right" | "symmetric" {
  const targetJoints = ["knee", "hip"]
  let leftSum = 0
  let rightSum = 0
  let samples = 0

  performances.forEach((perf) => {
    Object.entries(perf.jointAngles).forEach(([joint, pair]) => {
      const lowered = joint.toLowerCase()
      if (!targetJoints.some((t) => lowered.includes(t))) return
      if (typeof pair.left !== "number" || typeof pair.right !== "number") return
      leftSum += pair.left
      rightSum += pair.right
      samples += 1
    })
  })

  if (samples === 0) return "symmetric"

  const leftAvg = leftSum / samples
  const rightAvg = rightSum / samples
  const diff = Math.abs(leftAvg - rightAvg)
  if (diff < 5) return "symmetric"
  return leftAvg < rightAvg ? "left" : "right"
}

// MediaPipe landmark indices for full body tracking
export const MEDIAPIPE_LANDMARKS = {
  NOSE: 0,

  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,

  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
}
