import { SignIn } from "@clerk/nextjs"

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0F1E28] px-4 py-10 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[#C97A56]/20 blur-[140px]" />
        <div className="absolute bottom-[-200px] right-[-120px] h-[440px] w-[440px] rounded-full bg-[#C97A56]/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.04),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(201,122,86,0.08),transparent_50%)]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            RecoveryOS
          </h1>
          <p className="mt-2 text-sm uppercase tracking-[0.16em] text-white/45">
            Hydrawav3
          </p>
          <p className="mt-4 text-sm text-white/60">
            Sign in to continue to your clinic workspace.
          </p>
        </div>

        <SignIn
          routing="hash"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/dashboard"
          forceRedirectUrl="/dashboard"
          appearance={{
            elements: {
              card: "rounded-2xl shadow-2xl border border-white/10",
              headerTitle: "text-[#162532]",
              formButtonPrimary:
                "bg-[#C97A56] hover:bg-[#B86A48] text-white shadow-none",
              footerActionLink: "text-[#C97A56] hover:text-[#B86A48]",
            },
          }}
        />

        <p className="mt-6 text-center text-xs text-white/40">
          Secure access for RecoveryOS practitioners.
        </p>
      </div>
    </main>
  )
}