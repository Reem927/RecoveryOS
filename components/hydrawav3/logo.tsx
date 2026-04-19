import { cn } from "@/lib/utils"

export function RecoveryOSLogo({
  className,
  showWordmark = true,
  tone = "light",
  subtitle = "Professional",
}: {
  className?: string
  showWordmark?: boolean
  tone?: "light" | "dark"
  subtitle?: string | null
}) {
  const textColor = tone === "light" ? "text-white" : "text-[#1F2937]"
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#C97A56] shadow-[0_6px_18px_-6px_rgba(201,122,86,0.6)]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-white"
          aria-hidden="true"
        >
          <path
            d="M2 14c2.5 0 2.5-3 5-3s2.5 3 5 3 2.5-3 5-3 2.5 3 5 3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 19c2.5 0 2.5-3 5-3s2.5 3 5 3 2.5-3 5-3 2.5 3 5 3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
          />
        </svg>
      </div>
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className={cn("text-[15px] font-semibold tracking-tight", textColor)}>
            Recovery<span className="text-[#C97A56]">OS</span>
          </span>
          {subtitle ? (
            <span
              className={cn(
                "mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em]",
                tone === "light" ? "text-white/40" : "text-[#9CA3AF]",
              )}
            >
              {subtitle}
            </span>
          ) : null}
        </div>
      )}
    </div>
  )
}
