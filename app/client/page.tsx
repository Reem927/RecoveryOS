"use client"

import { useEffect, useRef, useState } from "react"

const COPPER = "#C97A56"
const COPPER_LIGHT = "#FDF6F0"
const COPPER_BORDER = "rgba(201,122,86,0.25)"
const GREEN = "#16A34A"
const GREEN_BG = "#F0FDF4"
const GREEN_BORDER = "rgba(22,163,74,0.2)"
const MUTED = "#6B7280"
const BODY = "#1F2937"
const LABEL = "#9CA3AF"

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
        <span className="text-[28px] font-semibold leading-none" style={{ color: COPPER }}>{score}</span>
        <span className="text-[10px]" style={{ color: MUTED }}>/100</span>
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
          <text x={x} y={76} textAnchor="middle" fontSize={9} fill={i === pts.length - 1 ? COPPER : MUTED} fontWeight={i === pts.length - 1 ? 500 : 400}>{score}</text>
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
    <div className="rounded-[12px] border border-black/[0.07] bg-white p-5">
      {/* Gradient top stripe */}
      <div
        className="absolute inset-x-0 top-0 h-[3px] rounded-t-[12px]"
        style={{ background: "linear-gradient(90deg, #378ADD, #C69E83, #C97A56)" }}
      />

      <div className="mb-4 flex items-center gap-3">
        <div
          className="h-8 w-8 shrink-0 rounded-full border"
          style={{
            background: "conic-gradient(from 270deg, #BA4A10 0% 50%, #185FA5 50% 100%)",
            borderColor: "#C69E83",
          }}
        />
        <div>
          <p className="text-[14px] font-medium" style={{ color: BODY, fontFamily: '"DM Serif Display", Georgia, serif' }}>Ask SoNa</p>
          <p className="text-[11px]" style={{ color: MUTED }}>Your recovery AI companion</p>
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
              border: m.role === "assistant" ? "1px solid #F3F4F6" : "none",
            }}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="flex gap-1.5 self-start rounded-2xl border border-[#F3F4F6] bg-[#F9FAFB] px-3 py-2.5" style={{ borderRadius: "14px 14px 14px 4px" }}>
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
              className="rounded-full border px-3 py-1 text-[11px] transition-colors hover:bg-[#FDF6F0]"
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
          className="h-10 flex-1 rounded-lg border border-black/[0.07] bg-[#F9FAFB] px-3 text-[13px] outline-none focus:border-[#C97A56] focus:ring-1 focus:ring-[#C97A56]/20"
          style={{ color: BODY }}
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors"
          style={{
            background: input.trim() ? COPPER : "#F3F4F6",
            color: input.trim() ? "white" : MUTED,
            border: "none",
            cursor: input.trim() ? "pointer" : "default",
          }}
        >
          <svg width={15} height={15} viewBox="0 0 20 20" fill="none">
            <path d="M3 10L17 10M17 10L11 4M17 10L11 16" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
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
    <div className="rounded-[12px] border bg-white p-5" style={{ borderColor: COPPER_BORDER }}>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: COPPER }}>
        24-hour check-in
      </p>
      <p className="mb-1 text-[18px]" style={{ fontFamily: '"DM Serif Display", Georgia, serif', color: BODY }}>
        How are you feeling?
      </p>
      <p className="mb-5 text-[12px] leading-relaxed" style={{ color: MUTED }}>
        Under 60 seconds · keeps your streak alive · your practitioner sees this
      </p>

      {done ? (
        <div className="rounded-lg border px-4 py-5 text-center" style={{ background: GREEN_BG, borderColor: GREEN_BORDER }}>
          <p className="mb-1 text-[16px] font-medium" style={{ color: GREEN, fontFamily: '"DM Serif Display", Georgia, serif' }}>
            Check-in sent ✓
          </p>
          <p className="text-[12px]" style={{ color: MUTED }}>Streak day 5 secured · Dr. Ruiz has been notified</p>
        </div>
      ) : (
        <>
          <p className="mb-3 text-[13px]" style={{ color: BODY }}>
            How&apos;s your lower back right now?{" "}
            <span className="text-[11px]" style={{ color: MUTED }}>1 = still sore · 5 = feeling great</span>
          </p>
          <div className="mb-5 flex gap-2">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                onClick={() => setScale(v)}
                className="h-10 flex-1 rounded-lg border text-[13px] font-medium transition-all"
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

          <p className="mb-3 text-[13px]" style={{ color: BODY }}>
            Any new pain, swelling, or discomfort since your session?
          </p>
          <div className="mb-5 flex gap-2">
            {(["no", "yes"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setPain(v)}
                className="h-10 flex-1 rounded-lg border text-[13px] transition-all"
                style={{
                  borderColor: pain === v
                    ? v === "no" ? GREEN_BORDER : "rgba(220,38,38,0.3)"
                    : "rgba(0,0,0,0.07)",
                  background: pain === v
                    ? v === "no" ? GREEN_BG : "#FEF2F2"
                    : "white",
                  color: pain === v
                    ? v === "no" ? GREEN : "#EF4444"
                    : MUTED,
                }}
              >
                {v === "no" ? "No, all good" : "Yes — flag practitioner"}
              </button>
            ))}
          </div>

          <button
            onClick={() => setDone(true)}
            className="h-11 w-full rounded-lg text-[14px] font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: COPPER }}
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

  const card = "rounded-[12px] border border-black/[0.07] bg-white p-5"
  const serif = { fontFamily: '"DM Serif Display", Georgia, serif' }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Page heading */}
      <div className="mb-6">
        <p className="text-[12px] uppercase tracking-widest" style={{ color: LABEL }}>Monday · 21 April 2026</p>
        <h1 className="text-[28px] font-medium" style={{ ...serif, color: BODY }}>Your Recovery</h1>
      </div>

      {/* Top row: score hero + streak */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">

        {/* Score hero */}
        <div className={`${card} relative overflow-hidden`} style={fade(0)}>
          <div
            className="absolute inset-x-0 top-0 h-[3px] rounded-t-[12px]"
            style={{ background: "linear-gradient(90deg, #378ADD, #C69E83, #C97A56)" }}
          />
          <p className="mb-4 text-[11px] uppercase tracking-widest" style={{ color: LABEL }}>HydraFlush · today</p>
          <div className="flex items-center gap-5">
            <RecoveryRing score={74} />
            <div>
              <p className="text-[42px] font-semibold leading-none" style={{ ...serif, color: BODY }}>74</p>
              <p className="mt-1 text-[12px]" style={{ color: MUTED }}>Recovery score</p>
              <span
                className="mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                style={{ background: GREEN_BG, color: GREEN, border: `1px solid ${GREEN_BORDER}` }}
              >
                ↑ +18 from last session
              </span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { label: "Before session", val: "56", muted: true },
              { label: "After session", val: "74", muted: false },
            ].map((c) => (
              <div key={c.label} className="rounded-lg bg-[#F9FAFB] p-3" style={{ border: "1px solid #F3F4F6" }}>
                <p className="mb-1 text-[10px] uppercase tracking-wider" style={{ color: LABEL }}>{c.label}</p>
                <p className="text-[24px] font-medium leading-none" style={{ ...serif, color: c.muted ? MUTED : GREEN }}>{c.val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Streak + badges */}
        <div className={`${card} flex flex-col`} style={fade(1)}>
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-[48px] font-semibold leading-none" style={{ ...serif, color: COPPER }}>4</p>
              <p className="mt-1 text-[12px]" style={{ color: MUTED }}>day streak</p>
            </div>
            <div
              className="max-w-[160px] rounded-lg px-3 py-2 text-right text-[11px] leading-relaxed"
              style={{ background: COPPER_LIGHT, color: COPPER, border: `1px solid ${COPPER_BORDER}` }}
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
                style={{ background: d.done ? COPPER : d.today ? "#EF9F27" : "#E5E7EB" }}
              />
            ))}
          </div>
          <div className="mb-4 flex gap-1">
            {days.map((d, i) => (
              <div
                key={i}
                className="flex-1 text-center text-[9px]"
                style={{ color: d.done ? MUTED : d.today ? "#EF9F27" : "#D1D5DB", fontWeight: d.today ? 600 : 400 }}
              >
                {d.lbl}
              </div>
            ))}
          </div>

          {/* Badges */}
          <p className="mb-2 text-[10px] uppercase tracking-wider" style={{ color: LABEL }}>Milestones</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {badges.map((b, i) => (
              <div
                key={i}
                className="shrink-0 rounded-xl px-3 py-2.5 text-center"
                style={{
                  background: b.earned ? COPPER_LIGHT : "#F9FAFB",
                  border: `1px solid ${b.earned ? COPPER_BORDER : "#F3F4F6"}`,
                  minWidth: 72,
                  opacity: b.earned ? 1 : 0.5,
                }}
              >
                <div className="mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-full text-[13px]"
                  style={{ background: b.earned ? "rgba(201,122,86,0.12)" : "#F3F4F6" }}
                >
                  {b.glyph}
                </div>
                <p className="text-[10px] leading-tight" style={{ color: b.earned ? BODY : MUTED }}>{b.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recovery trend */}
      <div className={`${card} relative mb-4`} style={fade(2)}>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[16px] font-medium" style={{ ...serif, color: BODY }}>Recovery trend</p>
          <div className="text-right">
            <p className="text-[20px] font-medium leading-none" style={{ ...serif, color: GREEN }}>+26</p>
            <p className="text-[10px]" style={{ color: MUTED }}>total improvement</p>
          </div>
        </div>
        <TrendChart />
        <div className="mt-4 divide-y divide-black/[0.05]">
          {sessions.map((s, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[13px] font-medium"
                style={{
                  borderColor: s.current ? COPPER : "rgba(0,0,0,0.07)",
                  color: s.current ? COPPER : MUTED,
                  background: s.current ? COPPER_LIGHT : "transparent",
                }}
              >
                {s.score}
              </div>
              <div className="flex-1">
                <p className="text-[13px]" style={{ color: BODY }}>{s.proto}</p>
                <p className="text-[11px]" style={{ color: MUTED }}>{s.meta}</p>
              </div>
              <span
                className="rounded-lg px-2 py-0.5 text-[11px] font-medium"
                style={{ background: GREEN_BG, color: GREEN, border: `1px solid ${GREEN_BORDER}` }}
              >
                {s.delta}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* What happened + body map */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* What happened */}
        <div className={card} style={fade(3)}>
          <p className="mb-4 text-[16px] font-medium" style={{ ...serif, color: BODY }}>What happened in your session</p>
          <div className="flex flex-col gap-4">
            {[
              { color: COPPER, head: "Warmth and cool contrast", desc: "Alternating temperatures encouraged your muscles to release tension and helped move out the soreness from your lower back." },
              { color: "#378ADD", head: "Light support", desc: "Gentle red and blue light worked at different depths — supporting circulation and helping your surface tissue calm down." },
              { color: "#7F77DD", head: "Gentle vibration", desc: "Low-frequency pulses helped your nervous system reset, easing the guarding your muscles had built up over time." },
            ].map((m, i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-1 h-10 w-1.5 shrink-0 rounded-full" style={{ background: m.color }} />
                <div>
                  <p className="text-[13px] font-medium" style={{ color: BODY }}>{m.head}</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed" style={{ color: MUTED }}>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div
            className="mt-4 rounded-lg border-l-2 py-3 pl-4 pr-3 text-[13px] italic leading-relaxed"
            style={{ background: "#F9FAFB", borderColor: "#C69E83", color: "#6B7280", fontFamily: '"DM Serif Display", Georgia, serif' }}
          >
            &ldquo;Your body did the work. The device gave it the right conditions.&rdquo;
          </div>
        </div>

        {/* Body map */}
        <div className={card} style={fade(4)}>
          <p className="mb-4 text-[16px] font-medium" style={{ ...serif, color: BODY }}>Where we focused today</p>
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
                { color: "#534AB7", label: "Nervous system", sub: "whole body reset" },
              ].map((z) => (
                <div key={z.label} className="mb-2 flex items-center gap-2">
                  <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: z.color }} />
                  <span className="text-[12px]" style={{ color: MUTED }}>
                    <strong className="font-medium" style={{ color: BODY }}>{z.label}</strong> — {z.sub}
                  </span>
                </div>
              ))}
              <div className="mt-3 rounded-lg bg-[#F9FAFB] p-3" style={{ border: "1px solid #F3F4F6" }}>
                <p className="mb-1 text-[10px] uppercase tracking-wider" style={{ color: LABEL }}>Protocol used</p>
                <p className="text-[13px] font-medium" style={{ color: BODY }}>HydraFlush · 9 min</p>
                <p className="mt-0.5 text-[11px]" style={{ color: MUTED }}>Dr. Elena Ruiz</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SoNa AI chat */}
      <div className="relative mb-4" style={fade(5)}>
        <SoNaChat />
      </div>

      {/* Check-in */}
      <div className="mb-4" style={fade(6)}>
        <CheckInForm />
      </div>

      {/* Next session */}
      <div className={`${card} flex items-center gap-4`} style={fade(7)}>
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border"
          style={{ background: COPPER_LIGHT, borderColor: COPPER_BORDER }}
        >
          <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            <circle cx={10} cy={10} r={8} stroke={COPPER} strokeWidth={1.2} />
            <path d="M10 6v4l2.5 2.5" stroke={COPPER} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-medium" style={{ color: BODY }}>Book your next session</p>
          <p className="mt-0.5 text-[11px]" style={{ color: MUTED }}>Recommended within 3–5 days · HydraFlush</p>
        </div>
        <button
          className="rounded-lg px-4 py-2 text-[12px] font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: COPPER }}
        >
          Book now
        </button>
      </div>
    </div>
  )
}
