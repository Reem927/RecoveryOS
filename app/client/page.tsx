"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight, ArrowUpRight, Clock, Send, Sparkles } from "lucide-react"
import { RecoveryTrendChart, type TrendPoint } from "@/components/hydrawav3/recovery-trend-chart"

const COPPER = "#C97A56"
const COPPER_HOVER = "#B86A48"
const COPPER_LIGHT = "#FDF6F0"
const COPPER_BORDER = "rgba(201,122,86,0.25)"
const GREEN = "#1f8e4a"
const GREEN_BG = "rgba(39,174,96,0.12)"
const GREEN_BORDER = "rgba(39,174,96,0.2)"
const MUTED = "#6B7280"
const BODY = "#1F2937"
const LABEL = "#9CA3AF"

const eyebrow =
  "text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]"
const card = "rounded-[12px] border border-black/[0.07] bg-white p-5"
const heading = "text-[16px] font-semibold tracking-tight text-[#1F2937]"

/* ─── Recovery ring ────────────────────────────────────────── */
function RecoveryRing({ score }: { score: number }) {
  const r = 40
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div className="relative shrink-0" style={{ width: 100, height: 100 }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <circle cx={50} cy={50} r={r} stroke="#F3F4F6" strokeWidth={9} fill="none" />
        <circle
          cx={50} cy={50} r={r}
          stroke={COPPER} strokeWidth={9} fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[28px] font-semibold tracking-tight leading-none" style={{ color: COPPER }}>{score}</span>
        <span className="text-[10px] text-[#9CA3AF]">/100</span>
      </div>
    </div>
  )
}

/* ─── Trend chart ──────────────────────────────────────────── */
function TrendChart() {
  const pts: [number, number, number][] = [[20, 60, 48], [120, 48, 56], [220, 36, 62], [320, 14, 74]]
  const line = pts.map(([x, y]) => `${x},${y}`).join(" ")
  const fill = `M20 60 L120 48 L220 36 L320 14 L320 75 L20 75 Z`
  return (
    <svg viewBox="0 0 360 80" preserveAspectRatio="none" className="h-20 w-full">
      <defs>
        <linearGradient id="cg-client" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COPPER} stopOpacity={0.15} />
          <stop offset="100%" stopColor={COPPER} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={fill} fill="url(#cg-client)" />
      <polyline points={line} fill="none" stroke={COPPER} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y, score], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={i === pts.length - 1 ? 6 : 4} fill={COPPER} stroke={i === pts.length - 1 ? "white" : "none"} strokeWidth={2} />
          <text x={x} y={76} textAnchor="middle" fontSize={9} fill={i === pts.length - 1 ? COPPER : MUTED} fontWeight={i === pts.length - 1 ? 600 : 400}>{score}</text>
        </g>
      ))}
    </svg>
  )
}

/* ─── SoNa chat ────────────────────────────────────────────── */
type Msg = { role: "user" | "assistant"; content: string }

const STARTERS = [
  "Why did my score go up so much?",
  "What should I do before my next session?",
  "How is my streak going?",
]

