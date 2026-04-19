"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"

/* ─── tiny helpers ─────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

/* ─── counter animation ────────────────────────────────────── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const { ref, visible } = useInView()
  useEffect(() => {
    if (!visible) return
    let start = 0
    const step = Math.ceil(to / 60)
    const id = setInterval(() => {
      start = Math.min(start + step, to)
      setVal(start)
      if (start >= to) clearInterval(id)
    }, 16)
    return () => clearInterval(id)
  }, [visible, to])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

/* ─── ROI calculator ───────────────────────────────────────── */
function RoiCalc() {
  const [devices, setDevices] = useState(1)
  const [clients, setClients] = useState(6)
  const [days, setDays] = useState(22)
  const [price, setPrice] = useState(30)
  const revenue = devices * clients * days * price * 12
  return (
    <div>
      <div className="grid gap-8 sm:grid-cols-2">
        {[
          { label: "Devices", value: devices, set: setDevices, min: 1, max: 10 },
          { label: "Clients / Day", value: clients, set: setClients, min: 1, max: 30 },
          { label: "Days Open / Mo", value: days, set: setDays, min: 1, max: 31 },
          { label: "Price Per Session ($)", value: price, set: setPrice, min: 10, max: 200 },
        ].map((f) => (
          <div key={f.label} className="border-b border-white/[0.07] pb-6">
            <div className="mb-3 flex justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">{f.label}</span>
              <span className="text-[11px] font-bold tabular-nums text-white">{f.value}</span>
            </div>
            <input
              type="range" min={f.min} max={f.max} value={f.value}
              onChange={(e) => f.set(Number(e.target.value))}
              className="roi-range w-full cursor-pointer"
            />
          </div>
        ))}
      </div>
      <div className="mt-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/30">Est. Annual Revenue</p>
        <p
          className="mt-3 font-bold leading-none tracking-tight text-white"
          style={{ fontSize: "clamp(48px, 7vw, 76px)" }}
        >
          ${revenue.toLocaleString()}
        </p>
        <p className="mt-3 text-[11px] text-white/20">Illustrative estimate · actual results vary</p>
      </div>
    </div>
  )
}

