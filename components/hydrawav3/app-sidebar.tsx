"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Settings,
  LifeBuoy,
  Sparkles,
  CalendarDays,
  LogOut,
  Plus,
  Square,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Hydrawav3Logo } from "./logo"
import { useActiveSession, useElapsed } from "@/lib/active-session"

const primaryNav = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Patients", href: "/patients", icon: Users },
  { label: "Appointments", href: "/appointments", icon: CalendarDays },
  { label: "Assessments", href: "/assessment", icon: ClipboardCheck },
]

const secondaryNav = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Support", href: "/support", icon: LifeBuoy },
]

function StartSessionCTA() {
  const { session, endSession } = useActiveSession()
  const elapsed = useElapsed(session?.startedAt)
  const router = useRouter()

  if (session) {
    return (
      <div className="mx-3 mb-4 flex items-stretch gap-1 overflow-hidden rounded-[12px] border border-[#E74C3C]/25 bg-gradient-to-br from-[#E74C3C]/15 to-[#C97A56]/10 p-1 shadow-[0_10px_25px_-15px_rgba(231,76,60,0.6)]">
        <Link
          href="/session"
          className="group relative flex min-w-0 flex-1 items-center gap-2.5 rounded-[10px] px-3 py-2 text-left text-white transition-colors hover:bg-white/[0.06]"
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E74C3C] opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#E74C3C]" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#E74C3C]">
              Session live
            </div>
            <div className="truncate text-[12.5px] font-semibold text-white">
              {session.patientName}
            </div>
            <div className="truncate text-[10.5px] text-white/50">
              {session.protocol} · {elapsed}
            </div>
          </div>
        </Link>
        <button
          type="button"
          aria-label="End session"
          title="End session"
          onClick={() => {
            endSession()
            router.push("/results")
          }}
          className="flex w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#E74C3C] text-white transition-colors hover:bg-[#c0392b] focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/40"
        >
          <Square className="h-3.5 w-3.5 fill-white" />
        </button>
      </div>
    )
  }

  return (
    <Link
      href="/session-setup"
      className="group mx-3 mb-4 flex items-center gap-2.5 rounded-[12px] border border-[#C97A56]/30 bg-gradient-to-br from-[#C97A56]/15 to-[#C97A56]/5 px-3 py-2.5 text-left text-white transition-colors hover:border-[#C97A56]/50 hover:from-[#C97A56]/25 hover:to-[#C97A56]/10"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-[#C97A56] text-white shadow-[0_6px_14px_-6px_rgba(201,122,86,0.8)] transition-transform group-hover:scale-105">
        <Plus className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[12.5px] font-semibold text-white">Start a new session</div>
        <div className="text-[10.5px] text-white/50">Guided or quick start</div>
      </div>
    </Link>
  )
}

export function AppSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    if (href.startsWith("/patients")) return pathname.startsWith("/patients")
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-[220px] shrink-0 flex-col border-r border-white/5 bg-[#162532] lg:flex">
      <div className="flex h-[68px] items-center px-5">
        <Hydrawav3Logo />
      </div>

      <StartSessionCTA />

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
