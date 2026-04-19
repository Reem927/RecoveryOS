"use client"

import { useState } from "react"
import { CheckCircle2 } from "lucide-react"
import LegAssessmentScan from "@/components/hydrawav3/LegAssessmentScan"
import type { MuscleScore, AssessmentSession } from "@/lib/leg-assessment-engine"

export default function ClientScanPage() {
  const [complete, setComplete] = useState(false)

  function handleComplete(_scores: MuscleScore[], _session: AssessmentSession) {
    setComplete(true)
  }

  if (complete) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#27AE60]/15">
          <CheckCircle2 className="h-8 w-8 text-[#27AE60]" />
        </div>
        <h2 className="text-[24px] font-semibold tracking-tight text-[#1F2937]">
          Great work!
        </h2>
        <p className="max-w-sm text-[14px] leading-relaxed text-[#6B7280]">
          Your practitioner has been notified. You can close this page or wait
          for further instructions.
        </p>
      </div>
    )
  }

  return <LegAssessmentScan mode="client" onComplete={handleComplete} />
}
