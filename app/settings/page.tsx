"use client"

import { useState, useEffect } from "react"
import { getClinicColleagues } from "./actions"
import Link from "next/link"
import {
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  Download,
  ExternalLink,
  Key,
  Lock,
  LogOut,
  Mail,
  Palette,
  Phone,
  Shield,
  Smartphone,
  Trash2,
  UserCircle2,
  Users,
  Waves,
  Wifi,
  WifiOff,
} from "lucide-react"
import { AppShell } from "@/components/hydrawav3/app-shell"

type Section =
  | "profile"
  | "clinic"
  | "notifications"
  | "devices"
  | "team"
  | "security"
  | "appearance"
  | "data"

const sections: {
  id: Section
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: "profile", label: "Profile", description: "Your practitioner account", icon: UserCircle2 },
  { id: "clinic", label: "Clinic", description: "Organisation details", icon: Building2 },
  { id: "notifications", label: "Notifications", description: "Alerts & reminders", icon: Bell },
  { id: "devices", label: "Devices", description: "Hydrawav3 hardware", icon: Smartphone },
  { id: "team", label: "Team", description: "Practitioners & access", icon: Users },
  { id: "security", label: "Security", description: "Password & sign-in", icon: Lock },
  { id: "appearance", label: "Appearance", description: "Theme & density", icon: Palette },
  { id: "data", label: "Data & privacy", description: "Export, retention, delete", icon: Shield },
]

export default function SettingsPage() {
  const [active, setActive] = useState<Section>("profile")

  return (
    <AppShell
      title="Settings"
      eyebrow="Workspace"
      breadcrumbs={[{ label: "Settings" }]}
    >
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Left nav */}
        <nav className="self-start rounded-[12px] border border-black/[0.07] bg-white p-2">
          {sections.map((s) => {
            const Icon = s.icon
            const isActive = active === s.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(s.id)}
                className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors ${
                  isActive
                    ? "bg-[#C97A56]/10 text-[#B86A48]"
                    : "text-[#374151] hover:bg-[#F2EDE6]/60"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] ${
                    isActive ? "bg-[#C97A56]/15 text-[#C97A56]" : "bg-[#F2EDE6] text-[#6B7280]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold">{s.label}</div>
                  <div className="truncate text-[11px] text-[#9CA3AF]">{s.description}</div>
                </div>
                <ChevronRight
                  className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-[#C97A56]" : "text-[#D1D5DB]"}`}
                />
              </button>
            )
          })}
        </nav>

        {/* Content */}
        <div className="min-w-0 space-y-6">
          {active === "profile" && <ProfileSection />}
          {active === "clinic" && <ClinicSection />}
          {active === "notifications" && <NotificationsSection />}
          {active === "devices" && <DevicesSection />}
          {active === "team" && <TeamSection />}
          {active === "security" && <SecuritySection />}
          {active === "appearance" && <AppearanceSection />}
          {active === "data" && <DataSection />}
        </div>
      </div>
    </AppShell>
  )
}

/* ------------------------------- SECTIONS ------------------------------- */