/* ─── section fade wrapper ─────────────────────────────────── */
function Fade({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(22px)",
        transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#09141C] font-sans text-white overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#09141C]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[52px] max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[#C97A56]" aria-hidden />
            <span className="text-[13px] font-bold tracking-tight text-white">RecoveryOS</span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            {["Products", "Technology", "Resources"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="text-[12px] tracking-wide text-white/40 transition-colors hover:text-white"
              >
                {l}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/client"
              className="hidden text-[12px] text-white/35 transition-colors hover:text-white/70 md:block"
            >
              Client Portal
            </Link>
            <span className="hidden h-3 w-px bg-white/[0.12] md:block" aria-hidden />
            <Link
              href="/login"
              className="hidden text-[12px] text-white/40 transition-colors hover:text-white md:block"
            >
              Practitioner Login
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex h-8 items-center rounded-full bg-[#C97A56] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#B86A48]"
            >
              Get Access
            </Link>
            <button
              className="flex flex-col items-center justify-center gap-[5px] md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span className={`block h-px w-5 bg-white transition-all origin-center ${menuOpen ? "translate-y-[6px] rotate-45" : ""}`} />
              <span className={`block h-px w-5 bg-white transition-all ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-px w-5 bg-white transition-all origin-center ${menuOpen ? "-translate-y-[6px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-white/[0.06] bg-[#09141C] px-6 py-5 md:hidden">
            {["Products", "Technology", "Resources"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="block py-2.5 text-[14px] text-white/60"
                onClick={() => setMenuOpen(false)}
              >{l}</a>
            ))}
            <div className="mt-4 flex flex-col gap-2">
              <Link href="/sign-up" className="rounded-full bg-[#C97A56] py-2.5 text-center text-[13px] font-semibold text-white">Practitioner Portal</Link>
              <Link href="/client" className="rounded-full border border-white/10 py-2.5 text-center text-[13px] font-medium text-white/70">Client Portal</Link>
              <Link href="/login" className="py-2 text-center text-[12px] text-white/35">Already have an account? Log in</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen overflow-hidden pt-[52px]">
        {/* Single deliberate ambient light — top-right corner only */}
        <div
          className="pointer-events-none absolute right-0 top-0 h-[70vh] w-[55vw]"
          aria-hidden
          style={{ background: "radial-gradient(ellipse at top right, rgba(201,122,86,0.10) 0%, transparent 65%)" }}
        />

        <div className="relative mx-auto max-w-7xl px-6">

          {/* Eyebrow strip */}
          <div
            className="flex items-center justify-between border-b border-white/[0.07] pb-5 pt-16"
            style={{ animation: "lp-fadein 1s ease both" }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/30">
              Built for Clinics · Sports Rehab · Performance
            </p>
            <p className="hidden text-[11px] tabular-nums text-white/[0.12] md:block" aria-hidden>001</p>
          </div>

          {/* Display heading */}
          <div className="relative pt-10 lg:grid lg:grid-cols-[1fr_280px] lg:items-start lg:gap-0">
            <div>
              <h1
                className="font-bold leading-[0.92] tracking-tight text-white"
                style={{
                  fontSize: "clamp(60px, 11vw, 144px)",
                  animation: "lp-slideup 1s cubic-bezier(0.16,1,0.3,1) 0.1s both",
                }}
              >
                Unlock your<br />mobility
              </h1>

              {/* Contrasting italic line */}
              <div
                className="mt-5 flex items-center gap-5"
                style={{ animation: "lp-slideup 1s cubic-bezier(0.16,1,0.3,1) 0.2s both" }}
              >
                <span className="h-px w-10 shrink-0 bg-[#C97A56]" aria-hidden />
                <span
                  className="text-[#C97A56]"
                  style={{
                    fontSize: "clamp(24px, 3.8vw, 48px)",
                    fontFamily: '"Georgia", "Times New Roman", serif',
                    fontStyle: "italic",
                    fontWeight: 400,
                    lineHeight: 1,
                  }}
                >
                  within minutes
                </span>
              </div>
            </div>

            {/* Decorative number — desktop only, art element */}
            <div
              className="hidden select-none flex-col items-end justify-start pt-3 lg:flex"
              aria-hidden
              style={{ animation: "lp-fadein 1.4s ease 0.5s both" }}
            >
              <span className="text-[11px] uppercase tracking-[0.22em] text-white/[0.15]">avg. session</span>
              <span
                className="font-bold leading-none tabular-nums text-white/[0.04]"
                style={{ fontSize: "124px" }}
              >
                10
              </span>
              <span className="text-[11px] uppercase tracking-[0.22em] text-white/[0.15]">minutes</span>
            </div>
          </div>

          {/* Description, CTAs, pills */}
          <div
            className="mt-14 grid gap-12 pb-24 lg:grid-cols-[1fr_auto] lg:gap-20"
            style={{ animation: "lp-slideup 1s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}
          >
            <div className="max-w-[520px]">
              <p className="text-[17px] leading-relaxed text-white/45">
                An affordable, professional, hands-off tool that works instantly. Practitioners trust RecoveryOS
                because it delivers measurable mobility improvements — without downtime or complicated setup.
              </p>
              {/* Portal split CTAs */}
              <div className="mt-8 space-y-3">
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/sign-up"
                    className="group inline-flex h-11 items-center gap-2.5 rounded-full bg-[#C97A56] px-6 text-[13px] font-semibold text-white transition-all hover:bg-[#B86A48] hover:shadow-[0_0_40px_rgba(201,122,86,0.4)]"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-[10px]">⚕</span>
                    Practitioner Portal
                    <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </Link>
                  <Link
                    href="/client"
                    className="group inline-flex h-11 items-center gap-2.5 rounded-full border border-white/[0.14] bg-white/[0.04] px-6 text-[13px] font-medium text-white/70 transition-all hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px]">✦</span>
                    Client Portal
                    <svg className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </Link>
                </div>
                {/* Schedule demo — understated, editorial */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="h-px w-8 bg-white/[0.12]" aria-hidden />
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center gap-2 text-[11.5px] text-white/30 transition-colors hover:text-white/60"
                  >
                    <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}><rect x={1} y={2} width={14} height={13} rx={2}/><path d="M1 6h14M5 1v2M11 1v2"/></svg>
                    Schedule a product demo
                  </Link>
                  <span className="h-px w-8 bg-white/[0.12]" aria-hidden />
                </div>
              </div>
            </div>

            {/* Attribute tags — staggered, intentionally off-axis */}
            <div className="flex flex-wrap items-start content-start gap-2 lg:max-w-[200px] lg:flex-col lg:items-end">
              {["Under 10 Mins", "Pre/Post Recovery", "Measurable", "Portable", "3 Modes in 1", "Advanced Contrast"].map((tag, i) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/[0.08] px-3.5 py-1.5 text-[11px] tracking-wide text-white/30"
                  style={{ marginRight: i % 2 !== 0 ? "12px" : "0" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator — bottom-left, subtle */}
        <div
          className="absolute bottom-8 left-6 hidden items-center gap-3 text-white/20 lg:flex"
          style={{ animation: "lp-fadein 2s ease 1s both" }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em]">Scroll</span>
          <span className="h-px w-10 bg-white/[0.12]" aria-hidden />
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-white/[0.06] bg-[#0B1A24]">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 divide-x divide-white/[0.06] md:grid-cols-4">
            {[
              { n: 10, suffix: " min", label: "Average session" },
              { n: 42, suffix: " spots", label: "Founding Clinics left" },
              { n: 3, suffix: " modes", label: "In one device" },
              { n: 98, suffix: "%", label: "Practitioner satisfaction" },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`px-8 py-12 ${i >= 2 ? "border-t border-white/[0.06] md:border-t-0" : ""}`}
              >
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/25">{s.label}</p>
                <p
                  className="font-bold leading-none tracking-tight text-white"
                  style={{ fontSize: "clamp(38px, 4.5vw, 58px)" }}
                >
                  <Counter to={s.n} suffix={s.suffix} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For Professionals ── */}
      <section id="products" className="relative py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-6">

          <Fade>
            <div className="mb-16 flex flex-col gap-6 border-b border-white/[0.07] pb-10 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C97A56]">
                  Built for professionals who demand more
                </p>
                <h2
                  className="mt-4 font-bold leading-[1.0] tracking-tight text-white"
                  style={{ fontSize: "clamp(30px, 4.8vw, 58px)" }}
                >
                  Whether you&apos;re solo<br />or multi-location
                </h2>
              </div>
              <p className="max-w-[280px] text-[14px] leading-relaxed text-white/30 lg:text-right">
                RecoveryOS scales with Enterprise-level support for practices of every size.
              </p>
            </div>
          </Fade>

          {/* Numbered editorial list */}
          <div>
            {[
              {
                num: "01",
                title: "Physical Therapists & Chiropractors",
                sub: "Clinics navigating low reimbursement, limited time, and practitioner burnout",
                bullets: ["Reduced prep time", "Hands-off support", "Cash-based add-on", "No insurance complexity"],
              },
              {
                num: "02",
                title: "Sports Performance",
                sub: "Athletes and trainers demanding measurable, repeatable results",
                bullets: ["Pre-session warm-up", "Post-session recovery", "Bilateral protocols", "Portable anywhere"],
              },
              {
                num: "03",
                title: "Wellness & Recovery Spas",
                sub: "Destination resorts and wellness suites seeking premium offerings",
                bullets: ["Immersive multi-station", "Elevated client experience", "High-volume capable", "Minimal staff training"],
              },
            ].map((c, i) => (
              <Fade key={c.title} delay={i * 70}>
                <div className="group grid cursor-default items-start gap-6 border-b border-white/[0.07] py-9 transition-colors duration-300 hover:border-white/[0.14] lg:grid-cols-[52px_1.5fr_1fr]">
                  <span className="pt-1.5 text-[11px] font-semibold text-white/[0.18]" aria-hidden>{c.num}</span>
                  <div>
                    <h3
                      className="font-semibold leading-tight text-white transition-colors duration-300 group-hover:text-[#C97A56]"
                      style={{ fontSize: "clamp(18px, 2vw, 24px)" }}
                    >
                      {c.title}
                    </h3>
                    <p className="mt-2.5 max-w-md text-[13.5px] leading-relaxed text-white/35">{c.sub}</p>
                  </div>
                  <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                    {c.bullets.map((b) => (
                      <span
                        key={b}
                        className="rounded-full border border-white/[0.09] px-3.5 py-1.5 text-[11.5px] text-white/40 transition-colors duration-300 group-hover:border-white/[0.16]"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ── Technology ── */}
      <section id="technology" className="bg-[#0B1A24] py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-16 lg:grid-cols-[1fr_1.15fr] lg:gap-20">

            {/* Sticky left: heading + outcomes */}
            <Fade>
              <div className="lg:sticky lg:top-24 lg:self-start">
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C97A56]">Our Technology</p>
                <h2
                  className="mt-5 font-bold leading-[0.93] tracking-tight text-white"
                  style={{ fontSize: "clamp(34px, 5.5vw, 70px)" }}
                >
                  Polar Water<br />Resonance™
                </h2>
                <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-white/40">
                  Precisely timed thermal contrast and gentle rhythmic stimulation to support fluid movement and reduce neuromuscular guarding.
                </p>

                <div className="mt-10 space-y-5 border-t border-white/[0.07] pt-10">
                  {[
                    "Looser, less restricted movement",
                    "A lighter, freer feeling in the body",
                    "Improved balance and coordination",
                    "A calm, reset nervous system",
                  ].map((f) => (
                    <div key={f} className="flex items-start gap-4">
                      <span className="mt-[6px] h-px w-5 shrink-0 bg-[#C97A56]" aria-hidden />
                      <p className="text-[13.5px] leading-relaxed text-white/45">{f}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Fade>

            {/* Right: modality stack — border-left divider */}
            <div className="border-white/[0.07] lg:border-l">
              {[
                {
                  badge: "Thermal Modulation",
                  tag: "Dry Heat + Mild Cryo",
                  desc: "Supports circulation dynamics, tissue elasticity, and recovery readiness through controlled temperature contrast.",
                  num: "01",
                },
                {
                  badge: "Photobiomodulation",
                  tag: "RED & BLUE LIGHT",
                  desc: "Targets surface and sub-surface tissues to support cellular function and tissue quality.",
                  num: "02",
                },
                {
                  badge: "Resonance Stimulation",
                  tag: "Rhythmic Mechanical",
                  desc: "Applies gentle, rhythmic stimulation to encourage fluid movement and restore natural movement patterns.",
                  num: "03",
                },
              ].map((m, i) => (
                <Fade key={m.badge} delay={i * 90}>
                  <div className="border-b border-white/[0.07] px-0 py-10 last:border-b-0 lg:px-10">
                    <div className="flex items-start justify-between">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C97A56]">{m.badge}</p>
                      <span className="text-[11px] text-white/[0.15]" aria-hidden>{m.num}</span>
                    </div>
                    <p className="mt-1.5 text-[10px] uppercase tracking-[0.22em] text-white/25">{m.tag}</p>
                    <p className="mt-5 text-[14px] leading-relaxed text-white/45">{m.desc}</p>
                  </div>
                </Fade>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="relative py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-6">
          <Fade>
            <div className="mb-16 border-b border-white/[0.07] pb-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C97A56]">Choose your system</p>
              <h2
                className="mt-4 font-bold leading-[1.0] tracking-tight text-white"
                style={{ fontSize: "clamp(30px, 4.8vw, 58px)" }}
              >
                Scalable solutions<br />for every practice
              </h2>
            </div>
          </Fade>

          <div className="grid border border-white/[0.08] lg:grid-cols-3">
            {[
              {
                name: "Pro",
                sub: "Small-Scale Operations",
                for: "Individual practitioners, pilot programs, and early adopters",
                features: ["1 RecoveryOS™ unit", "1 basic app license", "1-year warranty", "Standard support"],
                cta: "Get started",
                popular: false,
              },
              {
                name: "Duo",
                sub: "Maximize Results",
                for: "Growing practices, higher client throughput, nurse practices",
                features: ["2 integrated units", "Priority support", "Business-in-a-Box setup", "Bilateral sessions"],
                cta: "Most popular",
                popular: true,
              },
              {
                name: "Studio",
                sub: "Build Your Recovery Room",
                for: "Recovery suites, wellness spas, and destination resorts",
                features: ["3 RecoveryOS™ units", "Dedicated account manager", "Enterprise-level training", "Multi-station design"],
                cta: "Contact sales",
                popular: false,
              },
            ].map((plan, i) => (
              <Fade key={plan.name} delay={i * 70}>
                <div
                  className={`relative flex h-full flex-col p-10 ${
                    i < 2
                      ? "border-b border-white/[0.08] lg:border-b-0 lg:border-r lg:border-white/[0.08]"
                      : ""
                  } ${plan.popular ? "bg-[#C97A56]/[0.055]" : ""}`}
                >
                  {plan.popular && (
                    <span className="mb-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#C97A56] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                      <span className="h-[3px] w-[3px] rounded-full bg-white/70" aria-hidden />
                      Most Popular
                    </span>
                  )}
                  <h3
                    className="font-bold leading-none tracking-tight text-white"
                    style={{ fontSize: "clamp(36px, 3.5vw, 48px)" }}
                  >
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C97A56]">{plan.sub}</p>
                  <p className="mt-5 text-[13px] leading-relaxed text-white/30">{plan.for}</p>
                  <ul className="mt-8 flex-1 space-y-4">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-3.5 text-[13px] text-white/55">
                        <span className="h-px w-4 shrink-0 bg-[#C97A56]" aria-hidden />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/sign-up"
                    className={`mt-10 inline-flex h-11 w-full items-center justify-center rounded-full text-[13px] font-semibold transition-all ${
                      plan.popular
                        ? "bg-[#C97A56] text-white hover:bg-[#B86A48]"
                        : "border border-white/[0.12] text-white/55 hover:border-white/25 hover:text-white"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ── Founding Clinics ── */}
      <section className="relative overflow-hidden bg-[#0B1A24] py-28 lg:py-36">
        {/* "42" as massive typographic art element */}
        <div
          className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 select-none overflow-hidden"
          aria-hidden
        >
          <span
            className="block font-bold leading-none tabular-nums text-white/[0.028]"
            style={{ fontSize: "clamp(180px, 28vw, 400px)" }}
          >
            42
          </span>
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <Fade>
            <div className="max-w-xl">
              <div className="mb-6 flex items-center gap-3">
                <span className="h-[5px] w-[5px] animate-pulse rounded-full bg-[#C97A56]" aria-hidden />
                <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C97A56]">
                  42 spots remaining · Updating in real-time
                </span>
              </div>
              <h2
                className="font-bold leading-[0.93] tracking-tight text-white"
                style={{ fontSize: "clamp(36px, 6vw, 72px)" }}
              >
                Founding Clinics<br />Program
              </h2>
              <p className="mt-6 text-[16px] leading-relaxed text-white/40">
                Join a select group of forward-thinking clinics shaping the future of professional recovery.
              </p>
            </div>
          </Fade>

          <Fade delay={100} className="mt-14">
            <div className="grid border-t border-white/[0.07] sm:grid-cols-2">
              {[
                { v: "$300", label: "3 months free AI app access" },
                { v: "$250", label: "Additional 1-year warranty" },
                { v: "$99", label: "Upper Body Band Accessory" },
                { v: "Free", label: "Priority Delivery & Support" },
                { v: "✓", label: "Business Toolkit included" },
                { v: "✓", label: "Featured Locator Placement" },
              ].map((b, i) => (
                <div
                  key={b.label}
                  className={`flex items-center gap-5 border-b border-white/[0.07] py-5 ${
                    i % 2 === 0
                      ? "sm:border-r sm:border-white/[0.07] sm:pr-10"
                      : "sm:pl-10"
                  }`}
                >
                  <span className="w-12 shrink-0 text-[14px] font-bold tabular-nums text-[#C97A56]">{b.v}</span>
                  <span className="text-[13.5px] text-white/50">{b.label}</span>
                </div>
              ))}
            </div>
          </Fade>

          <Fade delay={180} className="mt-12">
            <Link
              href="/sign-up"
              className="inline-flex h-12 items-center gap-2.5 rounded-full bg-[#C97A56] px-8 text-[13.5px] font-semibold text-white transition-all hover:bg-[#B86A48] hover:shadow-[0_0_40px_rgba(201,122,86,0.4)]"
            >
              Claim Your Founding Clinic Spot
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <p className="mt-4 text-[11px] text-white/[0.22]">Offer ends after the sale of first 50 units.</p>
          </Fade>
        </div>
      </section>

      {/* ── ROI ── */}
      <section id="resources" className="relative py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">

            <Fade>
              <div className="lg:sticky lg:top-24 lg:self-start">
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C97A56]">Revenue</p>
                <h2
                  className="mt-5 font-bold leading-[0.95] tracking-tight text-white"
                  style={{ fontSize: "clamp(30px, 4.8vw, 58px)" }}
                >
                  A simple, scalable<br />revenue opportunity
                </h2>
                <p className="mt-5 text-[15px] leading-relaxed text-white/38">
                  Estimate your clinic&apos;s potential without increasing appointment length or staffing.
                </p>
              </div>
            </Fade>

            <Fade delay={120}>
              <RoiCalc />
            </Fade>
          </div>
        </div>
      </section>

      {/* ── CTA strip ── */}
      <section className="relative overflow-hidden bg-[#0B1A24] py-28 lg:py-44">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{ background: "radial-gradient(ellipse 80% 70% at 40% 50%, rgba(201,122,86,0.08) 0%, transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-7xl px-6">
          <Fade>
            <h2
              className="font-bold leading-[0.9] tracking-tight text-white"
              style={{ fontSize: "clamp(52px, 10vw, 128px)" }}
            >
              Ready to transform<br />
              <em
                className="text-[#C97A56]"
                style={{
                  fontFamily: '"Georgia", "Times New Roman", serif',
                  fontStyle: "italic",
                  fontWeight: 400,
                }}
              >
                your practice?
              </em>
            </h2>
            <p className="mt-8 max-w-sm text-[16px] leading-relaxed text-white/38">
              Join the future of professional recovery. Set up in under a minute.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/sign-up"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-[#C97A56] px-8 text-[14px] font-semibold text-white transition-all hover:bg-[#B86A48] hover:shadow-[0_0_50px_rgba(201,122,86,0.45)]"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center rounded-full border border-white/[0.12] px-8 text-[14px] font-medium text-white/50 transition-all hover:border-white/25 hover:text-white"
              >
                Sign In
              </Link>
            </div>
          </Fade>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="h-[5px] w-[5px] rounded-full bg-[#C97A56]" aria-hidden />
                <span className="text-[13px] font-bold tracking-tight text-white">RecoveryOS</span>
              </div>
              <p className="mt-4 max-w-[220px] text-[12px] leading-relaxed text-white/28">
                Advanced recovery technology for high-performance clinics. Ancient science rooted in modern innovation.
              </p>
              <p className="mt-3 text-[11px] text-white/[0.14]">
                Not a medical device. Results may vary. Intended for wellness and recovery purposes only.
              </p>
            </div>
            <div>
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/[0.22]">Product</p>
              {["Features", "Science", "Founders Program"].map((l) => (
                <Link key={l} href="/sign-up" className="block py-1.5 text-[13px] text-white/35 transition-colors hover:text-white">{l}</Link>
              ))}
            </div>
            <div>
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/[0.22]">Support</p>
              {["Contact Us", "Pricing", "Help Center"].map((l) => (
                <Link key={l} href="/sign-up" className="block py-1.5 text-[13px] text-white/35 transition-colors hover:text-white">{l}</Link>
              ))}
            </div>
            <div>
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/[0.22]">Access</p>
              <Link href="/login" className="block py-1.5 text-[13px] text-white/35 transition-colors hover:text-white">Log in</Link>
              <Link href="/sign-up" className="block py-1.5 text-[13px] text-white/35 transition-colors hover:text-white">Create account</Link>
              <Link href="/dashboard" className="block py-1.5 text-[13px] text-white/35 transition-colors hover:text-white">App dashboard</Link>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/[0.05] pt-8 text-[11px] text-white/[0.18] sm:flex-row sm:items-center">
            <p>© 2026 RecoveryOS. All rights reserved.</p>
            <p>Terms &amp; Conditions · Privacy Policy</p>
          </div>
        </div>
      </footer>

      {/* ── Global styles ── */}
      <style>{`
        @keyframes lp-fadein {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes lp-slideup {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Minimal custom range — no browser chrome */
        .roi-range {
          -webkit-appearance: none;
          appearance: none;
          height: 1px;
          background: rgba(255,255,255,0.10);
          outline: none;
          border: none;
        }
        .roi-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #C97A56;
          cursor: pointer;
          border: 2px solid #09141C;
          box-shadow: 0 0 0 1px #C97A56;
          transition: transform 0.15s ease;
        }
        .roi-range::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        .roi-range::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #C97A56;
          cursor: pointer;
          border: 2px solid #09141C;
        }
      `}</style>
    </div>
  )
}
