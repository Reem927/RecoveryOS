import { MEDIAPIPE_LANDMARKS, type ExerciseId } from "@/lib/leg-assessment-engine"

type Landmark = {
  x: number
  y: number
  z?: number
  visibility?: number
  presence?: number
}

export type ExerciseValidation = {
  ready: boolean
  validFrame: boolean
  repSignal: number
  patterns: string[]
  formHint: string
  debug: Record<string, number | string | boolean>
}

const L = MEDIAPIPE_LANDMARKS

function p(lms: Landmark[], i: number) {
  return lms[i] ?? { x: 0, y: 0, visibility: 0 }
}

function visibility(point: Landmark) {
  return point.visibility ?? point.presence ?? 1
}

function avg(values: number[]) {
  return values.reduce((a, b) => a + b, 0) / Math.max(values.length, 1)
}

function dist(a: Landmark, b: Landmark) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function lowerBodyVisibility(lms: Landmark[]) {
  return avg([
    visibility(p(lms, L.LEFT_HIP)),
    visibility(p(lms, L.RIGHT_HIP)),
    visibility(p(lms, L.LEFT_KNEE)),
    visibility(p(lms, L.RIGHT_KNEE)),
    visibility(p(lms, L.LEFT_ANKLE)),
    visibility(p(lms, L.RIGHT_ANKLE)),
    visibility(p(lms, L.LEFT_HEEL)),
    visibility(p(lms, L.RIGHT_HEEL)),
    visibility(p(lms, L.LEFT_FOOT_INDEX)),
    visibility(p(lms, L.RIGHT_FOOT_INDEX)),
  ])
}

function lowerBodyVisible(lms: Landmark[]) {
  return lowerBodyVisibility(lms) > 0.55
}

export function fullBodyVisible(lms: Landmark[]): { visible: boolean; reason: string } {
  const required = [
    L.LEFT_SHOULDER,
    L.RIGHT_SHOULDER,
    L.LEFT_HIP,
    L.RIGHT_HIP,
    L.LEFT_KNEE,
    L.RIGHT_KNEE,
    L.LEFT_ANKLE,
    L.RIGHT_ANKLE,
    L.LEFT_HEEL,
    L.RIGHT_HEEL,
    L.LEFT_FOOT_INDEX,
    L.RIGHT_FOOT_INDEX,
  ]

  const missing = required.filter(i => {
    const pt = lms[i]
    if (!pt) return true
    const vis = pt.visibility ?? 1
    const inFrame = pt.x > 0.03 && pt.x < 0.97 && pt.y > 0.03 && pt.y < 0.97
    return vis < 0.45 || !inFrame
  })

  if (missing.length > 0) {
    return { visible: false, reason: "Step back so your full body, ankles, and feet are visible." }
  }

  return { visible: true, reason: "" }
}

function mid(a: Landmark, b: Landmark) {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  }
}

export function validateExerciseFrame(args: {
  exerciseId: ExerciseId
  landmarks: Landmark[]
  angles: {
    kneeL: number
    kneeR: number
    hipL: number
    hipR: number
    ankleL: number
    ankleR: number
  }
}): ExerciseValidation {
  const { exerciseId, landmarks: lms, angles } = args

  const lowerVisible = lowerBodyVisible(lms)

  if (!lowerVisible) {
    return {
      ready: false,
      validFrame: false,
      repSignal: 0,
      patterns: ["lower_body_not_visible"],
      formHint: "Step back until your hips, knees, ankles, and feet are visible.",
      debug: {
        lowerBodyVisibility: Math.round(lowerBodyVisibility(lms) * 100),
      },
    }
  }

  switch (exerciseId) {
    case "bodyweight_squat":
      return validateSquat(lms, angles)

    case "reverse_lunge":
      return validateReverseLunge(lms, angles)

    case "single_leg_balance":
      return validateSingleLegBalance(lms, angles)

    case "hip_hinge":
      return validateHipHinge(lms, angles)

    case "calf_raise":
      return validateCalfRaise(lms, angles)

    default:
      return {
        ready: false,
        validFrame: false,
        repSignal: 0,
        patterns: [],
        formHint: "Exercise not recognized.",
        debug: {},
      }
  }
}

