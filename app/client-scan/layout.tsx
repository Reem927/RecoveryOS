import Link from "next/link"
import { LogOut } from "lucide-react"
import { Hydrawav3Logo } from "@/components/hydrawav3/logo"

export default function ClientScanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0B1820] text-white">
      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#0F1E28] text-white">
        <div className="flex h-[60px] w-full items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <Hydrawav3Logo subtitle={null} />
            <span className="hidden rounded-full bg-white/[0.06] px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/70 sm:inline-flex">
              Client portal
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

      <main className="min-h-[calc(100vh-60px)] w-full bg-[#0B1820]">
        {children}
      </main>
    </div>
  )
}