function SoNaChat() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Hey Alex! I'm SoNa — your recovery companion. You jumped +18 today, which is your best session yet. Ask me anything about your progress." },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [msgs, loading])

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Msg = { role: "user", content: text.trim() }
    const next = [...msgs, userMsg]
    setMsgs(next)
    setInput("")
    setLoading(true)
    try {
      const res = await fetch("/api/sona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      })
      const { reply } = await res.json()
      setMsgs([...next, { role: "assistant", content: reply }])
    } catch {
      setMsgs([...next, { role: "assistant", content: "Connection lost — try again in a moment." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${card} relative overflow-hidden`}>
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: "linear-gradient(90deg, #378ADD, #C69E83, #C97A56)" }}
      />

      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#C97A56]/12 text-[#C97A56]">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <p className={heading}>Ask SoNa</p>
          <p className="text-[12px] text-[#6B7280]">Your recovery AI companion</p>
        </div>
      </div>

      <div className="mb-3 flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
        {msgs.map((m, i) => (
          <div
            key={i}
            className="max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed"
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              background: m.role === "user" ? COPPER : "#F9FAFB",
              color: m.role === "user" ? "white" : BODY,
              borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              border: m.role === "assistant" ? "1px solid rgba(0,0,0,0.05)" : "none",
            }}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div
            className="flex gap-1.5 self-start border border-black/[0.05] bg-[#F9FAFB] px-3 py-2.5"
            style={{ borderRadius: "14px 14px 14px 4px" }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block h-1.5 w-1.5 rounded-full"
                style={{ background: "#C69E83", animation: `sona-pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {msgs.length === 1 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border px-3 py-1 text-[11px] font-medium transition-colors hover:bg-[#FDF6F0]"
              style={{ borderColor: COPPER_BORDER, color: COPPER }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Ask about your recovery…"
          disabled={loading}
          className="h-10 flex-1 rounded-[10px] border border-black/[0.07] bg-white px-3 text-[13px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/20"
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-white transition-colors disabled:cursor-default"
          style={{
            background: input.trim() ? COPPER : "#F3F4F6",
            color: input.trim() ? "white" : MUTED,
          }}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

/* ─── Check-in form ────────────────────────────────────────── */
function CheckInForm() {
  const [scale, setScale] = useState(4)
  const [pain, setPain] = useState<"no" | "yes" | null>("no")
  const [done, setDone] = useState(false)

  return (
    <div className={card}>
      <p className={`${eyebrow} mb-2`}>24-hour check-in</p>
      <h2 className="mb-1 text-[18px] font-semibold tracking-tight text-[#1F2937]">
        How are you feeling?
      </h2>
      <p className="mb-5 text-[12px] text-[#6B7280]">
        Under 60 seconds · keeps your streak alive · your practitioner sees this
      </p>

      {done ? (
        <div
          className="rounded-[10px] border px-4 py-5 text-center"
          style={{ background: GREEN_BG, borderColor: GREEN_BORDER }}
        >
          <p className="mb-1 text-[14px] font-semibold tracking-tight" style={{ color: GREEN }}>
            Check-in sent
          </p>
          <p className="text-[12px] text-[#6B7280]">
            Streak day 5 secured · Dr. Ruiz has been notified
          </p>
        </div>
      ) : (
        <>
          <p className="mb-3 text-[13px] font-medium text-[#374151]">
            How&apos;s your lower back right now?{" "}
            <span className="text-[11px] font-normal text-[#9CA3AF]">
              1 = still sore · 5 = feeling great
            </span>
          </p>
          <div className="mb-5 flex gap-2">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                onClick={() => setScale(v)}
                className="h-10 flex-1 rounded-[10px] border text-[13px] font-semibold transition-all"
                style={{
                  borderColor: scale === v ? COPPER : "rgba(0,0,0,0.07)",
                  background: scale === v ? COPPER_LIGHT : "white",
                  color: scale === v ? COPPER : MUTED,
                }}
              >
                {v}
              </button>
            ))}
          </div>

          <p className="mb-3 text-[13px] font-medium text-[#374151]">
            Any new pain, swelling, or discomfort since your session?
          </p>
          <div className="mb-5 flex gap-2">
            {(["no", "yes"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setPain(v)}
                className="h-10 flex-1 rounded-[10px] border text-[13px] font-medium transition-all"
                style={{
                  borderColor: pain === v
                    ? v === "no" ? GREEN_BORDER : "rgba(231,76,60,0.3)"
                    : "rgba(0,0,0,0.07)",
                  background: pain === v
                    ? v === "no" ? GREEN_BG : "rgba(231,76,60,0.08)"
                    : "white",
                  color: pain === v
                    ? v === "no" ? GREEN : "#c0392b"
                    : MUTED,
                }}
              >
                {v === "no" ? "No, all good" : "Yes — flag practitioner"}
              </button>
            ))}
          </div>

          <button
            onClick={() => setDone(true)}
            className="h-11 w-full rounded-[10px] bg-[#C97A56] text-[13px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(201,122,86,0.7)] transition-colors hover:bg-[#B86A48]"
          >
            Send check-in
          </button>
        </>
      )}
    </div>
  )
}

/* ─── Main dashboard ───────────────────────────────────────── */
export default function ClientDashboard() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const sessions = [
    { score: 74, proto: "HydraFlush · 9 min", meta: "Today · Lower back", delta: "+18", current: true },
    { score: 62, proto: "Precision Cryo · 8 min", meta: "Thu 18 Apr · Lower back", delta: "+6", current: false },
    { score: 56, proto: "HydraFlush · 9 min", meta: "Tue 16 Apr · Lower back", delta: "+8", current: false },
    { score: 48, proto: "HydraFlush · 9 min", meta: "Mon 15 Apr · First session", delta: "+12", current: false },
  ]

  const days = [
    { lbl: "M", done: true }, { lbl: "T", done: true }, { lbl: "W", done: true },
    { lbl: "T", done: true }, { lbl: "F", today: true }, { lbl: "S" }, { lbl: "S" },
  ]

  const badges = [
    { earned: true, glyph: "🌑", name: "First session" },
    { earned: true, glyph: "⭐", name: "3-day streak" },
    { earned: true, glyph: "📈", name: "Score +15" },
    { earned: false, glyph: "🔒", name: "5 sessions" },
    { earned: false, glyph: "🔒", name: "7-day streak" },
  ]

  const fade = (i: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(14px)",
    transition: `opacity 0.45s ease ${i * 0.07}s, transform 0.45s ease ${i * 0.07}s`,
  })

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Page heading */}
      <div>
        <p className={eyebrow}>Monday · 21 April 2026</p>
        <h1 className="mt-1 text-[22px] font-semibold tracking-tight text-[#1F2937]">
          Your recovery
        </h1>
      </div>

      {/* Top row: score hero + streak */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Score hero */}
        <div className={`${card} relative overflow-hidden`} style={fade(0)}>
          <div
            className="absolute inset-x-0 top-0 h-[3px]"
            style={{ background: "linear-gradient(90deg, #378ADD, #C69E83, #C97A56)" }}
          />
          <p className={eyebrow}>HydraFlush · today</p>
          <div className="mt-4 flex items-center gap-5">
            <RecoveryRing score={74} />
            <div>
              <p className="text-[36px] font-semibold tracking-tight leading-none text-[#1F2937]">74</p>
              <p className="mt-1 text-[12px] text-[#6B7280]">Recovery score</p>
              <span
                className="mt-2 inline-flex items-center gap-1 rounded-[6px] px-1.5 py-0.5 text-[11px] font-medium"
                style={{ background: GREEN_BG, color: GREEN }}
              >
                <ArrowUpRight className="h-3 w-3" />
                +18 from last session
              </span>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {[
              { label: "Before session", val: "56", muted: true },
              { label: "After session", val: "74", muted: false },
            ].map((c) => (
              <div
                key={c.label}
                className="rounded-[10px] border border-black/[0.05] bg-[#F9FAFB] p-3"
              >
                <p className={eyebrow}>{c.label}</p>
                <p
                  className="mt-1 text-[22px] font-semibold tracking-tight leading-none"
                  style={{ color: c.muted ? MUTED : GREEN }}
                >
                  {c.val}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Streak + badges */}
        <div className={`${card} flex flex-col`} style={fade(1)}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[42px] font-semibold tracking-tight leading-none" style={{ color: COPPER }}>
                4
              </p>
              <p className="mt-1 text-[12px] text-[#6B7280]">day streak</p>
            </div>
            <div
              className="max-w-[180px] rounded-[10px] border px-3 py-2 text-right text-[11px] font-medium leading-relaxed"
              style={{ background: COPPER_LIGHT, color: COPPER, borderColor: COPPER_BORDER }}
            >
              Complete tomorrow&apos;s check-in to reach day 5
            </div>
          </div>

          {/* Day pips */}
          <div className="mb-1 flex gap-1">
            {days.map((d, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full"
                style={{ background: d.done ? COPPER : d.today ? "#F0A500" : "#E5E7EB" }}
              />
            ))}
          </div>
          <div className="mb-5 flex gap-1">
            {days.map((d, i) => (
              <div
                key={i}
                className="flex-1 text-center text-[10px]"
                style={{
                  color: d.done ? MUTED : d.today ? "#F0A500" : "#D1D5DB",
                  fontWeight: d.today ? 700 : 500,
                }}
              >
                {d.lbl}
              </div>
            ))}
          </div>

          {/* Badges */}
          <p className={`${eyebrow} mb-2`}>Milestones</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {badges.map((b, i) => (
              <div
                key={i}
                className="shrink-0 rounded-[10px] border px-3 py-2.5 text-center"
                style={{
                  background: b.earned ? COPPER_LIGHT : "#F9FAFB",
                  borderColor: b.earned ? COPPER_BORDER : "rgba(0,0,0,0.05)",
                  minWidth: 76,
                  opacity: b.earned ? 1 : 0.55,
                }}
              >
                <div
                  className="mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-full text-[13px]"
                  style={{ background: b.earned ? "rgba(201,122,86,0.12)" : "#F3F4F6" }}
                >
                  {b.glyph}
                </div>
                <p
                  className="text-[10px] font-medium leading-tight"
                  style={{ color: b.earned ? BODY : MUTED }}
                >
                  {b.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recovery trend */}
      <div className={card} style={fade(2)}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className={eyebrow}>Recovery trend</p>
            <h2 className={`${heading} mt-1`}>Last four sessions</h2>
          </div>
          <div className="text-right">
            <p
              className="text-[20px] font-semibold tracking-tight leading-none"
              style={{ color: GREEN }}
            >
              +26
            </p>
            <p className="mt-0.5 text-[11px] text-[#9CA3AF]">Total improvement</p>
          </div>
        </div>
        <TrendChart />
        <ul className="mt-4 divide-y divide-black/[0.05]">
          {sessions.map((s, i) => (
            <li key={i} className="flex items-center gap-3 py-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-[13px] font-semibold"
                style={{
                  border: `1px solid ${s.current ? COPPER : "rgba(0,0,0,0.07)"}`,
                  color: s.current ? COPPER : BODY,
                  background: s.current ? COPPER_LIGHT : "#F2EDE6",
                }}
              >
                {s.score}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-[#1F2937]">{s.proto}</p>
                <p className="truncate text-[11px] text-[#9CA3AF]">{s.meta}</p>
              </div>
              <span
                className="inline-flex items-center gap-1 rounded-[6px] px-1.5 py-0.5 text-[11px] font-medium"
                style={{ background: GREEN_BG, color: GREEN }}
              >
                <ArrowUpRight className="h-3 w-3" />
                {s.delta}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* What happened + body map */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* What happened */}
        <div className={card} style={fade(3)}>
          <p className={eyebrow}>Session breakdown</p>
          <h2 className={`${heading} mt-1 mb-4`}>What happened in your session</h2>
          <div className="flex flex-col gap-4">
            {[
              { color: COPPER, head: "Warmth and cool contrast", desc: "Alternating temperatures encouraged your muscles to release tension and helped move out the soreness from your lower back." },
              { color: "#378ADD", head: "Light support", desc: "Gentle red and blue light worked at different depths — supporting circulation and helping your surface tissue calm down." },
              { color: "#8B5CF6", head: "Gentle vibration", desc: "Low-frequency pulses helped your nervous system reset, easing the guarding your muscles had built up over time." },
            ].map((m, i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-1 h-10 w-1 shrink-0 rounded-full" style={{ background: m.color }} />
                <div>
                  <p className="text-[13px] font-semibold text-[#1F2937]">{m.head}</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-[#6B7280]">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div
            className="mt-4 rounded-[10px] border-l-2 bg-[#F9FAFB] py-3 pl-4 pr-3 text-[12px] italic leading-relaxed text-[#6B7280]"
            style={{ borderColor: COPPER }}
          >
            &ldquo;Your body did the work. The device gave it the right conditions.&rdquo;
          </div>
        </div>

        {/* Body map */}
        <div className={card} style={fade(4)}>
          <p className={eyebrow}>Focus area</p>
          <h2 className={`${heading} mt-1 mb-4`}>Where we focused today</h2>
          <div className="flex items-center gap-5">
            <div className="shrink-0">
              <svg width={80} height={130} viewBox="0 0 80 130" fill="none">
                <ellipse cx={40} cy={14} rx={13} ry={13} fill="#F3F4F6" stroke="#E5E7EB" strokeWidth={0.5} />
                <rect x={35} y={26} width={10} height={8} rx={2} fill="#F3F4F6" stroke="#E5E7EB" strokeWidth={0.5} />
                <rect x={22} y={34} width={36} height={44} rx={6} fill="#F3F4F6" stroke="#E5E7EB" strokeWidth={0.5} />
                <rect x={24} y={62} width={32} height={14} rx={4} fill={`${COPPER}33`} stroke={COPPER} strokeWidth={1} />
                <circle cx={40} cy={69} r={3} fill={COPPER} />
                <rect x={8} y={34} width={12} height={32} rx={6} fill="#F3F4F6" stroke="#E5E7EB" strokeWidth={0.5} />
                <rect x={60} y={34} width={12} height={32} rx={6} fill="#F3F4F6" stroke="#E5E7EB" strokeWidth={0.5} />
                <rect x={22} y={80} width={15} height={44} rx={6} fill="#F3F4F6" stroke="#E5E7EB" strokeWidth={0.5} />
                <rect x={43} y={80} width={15} height={44} rx={6} fill="#F3F4F6" stroke="#E5E7EB" strokeWidth={0.5} />
              </svg>
            </div>
            <div className="flex-1">
              {[
                { color: COPPER, label: "Lower back", sub: "primary zone" },
                { color: "#8B5CF6", label: "Nervous system", sub: "whole body reset" },
              ].map((z) => (
                <div key={z.label} className="mb-2 flex items-center gap-2">
                  <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: z.color }} />
                  <span className="text-[12px] text-[#6B7280]">
                    <strong className="font-semibold text-[#1F2937]">{z.label}</strong> — {z.sub}
                  </span>
                </div>
              ))}
              <div className="mt-3 rounded-[10px] border border-black/[0.05] bg-[#F9FAFB] p-3">
                <p className={eyebrow}>Protocol used</p>
                <p className="mt-1 text-[13px] font-semibold text-[#1F2937]">HydraFlush · 9 min</p>
                <p className="mt-0.5 text-[11px] text-[#6B7280]">Dr. Elena Ruiz</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SoNa AI chat */}
      <div style={fade(5)}>
        <SoNaChat />
      </div>

      {/* Check-in */}
      <div style={fade(6)}>
        <CheckInForm />
      </div>

      {/* Next session */}
      <div className={`${card} flex items-center gap-4`} style={fade(7)}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#C97A56]/12 text-[#C97A56]">
          <Clock className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-[#1F2937]">Book your next session</p>
          <p className="mt-0.5 text-[11px] text-[#9CA3AF]">Recommended within 3–5 days · HydraFlush</p>
        </div>
        <button className="inline-flex h-10 items-center gap-1.5 rounded-[10px] bg-[#C97A56] px-4 text-[13px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(201,122,86,0.7)] transition-colors hover:bg-[#B86A48]">
          Book now
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
