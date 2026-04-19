import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AppShell } from "@/components/hydrawav3/app-shell"
import { AssessmentStepper, type Step } from "@/components/hydrawav3/assessment-stepper"
import ScanClientWrapper from "@/components/hydrawav3/ScanClientWrapper"

const steps: Step[] = [
  { label: "Consent", status: "done", meta: "09:02" },
  { label: "Intake", status: "done", meta: "09:04" },
  { label: "Camera scan", status: "active", meta: "Capturing…" },
  { label: "Insights", status: "todo" },
  { label: "Session", status: "todo" },
]

export default function ScanPage() {
  return (
    <AppShell
      title="Camera scan · Alex Morgan"
      breadcrumbs={[
        { label: "Clients" },
        { label: "Alex Morgan" },
        { label: "Scan" },
      ]}
      actions={
        <Link
          href="/insights"
          className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#C97A56] px-4 text-[13px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(201,122,86,0.7)] hover:bg-[#B86A48]"
        >
          Generate insights
          <ArrowRight className="h-4 w-4" />
        </Link>
      }
    >
      <div className="space-y-6">
        <AssessmentStepper steps={steps} />
        <ScanClientWrapper />
      </div>
    </AppShell>
  )
}
