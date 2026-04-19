import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Flame,
  Gauge,
  HeartPulse,
  Layers,
  LineChart,
  Lightbulb,
  Mail,
  MonitorSmartphone,
  Package,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Target,
  Users,
  Waves,
  Zap,
} from "lucide-react"
import { LandingNav } from "@/components/landing/landing-nav"
import { LandingFooter } from "@/components/landing/landing-footer"

const heroStats = [
  { label: "Under 10 min", icon: Clock },
  { label: "Pre / Post recovery", icon: HeartPulse },
  { label: "Measurable", icon: LineChart },
  { label: "Portable", icon: Package },
  { label: "3 modes in 1", icon: Layers },
  { label: "Advanced contrast", icon: Flame },
]

const audiences = [
  {
    tag: "Physical therapists & chiropractors",
    title: "For clinics navigating low reimbursement and limited time.",
    body: "Expand your treatment offerings with hands-off recovery sessions that deliver measurable results in under 10 minutes.",
    delivers: [
      "Reduced prep time — clients arrive calmer and ready to move",
      "Hands-off support — less physical strain on clinicians",
      "Better session efficiency — more productive time per appointment",
      "Cash-based recovery add-on — no insurance complexity",
    ],
  },
  {
    tag: "Sports rehab & performance",
    title: "For teams that need reproducible, quantifiable recovery.",
    body: "Prep athletes faster, track range of motion and symmetry every session, and build long-term recovery stories with data.",
    delivers: [
      "Baseline & reassess with a consistent protocol",
      "Session-level insights inside minutes, not days",
      "Shared chart between athletic trainers and clinicians",
      "Works between sets, between sessions, between games",
    ],
  },
]

const testimonials = [
  {
    quote:
      "It's the first recovery tool that actually fits between appointments. Clients ask for it by name by the second visit.",
    name: "Dr. Jennifer Burns",
    role: "Burns Integrative Wellness Center · Phoenix, AZ",
  },
  {
    quote:
      "The measurable range-of-motion changes mid-session are what convinced our physical therapy team to adopt it across the clinic.",
    name: "Dr. Joe",
    role: "PT, Spooner Physical Therapy · Phoenix, AZ",
  },
  {
    quote:
      "Completely hands-off, predictable, and reproducible. It lets me run more productive sessions without burning out.",
    name: "Nurse Practitioner",
    role: "Independent Practice · Phoenix, AZ",
  },
]

const tiers = [
  {
    name: "Pro",
    subtitle: "Small-scale operations",
    best: "Individual professionals, pilots, early adopters",
    points: [
      "1 recovery unit",
      "1 basic app license",
      "1-year warranty",
      "Standard support",
    ],
    footnote: "Ideal for introducing recovery into an existing wellness or movement practice.",
    highlight: false,
  },
  {
    name: "Duo",
    subtitle: "Maximize results",
    best: "Growing practices, higher throughput, athletic trainers",
    points: [
      "2 integrated units",
      "Full app + multi-device coordination",
      "Priority support",
      "Business-in-a-Box setup",
    ],
    footnote: "Enables bilateral or multi-area sessions within a single appointment.",
    highlight: true,
  },
  {
    name: "Studio",
    subtitle: "Build your recovery room",
    best: "Recovery suites, wellness spas, destination resorts",
    points: [
      "3 recovery units",
      "Dedicated account manager",
      "Enterprise-level training",
      "Advanced reporting & exports",
    ],
    footnote: "Built for high-volume use and elevated client experiences.",
    highlight: false,
  },
]

const foundingBenefits = [
  {
    icon: Sparkles,
    title: "3 months complimentary AI app access",
    note: "$300 value",
  },
  {
    icon: ShieldCheck,
    title: "Additional 1-year warranty",
    note: "$250 value",
  },
  {
    icon: Package,
    title: "Upper-body band accessory included",
    note: "$99 value",
  },
  {
    icon: Zap,
    title: "Priority delivery & dedicated onboarding",
    note: "Direct success partner",
  },
  {
    icon: Lightbulb,
    title: "Business toolkit & marketing resources",
    note: "Bundled to accelerate growth",
  },
  {
    icon: Target,
    title: "Featured locator placement",
    note: "Drive referrals from patient directory",
  },
]

