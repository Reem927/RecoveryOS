"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Activity,
  AlertTriangle,
  Flame,
  HeartPulse,
  Pause,
  Play,
  Square,
  Sparkles,
  Target,
  Timer,
  Waves,
  Wind,
} from "lucide-react"
import { AppShell } from "@/components/hydrawav3/app-shell"
import { useActiveSession, useElapsed } from "@/lib/active-session"
import {
  getProtocolName,
  type HydrawavPayload,
} from "@/lib/hydrawav3-protocol"
import { getClient } from "@/lib/hydrawav3-client"

type DeviceState = "running" | "paused" | "stopped"

function readPayload(): HydrawavPayload | null {
  try {
    const raw = localStorage.getItem("hw3_active_payload")
    if (!raw) return null
    return JSON.parse(raw) as HydrawavPayload
  } catch {
    return null
  }
}

export default function SessionPage() {
  const router = useRouter()
  const { session, endSession, startSession, ready } = useActiveSession()
  const elapsed = useElapsed(session?.startedAt)

  const [payload, setPayload] = useState<HydrawavPayload | null>(null)
  const [deviceState, setDeviceState] = useState<DeviceState>("running")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setPayload(readPayload())
  }, [])

  useEffect(() => {
    if (!ready) return
    if (!session) {
      if (payload) {
        const protocolName = getProtocolName(payload)
        const durationMin = Math.max(1, Math.round(payload.totalDuration / 60))
        startSession({
          patientId: "alex-morgan",
          patientName: "Alex Morgan",
          protocol: `${protocolName} · ${durationMin} min`,
          room: "Room 2",
        })
      } else {
        router.replace("/session-setup")
      }
    }
  }, [ready, session, payload, startSession, router])

  const patientName = session?.patientName ?? "Alex Morgan"
  const protocolName = payload ? getProtocolName(payload) : "H3-Beta"
  const durationMin = payload ? Math.max(1, Math.round(payload.totalDuration / 60)) : 18
  const sunSide: "left" | "right" = useMemo(() => {
    if (!payload) return "left"
    return payload.leftFuncs[0]?.includes("Hot") ? "left" : "right"
  }, [payload])
  const moonSide: "left" | "right" = sunSide === "left" ? "right" : "left"

  const intensityLabel =
    protocolName === "H3-Alpha"
      ? "Gentle"
      : protocolName === "H3-Beta"
        ? "Moderate"
        : "Performance"
  const vibLabel = !payload
    ? "Moderate"
    : payload.vibMax <= 150
      ? "Calming"
      : payload.vibMax <= 200
        ? "Moderate"
        : "Energising"

  const handlePause = async () => {
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      await getClient().pauseSession()
      setDeviceState("paused")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pause failed")
    } finally {
      setBusy(false)
    }
  }

  const handleResume = async () => {
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      await getClient().resumeSession()
      setDeviceState("running")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resume failed")
    } finally {
      setBusy(false)
    }
  }

  const handleStop = async () => {
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      await getClient().stopSession()
      setDeviceState("stopped")
      endSession()
      try {
        localStorage.removeItem("hw3_active_payload")
      } catch {
        // ignore
      }
      router.push("/results")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Stop failed")
      setBusy(false)
    }
  }

  const progressPct = payload
    ? Math.min(
        100,
        Math.round(((Date.now() - (session?.startedAt ?? Date.now())) / (payload.totalDuration * 1000)) * 100),
      )
    : 0

  return (
    <AppShell
      title={`Live session · ${patientName}`}
      breadcrumbs={[
        { label: "Patients", href: "/patients" },
        { label: patientName },
        { label: protocolName },
      ]}
      actions={
        <button
          type="button"
          onClick={handleStop}
          disabled={busy || deviceState === "stopped"}
          className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#E74C3C] px-4 text-[13px] font-semibold text-white hover:bg-[#c0392b] disabled:opacity-60"
        >
          <Square className="h-3.5 w-3.5 fill-white" />
          End session
        </button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <section className="flex flex-col overflow-hidden rounded-[12px] border border-black/[0.07] bg-[#0F1E28] text-white">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                {deviceState === "running" && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E74C3C] opacity-60" />
                )}
                <span
                  className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                    deviceState === "running"
                      ? "bg-[#E74C3C]"
                      : deviceState === "paused"
                        ? "bg-[#F0A500]"
                        : "bg-white/40"
                  }`}
                />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                {deviceState === "running"
                  ? "Session live"
                  : deviceState === "paused"
                    ? "Paused"
                    : "Stopped"}{" "}
                · Room 2
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-white/60">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1">
                <Sparkles className="h-3 w-3 text-[#C97A56]" />
                {protocolName}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1">
                <Target className="h-3 w-3 text-[#F5B08C]" />
                Sun · {sunSide}
              </span>
            </div>
          </div>

          <div className="relative flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(201,122,86,0.18),transparent_60%)]"
            />

            <div className="relative flex flex-col items-center">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                Elapsed / Target
              </span>
              <div className="mt-2 flex items-baseline gap-2 font-mono">
                <span className="text-[64px] font-semibold leading-none tabular-nums">
                  {elapsed}
                </span>
                <span className="text-[18px] text-white/40 tabular-nums">
                  / {String(durationMin).padStart(2, "0")}:00
                </span>
              </div>

              <div className="mt-6 flex w-full max-w-sm items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#C97A56] via-[#F0A500] to-[#C97A56]"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="text-[11px] tabular-nums text-white/60">{progressPct}%</span>
              </div>
            </div>

            <div className="relative mt-4 flex items-center gap-3">
              {deviceState === "paused" ? (
                <button
                  type="button"
                  onClick={handleResume}
                  disabled={busy}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-[#27AE60] text-white shadow-[0_20px_40px_-12px_rgba(39,174,96,0.6)] hover:bg-[#1f8e4a] disabled:opacity-60"
                  aria-label="Resume"
                >
                  <Play className="h-6 w-6 fill-white" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePause}
                  disabled={busy || deviceState === "stopped"}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C97A56] text-white shadow-[0_20px_40px_-12px_rgba(201,122,86,0.6)] hover:bg-[#B86A48] disabled:opacity-60"
                  aria-label="Pause"
                >
                  <Pause className="h-6 w-6 fill-white" />
                </button>
              )}
            </div>

            {error && (
              <div className="relative rounded-[10px] border border-[#E74C3C]/30 bg-[#E74C3C]/10 px-3 py-2 text-[11px] text-[#f5b8b0]">
                {error}
              </div>
            )}
          </div>

          {payload && (
            <div className="grid grid-cols-3 gap-px border-t border-white/5 bg-white/5 text-[11px]">
              <SessionStat label="Cycles" value={`${payload.sessionCount}`} sub={payload.cycleRepetitions.join("/")} />
              <SessionStat label="Intensity" value={intensityLabel} sub={`pwm ${payload.pwmValues.hot[0]}`} />
              <SessionStat label="Vibration" value={vibLabel} sub={`vibMax ${payload.vibMax}`} />
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="rounded-[12px] border border-black/[0.07] bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
              Pad placement
            </p>
            <h3 className="mt-1 text-[15px] font-semibold tracking-tight text-[#1F2937]">
              How the belt is set
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-center gap-3 rounded-[10px] bg-[#FFF3ED] px-3 py-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#C97A56] text-white">
                  <Flame className="h-4 w-4" />
                </span>
                <div className="text-[12px]">
                  <div className="font-semibold text-[#B86A48]">Sun · {sunSide}</div>
                  <div className="text-[#6B7280]">Supports tissue preparation</div>
                </div>
              </li>
              <li className="flex items-center gap-3 rounded-[10px] bg-[#EEF4FA] px-3 py-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#4F8FBF] text-white">
                  <Waves className="h-4 w-4" />
                </span>
                <div className="text-[12px]">
                  <div className="font-semibold text-[#2E6591]">Moon · {moonSide}</div>
                  <div className="text-[#6B7280]">Supports nervous system calming</div>
                </div>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Heart rate", value: "74", unit: "bpm", icon: HeartPulse, tint: "#E74C3C" },
              { label: "Breath rate", value: "11", unit: "rpm", icon: Wind, tint: "#8B5CF6" },
              { label: "Duration", value: `${durationMin}`, unit: "min", icon: Timer, tint: "#F0A500" },
              { label: "Status", value: deviceState === "running" ? "Live" : deviceState === "paused" ? "Paused" : "Stopped", unit: "", icon: Activity, tint: "#27AE60" },
            ].map((v) => (
              <div
                key={v.label}
                className="rounded-[12px] border border-black/[0.07] bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
                    {v.label}
                  </span>
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-[8px]"
                    style={{ backgroundColor: `${v.tint}1F`, color: v.tint }}
                  >
                    <v.icon className="h-3.5 w-3.5" />
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-[22px] font-semibold tabular-nums text-[#1F2937]">
                    {v.value}
                  </span>
                  {v.unit && <span className="text-[11px] text-[#9CA3AF]">{v.unit}</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-3 rounded-[12px] border border-[#E74C3C]/25 bg-[#E74C3C]/6 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#E74C3C]" />
            <div className="flex-1 text-[11px] text-[#c0392b]">
              <div className="font-semibold text-[#E74C3C]">Emergency stop</div>
              Cuts output instantly and ends the session.
            </div>
            <button
              type="button"
              onClick={handleStop}
              disabled={busy || deviceState === "stopped"}
              className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-[#E74C3C] px-3 text-[11px] font-semibold text-white hover:bg-[#c0392b] disabled:opacity-60"
            >
              Stop now
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  )
}

function SessionStat({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub: string
}) {
  return (
    <div className="bg-[#0F1E28] px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/50">
        {label}
      </div>
      <div className="mt-1 text-[13px] font-semibold text-white">{value}</div>
      <div className="text-[10px] text-white/40">{sub}</div>
    </div>
  )
}
