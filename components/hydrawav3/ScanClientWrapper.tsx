"use client"

import { useRouter } from "next/navigation"
import LegAssessmentScan from "@/components/hydrawav3/LegAssessmentScan"
import type { MuscleScore, AssessmentSession } from "@/lib/leg-assessment-engine"

export default function ScanClientWrapper() {
  const router = useRouter()

  function handleComplete(muscleScores: MuscleScore[], session: AssessmentSession) {
    localStorage.setItem("hw3_muscle_scores", JSON.stringify(muscleScores))
    localStorage.setItem("hw3_session", JSON.stringify(session))
    router.push("/insights")
  }

  return <LegAssessmentScan mode="practitioner" onComplete={handleComplete} />
}
