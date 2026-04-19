import Link from "next/link"
import { ArrowRight, Activity, ScanLine, Users } from "lucide-react"

const FEATURES = [
  {
    icon: ScanLine,
    title: "CV-powered movement scanning",
    body: "Automatic posture and gait analysis — no wearables required.",
  },
  {
    icon: Activity,
    title: "AI session summaries",
    body: "Each session closes with a structured clinical note drafted for you.",
  },
  {
    icon: Users,
    title: "Multi-practitioner clinics",
    body: "Shared patient charts, coordinated follow-ups, one workspace.",
  },
]

export default function OnboardingWelcomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        {/* Logo + headline */}
        <div className="mb-10 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C97A56]">
            RecoveryOS · Hydrawav3
          </p>
          <h1 className="mt-3 text-[34px] font-bold tracking-tight text-white">
            Welcome aboard.
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-white/55">
            Let&apos;s set up your practitioner profile in three quick steps so
            your clinic workspace is ready to go.
          </p>
        </div>

        {/* Feature list */}
        <ul className="mb-10 space-y-4">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="flex items-start gap-4 rounded-[12px] border border-white/[0.06] bg-white/[0.03] px-4 py-4"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#C97A56]/15 text-[#C97A56]">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="text-[14px] font-semibold text-white">{title}</p>
                <p className="mt-0.5 text-[13px] text-white/50">{body}</p>
              </div>
            </li>
          ))}
        </ul>

        <Link
          href="/onboarding/account"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-[#C97A56] text-[15px] font-semibold text-white shadow-[0_8px_24px_-8px_rgba(201,122,86,0.65)] transition-colors hover:bg-[#B86A48]"
        >
          Get started
          <ArrowRight className="h-4 w-4" />
        </Link>

        <p className="mt-5 text-center text-[12px] text-white/30">
          Takes about 2 minutes &nbsp;·&nbsp; You can always update this later
        </p>
      </div>
    </main>
  )
}
