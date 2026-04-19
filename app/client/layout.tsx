import Link from "next/link"
import Image from "next/image"
import { LogOut } from "lucide-react"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F2EDE6] text-[#1F2937]">
      <header className="sticky top-0 z-20 flex h-[68px] items-center gap-4 border-b border-black/5 bg-white/80 px-4 backdrop-blur-md md:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <div className="relative h-8 w-8 shrink-0">
            <Image
              src="/sona_final_line.svg"
              alt="SoNa"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex min-w-0 flex-col justify-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
              Client Portal
            </p>
            <h1 className="truncate text-[18px] font-semibold tracking-tight text-[#1F2937]">
              SoNa
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex h-10 items-center gap-2 rounded-[10px] border border-black/[0.07] bg-white px-2.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C97A56] text-[10px] font-semibold text-white">
              AR
            </div>
            <span className="hidden text-[12px] font-medium text-[#374151] sm:block">
              Alex Rodriguez
            </span>
          </div>
          <Link
            href="/login"
            className="inline-flex h-10 items-center gap-1.5 rounded-[10px] border border-black/[0.07] bg-white px-3 text-[12px] font-medium text-[#374151] transition-colors hover:border-black/10"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:block">Sign out</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        {children}
      </main>

      <style>{`
        @keyframes sona-pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