function validateSquat(lms: Landmark[], angles: any): ExerciseValidation {
  const hipMid = mid(p(lms, L.LEFT_HIP), p(lms, L.RIGHT_HIP))
  const kneeMid = mid(p(lms, L.LEFT_KNEE), p(lms, L.RIGHT_KNEE))
  const ankleMid = mid(p(lms, L.LEFT_ANKLE), p(lms, L.RIGHT_ANKLE))

  const avgKnee = avg([angles.kneeL, angles.kneeR])
  const kneeSymmetryDiff = Math.abs(angles.kneeL - angles.kneeR)

  const hipDrop = ankleMid.y - hipMid.y
  const patterns: string[] = []

  if (avgKnee > 165) {
    return {
      ready: true,
      validFrame: true,
      repSignal: 0,
      patterns,
      formHint: "Start your squat slowly.",
      debug: { avgKnee, kneeSymmetryDiff, hipDrop },
    }
  }

  if (avgKnee < 95) {
    patterns.push("good_depth")
  } else {
    patterns.push("insufficient_depth")
  }

  if (kneeSymmetryDiff > 15) {
    patterns.push("asymmetric_weight_shift")
  }

  const leftKneeToAnkle = Math.abs(p(lms, L.LEFT_KNEE).x - p(lms, L.LEFT_ANKLE).x)
  const rightKneeToAnkle = Math.abs(p(lms, L.RIGHT_KNEE).x - p(lms, L.RIGHT_ANKLE).x)

  if (leftKneeToAnkle > 0.08 || rightKneeToAnkle > 0.08) {
    patterns.push("knees_cave_inward")
  }

  return {
    ready: true,
    validFrame: true,
    repSignal: 180 - avgKnee,
    patterns,
    formHint: patterns.includes("insufficient_depth")
      ? "Go a little lower if comfortable."
      : "Good squat depth — keep knees tracking over toes.",
    debug: { avgKnee, kneeSymmetryDiff, hipDrop },
  }
}

function validateReverseLunge(lms: Landmark[], angles: any): ExerciseValidation {
  const leftKnee = angles.kneeL
  const rightKnee = angles.kneeR
  const kneeDiff = Math.abs(leftKnee - rightKnee)
  const frontKnee = Math.min(leftKnee, rightKnee)

  const leftFoot = p(lms, L.LEFT_FOOT_INDEX)
  const rightFoot = p(lms, L.RIGHT_FOOT_INDEX)
  const footSeparation = dist(leftFoot, rightFoot)

  // Return validFrame:true on every frame so the rep counter can observe the
  // full lunge → stand cycle via repSignal. Form hint/goodForm UX is gated by
  // whether the user is actually in lunge shape.
  const inLunge = kneeDiff >= 18 && footSeparation >= 0.08
  const patterns: string[] = []

  if (!inLunge) {
    return {
      ready: true,
      validFrame: true,
      repSignal: 180 - frontKnee,
      patterns,
      formHint: "Step one foot back into a reverse lunge.",
      debug: { leftKnee, rightKnee, kneeDiff, footSeparation, inLunge: 0 },
    }
  }

  if (frontKnee > 125) {
    patterns.push("shallow_lunge")
  }

  return {
    ready: true,
    validFrame: true,
    repSignal: 180 - frontKnee,
    patterns,
    formHint: "Good. Keep your front knee steady over your ankle.",
    debug: { leftKnee, rightKnee, kneeDiff, footSeparation, inLunge: 1 },
  }
}

function validateSingleLegBalance(lms: Landmark[], _angles: any): ExerciseValidation {
  const leftFootY = avg([
    p(lms, L.LEFT_ANKLE).y,
    p(lms, L.LEFT_HEEL).y,
    p(lms, L.LEFT_FOOT_INDEX).y,
  ])

  const rightFootY = avg([
    p(lms, L.RIGHT_ANKLE).y,
    p(lms, L.RIGHT_HEEL).y,
    p(lms, L.RIGHT_FOOT_INDEX).y,
  ])

  const footLiftDelta = Math.abs(leftFootY - rightFootY)
  const leftLifted = leftFootY < rightFootY
  const supportSide = leftLifted ? "right" : "left"

  const hipLevelDiff = Math.abs(p(lms, L.LEFT_HIP).y - p(lms, L.RIGHT_HIP).y)

  const supportAnkleX = leftLifted ? p(lms, L.RIGHT_ANKLE).x : p(lms, L.LEFT_ANKLE).x
  const supportKneeX = leftLifted ? p(lms, L.RIGHT_KNEE).x : p(lms, L.LEFT_KNEE).x
  const supportHipX = leftLifted ? p(lms, L.RIGHT_HIP).x : p(lms, L.LEFT_HIP).x
  const shoulderMidX = mid(p(lms, L.LEFT_SHOULDER), p(lms, L.RIGHT_SHOULDER)).x

  const patterns: string[] = []

  if (footLiftDelta < 0.035) {
    return {
      ready: false,
      validFrame: false,
      repSignal: 0,
      patterns: ["both_feet_down"],
      formHint: "Lift one foot slightly off the floor to start the balance hold.",
      debug: { footLiftDelta, leftFootY, rightFootY },
    }
  }

  if (hipLevelDiff > 0.04) {
    patterns.push("trendelenburg_sign")
  }

  if (Math.abs(supportKneeX - supportAnkleX) > 0.065) {
    patterns.push("knee_wobble_medial")
  }

  if (Math.abs(shoulderMidX - supportHipX) > 0.09) {
    patterns.push("it_band_tightness")
  }

  return {
    ready: true,
    validFrame: true,
    repSignal: 1,
    patterns,
    formHint:
      patterns.length === 0
        ? "Good balance. Keep your hips level."
        : "Stay tall and keep your support knee stacked over your ankle.",
    debug: { footLiftDelta, hipLevelDiff, supportSide },
  }
}

