import Link from "next/link"
import { RecoveryOSLogo } from "@/components/hydrawav3/logo"

const cols = [
  {
    title: "Product",
    links: [
      { label: "Platform", href: "#platform" },
      { label: "Science", href: "#science" },
      { label: "Systems", href: "#pricing" },
      { label: "Founding Program", href: "#founding" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Contact", href: "#contact" },
      { label: "Help Center", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Partners", href: "#contact" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
]

export function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#0B1820] text-white/70">
      <div className="mx-auto w-full max-w-[1240px] px-5 py-14 md:px-8 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <RecoveryOSLogo subtitle={null} />
            <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-white/55">
              The operating system for modern recovery — built for clinics, sports rehab, and
              performance teams.
            </p>
            <p className="mt-4 text-[11.5px] leading-relaxed text-white/40">
              RecoveryOS is not a medical device and makes no medical claims. Our platform is
              intended for wellness and recovery purposes only.
            </p>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
                {c.title}
              </div>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[13px] font-medium text-white/70 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/[0.06] pt-6 text-[11.5px] text-white/40 sm:flex-row sm:items-center">
          <span>© 2026 RecoveryOS Health Systems. All rights reserved.</span>
          <div className="flex items-center gap-5">
            <Link href="#" className="hover:text-white/70">
              Privacy
            </Link>
            <Link href="#" className="hover:text-white/70">
              Terms
            </Link>
            <Link href="#" className="hover:text-white/70">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
