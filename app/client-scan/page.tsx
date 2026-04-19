"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, AlertTriangle } from "lucide-react"
import LegAssessmentScan from "@/components/hydrawav3/LegAssessmentScan"
import type { MuscleScore, AssessmentSession } from "@/lib/leg-assessment-engine"
import { supabase } from "@/lib/supabase"

export default function ClientScanPage() {
  const searchParams = useSearchParams()
  const patientId = searchParams.get("patient")
  const sessionId = searchParams.get("session")

  const [complete, setComplete] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleComplete(scores: MuscleScore[], session: AssessmentSession, videoBlob?: Blob | null) {
    setComplete(true)

    let videoUrl: string | null = null

    if (!patientId) {
      setSaveError("No patient ID in URL (add ?patient=<uuid>). Results not saved.")
      return
    }

    // Upload video if recorded
    if (videoBlob) {
      const fileName = `scan-${patientId}-${Date.now()}.webm`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("cv-scan-videos")
        .upload(fileName, videoBlob, { contentType: "video/webm" })

      if (uploadError) {
        setSaveError("Video upload failed: " + uploadError.message)
      } else {
        const { data: urlData } = supabase.storage.from("cv-scan-videos").getPublicUrl(fileName)
        videoUrl = urlData.publicUrl
      }
    }

    const { error } = await supabase.from("cv_scans").insert({
      patient_id: patientId,
      session_id: sessionId ?? null,
      exercises: session.performances,
      metrics: {
        muscleScores: scores,
        completedExercises: session.completedExercises,
        videoUrl: videoUrl,
      },
    })

    if (error) {
      setSaveError(error.message)
    }
  }

  if (complete) {
    return (
      <div className="flex min-h-[calc(100dvh-60px)] flex-col items-center justify-center gap-4 bg-[#0B1820] text-center text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#27AE60]/15">
          <CheckCircle2 className="h-8 w-8 text-[#27AE60]" />
        </div>
        <h2 className="text-[24px] font-semibold tracking-tight">Great work!</h2>
        <p className="max-w-sm text-[14px] leading-relaxed text-white/60">
          Your practitioner has been notified. You can close this page or wait for further instructions.
        </p>
        {saveError && (
          <div className="mt-2 flex max-w-sm items-start gap-2 rounded-[10px] border border-[#F0A500]/30 bg-[#F0A500]/10 px-4 py-3 text-left text-[12px] text-[#F0A500]">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}
      </div>
    )
  }

  return <LegAssessmentScan mode="client" onComplete={handleComplete} />
}