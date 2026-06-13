"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import {
  Check, ChevronDown, ChevronUp, ClipboardList,
  Mail, Plus, Zap, Sun, Moon, Send,
} from "lucide-react"
import { AppShell } from "@/components/hydrawav3/app-shell"
import type { AssessmentSummary } from "@/components/recovery-assistant-chat"

const BODY_AREAS = [
  "shoulder", "hip", "lower back", "knee", "neck", "calf",
  "upper back", "ankle", "wrist", "general",
]

const WELLNESS_GOALS = [
  "mobility", "recovery", "performance", "relaxation", "activation",
]

const ACTIVITY_LEVELS = [
  { value: "low", label: "Low" },
  { value: "moderate", label: "Moderate" },
  { value: "high", label: "High" },
  { value: "very_high", label: "Very High" },
]

const DISCOMFORT_LABELS: Record<number, string> = {
  0: "Feeling great",
  2: "Minimal restriction",
  4: "Some restriction",
  6: "Moderate restriction",
  8: "Significant restriction",
  10: "Very restricted",
}

function getDiscomfortLabel(val: number): string {
  const keys = [0, 2, 4, 6, 8, 10]
  const nearest = keys.reduce((a, b) => (Math.abs(b - val) < Math.abs(a - val) ? b : a))
  return DISCOMFORT_LABELS[nearest]
}

interface AssessmentForm {
  primaryArea: string
  discomfortLevel: number
  wellnessGoals: string[]
  activityLevel: string
  practitionerNotes: string
  hrv: string
  strain: string
  sleepScore: string
}