const modalities = [
  {
    icon: Flame,
    title: "Thermal modulation",
    subtitle: "Dry heat + mild cryo",
    body: "Supports circulation dynamics, tissue elasticity, and recovery readiness through controlled temperature contrast.",
  },
  {
    icon: Lightbulb,
    title: "Photobiomodulation",
    subtitle: "Red & blue light",
    body: "Targets surface and sub-surface tissues to support cellular function and tissue quality.",
  },
  {
    icon: Waves,
    title: "Resonance stimulation",
    subtitle: "Rhythmic mechanical",
    body: "Gentle, rhythmic stimulation encourages fluid movement, reduces guarding, and restores natural movement patterns.",
  },
]

const platformFeatures = [
  {
    icon: Zap,
    title: "Rapid session orchestration",
    body: "Launch, adjust, and optimize sessions in seconds. Fits real clinic workflows with virtually no learning curve.",
  },
  {
    icon: Target,
    title: "Protocol intelligence built in",
    body: "Structured, evidence-informed protocols guide session setup for warm-up, recovery, and mobility — with full professional override.",
  },
  {
    icon: Sparkles,
    title: "Adaptive session personalization",
    body: "Tailor sessions dynamically by body region, intensity, and duration — both localized and coordinated full-body recovery.",
  },
  {
    icon: MonitorSmartphone,
    title: "Multi-device coordination",
    body: "Monitor, manage, and synchronize multiple units from a single dashboard — built for high-throughput clinics and performance teams.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F1E28] text-white">
      <LandingNav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full bg-[#C97A56]/18 blur-[160px]" />
          <div className="absolute bottom-[-220px] right-[-120px] h-[520px] w-[520px] rounded-full bg-[#C97A56]/10 blur-[160px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.04),transparent_55%),radial-gradient(circle_at_85%_85%,rgba(201,122,86,0.1),transparent_55%)]" />
        </div>

        <div className="relative mx-auto w-full max-w-[1240px] px-5 pt-10 pb-16 md:px-8 md:pt-16 md:pb-24 lg:pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_1fr] lg:gap-14">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75">
                <span className="h-1.5 w-1.5 rounded-full bg-[#27AE60]" />
                Built for clinics · Sports rehab · Performance
              </div>

              <h1 className="mt-5 text-balance text-[42px] font-semibold leading-[1.04] tracking-tight sm:text-[52px] lg:text-[60px]">
                Unlock mobility in{" "}
                <span className="text-[#C97A56]">minutes,</span>{" "}
                not months.
              </h1>

              <p className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-white/65 sm:text-[16px]">
                RecoveryOS is the affordable, hands-off recovery platform professionals trust to
                deliver measurable mobility improvements — before, between, or after sessions.
                No downtime. No complicated setup. Just repeatable results.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className="group inline-flex h-12 items-center gap-2 rounded-[12px] bg-[#C97A56] px-5 text-[14px] font-semibold text-white shadow-[0_12px_32px_-12px_rgba(201,122,86,0.8)] transition-colors hover:bg-[#B86A48]"
                >
                  Sign in to workspace
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="#contact"
                  className="inline-flex h-12 items-center gap-2 rounded-[12px] border border-white/15 bg-white/[0.03] px-5 text-[14px] font-medium text-white/85 transition-colors hover:bg-white/[0.07]"
                >
                  Schedule a demo
                </Link>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
                {heroStats.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-2.5 text-[12.5px] text-white/70"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-white/[0.04] ring-1 ring-white/10">
                      <s.icon className="h-3.5 w-3.5 text-[#C97A56]" />
                    </span>
                    {s.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-6 rounded-[28px] bg-gradient-to-br from-[#C97A56]/25 via-transparent to-transparent blur-3xl"
              />
              <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-[#0B1820] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.7)]">
                <Image
                  src="/landing/hero-device.jpg"
                  alt="RecoveryOS device on a studio backdrop"
                  width={880}
                  height={720}
                  priority
                  className="h-auto w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0B1820] to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3 rounded-[12px] border border-white/10 bg-[#0F1E28]/80 p-3 backdrop-blur-md">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#27AE60]/70" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#27AE60]" />
                    </span>
                    <div>
                      <div className="text-[11.5px] font-semibold text-white">
                        Session in progress · Room 2
                      </div>
                      <div className="text-[10.5px] text-white/50">Protocol H3-Beta · 18 min</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11.5px] font-semibold text-[#C97A56]">+9 pts</div>
                    <div className="text-[10.5px] text-white/50">Recovery score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED STRIP */}
      <section className="border-y border-white/[0.06] bg-[#0B1820]/60">
        <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center justify-between gap-6 px-5 py-6 md:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
            Trusted by professionals across
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[12.5px] font-medium text-white/55">
            <span className="flex items-center gap-2">
              <Stethoscope className="h-3.5 w-3.5 text-[#C97A56]" />
              Physical therapy
            </span>
            <span className="flex items-center gap-2">
              <HeartPulse className="h-3.5 w-3.5 text-[#C97A56]" />
              Chiropractic
            </span>
            <span className="flex items-center gap-2">
              <Gauge className="h-3.5 w-3.5 text-[#C97A56]" />
              Sports performance
            </span>
            <span className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-[#C97A56]" />
              Wellness & recovery
            </span>
          </div>
        </div>
      </section>

      {/* AUDIENCES */}
      <section id="platform" className="mx-auto w-full max-w-[1240px] px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C97A56]">
            Built for professionals who demand more
          </p>
          <h2 className="mt-3 text-balance text-[32px] font-semibold leading-[1.1] tracking-tight sm:text-[40px]">
            One platform. Every corner of modern recovery.
          </h2>
          <p className="mt-4 text-pretty text-[14.5px] leading-relaxed text-white/60">
            Whether you&apos;re a solo professional or running a multi-location facility,
            RecoveryOS scales with enterprise-level support and a workflow clinicians actually
            want to use.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {audiences.map((a) => (
            <article
              key={a.tag}
              className="group relative overflow-hidden rounded-[20px] border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-7 transition-colors hover:border-[#C97A56]/30"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#C97A56]/12 blur-3xl opacity-0 transition-opacity group-hover:opacity-100"
              />
              <div className="relative">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C97A56]/12 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#E09B78]">
                  {a.tag}
                </span>
                <h3 className="mt-4 text-balance text-[22px] font-semibold leading-tight tracking-tight sm:text-[24px]">
                  {a.title}
                </h3>
                <p className="mt-3 text-pretty text-[13.5px] leading-relaxed text-white/60">
                  {a.body}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {a.delivers.map((d) => (
                    <li key={d} className="flex items-start gap-2.5 text-[13px] text-white/75">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C97A56]" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* PLATFORM FEATURES */}
      <section className="relative border-y border-white/[0.06] bg-[#0B1820]">
        <div className="mx-auto w-full max-w-[1240px] px-5 py-20 md:px-8 md:py-28">
          <div className="grid items-start gap-14 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="lg:sticky lg:top-24">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C97A56]">
                Precision control · Adaptive intelligence
              </p>
              <h2 className="mt-3 text-balance text-[32px] font-semibold leading-[1.1] tracking-tight sm:text-[40px]">
                A companion app that thinks alongside you.
              </h2>
              <p className="mt-4 text-pretty text-[14.5px] leading-relaxed text-white/60">
                RecoveryOS combines precision control with adaptive guidance — helping
                professionals deliver consistent, high-quality sessions while reducing
                guesswork in real time.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#C97A56] px-4 text-[13px] font-semibold text-white hover:bg-[#B86A48]"
                >
                  Open the workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#contact"
                  className="inline-flex h-10 items-center rounded-[10px] border border-white/15 bg-white/[0.03] px-4 text-[13px] font-medium text-white/85 hover:bg-white/[0.07]"
                >
                  Book a walkthrough
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {platformFeatures.map((f) => (
                <div
                  key={f.title}
                  className="rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-5 transition-colors hover:border-[#C97A56]/25 hover:bg-white/[0.035]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#C97A56]/15 text-[#C97A56]">
                    <f.icon className="h-4 w-4" />
                  </span>
                  <h3 className="mt-4 text-[15.5px] font-semibold tracking-tight text-white">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-white/60">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SCIENCE */}
      <section id="science" className="mx-auto w-full max-w-[1240px] px-5 py-20 md:px-8 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
          <div className="relative overflow-hidden rounded-[20px] border border-white/[0.06]">
            <Image
              src="/landing/science-water.jpg"
              alt="Abstract water ripples representing fluid dynamics"
              width={900}
              height={720}
              className="h-auto w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0F1E28]/85 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 rounded-[12px] border border-white/10 bg-[#0F1E28]/80 p-4 backdrop-blur-md">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#C97A56]">
                Thermodynamics meets fluid dynamics
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/75">
                Precisely timed thermal contrast and gentle rhythmic stimulation support fluid
                movement and reduce neuromuscular guarding.
              </p>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C97A56]">
              The science
            </p>
            <h2 className="mt-3 text-balance text-[32px] font-semibold leading-[1.1] tracking-tight sm:text-[40px]">
              Polar Water Resonance{" "}
              <span className="text-[#C97A56]">(PWR™)</span> — an advanced evolution of
              contrast therapy.
            </h2>
            <p className="mt-4 text-pretty text-[14.5px] leading-relaxed text-white/60">
              The body moves better when fluid dynamics and neural signaling are supported, not
              forced. RecoveryOS removes interference — so joints move more freely and movement
              quality improves. Usable range-of-motion changes often show up in minutes.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                "Downregulates excessive muscle tone",
                "Improves tissue glide and joint readiness",
                "Supports smoother, more coordinated movement",
                "Calms neuromuscular guarding without force",
              ].map((t) => (
                <div
                  key={t}
                  className="flex items-start gap-2.5 rounded-[12px] border border-white/[0.06] bg-white/[0.02] px-3.5 py-3 text-[13px] text-white/75"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C97A56]" />
                  <span>{t}</span>
                </div>
              ))}
            </div>

            <p className="mt-7 text-[11.5px] leading-relaxed text-white/40">
              RecoveryOS is not a medical device and makes no medical claims. Individual
              results may vary. Our products are intended for wellness and recovery purposes
              only.
            </p>
          </div>
        </div>

        {/* Modalities */}
        <div className="mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C97A56]">
              Three modalities · one integrated system
            </p>
            <h3 className="mt-3 text-balance text-[26px] font-semibold leading-tight tracking-tight sm:text-[32px]">
              Ancient science, rooted in modern technology.
            </h3>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {modalities.map((m) => (
              <div
                key={m.title}
                className="rounded-[16px] border border-white/[0.06] bg-gradient-to-b from-white/[0.035] to-transparent p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#C97A56]/15 text-[#C97A56]">
                  <m.icon className="h-5 w-5" />
                </span>
                <h4 className="mt-5 text-[17px] font-semibold tracking-tight text-white">
                  {m.title}
                </h4>
                <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-white/45">
                  {m.subtitle}
                </p>
                <p className="mt-3 text-[13.5px] leading-relaxed text-white/65">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-y border-white/[0.06] bg-[#0B1820]">
        <div className="mx-auto w-full max-w-[1240px] px-5 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C97A56]">
              What professionals are saying
            </p>
            <h2 className="mt-3 text-balance text-[32px] font-semibold leading-[1.1] tracking-tight sm:text-[38px]">
              Real clinicians. Real results.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className="relative flex h-full flex-col rounded-[16px] border border-white/[0.06] bg-white/[0.02] p-6"
              >
                <Quote className="h-5 w-5 text-[#C97A56]" aria-hidden />
                <blockquote className="mt-4 flex-1 text-[14px] leading-relaxed text-white/80">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-3 border-t border-white/[0.06] pt-5">
                  <div
                    aria-hidden
                    className="h-9 w-9 rounded-full bg-gradient-to-br from-[#C97A56] to-[#8b4a2e] ring-2 ring-white/10"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-white">{t.name}</div>
                    <div className="truncate text-[11.5px] text-white/50">{t.role}</div>
                  </div>
                  <div className="ml-auto flex gap-0.5 text-[#C97A56]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-current" />
                    ))}
                  </div>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section
        id="pricing"
        className="mx-auto w-full max-w-[1240px] px-5 py-20 md:px-8 md:py-28"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C97A56]">
            Choose your system
          </p>
          <h2 className="mt-3 text-balance text-[32px] font-semibold leading-[1.1] tracking-tight sm:text-[40px]">
            Scalable solutions designed for practices of every size.
          </h2>
          <p className="mt-4 text-pretty text-[14.5px] leading-relaxed text-white/60">
            From solo professionals piloting recovery to immersive multi-station rooms —
            every RecoveryOS system includes the full companion platform.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative flex flex-col rounded-[20px] border p-7 ${
                t.highlight
                  ? "border-[#C97A56]/50 bg-gradient-to-b from-[#C97A56]/10 to-transparent shadow-[0_30px_80px_-30px_rgba(201,122,86,0.5)]"
                  : "border-white/[0.06] bg-white/[0.02]"
              }`}
            >
              {t.highlight && (
                <span className="absolute -top-3 left-7 inline-flex items-center gap-1.5 rounded-full bg-[#C97A56] px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_10px_24px_-10px_rgba(201,122,86,0.8)]">
                  <Sparkles className="h-3 w-3" />
                  Most popular
                </span>
              )}
              <div>
                <h3 className="text-[26px] font-semibold tracking-tight text-white">{t.name}</h3>
                <p className="mt-1 text-[13px] font-medium text-[#C97A56]">{t.subtitle}</p>
                <p className="mt-3 text-[12.5px] leading-relaxed text-white/55">
                  Best for: {t.best}
                </p>
              </div>

              <ul className="mt-6 flex-1 space-y-2.5 border-t border-white/[0.06] pt-6">
                {t.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-[13px] text-white/80">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C97A56]" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-[12px] leading-relaxed text-white/50">{t.footnote}</p>

              <Link
                href="#contact"
                className={`mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-[10px] text-[13px] font-semibold transition-colors ${
                  t.highlight
                    ? "bg-[#C97A56] text-white hover:bg-[#B86A48]"
                    : "border border-white/15 bg-white/[0.03] text-white/90 hover:bg-white/[0.07]"
                }`}
              >
                Request pricing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FOUNDING PROGRAM */}
      <section id="founding" className="relative overflow-hidden border-y border-white/[0.06] bg-[#0B1820]">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[#C97A56]/10 blur-[160px]" />
        </div>
        <div className="relative mx-auto w-full max-w-[1240px] px-5 py-20 md:px-8 md:py-28">
          <div className="grid items-start gap-12 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#C97A56]/40 bg-[#C97A56]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E09B78]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C97A56]" />
                Limited cohort · 42 spots remaining
              </div>
              <h2 className="mt-5 text-balance text-[32px] font-semibold leading-[1.1] tracking-tight sm:text-[40px]">
                Founding Clinics Program
              </h2>
              <p className="mt-4 text-pretty text-[14.5px] leading-relaxed text-white/60">
                Join a select group of forward-thinking clinics shaping the future of
                professional recovery. Founding Clinics receive priority access, direct
                support, and long-term advantages designed to accelerate adoption — without
                added risk.
              </p>
              <p className="mt-3 text-[12.5px] text-white/45">
                Offer ends after the sale of the first 50 units.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="#contact"
                  className="group inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#C97A56] px-4 text-[13px] font-semibold text-white shadow-[0_12px_30px_-12px_rgba(201,122,86,0.7)] hover:bg-[#B86A48]"
                >
                  Reserve founding spot
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="#pricing"
                  className="inline-flex h-11 items-center rounded-[10px] border border-white/15 bg-white/[0.03] px-4 text-[13px] font-medium text-white/85 hover:bg-white/[0.07]"
                >
                  Compare systems
                </Link>
              </div>

              <div className="mt-10 rounded-[16px] border border-white/[0.08] bg-white/[0.02] p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#C97A56]/40 bg-[#C97A56]/10 text-[#C97A56]">
                    <Star className="h-4 w-4 fill-current" />
                  </span>
                  <div>
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#C97A56]">
                      Official 2026 Founding Clinic
                    </p>
                    <p className="text-[13px] font-semibold text-white">
                      Pioneering future recovery
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {foundingBenefits.map((b) => (
                <li
                  key={b.title}
                  className="rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-5"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#C97A56]/15 text-[#C97A56]">
                    <b.icon className="h-4 w-4" />
                  </span>
                  <h4 className="mt-4 text-[14px] font-semibold tracking-tight text-white">
                    {b.title}
                  </h4>
                  <p className="mt-1 text-[12px] text-white/55">{b.note}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* REVENUE / ROI */}
      <section className="mx-auto w-full max-w-[1240px] px-5 py-20 md:px-8 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C97A56]">
              A simple, scalable revenue opportunity
            </p>
            <h2 className="mt-3 text-balance text-[32px] font-semibold leading-[1.1] tracking-tight sm:text-[40px]">
              Add cash-based recovery{" "}
              <span className="text-[#C97A56]">without</span> lengthening appointments.
            </h2>
            <p className="mt-4 text-pretty text-[14.5px] leading-relaxed text-white/60">
              Setup takes under a minute, works in any treatment room, and requires minimal
              staff training. Operationally simple by design.
            </p>

            <ul className="mt-7 space-y-3">
              {[
                "10–15 minute recovery add-on to existing treatments",
                "Standalone mobility sessions for athletes and active adults",
                "Gentle recovery for aging and wellness-focused populations",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[13.5px] text-white/75">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C97A56]" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-gradient-to-br from-[#162532] to-[#0B1820] p-7">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#C97A56]/15 blur-3xl"
            />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
                3-year revenue projection
              </p>
              <h3 className="mt-2 text-[44px] font-semibold leading-none tracking-tight text-white">
                $158,400
              </h3>
              <p className="mt-2 text-[12.5px] text-white/50">
                Illustrative estimate based on common clinic utilization. Actual results vary.
              </p>

              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/[0.08] pt-6">
                {[
                  { k: "Devices", v: "1" },
                  { k: "Clients / day", v: "4" },
                  { k: "Days open / month", v: "22" },
                  { k: "Price / session", v: "$75" },
                ].map((row) => (
                  <div key={row.k}>
                    <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/40">
                      {row.k}
                    </dt>
                    <dd className="mt-1 text-[18px] font-semibold text-white">{row.v}</dd>
                  </div>
                ))}
              </dl>

              <Link
                href="#contact"
                className="mt-7 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[10px] border border-white/15 bg-white/[0.04] text-[13px] font-medium text-white/90 hover:bg-white/[0.08]"
              >
                Get a tailored projection
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT / CTA */}
      <section id="contact" className="relative overflow-hidden border-t border-white/[0.06]">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <Image
            src="/landing/clinic-scene.jpg"
            alt=""
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-[#0F1E28]/90" />
          <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[#C97A56]/15 blur-[160px]" />
        </div>
        <div className="relative mx-auto w-full max-w-[1240px] px-5 py-20 md:px-8 md:py-28">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C97A56]">
                Get in touch
              </p>
              <h2 className="mt-3 text-balance text-[32px] font-semibold leading-[1.1] tracking-tight sm:text-[40px]">
                Bring RecoveryOS into your practice.
              </h2>
              <p className="mt-4 max-w-lg text-pretty text-[14.5px] leading-relaxed text-white/65">
                Tell us a little about your clinic and a team member will reach out with a
                tailored proposal, demo scheduling, and clinical research matching your
                interests.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  { icon: Mail, label: "partners@recoveryos.health" },
                  { icon: Stethoscope, label: "White papers & case study reports on request" },
                  { icon: Users, label: "Distributor & partnership programs available" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 text-[13px] text-white/75">
                    <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-white/[0.04] ring-1 ring-white/10">
                      <item.icon className="h-4 w-4 text-[#C97A56]" />
                    </span>
                    {item.label}
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-4 text-[12.5px] leading-relaxed text-white/60">
                Already a customer?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#C97A56] hover:text-[#D4825E]"
                >
                  Sign in to your workspace →
                </Link>
              </div>
            </div>

            <form className="rounded-[20px] border border-white/[0.08] bg-[#1A2E3B]/70 p-6 backdrop-blur-xl sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" placeholder="Elena" name="first" />
                <Field label="Last name" placeholder="Ruiz" name="last" />
                <Field
                  label="Work email"
                  placeholder="you@clinic.health"
                  name="email"
                  type="email"
                  full
                />
                <Field label="Phone" placeholder="+1 (555) 000-0000" name="phone" full />
              </div>
              <label className="mt-4 block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">
                  Message
                </span>
                <textarea
                  rows={4}
                  name="message"
                  placeholder="Tell us about your practice and what you're hoping to accomplish."
                  className="w-full resize-none rounded-[10px] border border-transparent bg-[#243443] px-3.5 py-3 text-[14px] text-white placeholder:text-white/35 focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/20"
                />
              </label>
              <button
                type="submit"
                className="group mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#C97A56] text-[14px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(201,122,86,0.7)] transition-colors hover:bg-[#B86A48]"
              >
                Request pricing information
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <p className="mt-3 text-center text-[11px] text-white/40">
                We reply within one business day.
              </p>
            </form>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}

function Field({
  label,
  placeholder,
  name,
  type = "text",
  full,
}: {
  label: string
  placeholder: string
  name: string
  type?: string
  full?: boolean
}) {
  return (
    <label className={full ? "sm:col-span-2" : undefined}>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">
        {label}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        className="h-11 w-full rounded-[10px] border border-transparent bg-[#243443] px-3.5 text-[14px] text-white placeholder:text-white/35 focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/20"
      />
    </label>
  )
}
