export type AngleFrame = {
  kneeL: number
  kneeR: number
  hipL: number
  hipR: number
  ankleL: number
  ankleR: number
  confidence: number
}

export function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)] ?? 0
}

export function removeOutliers(values: number[], tolerance = 18): number[] {
  const m = median(values)
  return values.filter(v => Math.abs(v - m) <= tolerance)
}

export function smoothAngle(values: number[]): number {
  const clean = removeOutliers(values)
  if (clean.length === 0) return values.at(-1) ?? 0
  return Math.round(clean.reduce((a, b) => a + b, 0) / clean.length)
}

export interface FrameQualityArgs {
  landmarkVisibility: number
  lowerBodyVisible: boolean
  centered: boolean
  lightingOk: boolean
}

export function computeFrameConfidence(args: FrameQualityArgs): number {
  let score = 100

  if (args.landmarkVisibility < 0.65) score -= 35
  if (!args.lowerBodyVisible) score -= 30
  if (!args.centered) score -= 15
  if (!args.lightingOk) score -= 10

  return Math.max(0, Math.min(100, score))
}

export function getFrameQualityMessage(
  confidence: number,
  lowerBodyVisible: boolean,
  exerciseHint?: string
): string {
  if (!lowerBodyVisible) return "Step back so your hips, knees, ankles, and feet are visible."
  if (confidence < 50) return "Step back so your full body is visible."
  if (confidence < 70) return exerciseHint || "Keep your body centered in frame."
  return exerciseHint || "Great form — keep going!"
}

export class AngleSmoother {
  private history: number[][] = []
  private readonly windowSize: number

  constructor(windowSize = 8) {
    this.windowSize = windowSize
  }

  push(angles: number[]) {
    this.history.push(angles)
    if (this.history.length > this.windowSize) {
      this.history.shift()
    }
  }

  get(): number[] {
    if (this.history.length < 3) {
      return this.history.at(-1) ?? [0, 0, 0, 0, 0, 0]
    }

    const result: number[] = []
    for (let i = 0; i < 6; i++) {
      const column = this.history.map(row => row[i]).filter(v => v > 0)
      result.push(smoothAngle(column))
    }
    return result
  }

  reset() {
    this.history = []
  }
}