import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0F1E28] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            RecoveryOS
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Create your account
          </p>
        </div>

        <SignUp
          routing="hash"
          signInUrl="/login"
          fallbackRedirectUrl="/dashboard"
          forceRedirectUrl="/dashboard"
          appearance={{
            elements: {
              card: "rounded-2xl shadow-2xl",
              headerTitle: "text-[#162532]",
              formButtonPrimary:
                "bg-[#C97A56] hover:bg-[#B86A48] text-white shadow-none",
              footerActionLink: "text-[#C97A56] hover:text-[#B86A48]",
            },
          }}
        />
      </div>
    </main>
  )
}