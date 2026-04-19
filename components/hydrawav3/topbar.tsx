import { Bell, Search, ChevronRight, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"

type Crumb = { label: string; href?: string }

export function Topbar({
  title,
  breadcrumbs,
  eyebrow,
  actions,
  className,
}: {
  title: string
  breadcrumbs?: Crumb[]
  eyebrow?: string
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-[68px] items-center gap-4 border-b border-black/5 bg-white/80 px-6 backdrop-blur-md",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        {(eyebrow || breadcrumbs?.length) && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#9CA3AF]">
            {eyebrow && <span>{eyebrow}</span>}
            {breadcrumbs?.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 || eyebrow ? <ChevronRight className="h-3 w-3 text-[#D1D5DB]" /> : null}
                <span className={i === (breadcrumbs?.length ?? 0) - 1 ? "text-[#C97A56]" : ""}>
                  {c.label}
                </span>
              </span>
            ))}
          </div>
        )}
        <h1 className="truncate text-[18px] font-semibold tracking-tight text-[#1F2937]">
          {title}
        </h1>
      </div>

      <div className="hidden items-center md:flex">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="search"
            placeholder="Search patients, sessions…"
            className="h-10 w-64 rounded-[10px] border border-black/[0.07] bg-white pl-9 pr-3 text-[13px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/20"
          />
        </div>
      </div>

      <button
        type="button"
        className="hidden h-10 items-center gap-2 rounded-[10px] border border-black/[0.07] bg-white px-3 text-[12px] font-medium text-[#374151] hover:border-black/10 md:flex"
      >
        <CalendarDays className="h-4 w-4 text-[#C97A56]" />
        <span>Today</span>
      </button>

      <button
        type="button"
        aria-label="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-[10px] border border-black/[0.07] bg-white text-[#374151] hover:border-black/10"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#C97A56]" />
      </button>

      {actions}
    </header>
  )
}
