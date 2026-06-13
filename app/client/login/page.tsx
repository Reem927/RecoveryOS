import { SignIn } from "@clerk/nextjs"
import Link from "next/link"

export default function ClientLoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0F1E28] px-4 py-10 text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[#C97A56]/20 blur-[140px]" />
        <div className="absolute bottom-[-200px] right-[-120px] h-[440px] w-[440px] rounded-full bg-[#C97A56]/10 blur-[140px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold tracking-tight text-white">RecoveryOS</h1>
            <p className="mt-1 text-sm uppercase tracking-[0.16em] text-white/45">Client Portal</p>
          </Link>
          <p className="mt-4 text-sm text-white/60">Sign in to your recovery dashboard.</p>
        </div>

        <SignIn
          routing="hash"
          forceRedirectUrl="/client"
          fallbackRedirectUrl="/client"
          appearance={{
            elements: {
              card: "rounded-2xl shadow-2xl border border-white/10 w-full",
              header: "hidden",
              formButtonPrimary: "bg-[#C97A56] hover:bg-[#B86A48] text-white shadow-none",
              footerActionLink: "text-[#C97A56] hover:text-[#B86A48]",
              rootBox: "w-full",
            },
          }}
        />

        <p className="mt-6 text-center text-xs text-white/40">
          Need an account?{" "}
          <span className="text-white/60">Ask your practitioner for an invite link.</span>
        </p>
        <p className="mt-3 text-center text-xs text-white/30">
          Practitioner?{" "}
          <Link href="/login" className="text-[#C97A56] hover:text-[#B86A48]">Sign in here</Link>
        </p>
      </div>
    </main>
  )
}
