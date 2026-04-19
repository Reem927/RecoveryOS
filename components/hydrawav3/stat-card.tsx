import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  unit,
  delta,
  trend = "up",
  icon: Icon,
  tint = "accent",
  footnote,
}: {
  label: string
  value: string | number
  unit?: string
  delta?: string
  trend?: "up" | "down"
  icon?: LucideIcon
  tint?: "accent" | "success" | "warning" | "purple" | "navy"
  footnote?: string
}) {
  const tintMap = {
    accent: { bg: "bg-[#C97A56]/12", fg: "text-[#C97A56]" },
    success: { bg: "bg-[#27AE60]/12", fg: "text-[#27AE60]" },
    warning: { bg: "bg-[#F0A500]/14", fg: "text-[#F0A500]" },
    purple: { bg: "bg-[#8B5CF6]/12", fg: "text-[#8B5CF6]" },
    navy: { bg: "bg-[#162532]/8", fg: "text-[#162532]" },
  }[tint]

  return (
    <div className="group flex flex-col justify-between rounded-[12px] border border-black/[0.07] bg-white p-5 transition-shadow hover:shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
          {label}
        </span>
        {Icon && (
          <span className={cn("flex h-8 w-8 items-center justify-center rounded-[8px]", tintMap.bg)}>
            <Icon className={cn("h-4 w-4", tintMap.fg)} />
          </span>
        )}
      </div>
      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="text-[28px] font-semibold tracking-tight text-[#1F2937]">{value}</span>
        {unit && <span className="text-[13px] font-medium text-[#9CA3AF]">{unit}</span>}
      </div>
      <div className="mt-2 flex items-center justify-between">
        {delta ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-[6px] px-1.5 py-0.5 text-[11px] font-medium",
              trend === "up"
                ? "bg-[#27AE60]/12 text-[#1f8e4a]"
                : "bg-[#E74C3C]/12 text-[#c0392b]",
            )}
          >
            {trend === "up" ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {delta}
          </span>
        ) : (
          <span />
        )}
        {footnote && <span className="text-[11px] text-[#9CA3AF]">{footnote}</span>}
      </div>
    </div>
  )
}
