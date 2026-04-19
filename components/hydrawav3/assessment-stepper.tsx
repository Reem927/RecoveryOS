import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export type Step = {
  label: string
  status: "done" | "active" | "todo"
  meta?: string
}

export function AssessmentStepper({ steps }: { steps: Step[] }) {
  return (
    <div className="rounded-[12px] border border-black/[0.07] bg-white p-4">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-3">
        {steps.map((step, i) => {
          const last = i === steps.length - 1
          return (
            <li key={step.label} className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold",
                    step.status === "done" &&
                      "bg-[#27AE60] text-white",
                    step.status === "active" &&
                      "bg-[#C97A56] text-white ring-4 ring-[#C97A56]/15",
                    step.status === "todo" &&
                      "bg-[#F2EDE6] text-[#9CA3AF]",
                  )}
                >
                  {step.status === "done" ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <div className="min-w-0">
                  <div
                    className={cn(
                      "truncate text-[13px] font-semibold",
                      step.status === "todo" ? "text-[#9CA3AF]" : "text-[#1F2937]",
                    )}
                  >
                    {step.label}
                  </div>
                  {step.meta && (
                    <div className="truncate text-[11px] text-[#9CA3AF]">{step.meta}</div>
                  )}
                </div>
              </div>
              {!last && (
                <div
                  className={cn(
                    "mx-1 h-px min-w-6 flex-1",
                    step.status === "done" ? "bg-[#27AE60]" : "bg-black/10",
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
