"use client"

import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = [
  { n: 1, label: "Account", sub: "Your profile & title" },
  { n: 2, label: "Credentials", sub: "Licenses & certifications" },
  { n: 3, label: "Workplace", sub: "Clinic or practice" },
]

export function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="flex flex-col gap-1">
      {STEPS.map((step, i) => {
        const done = step.n < current
        const active = step.n === current
        return (
          <li key={step.n} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-semibold ring-1",
                  done && "bg-[#C97A56] ring-[#C97A56] text-white",
                  active && "bg-white ring-white text-[#162532]",
                  !done && !active && "bg-white/[0.06] ring-white/15 text-white/40",
                )}
              >
                {done ? <CheckIcon className="h-4 w-4" /> : step.n}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mt-1 w-px flex-1 rounded-full",
                    done ? "h-8 bg-[#C97A56]/50" : "h-8 bg-white/10",
                  )}
                />
              )}
            </div>
            <div className="pt-1">
              <p
                className={cn(
                  "text-[14px] font-semibold leading-tight",
                  active ? "text-white" : done ? "text-white/60" : "text-white/30",
                )}
              >
                {step.label}
              </p>
              <p
                className={cn(
                  "text-[12px] leading-tight",
                  active ? "text-white/60" : "text-white/25",
                )}
              >
                {step.sub}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
