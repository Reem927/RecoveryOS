"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { Bell, CalendarDays, Check, ChevronRight, Search } from "lucide-react"
import { cn } from "@/lib/utils"

type Crumb = { label: string; href?: string }

const STORAGE_KEY = "recoveryos.selected-date.v1"

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function parseDateInputValue(value: string) {
  const [year, month, day] = value.split("-").map(Number)

  if (!year || !month || !day) {
    return new Date()
  }

  return new Date(year, month - 1, day)
}

function formatDisplayDate(value: string) {
  const selected = parseDateInputValue(value)
  const today = new Date()

  const selectedKey = toDateInputValue(selected)
  const todayKey = toDateInputValue(today)

  if (selectedKey === todayKey) {
    return "Today"
  }

  return selected.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function formatLongDate(value: string) {
  const selected = parseDateInputValue(value)

  return selected.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

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
  actions?: ReactNode
  className?: string
}) {
  const todayValue = toDateInputValue(new Date())
  const calendarRef = useRef<HTMLDivElement | null>(null)

  const [selectedDate, setSelectedDate] = useState(todayValue)
  const [calendarOpen, setCalendarOpen] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)

      if (stored) {
        setSelectedDate(stored)
      }
    } catch {
      setSelectedDate(todayValue)
    }
  }, [todayValue])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!calendarRef.current) return

      if (!calendarRef.current.contains(event.target as Node)) {
        setCalendarOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setCalendarOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  const updateSelectedDate = (nextDate: string) => {
    setSelectedDate(nextDate)

    try {
      window.localStorage.setItem(STORAGE_KEY, nextDate)

      window.dispatchEvent(
        new CustomEvent("recoveryos:selected-date-change", {
          detail: { date: nextDate },
        }),
      )
    } catch {
      // Ignore storage/event issues so the UI never crashes.
    }
  }

  const handleToday = () => {
    updateSelectedDate(todayValue)
    setCalendarOpen(false)
  }

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

            {breadcrumbs?.map((crumb, index) => (
              <span key={index} className="flex items-center gap-1.5">
                {index > 0 || eyebrow ? (
                  <ChevronRight className="h-3 w-3 text-[#D1D5DB]" />
                ) : null}

                <span
                  className={
                    index === (breadcrumbs?.length ?? 0) - 1
                      ? "text-[#C97A56]"
                      : ""
                  }
                >
                  {crumb.label}
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
            placeholder="Search patients, sessions..."
            className="h-10 w-64 rounded-[10px] border border-black/[0.07] bg-white pl-9 pr-3 text-[13px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/20"
          />
        </div>
      </div>

      <div ref={calendarRef} className="relative hidden md:block">
        <button
          type="button"
          onClick={() => setCalendarOpen((open) => !open)}
          className={cn(
            "flex h-10 items-center gap-2 rounded-[10px] border border-black/[0.07] bg-white px-3 text-[12px] font-medium text-[#374151] hover:border-black/10",
            calendarOpen && "border-[#C97A56]/40 ring-2 ring-[#C97A56]/15",
          )}
        >
          <CalendarDays className="h-4 w-4 text-[#C97A56]" />
          <span>{formatDisplayDate(selectedDate)}</span>
        </button>

        {calendarOpen && (
          <div className="absolute right-0 top-12 z-50 w-[280px] rounded-[14px] border border-black/[0.08] bg-white p-4 shadow-[0_20px_60px_-30px_rgba(15,30,40,0.45)]">
            <div className="mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
                Calendar date
              </p>
              <p className="mt-1 text-[14px] font-semibold text-[#1F2937]">
                {formatLongDate(selectedDate)}
              </p>
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={(event) => updateSelectedDate(event.target.value)}
              className="h-10 w-full rounded-[10px] border border-black/[0.08] bg-white px-3 text-[13px] text-[#1F2937] focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/15"
            />

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleToday}
                className="inline-flex h-9 items-center justify-center rounded-[9px] border border-black/[0.07] bg-white px-3 text-[12px] font-semibold text-[#374151] hover:border-[#C97A56]/40"
              >
                Today
              </button>

              <button
                type="button"
                onClick={() => setCalendarOpen(false)}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[9px] bg-[#C97A56] px-3 text-[12px] font-semibold text-white hover:bg-[#B86A48]"
              >
                <Check className="h-3.5 w-3.5" />
                Done
              </button>
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-[#9CA3AF]">
              This date is saved locally and stays selected while moving across
              RecoveryOS pages.
            </p>
          </div>
        )}
      </div>

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