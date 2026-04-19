"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Menu, X, ArrowRight } from "lucide-react"
import { RecoveryOSLogo } from "@/components/hydrawav3/logo"

const links = [
  { href: "#platform", label: "Platform" },
  { href: "#science", label: "Science" },
  { href: "#pricing", label: "Systems" },
  { href: "#founding", label: "Founding Program" },
  { href: "#contact", label: "Contact" },
]

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all ${
        scrolled
          ? "border-b border-white/[0.06] bg-[#0F1E28]/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1240px] items-center justify-between px-5 md:h-[72px] md:px-8">
        <Link href="/" className="flex items-center">
          <RecoveryOSLogo subtitle={null} />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-[13px] font-medium text-white/65 transition-colors hover:bg-white/[0.04] hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden h-9 items-center rounded-full px-3.5 text-[13px] font-medium text-white/75 transition-colors hover:bg-white/[0.05] hover:text-white sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="group inline-flex h-9 items-center gap-1.5 rounded-full bg-[#C97A56] px-4 text-[12.5px] font-semibold text-white shadow-[0_8px_24px_-10px_rgba(201,122,86,0.7)] transition-colors hover:bg-[#B86A48]"
          >
            Get started
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white/70 lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/[0.06] bg-[#0F1E28]/95 backdrop-blur-xl lg:hidden">
          <nav className="mx-auto flex w-full max-w-[1240px] flex-col px-5 py-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/[0.05] py-3 text-[14px] font-medium text-white/75 last:border-none hover:text-white"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex h-10 items-center justify-center rounded-full border border-white/10 text-[13px] font-medium text-white/80 hover:bg-white/[0.05]"
            >
              Sign in
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