export default function ClientDashboardPage() {
  const params = useParams()
  const clientId = params.clientId as string

  const [clientName, setClientName] = useState("Client")
  const [clientEmail, setClientEmail] = useState<string | null>(null)
  const [lastSession, setLastSession] = useState<string | null>(null)
  const [sendingFollowUp, setSendingFollowUp] = useState(false)
  const [followUpSent, setFollowUpSent] = useState(false)
  const [followUpMessage, setFollowUpMessage] = useState<string | null>(null)
  const [followUpEmail, setFollowUpEmail] = useState("")
  const [formOpen, setFormOpen] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [assessmentId, setAssessmentId] = useState<string | undefined>()
  const [assessmentSummary, setAssessmentSummary] = useState<AssessmentSummary | undefined>()
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [sendingInvite, setSendingInvite] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)

  const [form, setForm] = useState<AssessmentForm>({
    primaryArea: "",
    discomfortLevel: 0,
    wellnessGoals: [],
    activityLevel: "",
    practitionerNotes: "",
    hrv: "",
    strain: "",
    sleepScore: "",
  })

  useEffect(() => {
    async function loadClient() {
      const res = await fetch(`/api/clients/${clientId}`)
      if (!res.ok) return
      const data = await res.json()
      setClientName(data.nickname ?? data.full_name ?? "Client")
      setClientEmail(data.email ?? null)
      if (data.email) setFollowUpEmail(data.email)
      setLastSession(
        data.latest_assessment?.created_at
          ? new Date(data.latest_assessment.created_at).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric",
            })
          : null
      )
    }
    loadClient()
  }, [clientId])

  async function sendInvite() {
    if (!inviteEmail) return
    setSendingInvite(true)
    setInviteError(null)
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: clientId, email: inviteEmail }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Failed to send invite")
      }
      setInviteSent(true)
    } catch (err: unknown) {
      setInviteError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSendingInvite(false)
    }
  }

  async function sendFollowUp() {
    setSendingFollowUp(true)
    try {
      const res = await fetch("/api/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, assessmentId, overrideEmail: followUpEmail || undefined }),
      })
      if (res.ok) {
        const { message } = await res.json()
        setFollowUpSent(true)
        setFollowUpMessage(message)
      }
    } finally {
      setSendingFollowUp(false)
    }
  }

  function toggleGoal(goal: string) {
    setForm((prev) => ({
      ...prev,
      wellnessGoals: prev.wellnessGoals.includes(goal)
        ? prev.wellnessGoals.filter((g) => g !== goal)
        : [...prev.wellnessGoals, goal],
    }))
  }

  async function submitAssessment() {
    if (!form.primaryArea) return
    setSubmitting(true)
    setSummaryError(null)
    try {
      const wearableData: Record<string, number> = {}
      if (form.hrv) wearableData.hrv_rmssd = parseFloat(form.hrv)
      if (form.strain) wearableData.strain = parseFloat(form.strain)
      if (form.sleepScore) wearableData.sleep_score = parseFloat(form.sleepScore)

      const body = {
        patient_id: clientId,
        primary_area: form.primaryArea,
        wellness_goals: form.wellnessGoals,
        reported_discomfort_level: form.discomfortLevel,
        recent_activity_level: form.activityLevel || null,
        practitioner_notes: form.practitionerNotes || null,
        wearable_data: Object.keys(wearableData).length > 0 ? wearableData : null,
      }

      const createRes = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}))
        throw new Error(err.error ?? "Failed to save assessment")
      }

      const { id } = await createRes.json()
      setAssessmentId(id)

      const sumRes = await fetch(`/api/assessments/${id}/summarize`, { method: "POST" })
      if (!sumRes.ok) {
        const err = await sumRes.json().catch(() => ({}))
        throw new Error(err.error ?? "Failed to generate summary")
      }
      const summary = await sumRes.json()
      setAssessmentSummary(summary)
      setFormOpen(false)
    } catch (err: unknown) {
      setSummaryError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell title={clientName} eyebrow="Recovery Intelligence">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#9CA3AF]">
            {lastSession ? `Last session: ${lastSession}` : "No sessions yet"}
          </p>
          <button
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center gap-2 rounded-[10px] border border-black/[0.09] bg-white px-4 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Assessment
          </button>
        </div>

        {/* Selected protocol banner */}
        {selectedProtocol && (
          <div className="flex items-center gap-3 bg-[#C97A56]/10 border border-[#C97A56]/20 rounded-[12px] px-4 py-3">
            <span className="inline-flex items-center rounded-full bg-[#C97A56]/20 px-2.5 py-1 text-xs font-medium text-[#C97A56]">
              Protocol Applied
            </span>
            <span className="text-sm text-[#374151]">{selectedProtocol}</span>
            <button
              className="ml-auto text-xs text-[#9CA3AF] hover:text-[#374151]"
              onClick={() => setSelectedProtocol(null)}
            >
              Clear
            </button>
          </div>
        )}

        {/* Pre-Session Assessment Card */}
        <div className="rounded-[12px] border border-black/[0.07] bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => setFormOpen((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 border-b border-black/[0.06] hover:bg-[#FAFAFA] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <ClipboardList className="h-4 w-4 text-[#C97A56]" />
              <span className="text-sm font-semibold text-[#1F2937]">Pre-Session Assessment</span>
              {assessmentSummary && (
                <span className="inline-flex items-center rounded-full bg-[#27ae60]/10 px-2.5 py-1 text-xs font-medium text-[#27ae60]">
                  Summary ready
                </span>
              )}
            </div>
            {formOpen
              ? <ChevronUp className="h-4 w-4 text-[#9CA3AF]" />
              : <ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
            }
          </button>

          {formOpen && (
            <div className="px-5 py-5 space-y-5">

              {/* Primary area */}
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">Primary Focus Area</label>
                <div className="flex flex-wrap gap-2">
                  {BODY_AREAS.map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, primaryArea: area }))}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium border capitalize transition-colors ${
                        form.primaryArea === area
                          ? "bg-[#C97A56]/15 border-[#C97A56]/40 text-[#C97A56]"
                          : "bg-[#FAFAFA] border-black/[0.09] text-[#374151] hover:border-[#C97A56]/30"
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discomfort slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-[#374151]">Restriction Level</label>
                  <span className="text-xs text-[#C97A56] font-medium">
                    {form.discomfortLevel} — {getDiscomfortLabel(form.discomfortLevel)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={form.discomfortLevel}
                  onChange={(e) => setForm((p) => ({ ...p, discomfortLevel: Number(e.target.value) }))}
                  className="w-full accent-[#C97A56]"
                />
                <div className="flex justify-between text-xs text-[#9CA3AF] mt-1">
                  <span>Feeling great</span>
                  <span>Very restricted</span>
                </div>
              </div>

              {/* Wellness goals */}
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">Wellness Goals</label>
                <div className="flex flex-wrap gap-2">
                  {WELLNESS_GOALS.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleGoal(goal)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium border capitalize transition-colors ${
                        form.wellnessGoals.includes(goal)
                          ? "bg-[#C97A56]/15 border-[#C97A56]/40 text-[#C97A56]"
                          : "bg-[#FAFAFA] border-black/[0.09] text-[#374151] hover:border-[#C97A56]/30"
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity level */}
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">Recent Activity Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {ACTIVITY_LEVELS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, activityLevel: value }))}
                      className={`rounded-[10px] border px-3 py-2 text-sm font-medium transition-colors ${
                        form.activityLevel === value
                          ? "border-[#C97A56] bg-[#C97A56]/10 text-[#C97A56]"
                          : "border-black/[0.09] bg-[#FAFAFA] text-[#374151] hover:border-[#C97A56]/40"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wearable data */}
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">
                  Wearable Data <span className="text-[#9CA3AF] font-normal">(optional)</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: "hrv", label: "HRV (ms)" },
                    { key: "strain", label: "Strain" },
                    { key: "sleepScore", label: "Sleep Score" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs text-[#9CA3AF] mb-1">{label}</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="—"
                        value={form[key as keyof AssessmentForm] as string}
                        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                        className="w-full rounded-[10px] border border-black/[0.09] bg-[#FAFAFA] px-3 py-2 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#C97A56]/30"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Practitioner notes */}
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">Practitioner Notes</label>
                <textarea
                  value={form.practitionerNotes}
                  onChange={(e) => setForm((p) => ({ ...p, practitionerNotes: e.target.value }))}
                  placeholder="Add any observations about this client's current state..."
                  rows={3}
                  className="w-full rounded-[10px] border border-black/[0.09] bg-[#FAFAFA] px-3.5 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#C97A56]/30 resize-none"
                />
              </div>

              <button
                onClick={submitAssessment}
                disabled={!form.primaryArea || submitting}
                className="w-full rounded-[10px] bg-[#C97A56] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#B86A48] transition-colors disabled:opacity-50"
              >
                {submitting ? "Generating Summary…" : "Generate Assessment Summary"}
              </button>

              {summaryError && (
                <p className="text-xs text-red-500 bg-red-50 rounded-[8px] px-3 py-2">{summaryError}</p>
              )}
            </div>
          )}
        </div>

        {/* Compact AI Summary Box */}
        {assessmentSummary && (
          <div className="rounded-[12px] border border-[#C97A56]/20 bg-[#C97A56]/5 px-4 py-4 space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-[#C97A56]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#C97A56]">AI Summary</span>
              {assessmentSummary.primary_focus_area && (
                <span className="ml-auto text-xs font-medium text-[#C97A56] capitalize bg-[#C97A56]/10 px-2 py-0.5 rounded-full">
                  {assessmentSummary.primary_focus_area}
                </span>
              )}
            </div>
            {assessmentSummary.practitioner_brief && (
              <p className="text-sm text-[#374151] leading-relaxed">{assessmentSummary.practitioner_brief}</p>
            )}
            {assessmentSummary.protocol_recommendation && (
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 flex items-center gap-2 text-xs text-[#9CA3AF]">
                  <Sun className="h-3 w-3 text-[#f0a500] shrink-0" />
                  <span>{assessmentSummary.protocol_recommendation.sun_placement}</span>
                  <Moon className="h-3 w-3 text-[#8b5cf6] shrink-0 ml-2" />
                  <span>{assessmentSummary.protocol_recommendation.moon_placement}</span>
                </div>
                <button
                  onClick={() => setSelectedProtocol(assessmentSummary.protocol_recommendation!.name)}
                  className="shrink-0 rounded-[8px] bg-[#C97A56] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#B86A48] transition-colors"
                >
                  Apply Protocol
                </button>
              </div>
            )}
          </div>
        )}

        {/* Email Follow-up Card */}
        <div className="rounded-[12px] border border-black/[0.07] bg-white overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-black/[0.06]">
            <Mail className="h-4 w-4 text-[#C97A56]" />
            <span className="text-sm font-semibold text-[#1F2937]">Email Follow-up</span>
            {clientEmail ? (
              <span className="inline-flex items-center rounded-full bg-[#27ae60]/10 px-2.5 py-1 text-xs font-medium text-[#27ae60]">
                {clientEmail}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-black/[0.05] px-2.5 py-1 text-xs font-medium text-[#9CA3AF]">
                No email on file
              </span>
            )}
          </div>
          <div className="px-5 py-4 space-y-4">
            {/* Editable email input */}
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Send to</label>
              <input
                type="email"
                value={followUpEmail}
                onChange={(e) => setFollowUpEmail(e.target.value)}
                placeholder="Enter client email address"
                className="w-full rounded-[10px] border border-black/[0.09] bg-[#FAFAFA] px-3.5 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#C97A56]/30"
              />
            </div>

            {followUpSent && followUpMessage ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-[#27ae60]">
                  <Check className="h-3.5 w-3.5" />
                  Email sent to {followUpEmail}
                </div>
                <p className="text-xs text-[#374151] bg-[#FAFAFA] rounded-[10px] px-3 py-2.5 border border-black/[0.06] italic leading-relaxed">
                  &ldquo;{followUpMessage}&rdquo;
                </p>
                <button
                  onClick={() => { setFollowUpSent(false); setFollowUpMessage(null) }}
                  className="rounded-[10px] border border-black/[0.09] bg-white px-3 py-2 text-xs font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                >
                  Send another
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-[#9CA3AF]">
                  {assessmentSummary
                    ? `Claude will write a personalised recovery follow-up for ${clientName} based on today's assessment.`
                    : `Claude will write a wellness check-in for ${clientName} and send it to their email.`}
                </p>
                <button
                  onClick={sendFollowUp}
                  disabled={sendingFollowUp || !followUpEmail}
                  className="inline-flex items-center gap-2 rounded-[10px] bg-[#C97A56] px-4 py-2 text-xs font-semibold text-white hover:bg-[#B86A48] transition-colors disabled:opacity-50"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {sendingFollowUp
                    ? "Sending…"
                    : assessmentSummary
                    ? "Send Post-Session Follow-up"
                    : "Send Wellness Check-in"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Send Portal Invite Card */}
        <div className="rounded-[12px] border border-black/[0.07] bg-white overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-black/[0.06]">
            <Send className="h-4 w-4 text-[#C97A56]" />
            <span className="text-sm font-semibold text-[#1F2937]">Client Portal Invite</span>
          </div>
          <div className="px-5 py-4 space-y-4">
            {inviteSent ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-[#27ae60]">
                  <Check className="h-3.5 w-3.5" />
                  Invite sent to {inviteEmail}
                </div>
                <p className="text-xs text-[#9CA3AF]">
                  {clientName} will receive an email with a link to create their client portal account.
                </p>
                <button
                  onClick={() => { setInviteSent(false); setInviteError(null) }}
                  className="rounded-[10px] border border-black/[0.09] bg-white px-3 py-2 text-xs font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                >
                  Send another invite
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-[#9CA3AF]">
                  Send {clientName} an invite link so they can create their client portal account and track their recovery.
                </p>
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full rounded-[10px] border border-black/[0.09] bg-[#FAFAFA] px-3.5 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#C97A56]/30"
                  />
                </div>
                {inviteError && (
                  <p className="text-xs text-red-500 bg-red-50 rounded-[8px] px-3 py-2">{inviteError}</p>
                )}
                <button
                  onClick={sendInvite}
                  disabled={sendingInvite || !inviteEmail}
                  className="inline-flex items-center gap-2 rounded-[10px] bg-[#C97A56] px-4 py-2 text-xs font-semibold text-white hover:bg-[#B86A48] transition-colors disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  {sendingInvite ? "Sending…" : "Send Invite"}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </AppShell>
  )
}
