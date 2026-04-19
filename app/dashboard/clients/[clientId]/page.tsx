"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ChevronDown, ChevronUp, ClipboardList, Plus } from "lucide-react"
import { AppShell } from "@/components/hydrawav3/app-shell"
import { RecoveryAssistantChat, type AssessmentSummary } from "@/components/recovery-assistant-chat"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  const [lastSession, setLastSession] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [assessmentId, setAssessmentId] = useState<string | undefined>()
  const [assessmentSummary, setAssessmentSummary] = useState<AssessmentSummary | undefined>()
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null)

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

  // Load patient info
  useEffect(() => {
    async function loadPatient() {
      const res = await fetch(`/api/patients/${clientId}`)
      if (res.ok) {
        const data = await res.json()
        setClientName(data.full_name ?? "Client")
        setLastSession(data.last_session_date ?? null)
      }
    }
    loadPatient().catch(() => {
      // patient API may not exist yet — use placeholder
    })
  }, [clientId])

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

      if (!createRes.ok) throw new Error("Failed to create assessment")

      const { id } = await createRes.json()
      setAssessmentId(id)

      // Summarize
      const sumRes = await fetch(`/api/assessments/${id}/summarize`, { method: "POST" })
      if (sumRes.ok) {
        const summary = await sumRes.json()
        setAssessmentSummary(summary)
        setFormOpen(false)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell title={clientName} eyebrow="Recovery Intelligence">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">{clientName}</h1>
            <p className="text-sm text-zinc-400">
              {lastSession ? `Last session: ${lastSession}` : "No sessions yet"}
            </p>
          </div>
          <Button
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            onClick={() => setFormOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Assessment
          </Button>
        </div>

        {/* Selected protocol banner */}
        {selectedProtocol && (
          <div className="flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-4 py-3">
            <Badge className="bg-cyan-600/30 text-cyan-300 border-cyan-500/40">Protocol Applied</Badge>
            <span className="text-sm text-cyan-200">{selectedProtocol}</span>
            <button
              className="ml-auto text-xs text-zinc-500 hover:text-zinc-300"
              onClick={() => setSelectedProtocol(null)}
            >
              Clear
            </button>
          </div>
        )}

        {/* Assessment form (collapsible) */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader
            className="pb-3 cursor-pointer select-none"
            onClick={() => setFormOpen((v) => !v)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-cyan-400" />
                Pre-Session Assessment
                {assessmentSummary && (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs ml-2" variant="outline">
                    Summary ready
                  </Badge>
                )}
              </CardTitle>
              {formOpen ? (
                <ChevronUp className="w-4 h-4 text-zinc-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              )}
            </div>
          </CardHeader>

          {formOpen && (
            <CardContent className="pt-0 pb-6 space-y-5">
              {/* Primary area */}
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">Primary Focus Area</Label>
                <Select value={form.primaryArea} onValueChange={(v) => setForm((p) => ({ ...p, primaryArea: v }))}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                    <SelectValue placeholder="Select primary area" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {BODY_AREAS.map((area) => (
                      <SelectItem key={area} value={area} className="text-zinc-200 capitalize">
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Discomfort slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-zinc-300 text-sm">Restriction Level</Label>
                  <span className="text-xs text-cyan-300">
                    {form.discomfortLevel} — {getDiscomfortLabel(form.discomfortLevel)}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={[form.discomfortLevel]}
                  onValueChange={([v]) => setForm((p) => ({ ...p, discomfortLevel: v }))}
                  className="[&_[role=slider]]:bg-cyan-500"
                />
                <div className="flex justify-between text-xs text-zinc-600">
                  <span>Feeling great</span>
                  <span>Very restricted</span>
                </div>
              </div>

              {/* Wellness goals */}
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">Wellness Goals</Label>
                <div className="flex flex-wrap gap-2">
                  {WELLNESS_GOALS.map((goal) => (
                    <button
                      key={goal}
                      onClick={() => toggleGoal(goal)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize ${
                        form.wellnessGoals.includes(goal)
                          ? "bg-cyan-600/30 border-cyan-500/60 text-cyan-200"
                          : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity level */}
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">Recent Activity Level</Label>
                <Select value={form.activityLevel} onValueChange={(v) => setForm((p) => ({ ...p, activityLevel: v }))}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {ACTIVITY_LEVELS.map(({ value, label }) => (
                      <SelectItem key={value} value={value} className="text-zinc-200">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Wearable data */}
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">
                  Wearable Data <span className="text-zinc-500 font-normal">(optional)</span>
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: "hrv", label: "HRV (ms)" },
                    { key: "strain", label: "Strain" },
                    { key: "sleepScore", label: "Sleep Score" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="text-xs text-zinc-500 block mb-1">{label}</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="—"
                        value={form[key as keyof AssessmentForm] as string}
                        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Practitioner notes */}
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">Practitioner Notes</Label>
                <Textarea
                  value={form.practitionerNotes}
                  onChange={(e) => setForm((p) => ({ ...p, practitionerNotes: e.target.value }))}
                  placeholder="Add any observations about this client's current state..."
                  className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-600 resize-none"
                  rows={3}
                />
              </div>

              <Button
                onClick={submitAssessment}
                disabled={!form.primaryArea || submitting}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                {submitting ? "Generating Summary..." : "Generate Assessment Summary"}
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Recovery Assistant Chat */}
        <RecoveryAssistantChat
          clientId={clientId}
          clientName={clientName}
          senderRole="practitioner"
          assessmentId={assessmentId}
          assessmentSummary={assessmentSummary}
          onProtocolSelect={(protocol) => {
            setSelectedProtocol(protocol)
            console.log("[Hydrawav3] Protocol selected:", protocol)
          }}
        />
      </div>
    </AppShell>
  )
}