function ProfileSection() {
  const [firstName, setFirstName] = useState("Elena")
  const [lastName, setLastName] = useState("Ruiz")
  const [title, setTitle] = useState("Lead practitioner")
  const [email, setEmail] = useState("elena.ruiz@hydrawav3.clinic")
  const [phone, setPhone] = useState("+1 (415) 555-0199")
  const [bio, setBio] = useState(
    "Physiotherapist specialising in post-op mobility and wellness-oriented recovery protocols.",
  )

  return (
    <Card
      title="Profile"
      description="Your personal information is shown to clients and teammates."
    >
      <div className="flex items-center gap-4">
        <div
          aria-hidden
          className="h-16 w-16 shrink-0 rounded-[14px] bg-gradient-to-br from-[#C97A56] to-[#7a3d22] ring-2 ring-white shadow-sm"
        />
        <div className="flex gap-2">
          <button className="inline-flex h-9 items-center rounded-[9px] border border-black/[0.07] bg-white px-3 text-[12.5px] font-medium text-[#374151] hover:border-black/10">
            Upload photo
          </button>
          <button className="inline-flex h-9 items-center rounded-[9px] border border-transparent bg-transparent px-2 text-[12.5px] font-medium text-[#E74C3C] hover:bg-[#E74C3C]/5">
            Remove
          </button>
        </div>
      </div>

      <Divider />

      <Row>
        <Field label="First name">
          <Input value={firstName} onChange={setFirstName} />
        </Field>
        <Field label="Last name">
          <Input value={lastName} onChange={setLastName} />
        </Field>
      </Row>
      <Row>
        <Field label="Title">
          <Input value={title} onChange={setTitle} />
        </Field>
        <Field label="Email" icon={Mail}>
          <Input type="email" value={email} onChange={setEmail} />
        </Field>
      </Row>
      <Field label="Phone" icon={Phone}>
        <Input value={phone} onChange={setPhone} />
      </Field>
      <Field label="Professional bio">
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-[9px] border border-black/[0.08] bg-white px-3 py-2.5 text-[13px] text-[#1F2937] focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/15"
        />
      </Field>

      <SaveBar />
    </Card>
  )
}

function ClinicSection() {
  const [name, setName] = useState("Hydrawav3 Recovery Clinic")
  const [address, setAddress] = useState("142 Folsom St · Suite 300 · San Francisco, CA")
  const [timezone, setTimezone] = useState("America/Los_Angeles")
  const [language, setLanguage] = useState("en-US")

  return (
    <Card title="Clinic" description="Organisation settings shared by all practitioners.">
      <Field label="Clinic name" icon={Building2}>
        <Input value={name} onChange={setName} />
      </Field>
      <Field label="Address">
        <Input value={address} onChange={setAddress} />
      </Field>
      <Row>
        <Field label="Timezone">
          <Select
            value={timezone}
            onChange={setTimezone}
            options={[
              { v: "America/Los_Angeles", l: "Pacific (US & Canada)" },
              { v: "America/New_York", l: "Eastern (US & Canada)" },
              { v: "Europe/London", l: "London" },
              { v: "Europe/Berlin", l: "Central Europe" },
              { v: "Asia/Kolkata", l: "India (IST)" },
              { v: "Asia/Tokyo", l: "Tokyo" },
            ]}
          />
        </Field>
        <Field label="Default language">
          <Select
            value={language}
            onChange={setLanguage}
            options={[
              { v: "en-US", l: "English (US)" },
              { v: "en-GB", l: "English (UK)" },
              { v: "es-ES", l: "Español" },
              { v: "pt-BR", l: "Português" },
              { v: "fr-FR", l: "Français" },
            ]}
          />
        </Field>
      </Row>

      <Divider />

      <Subheading
        title="Wellness scope"
        description="Defines the language used in AI-generated insights and protocols."
      />
      <div className="rounded-[10px] border border-[#F0A500]/25 bg-[#F0A500]/8 p-3 text-[12px] text-[#6B7280]">
        Hydrawav3 is a wellness and recovery support platform. Insights use non-medical,
        wellness-safe language ("supports recovery", "mobility insights"). Diagnostic terminology
        is disabled across the workspace.
      </div>

      <SaveBar />
    </Card>
  )
}

function NotificationsSection() {
  const [email, setEmail] = useState({
    apptReminders: true,
    weeklySummary: true,
    newPatientIntake: true,
    monthlyInsights: false,
  })
  const [push, setPush] = useState({
    sessionStart: true,
    safetyAlerts: true,
    mentions: true,
  })

  return (
    <Card title="Notifications" description="Choose how Hydrawav3 reaches you.">
      <Subheading title="Email" description="Delivered to your practitioner email address." />
      <ToggleList>
        <ToggleItem
          title="Appointment reminders"
          description="Daily morning digest of today's schedule."
          checked={email.apptReminders}
          onChange={(v) => setEmail((s) => ({ ...s, apptReminders: v }))}
        />
        <ToggleItem
          title="Weekly patient summary"
          description="Progress roll-up every Monday."
          checked={email.weeklySummary}
          onChange={(v) => setEmail((s) => ({ ...s, weeklySummary: v }))}
        />
        <ToggleItem
          title="New patient intake"
          description="When a new client completes the intake form."
          checked={email.newPatientIntake}
          onChange={(v) => setEmail((s) => ({ ...s, newPatientIntake: v }))}
        />
        <ToggleItem
          title="Monthly cohort insights"
          description="Aggregate trends across your caseload."
          checked={email.monthlyInsights}
          onChange={(v) => setEmail((s) => ({ ...s, monthlyInsights: v }))}
        />
      </ToggleList>

      <Divider />

      <Subheading title="In-app & push" description="While signed in on this device." />
      <ToggleList>
        <ToggleItem
          title="Session start nudges"
          description="10 minutes before a scheduled appointment."
          checked={push.sessionStart}
          onChange={(v) => setPush((s) => ({ ...s, sessionStart: v }))}
        />
        <ToggleItem
          title="Safety alerts"
          description="Device warnings, impedance anomalies, stop events."
          checked={push.safetyAlerts}
          onChange={(v) => setPush((s) => ({ ...s, safetyAlerts: v }))}
        />
        <ToggleItem
          title="Team mentions"
          description="When a teammate tags you on a patient note."
          checked={push.mentions}
          onChange={(v) => setPush((s) => ({ ...s, mentions: v }))}
        />
      </ToggleList>

      <SaveBar />
    </Card>
  )
}

function DevicesSection() {
  const [devices, setDevices] = useState([
    {
      id: "hw3-r2-001",
      name: "Hydrawav3 · Room 2",
      serial: "H3-2026-08741",
      firmware: "v3.4.1",
      status: "online" as "online" | "offline",
      lastSeen: "2 minutes ago",
    },
    {
      id: "hw3-r1-002",
      name: "Hydrawav3 · Room 1",
      serial: "H3-2026-08692",
      firmware: "v3.4.1",
      status: "online" as "online" | "offline",
      lastSeen: "Just now",
    },
    {
      id: "hw3-mobile-003",
      name: "Hydrawav3 · Mobile cart",
      serial: "H3-2026-09113",
      firmware: "v3.3.8",
      status: "offline" as "online" | "offline",
      lastSeen: "4 days ago",
    },
  ])

  return (
    <Card
      title="Devices"
      description="Hydrawav3 hardware paired with this workspace."
      actions={
        <button className="inline-flex h-9 items-center gap-1.5 rounded-[9px] border border-black/[0.07] bg-white px-3 text-[12.5px] font-medium text-[#374151] hover:border-black/10">
          <Waves className="h-3.5 w-3.5 text-[#C97A56]" />
          Pair new device
        </button>
      }
    >
      <ul className="divide-y divide-black/[0.05] rounded-[10px] border border-black/[0.07]">
        {devices.map((d) => (
          <li key={d.id} className="flex items-center gap-3 px-4 py-3.5">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] ${
                d.status === "online"
                  ? "bg-[#27AE60]/12 text-[#1f8e4a]"
                  : "bg-[#1F2937]/6 text-[#6B7280]"
              }`}
            >
              {d.status === "online" ? (
                <Wifi className="h-4 w-4" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-[13.5px] font-semibold text-[#1F2937]">
                  {d.name}
                </span>
                <span
                  className={`rounded-[5px] px-1.5 py-0.5 text-[10px] font-semibold ${
                    d.status === "online"
                      ? "bg-[#27AE60]/12 text-[#1f8e4a]"
                      : "bg-[#1F2937]/8 text-[#374151]"
                  }`}
                >
                  {d.status === "online" ? "Online" : "Offline"}
                </span>
              </div>
              <div className="mt-0.5 text-[11.5px] text-[#9CA3AF]">
                SN {d.serial} · Firmware {d.firmware} · Last seen {d.lastSeen}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="inline-flex h-8 items-center rounded-[8px] border border-black/[0.07] bg-white px-2.5 text-[12px] font-medium text-[#374151] hover:border-black/10">
                Calibrate
              </button>
              <button
                onClick={() => setDevices((prev) => prev.filter((x) => x.id !== d.id))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-black/[0.07] bg-white text-[#6B7280] hover:border-[#E74C3C]/40 hover:text-[#E74C3C]"
                aria-label="Unpair"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2 rounded-[10px] bg-[#27AE60]/8 px-3 py-2.5 text-[12px] text-[#1f8e4a]">
        <CheckCircle2 className="h-4 w-4" />
        All online devices are running the latest firmware.
      </div>
    </Card>
  )
}

function TeamSection() {
  const [members, setMembers] = useState<
    { id: string; full_name: string; title: string | null; email: string | null; isYou: boolean }[]
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getClinicColleagues().then((data) => {
      setMembers(data)
      setLoading(false)
    })
  }, [])

  return (
    <Card
      title="Team"
      description="Everyone currently working at your clinic."
    >
      {loading ? (
        <div className="flex items-center gap-2 py-4 text-[13px] text-[#9CA3AF]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#C97A56] border-t-transparent" />
          Loading…
        </div>
      ) : members.length === 0 ? (
        <p className="py-4 text-center text-[13px] text-[#9CA3AF]">
          No teammates found at your clinic.
        </p>
      ) : (
        <ul className="divide-y divide-black/[0.05] rounded-[10px] border border-black/[0.07]">
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-3 px-4 py-3.5">
              <div
                aria-hidden
                className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-[#C97A56] to-[#7a3d22] ring-2 ring-white shadow-sm"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[13.5px] font-semibold text-[#1F2937]">
                    {m.full_name}
                  </span>
                  {m.isYou && (
                    <span className="rounded-[5px] bg-[#C97A56]/12 px-1.5 py-0.5 text-[10px] font-semibold text-[#B86A48]">
                      You
                    </span>
                  )}
                </div>
                <div className="mt-0.5 truncate text-[11.5px] text-[#9CA3AF]">
                  {[m.title, m.email].filter(Boolean).join(" · ")}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function SecuritySection() {
  const [twoFA, setTwoFA] = useState(true)
  return (
    <Card title="Security" description="Keep your account protected.">
      <Subheading title="Sign-in" />
      <div className="space-y-2 rounded-[10px] border border-black/[0.07] p-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[13px] font-semibold text-[#1F2937]">Password</div>
            <div className="text-[11.5px] text-[#9CA3AF]">Last changed 3 months ago</div>
          </div>
          <button className="inline-flex h-9 items-center gap-1.5 rounded-[9px] border border-black/[0.07] bg-white px-3 text-[12.5px] font-medium text-[#374151] hover:border-black/10">
            <Key className="h-3.5 w-3.5" />
            Change password
          </button>
        </div>
      </div>

      <ToggleList>
        <ToggleItem
          title="Two-factor authentication"
          description="Use an authenticator app to verify sign-ins."
          checked={twoFA}
          onChange={setTwoFA}
        />
      </ToggleList>

      <Divider />

      <Subheading title="Active sessions" />
      <ul className="divide-y divide-black/[0.05] rounded-[10px] border border-black/[0.07]">
        {[
          { device: "Chrome · macOS", where: "San Francisco, CA", current: true, last: "Now" },
          { device: "Safari · iPhone", where: "San Francisco, CA", current: false, last: "Yesterday" },
        ].map((s) => (
          <li key={s.device} className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#F2EDE6] text-[#C97A56]">
              <Smartphone className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#1F2937]">
                {s.device}
                {s.current && (
                  <span className="rounded-[5px] bg-[#27AE60]/12 px-1.5 py-0.5 text-[10px] font-semibold text-[#1f8e4a]">
                    This session
                  </span>
                )}
              </div>
              <div className="text-[11.5px] text-[#9CA3AF]">
                {s.where} · {s.last}
              </div>
            </div>
            {!s.current && (
              <button className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-black/[0.07] bg-white px-2.5 text-[12px] font-medium text-[#374151] hover:border-[#E74C3C]/40 hover:text-[#E74C3C]">
                <LogOut className="h-3.5 w-3.5" />
                Revoke
              </button>
            )}
          </li>
        ))}
      </ul>
    </Card>
  )
}

function AppearanceSection() {
  const [theme, setTheme] = useState<"light" | "system">("light")
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable")

  return (
    <Card title="Appearance" description="Customise how Hydrawav3 looks on this device.">
      <Subheading title="Theme" />
      <div className="grid gap-3 sm:grid-cols-2">
        {(
          [
            { id: "light", label: "Light", desc: "Default light theme" },
            { id: "system", label: "System", desc: "Match device setting" },
          ] as { id: "light" | "system"; label: string; desc: string }[]
        ).map((opt) => {
          const active = theme === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={`rounded-[11px] border p-4 text-left transition-colors ${
                active
                  ? "border-[#C97A56] bg-[#C97A56]/5"
                  : "border-black/[0.07] bg-white hover:border-black/10"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[13.5px] font-semibold text-[#1F2937]">{opt.label}</span>
                {active && (
                  <span className="rounded-[5px] bg-[#C97A56] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                    Selected
                  </span>
                )}
              </div>
              <div className="mt-1 text-[11.5px] text-[#9CA3AF]">{opt.desc}</div>
            </button>
          )
        })}
      </div>

      <Divider />

      <Subheading title="Density" />
      <div className="flex gap-2">
        {(
          [
            { id: "comfortable", label: "Comfortable" },
            { id: "compact", label: "Compact" },
          ] as { id: "comfortable" | "compact"; label: string }[]
        ).map((d) => {
          const active = density === d.id
          return (
            <button
              key={d.id}
              onClick={() => setDensity(d.id)}
              className={`inline-flex h-9 items-center rounded-[9px] border px-3 text-[12.5px] font-medium transition-colors ${
                active
                  ? "border-[#C97A56] bg-[#C97A56]/10 text-[#B86A48]"
                  : "border-black/[0.07] bg-white text-[#374151] hover:border-black/10"
              }`}
            >
              {d.label}
            </button>
          )
        })}
      </div>
    </Card>
  )
}

function DataSection() {
  return (
    <Card
      title="Data & privacy"
      description="Export your workspace data or manage retention."
    >
      <ul className="space-y-3">
        <InfoRow
          icon={Download}
          title="Export data"
          description="Download a full copy of your patient data, sessions, and notes."
          action={
            <button className="inline-flex h-9 items-center gap-1.5 rounded-[9px] border border-black/[0.07] bg-white px-3 text-[12.5px] font-medium text-[#374151] hover:border-black/10">
              Request export
              <Download className="h-3.5 w-3.5" />
            </button>
          }
        />
        <InfoRow
          icon={ExternalLink}
          title="Privacy policy"
          description="Review how Hydrawav3 stores and processes wellness data."
          action={
            <Link
              href="#"
              className="inline-flex h-9 items-center gap-1.5 rounded-[9px] border border-black/[0.07] bg-white px-3 text-[12.5px] font-medium text-[#374151] hover:border-black/10"
            >
              Open
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          }
        />
      </ul>

      <Divider />

      <div className="rounded-[11px] border border-[#E74C3C]/25 bg-[#E74C3C]/5 p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#E74C3C]/15 text-[#c0392b]">
            <Trash2 className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <div className="text-[13.5px] font-semibold text-[#1F2937]">Delete workspace</div>
            <div className="mt-0.5 text-[12px] text-[#6B7280]">
              Permanently removes all patient records, sessions, and team members after a 30-day
              grace period. This cannot be undone.
            </div>
          </div>
          <button className="inline-flex h-9 items-center rounded-[9px] border border-[#E74C3C]/40 bg-white px-3 text-[12.5px] font-semibold text-[#E74C3C] hover:bg-[#E74C3C]/5">
            Delete…
          </button>
        </div>
      </div>
    </Card>
  )
}

/* ------------------------------- PRIMITIVES ------------------------------- */

function Card({
  title,
  description,
  actions,
  children,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[12px] border border-black/[0.07] bg-white">
      <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] px-5 py-4">
        <div>
          <h2 className="text-[16px] font-semibold tracking-tight text-[#1F2937]">{title}</h2>
          {description && (
            <p className="mt-0.5 text-[12.5px] text-[#6B7280]">{description}</p>
          )}
        </div>
        {actions}
      </div>
      <div className="space-y-4 px-5 py-5">{children}</div>
    </section>
  )
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </span>
      {children}
    </label>
  )
}

