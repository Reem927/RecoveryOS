import Link from "next/link"
import { LogOut } from "lucide-react"
import { RecoveryOSLogo } from "@/components/hydrawav3/logo"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F2EDE6]">
      <header className="sticky top-0 z-20 border-b border-black/[0.06] bg-[#0F1E28] text-white">
        <div className="mx-auto flex h-[60px] max-w-[1200px] items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <RecoveryOSLogo subtitle={null} />
            <span className="hidden rounded-full bg-white/[0.06] px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/70 sm:inline-flex">
              Patient portal
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-[12.5px] font-semibold leading-none">Alex Morgan</div>
              <div className="mt-1 text-[10.5px] text-white/50">Meridian Clinic</div>
            </div>
            <div
              aria-hidden
              className="h-8 w-8 rounded-full bg-gradient-to-br from-[#C97A56] to-[#8b4a2e] ring-2 ring-white/10"
            />
            <Link
              href="/login"
              className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-white/10 bg-white/[0.04] px-2.5 text-[12px] font-medium text-white/80 hover:bg-white/[0.08]"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1200px] px-5 py-8">{children}</main>
    </div>
  )
}