function validateHipHinge(lms: Landmark[], angles: any): ExerciseValidation {
  const avgKnee = avg([angles.kneeL, angles.kneeR])
  const avgHip = avg([angles.hipL, angles.hipR])

  // Hip angle (shoulder–hip–knee) drops from ~180° standing to ~120° when
  // hinging. Front-facing camera friendly — doesn't require lateral torso
  // displacement.
  const hipFlexion = Math.max(0, 180 - avgHip)

  const shoulderMid = mid(p(lms, L.LEFT_SHOULDER), p(lms, L.RIGHT_SHOULDER))
  const hipMid = mid(p(lms, L.LEFT_HIP), p(lms, L.RIGHT_HIP))
  const lateralShift = Math.abs(shoulderMid.x - hipMid.x)

  const patterns: string[] = []

  if (avgKnee < 110) {
    patterns.push("too_much_knee_bend")
  }

  if (lateralShift > 0.07) {
    patterns.push("lateral_shift")
  }

  const isHinging = avgHip < 160

  if (!isHinging) {
    return {
      ready: true,
      validFrame: true,
      repSignal: hipFlexion,
      patterns,
      formHint: "Push your hips back and hinge your torso forward.",
      debug: { avgKnee, avgHip, hipFlexion, hinging: 0 },
    }
  }

  return {
    ready: true,
    validFrame: true,
    repSignal: hipFlexion,
    patterns,
    formHint:
      patterns.length === 0
        ? "Good hinge. Keep your back long."
        : patterns.includes("too_much_knee_bend")
          ? "Less knee bend — push your hips back."
          : "Keep your weight centered.",
    debug: { avgKnee, avgHip, hipFlexion, hinging: 1 },
  }
}

function validateCalfRaise(lms: Landmark[], angles: any): ExerciseValidation {
  const leftHeelY = p(lms, L.LEFT_HEEL).y
  const rightHeelY = p(lms, L.RIGHT_HEEL).y
  const heelSymmetry = Math.abs(leftHeelY - rightHeelY)

  const avgAnkle = avg([angles.ankleL, angles.ankleR])
  const patterns: string[] = []

  if (heelSymmetry > 0.035) {
    patterns.push("heel_asymmetry")
  }

  return {
    ready: true,
    validFrame: true,
    repSignal: avg([leftHeelY, rightHeelY]),
    patterns,
    formHint: "Rise onto your toes, hold briefly, then lower slowly.",
    debug: { leftHeelY, rightHeelY, heelSymmetry, avgAnkle },
  }
}

export class ThresholdRepCounter {
  private state: "top" | "bottom" = "top"
  private count = 0

  constructor(
    private downThreshold: number,
    private upThreshold: number,
    private direction: "increase" | "decrease" = "increase"
  ) {}

  reset() {
    this.state = "top"
    this.count = 0
  }

  update(signal: number) {
    const wentDown =
      this.direction === "increase"
        ? signal > this.downThreshold
        : signal < this.downThreshold

    const cameUp =
      this.direction === "increase"
        ? signal < this.upThreshold
        : signal > this.upThreshold

    if (this.state === "top" && wentDown) {
      this.state = "bottom"
    }

    if (this.state === "bottom" && cameUp) {
      this.state = "top"
      this.count += 1
    }

    return this.count
  }

  get() {
    return this.count
  }
}

export class SquatRepCounter {
  private state: "standing" | "down" = "standing"
  private count = 0

  reset() {
    this.state = "standing"
    this.count = 0
  }

  update(avgKneeAngle: number, hipDropSignal: number, lowerBodyReady: boolean) {
    if (!lowerBodyReady) return this.count

    const isStanding = avgKneeAngle > 155
    const isSquatDepth = avgKneeAngle < 125 && hipDropSignal > 0.08

    if (this.state === "standing" && isSquatDepth) {
      this.state = "down"
    }

    if (this.state === "down" && isStanding) {
      this.state = "standing"
      this.count += 1
    }

    return this.count
  }

  get() {
    return this.count
  }
}