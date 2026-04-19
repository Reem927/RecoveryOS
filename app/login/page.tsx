import Link from "next/link"
import { ArrowRight, ShieldCheck, Waves, Activity, CheckCircle2 } from "lucide-react"
import { Hydrawav3Logo } from "@/components/hydrawav3/logo"

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#0F1E28] text-white">
      {/* Ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[#C97A56]/20 blur-[140px]" />
        <div className="absolute bottom-[-200px] right-[-120px] h-[440px] w-[440px] rounded-full bg-[#C97A56]/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.04),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(201,122,86,0.08),transparent_50%)]" />
      </div>

      <div className="relative mx-auto grid min-h-screen w-full max-w-[1280px] grid-cols-1 lg:grid-cols-2">
        {/* Left: brand story */}
        <div className="hidden flex-col justify-between px-10 py-10 lg:flex">
          <Hydrawav3Logo />

          <div className="max-w-md">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-[#27AE60]" />
              Platform v3.2 · Stable
            </div>
            <h2 className="text-balance text-[34px] font-semibold leading-[1.1] tracking-tight">
              Pre-session recovery,{" "}
              <span className="text-[#C97A56]">measured in seconds.</span>
            </h2>
            <p className="mt-4 text-pretty text-[14px] leading-relaxed text-white/60">
              Camera-based movement analysis, vitals estimation, and protocol recommendations —
              built for practitioners who need answers before the patient is on the table.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                { icon: Activity, text: "Range of motion & asymmetry in under 90 seconds" },
                { icon: Waves, text: "Personalised Hydrawav3 protocol per session" },
                { icon: ShieldCheck, text: "HIPAA-aligned. Data stays in your clinic." },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-3 text-[13px] text-white/75">
                  <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-white/[0.04] ring-1 ring-white/10">
                    <item.icon className="h-4 w-4 text-[#C97A56]" />
                  </span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-white/40">
            <span>© 2026 Hydrawav3 Health Systems</span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <Link href="#" className="hover:text-white/70">
              Privacy
            </Link>
            <Link href="#" className="hover:text-white/70">
              Terms
            </Link>
          </div>
        </div>

        {/* Right: form */}
        <div className="flex flex-col justify-center px-5 py-10 sm:px-10">
          <div className="mx-auto w-full max-w-[420px]">
            <div className="mb-8 flex justify-center lg:hidden">
              <Hydrawav3Logo />
            </div>

            <div className="rounded-[16px] border border-white/[0.06] bg-[#1A2E3B]/80 p-7 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl">
              <div className="mb-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C97A56]">
                  Practitioner sign in
                </p>
                <h1 className="mt-2 text-[24px] font-semibold tracking-tight">
                  Welcome back, clinician.
                </h1>
                <p className="mt-1.5 text-[13px] text-white/55">
                  Sign in to continue your patient pre-checks.
                </p>
              </div>

              <form className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50"
                  >
                    Work email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    defaultValue="elena.ruiz@meridianclinic.health"
                    className="h-11 w-full rounded-[10px] border border-transparent bg-[#243443] px-3.5 text-[14px] text-white placeholder:text-white/35 focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/20"
                    placeholder="you@clinic.health"
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50"
                    >
                      Password
                    </label>
                    <Link
                      href="#"
                      className="text-[11px] font-medium text-[#C97A56] hover:text-[#D4825E]"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    defaultValue="••••••••••••"
                    className="h-11 w-full rounded-[10px] border border-transparent bg-[#243443] px-3.5 text-[14px] text-white placeholder:text-white/35 focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/20"
                  />
                </div>

                <label className="flex cursor-pointer items-center gap-2.5 pt-1 text-[13px] text-white/60">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-white/20 bg-[#243443] text-[#C97A56] accent-[#C97A56]"
                  />
                  Keep me signed in on this clinic device
                </label>

                <Link
                  href="/"
                  className="group mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#C97A56] text-[14px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(201,122,86,0.7)] transition-colors hover:bg-[#B86A48]"
                >
                  Sign in to workspace
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>

                <div className="relative py-1 text-center">
                  <span className="absolute inset-0 flex items-center">
                    <span className="h-px w-full bg-white/10" />
                  </span>
                  <span className="relative bg-[#1A2E3B]/80 px-3 text-[11px] uppercase tracking-[0.14em] text-white/40">
                    or
                  </span>
                </div>

                <button
                  type="button"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.03] text-[13px] font-medium text-white/80 hover:bg-white/[0.06]"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-[#C97A56]/15 text-[#C97A56]">
                    <ShieldCheck className="h-3 w-3" />
                  </span>
                  Continue with clinic SSO
                </button>
              </form>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 rounded-full bg-[#1A7A45]/20 px-3 py-1.5 text-[12px] text-[#34d399]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              All systems operational · Last sync 2 min ago
            </div>

            <p className="mt-6 text-center text-[12px] text-white/40">
              Don&apos;t have an account?{" "}
              <Link href="#" className="font-medium text-[#C97A56] hover:text-[#D4825E]">
                Request clinic access
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
