"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  RotateCcw,
  Search,
  Users,
  Video,
  X,
} from "lucide-react"
import { AppShell } from "@/components/hydrawav3/app-shell"
import { patients } from "@/lib/patients"

type AppointmentStatus = "confirmed" | "tentative" | "completed" | "cancelled"
type Location = "in-person" | "virtual"

type Appointment = {
  id: string
  patientId: string
  patientName: string
  date: string // ISO date
  start: string // HH:MM
  end: string // HH:MM
  reason: string
  status: AppointmentStatus
  location: Location
  room?: string
  follow_up?: boolean
}

const seedAppointments: Appointment[] = [
  {
    id: "apt-001",
    patientId: "alex-morgan",
    patientName: "Alex Morgan",
    date: "2026-04-18",
    start: "09:00",
    end: "09:45",
    reason: "Post-op shoulder · Week 4 reassessment",
    status: "confirmed",
    location: "in-person",
    room: "Room 2",
  },
  {
    id: "apt-002",
    patientId: "priya-chandra",
    patientName: "Priya Chandra",
    date: "2026-04-18",
    start: "10:15",
    end: "11:00",
    reason: "Marathon recovery · HRV follow-up",
    status: "confirmed",
    location: "in-person",
    room: "Room 1",
  },
  {
    id: "apt-003",
    patientId: "marcus-lee",
    patientName: "Marcus Lee",
    date: "2026-04-18",
    start: "11:30",
    end: "12:15",
    reason: "New intake · Lower back assessment",
    status: "tentative",
    location: "in-person",
    room: "Room 1",
  },
  {
    id: "apt-004",
    patientId: "sofia-alvarez",
    patientName: "Sofia Alvarez",
    date: "2026-04-18",
    start: "13:00",
    end: "13:45",
    reason: "Post-surgical knee · Session 12 of 20",
    status: "confirmed",
    location: "in-person",
    room: "Room 2",
  },
  {
    id: "apt-005",
    patientId: "jordan-reyes",
    patientName: "Jordan Reyes",
    date: "2026-04-18",
    start: "14:30",
    end: "15:15",
    reason: "Cervical mobility reassessment",
    status: "confirmed",
    location: "in-person",
    room: "Room 1",
  },
  {
    id: "apt-006",
    patientId: "tomas-oliveira",
    patientName: "Tomás Oliveira",
    date: "2026-04-19",
    start: "15:30",
    end: "16:15",
    reason: "Cervical follow-up · Progress review",
    status: "confirmed",
    location: "virtual",
    follow_up: true,
  },
  {
    id: "apt-007",
    patientId: "amira-hassan",
    patientName: "Amira Hassan",
    date: "2026-04-22",
    start: "08:30",
    end: "09:00",
    reason: "Maintenance session · H3-Gamma",
    status: "confirmed",
    location: "in-person",
    room: "Room 2",
  },
  {
    id: "apt-008",
    patientId: "priya-chandra",
    patientName: "Priya Chandra",
    date: "2026-04-25",
    start: "10:15",
    end: "11:00",
    reason: "Follow-up check-in",
    status: "tentative",
    location: "virtual",
    follow_up: true,
  },
  {
    id: "apt-009",
    patientId: "alex-morgan",
    patientName: "Alex Morgan",
    date: "2026-04-11",
    start: "09:00",
    end: "09:45",
    reason: "Post-op shoulder · Week 3 reassessment",
    status: "completed",
    location: "in-person",
    room: "Room 2",
  },
  {
    id: "apt-010",
    patientId: "sofia-alvarez",
    patientName: "Sofia Alvarez",
    date: "2026-04-12",
    start: "13:00",
    end: "13:45",
    reason: "Post-surgical knee · Session 11",
    status: "completed",
    location: "in-person",
    room: "Room 2",
  },
]

const TODAY = "2026-04-18"

const statusStyles: Record<AppointmentStatus, string> = {
  confirmed: "bg-[#27AE60]/12 text-[#1f8e4a]",
  tentative: "bg-[#F0A500]/14 text-[#c47f00]",
  completed: "bg-[#1F2937]/8 text-[#374151]",
  cancelled: "bg-[#E74C3C]/12 text-[#c0392b]",
}

const statusLabel: Record<AppointmentStatus, string> = {
  confirmed: "Confirmed",
  tentative: "Tentative",
  completed: "Completed",
  cancelled: "Cancelled",
}

function formatDateHeader(iso: string) {
  const d = new Date(iso + "T00:00:00")
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  })
}

function isSameDay(a: string, b: string) {
  return a === b
}