function Input({
  value,
  onChange,
  type = "text",
}: {
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-[9px] border border-black/[0.08] bg-white px-3 text-[13px] text-[#1F2937] focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/15"
    />
  )
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { v: string; l: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-[9px] border border-black/[0.08] bg-white px-3 text-[13px] text-[#1F2937] focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/15"
    >
      {options.map((o) => (
        <option key={o.v} value={o.v}>
          {o.l}
        </option>
      ))}
    </select>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>
}

function Divider() {
  return <div className="h-px bg-black/[0.06]" />
}

function Subheading({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div>
      <h3 className="text-[13.5px] font-semibold text-[#1F2937]">{title}</h3>
      {description && <p className="mt-0.5 text-[12px] text-[#6B7280]">{description}</p>}
    </div>
  )
}

function ToggleList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="divide-y divide-black/[0.05] rounded-[10px] border border-black/[0.07]">
      {children}
    </ul>
  )
}

function ToggleItem({
  title,
  description,
  checked,
  onChange,
}: {
  title: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <li className="flex items-start gap-3 px-4 py-3.5">
      <div className="flex-1">
        <div className="text-[13px] font-semibold text-[#1F2937]">{title}</div>
        <div className="mt-0.5 text-[11.5px] text-[#6B7280]">{description}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-[#C97A56]" : "bg-[#1F2937]/15"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </li>
  )
}

function SaveBar() {
  return (
    <div className="flex items-center justify-end gap-2 pt-2">
      <button className="inline-flex h-9 items-center rounded-[9px] border border-black/[0.07] bg-white px-3 text-[12.5px] font-medium text-[#374151] hover:border-black/10">
        Discard
      </button>
      <button className="inline-flex h-9 items-center gap-1.5 rounded-[9px] bg-[#C97A56] px-3 text-[12.5px] font-semibold text-white hover:bg-[#B86A48]">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Save changes
      </button>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action: React.ReactNode
}) {
  return (
    <li className="flex items-start gap-3 rounded-[10px] border border-black/[0.07] p-3">
      <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#F2EDE6] text-[#C97A56]">
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1">
        <div className="text-[13px] font-semibold text-[#1F2937]">{title}</div>
        <div className="mt-0.5 text-[11.5px] text-[#6B7280]">{description}</div>
      </div>
      {action}
    </li>
  )
}
