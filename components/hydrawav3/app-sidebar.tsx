"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Activity,
  LineChart,
  Settings,
  LifeBuoy,
  Sparkles,
  PlayCircle,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Hydrawav3Logo } from "./logo"

const primaryNav = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Session Setup", href: "/session-setup", icon: PlayCircle },
  { label: "Patients", href: "/patients/alex-morgan", icon: Users },
  { label: "Assessments", href: "/assessment", icon: ClipboardCheck },
  { label: "Live Session", href: "/session", icon: Activity },
  { label: "Progress", href: "/progress", icon: LineChart },
]

const secondaryNav = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Support", href: "/support", icon: LifeBuoy },
]

export function AppSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    if (href.startsWith("/patients")) return pathname.startsWith("/patients")
    if (href === "/session") return pathname === "/session" || pathname.startsWith("/session/")
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-[220px] shrink-0 flex-col border-r border-white/5 bg-[#162532] lg:flex">
      <div className="flex h-[68px] items-center px-5">
        <Hydrawav3Logo />
      </div>

      <div className="mx-4 mb-4 rounded-[10px] border border-white/5 bg-white/[0.03] p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#C97A56]/15">
            <Sparkles className="h-3.5 w-3.5 text-[#C97A56]" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[12px] font-medium text-white">Clinic Pro</div>
            <div className="truncate text-[10px] text-white/40">2 seats active</div>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">
          Workspace
        </div>
        {primaryNav.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-colors",
                active
                  ? "bg-[rgba(201,122,86,0.18)] text-white"
                  : "text-white/65 hover:bg-white/[0.04] hover:text-white",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1.5 h-5 w-[3px] rounded-r-full bg-[#C97A56]" />
              )}
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active ? "text-[#C97A56]" : "text-white/50 group-hover:text-white/80",
                )}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}

        <div className="mt-6 px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">
          General
        </div>
        {secondaryNav.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-colors",
                active
                  ? "bg-[rgba(201,122,86,0.18)] text-white"
                  : "text-white/60 hover:bg-white/[0.04] hover:text-white",
              )}
            >
              <Icon className="h-4 w-4 text-white/50" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="m-4 rounded-[12px] border border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent p-4">
        <div className="flex items-center gap-3">
          <div
            aria-hidden
            className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-[#C97A56] to-[#8b4a2e] ring-2 ring-white/10"
          />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-white">Dr. Elena Ruiz</div>
            <div className="truncate text-[11px] text-white/50">Lead practitioner</div>
          </div>
          <Link
            href="/login"
            aria-label="Log out"
            title="Log out"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-white/10 bg-white/[0.03] text-white/60 transition-colors hover:border-[#C97A56]/40 hover:bg-[#C97A56]/10 hover:text-[#C97A56] focus:outline-none focus:ring-2 focus:ring-[#C97A56]/40"
          >
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
        <Link
          href="/login"
          className="mt-3 flex items-center justify-center gap-2 rounded-[8px] border border-white/5 bg-white/[0.02] px-3 py-2 text-[11px] font-medium text-white/60 transition-colors hover:border-white/10 hover:bg-white/[0.05] hover:text-white"
        >
          <LogOut className="h-3.5 w-3.5" />
          Log out
        </Link>
      </div>
    </aside>
  )
}