function isFuture(iso: string) {
  return iso >= TODAY
}

type Filter = "upcoming" | "today" | "past" | "all"

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(seedAppointments)
  const [filter, setFilter] = useState<Filter>("upcoming")
  const [query, setQuery] = useState("")
  const [bookingOpen, setBookingOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return appointments
      .filter((a) => {
        if (filter === "today") return isSameDay(a.date, TODAY)
        if (filter === "upcoming") return isFuture(a.date) && a.status !== "completed"
        if (filter === "past")
          return a.date < TODAY || a.status === "completed" || a.status === "cancelled"
        return true
      })
      .filter((a) => {
        if (!q) return true
        return (
          a.patientName.toLowerCase().includes(q) ||
          a.reason.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? -1 : 1
        return a.start < b.start ? -1 : 1
      })
  }, [appointments, filter, query])

  const grouped = useMemo(() => {
    const map = new Map<string, Appointment[]>()
    for (const a of filtered) {
      const list = map.get(a.date) ?? []
      list.push(a)
      map.set(a.date, list)
    }
    return Array.from(map.entries())
  }, [filtered])

  const counts = useMemo(
    () => ({
      today: appointments.filter((a) => isSameDay(a.date, TODAY) && a.status !== "cancelled")
        .length,
      upcoming: appointments.filter((a) => isFuture(a.date) && a.status !== "completed").length,
      tentative: appointments.filter((a) => a.status === "tentative").length,
      followups: appointments.filter((a) => a.follow_up && a.status !== "completed").length,
    }),
    [appointments],
  )

  const handleBook = (draft: Omit<Appointment, "id" | "status"> & { status?: AppointmentStatus }) => {
    setAppointments((prev) => [
      ...prev,
      {
        ...draft,
        id: `apt-${Date.now().toString(36)}`,
        status: draft.status ?? "confirmed",
      },
    ])
    setBookingOpen(false)
  }

  const handleCancel = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a)),
    )
  }

  const handleBookFollowUp = (apt: Appointment) => {
    const base = new Date(apt.date + "T00:00:00")
    base.setDate(base.getDate() + 7)
    const iso = base.toISOString().slice(0, 10)
    setAppointments((prev) => [
      ...prev,
      {
        id: `apt-${Date.now().toString(36)}`,
        patientId: apt.patientId,
        patientName: apt.patientName,
        date: iso,
        start: apt.start,
        end: apt.end,
        reason: `${apt.reason.split(" · ")[0]} · Follow-up`,
        status: "tentative",
        location: apt.location,
        room: apt.room,
        follow_up: true,
      },
    ])
  }

  return (
    <AppShell
      title="Appointments"
      eyebrow="Calendar · This week"
      breadcrumbs={[{ label: "Appointments" }]}
      actions={
        <button
          type="button"
          onClick={() => setBookingOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#C97A56] px-4 text-[13px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(201,122,86,0.7)] hover:bg-[#B86A48]"
        >
          <Plus className="h-4 w-4" />
          Book appointment
        </button>
      }
    >
      <div className="space-y-6">
        {/* Summary strip */}
        <section className="grid gap-3 md:grid-cols-4">
          <SummaryTile icon={CalendarDays} label="Today" value={counts.today} tint="#C97A56" />
          <SummaryTile
            icon={CalendarClock}
            label="Upcoming"
            value={counts.upcoming}
            tint="#27AE60"
          />
          <SummaryTile icon={Clock} label="Tentative" value={counts.tentative} tint="#F0A500" />
          <SummaryTile icon={RotateCcw} label="Follow-ups" value={counts.followups} tint="#6C5CE7" />
        </section>

        {/* Controls */}
        <section className="rounded-[12px] border border-black/[0.07] bg-white">
          <div className="flex flex-col gap-3 border-b border-black/[0.06] px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 overflow-x-auto">
              {(
                [
                  { id: "upcoming", label: "Upcoming" },
                  { id: "today", label: "Today" },
                  { id: "past", label: "Past" },
                  { id: "all", label: "All" },
                ] as { id: Filter; label: string }[]
              ).map((f) => {
                const active = filter === f.id
                return (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[8px] border px-3 text-[12px] font-medium transition-colors ${
                      active
                        ? "border-[#C97A56] bg-[#C97A56]/10 text-[#B86A48]"
                        : "border-black/[0.07] bg-white text-[#374151] hover:border-black/10"
                    }`}
                  >
                    {f.label}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search client or reason…"
                  className="h-9 w-72 rounded-[9px] border border-black/[0.08] bg-white pl-8 pr-3 text-[12.5px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/15"
                />
              </div>
            </div>
          </div>

          {/* Grouped list */}
          {grouped.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="divide-y divide-black/[0.05]">
              {grouped.map(([date, apts]) => (
                <li key={date}>
                  <div className="flex items-center gap-3 bg-[#F2EDE6]/40 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                    <CalendarDays className="h-3.5 w-3.5 text-[#C97A56]" />
                    {formatDateHeader(date)}
                    {isSameDay(date, TODAY) && (
                      <span className="rounded-[5px] bg-[#C97A56] px-1.5 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-white">
                        Today
                      </span>
                    )}
                    <span className="ml-auto text-[10.5px] font-normal normal-case tracking-normal text-[#9CA3AF]">
                      {apts.length} {apts.length === 1 ? "appointment" : "appointments"}
                    </span>
                  </div>
                  <ul className="divide-y divide-black/[0.05]">
                    {apts.map((a) => (
                      <AppointmentRow
                        key={a.id}
                        apt={a}
                        onBookFollowUp={() => handleBookFollowUp(a)}
                        onCancel={() => handleCancel(a.id)}
                      />
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {bookingOpen && (
        <BookingModal
          onClose={() => setBookingOpen(false)}
          onSubmit={handleBook}
        />
      )}
    </AppShell>
  )
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  tint: string
}) {
  return (
    <div className="rounded-[12px] border border-black/[0.07] bg-white px-4 py-3">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
        <span>{label}</span>
        <span
          className="flex h-7 w-7 items-center justify-center rounded-[8px]"
          style={{ backgroundColor: `${tint}1F`, color: tint }}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mt-1 text-[22px] font-semibold tabular-nums text-[#1F2937]">
        {value}
      </div>
    </div>
  )
}

function AppointmentRow({
  apt,
  onBookFollowUp,
  onCancel,
}: {
  apt: Appointment
  onBookFollowUp: () => void
  onCancel: () => void
}) {
  return (
    <li className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-[#F2EDE6]/40 md:flex-row md:items-center">
      <div className="flex w-24 shrink-0 flex-col">
        <div className="text-[13px] font-semibold tabular-nums text-[#1F2937]">
          {apt.start}
        </div>
        <div className="text-[11px] text-[#9CA3AF]">→ {apt.end}</div>
      </div>

      <Link
        href={`/patients/${apt.patientId}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <div
          aria-hidden
          className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-[#C97A56] to-[#7a3d22] ring-2 ring-white shadow-sm"
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-[14px] font-semibold text-[#1F2937]">
              {apt.patientName}
            </span>
            {apt.follow_up && (
              <span className="inline-flex items-center gap-1 rounded-[5px] bg-[#6C5CE7]/12 px-1.5 py-0.5 text-[10px] font-semibold text-[#5344c9]">
                <RotateCcw className="h-3 w-3" /> Follow-up
              </span>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11.5px] text-[#6B7280]">
            <span className="truncate">{apt.reason}</span>
          </div>
        </div>
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-[6px] px-2 py-0.5 text-[11px] font-medium ${statusStyles[apt.status]}`}
        >
          {apt.status === "confirmed" && <CheckCircle2 className="h-3 w-3" />}
          {statusLabel[apt.status]}
        </span>
        <span className="inline-flex items-center gap-1 rounded-[6px] border border-black/[0.07] bg-white px-2 py-0.5 text-[11px] text-[#374151]">
          {apt.location === "virtual" ? (
            <>
              <Video className="h-3 w-3 text-[#6C5CE7]" /> Virtual
            </>
          ) : (
            <>
              <MapPin className="h-3 w-3 text-[#C97A56]" /> {apt.room ?? "In-person"}
            </>
          )}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {apt.status !== "completed" && apt.status !== "cancelled" && (
          <>
            <button
              type="button"
              onClick={onBookFollowUp}
              className="inline-flex h-8 items-center gap-1 rounded-[8px] border border-black/[0.07] bg-white px-2.5 text-[12px] font-medium text-[#374151] hover:border-[#C97A56]/40 hover:text-[#C97A56]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Follow-up
            </button>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Cancel appointment"
              className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-black/[0.07] bg-white text-[#6B7280] hover:border-[#E74C3C]/40 hover:text-[#E74C3C]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        )}
        <Link
          href={`/patients/${apt.patientId}`}
          className="inline-flex h-8 items-center gap-1 rounded-[8px] bg-[#162532] px-2.5 text-[12px] font-semibold text-white hover:bg-[#0F1E28]"
        >
          Open
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </li>
  )
}

function EmptyState() {
  return (
    <div className="px-5 py-16 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#F2EDE6]">
        <CalendarClock className="h-5 w-5 text-[#C97A56]" />
      </div>
      <p className="text-[14px] font-medium text-[#1F2937]">No appointments found</p>
      <p className="mt-1 text-[12.5px] text-[#6B7280]">
        Try a different filter, or book a new appointment.
      </p>
    </div>
  )
}

type BookingDraft = {
  patientId: string
  patientName: string
  date: string
  start: string
  end: string
  reason: string
  location: Location
  room?: string
}

function BookingModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (draft: BookingDraft) => void
}) {
  const [patientId, setPatientId] = useState<string>(patients[0]?.id ?? "")
  const [date, setDate] = useState<string>(TODAY)
  const [start, setStart] = useState<string>("09:00")
  const [end, setEnd] = useState<string>("09:45")
  const [reason, setReason] = useState<string>("")
  const [location, setLocation] = useState<Location>("in-person")
  const [room, setRoom] = useState<string>("Room 2")

  const selected = patients.find((p) => p.id === patientId)

  const canSave = !!selected && reason.trim().length > 0

  const submit = () => {
    if (!canSave || !selected) return
    onSubmit({
      patientId: selected.id,
      patientName: selected.name,
      date,
      start,
      end,
      reason: reason.trim(),
      location,
      room: location === "in-person" ? room : undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1E28]/60 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg overflow-hidden rounded-[14px] border border-black/5 bg-white shadow-[0_30px_60px_-20px_rgba(15,30,40,0.45)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
              Schedule
            </p>
            <h3 className="mt-0.5 text-[16px] font-semibold tracking-tight text-[#1F2937]">
              Book appointment
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-black/[0.07] bg-white text-[#6B7280] hover:border-black/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <Field label="Client">
            <div className="relative">
              <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="h-10 w-full appearance-none rounded-[9px] border border-black/[0.08] bg-white pl-9 pr-8 text-[13px] text-[#1F2937] focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/15"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.focus}
                  </option>
                ))}
              </select>
              <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-[#9CA3AF]" />
            </div>
          </Field>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Date" className="md:col-span-1">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 w-full rounded-[9px] border border-black/[0.08] bg-white px-3 text-[13px] text-[#1F2937] focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/15"
              />
            </Field>
            <Field label="Start" className="md:col-span-1">
              <input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="h-10 w-full rounded-[9px] border border-black/[0.08] bg-white px-3 text-[13px] text-[#1F2937] focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/15"
              />
            </Field>
            <Field label="End" className="md:col-span-1">
              <input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="h-10 w-full rounded-[9px] border border-black/[0.08] bg-white px-3 text-[13px] text-[#1F2937] focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/15"
              />
            </Field>
          </div>

          <Field label="Reason / focus">
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Post-op shoulder · Week 5 reassessment"
              className="h-10 w-full rounded-[9px] border border-black/[0.08] bg-white px-3 text-[13px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/15"
            />
          </Field>

          <Field label="Location">
            <div className="flex gap-2">
              {(
                [
                  { id: "in-person", label: "In-person", icon: MapPin },
                  { id: "virtual", label: "Virtual", icon: Video },
                ] as { id: Location; label: string; icon: typeof MapPin }[]
              ).map((l) => {
                const active = location === l.id
                const Icon = l.icon
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLocation(l.id)}
                    className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-[9px] border text-[12.5px] font-medium transition-colors ${
                      active
                        ? "border-[#C97A56] bg-[#C97A56]/10 text-[#B86A48]"
                        : "border-black/[0.07] bg-white text-[#374151] hover:border-black/10"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {l.label}
                  </button>
                )
              })}
            </div>
          </Field>

          {location === "in-person" && (
            <Field label="Room">
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="h-10 w-full rounded-[9px] border border-black/[0.08] bg-white px-3 text-[13px] text-[#1F2937] focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/15"
              />
            </Field>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-black/[0.06] bg-[#F5F0EA]/60 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-[9px] border border-black/[0.07] bg-white px-3 text-[12.5px] font-medium text-[#374151] hover:border-black/10"
          >
            <ChevronLeft className="-ml-0.5 mr-1 h-3.5 w-3.5" /> Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSave}
            className={`inline-flex h-9 items-center gap-1.5 rounded-[9px] px-3 text-[12.5px] font-semibold text-white ${
              canSave
                ? "bg-[#C97A56] hover:bg-[#B86A48]"
                : "cursor-not-allowed bg-[#C97A56]/50"
            }`}
          >
            Book appointment
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
        {label}
      </span>
      {children}
    </label>
  )
}
