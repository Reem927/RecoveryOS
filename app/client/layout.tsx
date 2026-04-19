import Link from "next/link"
import Image from "next/image"
import { LogOut } from "lucide-react"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F2EDE6] text-[#1F2937]">
      {/* Header — matches practitioner topbar feel */}
      <header className="sticky top-0 z-20 h-[68px] border-b border-black/5 bg-white/80 backdrop-blur-md">
        <div className="flex h-full items-center justify-between px-4 md:px-8">
          {/* SoNa brand */}
          <div className="flex items-center gap-2.5">
            <div className="relative h-8 w-8 shrink-0">
              <Image
                src="/sona_final_line.svg"
                alt="SoNa"
                fill
                className="object-contain"
              />
            </div>
            <span
              className="text-[20px] tracking-[0.5px]"
              style={{ fontFamily: '"DM Serif Display", Georgia, serif', color: "#C69E83" }}
            >
              SoNa
            </span>
            <span className="ml-1 hidden rounded-full border border-black/[0.07] bg-[#F2EDE6] px-2 py-0.5 text-[11px] text-[#6B7280] sm:block">
              Client Portal
            </span>
          </div>

          {/* Patient + sign out */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-black/[0.07] bg-white px-3 py-1.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C97A56] text-[10px] font-medium text-white">
                AR
              </div>
              <span className="hidden text-[12px] text-[#6B7280] sm:block">Alex Rodriguez</span>
            </div>
            <Link
              href="/login"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-black/[0.07] bg-white px-2.5 text-[12px] font-medium text-[#6B7280] transition-colors hover:bg-[#F2EDE6]"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:block">Sign out</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content — same padding as practitioner shell */}
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        {children}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes sona-pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
