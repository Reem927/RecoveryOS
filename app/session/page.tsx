"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Flame,
  HeartPulse,
  Minus,
  Pause,
  Play,
  Plus,
  Square,
  StickyNote,
  ThermometerSun,
  Timer,
  Volume2,
  Waves,
  Wind,
} from "lucide-react"
import { AppShell } from "@/components/hydrawav3/app-shell"
import { useActiveSession, useElapsed } from "@/lib/active-session"

export default function SessionPage() {
  const router = useRouter()
<<<<<<< HEAD
  const { session, startSession, endSession, ready } = useActiveSession()
=======
  const { session, endSession, ready } = useActiveSession()
>>>>>>> 33b5f22 (added landing page and fixed bugs)
  const elapsed = useElapsed(session?.startedAt)

  useEffect(() => {
    if (!ready) return
    if (!session) {
<<<<<<< HEAD
      startSession({
        patientId: "alex-morgan",
        patientName: "Alex Morgan",
        protocol: "H3-Beta · 18 min",
        room: "Room 2",
      })
    }
  }, [ready, session, startSession])
=======
      router.replace("/session-setup")
    }
  }, [ready, session, router])
>>>>>>> 33b5f22 (added landing page and fixed bugs)

  const patientName = session?.patientName ?? "Alex Morgan"
  const protocolLabel = session?.protocol ?? "H3-Beta · 18 min"

  const handleEnd = () => {
    endSession()
    router.push("/results")
  }

  return (
    <AppShell
      title={`Live session · ${patientName}`}
      breadcrumbs={[
        { label: "Patients", href: "/patients" },
        { label: patientName },
        { label: protocolLabel.split(" · ")[0] },
      ]}
      actions={
        <button
          type="button"
          onClick={handleEnd}
          className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#E74C3C] px-4 text-[13px] font-semibold text-white hover:bg-[#c0392b]"
        >
          <Square className="h-3.5 w-3.5 fill-white" />
          End session
        </button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        {/* Session canvas */}
        <section className="flex flex-col overflow-hidden rounded-[12px] border border-black/[0.07] bg-[#0F1E28] text-white">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E74C3C] opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#E74C3C]" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                Session live · Room 2
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-white/60">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1">
                <Waves className="h-3 w-3 text-[#C97A56]" />
                H3-Beta · 2.4 Hz
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1">
                <Volume2 className="h-3 w-3 text-[#8B5CF6]" />
                Ambient low
              </span>
            </div>
          </div>

          {/* Big timer / wave */}
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
                <span className="text-[18px] text-white/40 tabular-nums">/ 18:00</span>
              </div>

              {/* ring progress */}
              <div className="mt-6">
                <svg viewBox="0 0 240 60" className="h-16 w-[280px]">
                  {/* Live waveform */}
                  <path
                    d="M 0 30 Q 10 10 20 30 T 40 30 T 60 30 T 80 30 T 100 30 T 120 30 T 140 30 T 160 30 T 180 30 T 200 30 T 220 30 T 240 30"
                    fill="none"
                    stroke="#C97A56"
                    strokeWidth="2"
                    opacity="0.8"
                  />
                  <path
                    d="M 0 30 Q 10 15 20 30 T 40 30 T 60 30 T 80 30 T 100 30 T 120 30 T 140 30 T 160 30 T 180 30 T 200 30 T 220 30 T 240 30"
                    fill="none"
                    stroke="#C97A56"
                    strokeWidth="1"
                    opacity="0.4"
                  />
                </svg>
              </div>

              <div className="mt-6 flex w-full max-w-sm items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#C97A56] via-[#F0A500] to-[#C97A56]"
                    style={{ width: "43%" }}
                  />
                </div>
                <span className="text-[11px] tabular-nums text-white/60">43%</span>
              </div>
            </div>

            {/* Controls */}
            <div className="relative mt-4 flex items-center gap-3">
              <button className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/80 hover:bg-white/[0.08]">
                <Minus className="h-4 w-4" />
              </button>
              <button className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C97A56] text-white shadow-[0_20px_40px_-12px_rgba(201,122,86,0.6)] hover:bg-[#B86A48]">
                <Pause className="h-6 w-6 fill-white" />
              </button>
              <button className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/80 hover:bg-white/[0.08]">
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Intensity slider */}
            <div className="relative w-full max-w-md">
              <div className="mb-1.5 flex items-center justify-between text-[11px] text-white/60">
                <span className="font-semibold uppercase tracking-[0.12em]">Intensity</span>
                <span className="tabular-nums font-semibold text-white">62%</span>
              </div>
              <div className="relative h-2 rounded-full bg-white/10">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#27AE60] via-[#F0A500] to-[#E74C3C]"
                  style={{ width: "62%" }}
                />
                <div
                  className="absolute top-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2 rounded-full border-[3px] border-[#0F1E28] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                  style={{ left: "62%" }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-white/40">
                <span>Gentle</span>
                <span>Moderate</span>
                <span>Peak</span>
              </div>
            </div>
          </div>

          {/* Phase strip */}
          <div className="grid grid-cols-4 gap-px border-t border-white/5 bg-white/5 text-[11px]">
            {[
              { label: "Calibration", range: "0–2", done: true },
              { label: "Alpha wave", range: "2–7", done: true },
              { label: "Beta ramp", range: "7–14", active: true },
              { label: "Recovery", range: "14–18", todo: true },
            ].map((p) => (
              <div
                key={p.label}
                className={`bg-[#0F1E28] px-4 py-3 ${
                  p.active ? "bg-[#C97A56]/15" : ""
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {p.done ? (
                    <CheckCircle2 className="h-3 w-3 text-[#27AE60]" />
                  ) : p.active ? (
                    <span className="h-2 w-2 rounded-full bg-[#C97A56]" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-white/20" />
                  )}
                  <span
                    className={`font-semibold uppercase tracking-[0.1em] ${
                      p.active ? "text-white" : p.done ? "text-white/80" : "text-white/40"
                    }`}
                  >
                    {p.label}
                  </span>
                </div>
                <div className="mt-1 text-[10px] text-white/40">min {p.range}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Right rail */}
        <section className="space-y-4">
          {/* Vitals live */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Heart rate",
                value: "74",
                unit: "bpm",
                delta: "within zone 2",
                icon: HeartPulse,
                tint: "#E74C3C",
              },
              {
                label: "Breath rate",
                value: "11",
                unit: "rpm",
                delta: "coherent",
                icon: Wind,
                tint: "#8B5CF6",
              },
              {
                label: "Skin temp",
                value: "35.8",
                unit: "°C",
                delta: "+0.3 °C",
                icon: ThermometerSun,
                tint: "#F0A500",
              },
              {
                label: "Tension",
                value: "Low",
                unit: "",
                delta: "EMG relaxed",
                icon: Flame,
                tint: "#27AE60",
              },
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
                <div className="mt-0.5 text-[11px] text-[#6B7280]">{v.delta}</div>
              </div>
            ))}
          </div>

          {/* Session telemetry */}
          <div className="rounded-[12px] border border-black/[0.07] bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
              Session telemetry
            </p>
            <h3 className="mt-1 text-[15px] font-semibold tracking-tight text-[#1F2937]">
              Device output
            </h3>
            <ul className="mt-4 space-y-3">
              {[
                { label: "Wave form", v: "Beta sinusoidal" },
                { label: "Frequency", v: "2.4 Hz ± 0.05" },
                { label: "Amplitude", v: "62% / 4.8 mA" },
                { label: "Channel pairing", v: "CH-A · CH-C" },
                { label: "Contact impedance", v: "2.3 kΩ · optimal" },
              ].map((t) => (
                <li
                  key={t.label}
                  className="flex items-center justify-between text-[12px]"
                >
                  <span className="text-[#6B7280]">{t.label}</span>
                  <span className="font-semibold text-[#1F2937]">{t.v}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-2 rounded-[8px] bg-[#27AE60]/10 px-3 py-2 text-[11px] text-[#1f8e4a]">
              <Activity className="h-3.5 w-3.5" />
              All channels nominal · no safety alerts
            </div>
          </div>

          {/* Quick note */}
          <div className="rounded-[12px] border border-black/[0.07] bg-white p-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                Session note
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] text-[#9CA3AF]">
                <Timer className="h-3 w-3" />
                Autosaves
              </span>
            </div>
            <textarea
              rows={3}
              defaultValue="Patient reports mild warmth at 04:30 mark. Comfortable. Breathing settled into 11 rpm coherent pattern by minute 6."
              className="w-full resize-none rounded-[8px] border border-black/[0.08] bg-white px-3 py-2 text-[12px] text-[#1F2937] focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/20"
            />
            <button className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[8px] border border-black/[0.07] bg-white text-[12px] font-medium text-[#374151] hover:border-black/10">
              <StickyNote className="h-3.5 w-3.5 text-[#C97A56]" />
              Add timestamped marker
            </button>
          </div>

          {/* Emergency */}
          <div className="flex items-start gap-3 rounded-[12px] border border-[#E74C3C]/25 bg-[#E74C3C]/6 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#E74C3C]" />
            <div className="flex-1 text-[11px] text-[#c0392b]">
              <div className="font-semibold text-[#E74C3C]">Emergency stop</div>
              Cuts output instantly and starts 2-min wind-down. Hold button for 2s.
            </div>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-[#E74C3C] px-3 text-[11px] font-semibold text-white hover:bg-[#c0392b]">
              Hold to stop
            </button>
          </div>

          {/* Finish button */}
          <button
            type="button"
            onClick={handleEnd}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-[#1F2937] text-[13px] font-semibold text-white hover:bg-[#0F1E28]"
          >
            <Play className="h-4 w-4 rotate-90" />
            Complete early &amp; review
          </button>
        </section>
      </div>
    </AppShell>
  )
}
