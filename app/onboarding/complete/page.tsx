import Link from "next/link"
import { CheckCircle2, ArrowRight } from "lucide-react"

export default function OnboardingCompletePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        {/* Success icon */}
        <div className="mb-8 flex justify-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#C97A56]/15 ring-1 ring-[#C97A56]/30">
            <CheckCircle2 className="h-10 w-10 text-[#C97A56]" />
          </span>
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C97A56]">
          All set
        </p>
        <h1 className="mt-3 text-[34px] font-bold tracking-tight text-white">
          You&apos;re in.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-white/55">
          Your practitioner profile is ready. Head to your dashboard to start
          scheduling sessions and tracking patient recovery.
        </p>

        <div className="mt-10 space-y-3">
          <Link
            href="/dashboard"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-[#C97A56] text-[15px] font-semibold text-white shadow-[0_8px_24px_-8px_rgba(201,122,86,0.65)] transition-colors hover:bg-[#B86A48]"
          >
            Go to dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-6 text-[12px] text-white/25">
          Your profile is visible to teammates at your clinic.
        </p>
      </div>
    </main>
  )
}
