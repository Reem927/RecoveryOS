"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ClipboardCheck,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  PlayCircle,
  Settings,
  Square,
  Users,
} from "lucide-react"
import { UserButton, useClerk, useUser } from "@clerk/nextjs"
import { cn } from "@/lib/utils"
import { useActiveSession } from "@/lib/active-session"

const primaryNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Session Setup", href: "/session-setup", icon: PlayCircle },
  { label: "Patients", href: "/patients", icon: Users },
  { label: "Assessments", href: "/assessment", icon: ClipboardCheck },
]

const secondaryNav = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Support", href: "/support", icon: LifeBuoy },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()
  const { signOut } = useClerk()
  const { session, startSession, endSession } = useActiveSession()

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }

    if (href.startsWith("/patients")) {
      return pathname.startsWith("/patients")
    }

    if (href === "/session") {
      return pathname === "/session" || pathname.startsWith("/session/")
    }

    return pathname === href || pathname.startsWith(href + "/")
  }

  const handleStartLiveSession = () => {
    if (!session) {
      startSession({
        patientId: "alex-morgan",
        patientName: "Alex Morgan",
        protocol: "H3-Beta · 18 min",
        room: "Room 2",
      })
    }

    router.push("/session")
  }

  const handleEndLiveSession = () => {
    endSession()
    router.push("/results")
  }

  const handleLogout = async () => {
    await signOut({ redirectUrl: "/login" })
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-[220px] shrink-0 flex-col border-r border-white/5 bg-[#162532] lg:flex">
      <div className="flex h-[76px] items-center px-5">
        <div>
          <div className="text-[17px] font-bold tracking-tight text-white">
            RecoveryOS
          </div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">
            Hydrawav3
          </div>
        </div>
      </div>

      <div className="px-3 pb-4">
        {session ? (
          <button
            type="button"
            onClick={handleEndLiveSession}
            className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-red-500 px-3 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-red-600"
          >
            <Square className="h-3.5 w-3.5 fill-white" />
            End Live Session
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStartLiveSession}
            className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#C97A56] px-3 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#B86A48]"
          >
            <PlayCircle className="h-4 w-4" />
            Start Live Session
          </button>
        )}
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
                  active
                    ? "text-[#C97A56]"
                    : "text-white/50 group-hover:text-white/80",
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
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9 ring-2 ring-white/10",
              },
            }}
          />

          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-white">
              {user?.fullName ||
                user?.primaryEmailAddress?.emailAddress ||
                "RecoveryOS user"}
            </div>

            <div className="truncate text-[11px] text-white/50">
              Practitioner
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-[8px] border border-white/5 bg-white/[0.02] px-3 py-2 text-[11px] font-medium text-white/60 transition-colors hover:border-white/10 hover:bg-white/[0.05] hover:text-white"
        >
          <LogOut className="h-3.5 w-3.5" />
          Log out
        </button>
      </div>
    </aside>
  )
}