"use client"

import { useState } from "react"
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  HeartPulse,
  LifeBuoy,
  Mail,
  MessageCircle,
  Play,
  Search,
  Settings,
  Waves,
  Zap,
} from "lucide-react"
import { AppShell } from "@/components/hydrawav3/app-shell"

const faqs = [
  {
    category: "Sessions",
    icon: Play,
    items: [
      {
        q: "How do I start a live session?",
        a: "From the dashboard, click 'New session' or use 'Session Setup' in the sidebar. Select a client, choose a protocol, and hit 'Start Live Session'. The session will appear in the sidebar once active.",
      },
      {
        q: "Why does the timer keep running after I end a session?",
        a: "Make sure to click 'End session' (the red button) in the session view. The session is fully stopped when the sidebar switches back to 'Start Live Session'.",
      },
      {
        q: "Can I pause a session mid-protocol?",
        a: "Yes — use the pause button in the centre of the session canvas. The timer halts and device output is suspended until you resume.",
      },
      {
        q: "What happens if I navigate away during a live session?",
        a: "The session stays active in the background and is tracked in the sidebar. You can return to it at any time via the sidebar's 'End Live Session' button.",
      },
    ],
  },
  {
    category: "Clients",
    icon: HeartPulse,
    items: [
      {
        q: "How do I add a new client?",
        a: "Go to the Clients tab and click 'New client' in the top right. Fill in their intake details and recovery baseline to unlock protocol recommendations.",
      },
      {
        q: "Where can I view a client's recovery trend?",
        a: "Open any client's profile from the Clients list. The Recovery Trend chart shows session-over-session score deltas across the last 8 weeks.",
      },
    ],
  },
  {
    category: "Device & Setup",
    icon: Waves,
    items: [
      {
        q: "How do I calibrate the device?",
        a: "Navigate to Session Setup and select 'Calibrate device'. Follow the on-screen prompts — calibration takes under 2 minutes and is recommended before each clinical day.",
      },
      {
        q: "What does 'Contact impedance optimal' mean?",
        a: "It confirms that the electrode-to-skin contact is within the safe therapeutic range (< 3 kΩ). If impedance is high, clean and re-seat the electrodes.",
      },
    ],
  },
  {
    category: "Account & Settings",
    icon: Settings,
    items: [
      {
        q: "How do I update my clinic information?",
        a: "Go to Settings in the sidebar. You can update your clinic name, room labels, practitioner display name, and notification preferences there.",
      },
      {
        q: "Can I add multiple practitioners to one account?",
        a: "Multi-practitioner accounts are available on Duo and Studio plans. Contact support to enable team access for your workspace.",
      },
    ],
  },
]

const quickLinks = [
  { label: "Getting started guide", icon: BookOpen, href: "#" },
  { label: "Protocol library", icon: Waves, href: "#" },
  { label: "Device quick-start", icon: Zap, href: "#" },
  { label: "Video walkthroughs", icon: Play, href: "#" },
]

function FaqSection({
  category,
  icon: Icon,
  items,
}: {
  category: string
  icon: React.ElementType
  items: { q: string; a: string }[]
}) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="rounded-[12px] border border-black/[0.07] bg-white overflow-hidden">
      <div className="flex items-center gap-3 border-b border-black/[0.06] px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#F2EDE6]">
          <Icon className="h-4 w-4 text-[#C97A56]" />
        </span>
        <h3 className="text-[14px] font-semibold text-[#1F2937]">{category}</h3>
      </div>
      <ul className="divide-y divide-black/[0.05]">
        {items.map((item, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[#F2EDE6]/40"
            >
              <span className="text-[13px] font-medium text-[#1F2937]">{item.q}</span>
              <ChevronDown
                className={`mt-0.5 h-4 w-4 shrink-0 text-[#9CA3AF] transition-transform ${open === i ? "rotate-180" : ""}`}
              />
            </button>
            {open === i && (
              <div className="border-t border-black/[0.04] bg-[#FAFAF9] px-5 py-4 text-[13px] leading-relaxed text-[#6B7280]">
                {item.a}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function SupportPage() {
  const [query, setQuery] = useState("")
  const [contactForm, setContactForm] = useState({ subject: "", message: "" })
  const [sent, setSent] = useState(false)

  const filtered = faqs.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        !query ||
        item.q.toLowerCase().includes(query.toLowerCase()) ||
        item.a.toLowerCase().includes(query.toLowerCase()),
    ),
  })).filter((s) => s.items.length > 0)

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
    setContactForm({ subject: "", message: "" })
  }

  return (
    <AppShell
      title="Support"
      eyebrow="Help & Resources"
      breadcrumbs={[{ label: "Support" }]}
    >
      <div className="space-y-8">
        {/* Hero search */}
        <section className="relative overflow-hidden rounded-[16px] bg-[#162532] p-8 text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#C97A56]/20 blur-3xl"
          />
          <div className="relative">
            <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-white/40">
              <LifeBuoy className="h-3.5 w-3.5" />
              Recovery OS Support
            </div>
            <h2 className="text-[24px] font-bold tracking-tight">How can we help?</h2>
            <p className="mt-1 text-[14px] text-white/55">
              Search the knowledge base or browse topics below.
            </p>
            <div className="relative mt-5 max-w-lg">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search FAQs…"
                className="h-11 w-full rounded-[10px] border border-white/10 bg-white/[0.08] pl-10 pr-4 text-[13.5px] text-white placeholder:text-white/35 focus:border-[#C97A56]/50 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/20"
              />
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* FAQ columns */}
          <div className="space-y-5">
            {filtered.length === 0 ? (
              <div className="rounded-[12px] border border-black/[0.07] bg-white px-5 py-16 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#F2EDE6]">
                  <Search className="h-5 w-5 text-[#C97A56]" />
                </div>
                <p className="text-[14px] font-medium text-[#1F2937]">No results for &ldquo;{query}&rdquo;</p>
                <p className="mt-1 text-[12.5px] text-[#6B7280]">
                  Try a different term or contact us below.
                </p>
              </div>
            ) : (
              filtered.map((section) => (
                <FaqSection
                  key={section.category}
                  category={section.category}
                  icon={section.icon}
                  items={section.items}
                />
              ))
            )}
          </div>

          {/* Right rail */}
          <div className="space-y-5">
            {/* Quick links */}
            <div className="rounded-[12px] border border-black/[0.07] bg-white">
              <div className="border-b border-black/[0.06] px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                  Quick links
                </p>
                <h3 className="mt-1 text-[15px] font-semibold text-[#1F2937]">Resources</h3>
              </div>
              <ul className="divide-y divide-black/[0.05]">
                {quickLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#F2EDE6]/40"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#F2EDE6]">
                          <Icon className="h-3.5 w-3.5 text-[#C97A56]" />
                        </span>
                        <span className="flex-1 text-[13px] font-medium text-[#1F2937]">
                          {link.label}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 text-[#9CA3AF]" />
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Contact card */}
            <div className="rounded-[12px] border border-black/[0.07] bg-white">
              <div className="border-b border-black/[0.06] px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                  Contact
                </p>
                <h3 className="mt-1 text-[15px] font-semibold text-[#1F2937]">
                  Reach our team
                </h3>
              </div>
              <div className="divide-y divide-black/[0.05]">
                <a
                  href="mailto:support@recoveryos.com"
                  className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#F2EDE6]/40"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#F2EDE6]">
                    <Mail className="h-4 w-4 text-[#C97A56]" />
                  </span>
                  <div>
                    <div className="text-[13px] font-medium text-[#1F2937]">Email support</div>
                    <div className="text-[11.5px] text-[#9CA3AF]">support@recoveryos.com</div>
                  </div>
                  <ChevronRight className="ml-auto h-4 w-4 text-[#9CA3AF]" />
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#F2EDE6]/40"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#F2EDE6]">
                    <MessageCircle className="h-4 w-4 text-[#C97A56]" />
                  </span>
                  <div>
                    <div className="text-[13px] font-medium text-[#1F2937]">Live chat</div>
                    <div className="text-[11.5px] text-[#9CA3AF]">Mon–Fri · 9am–6pm EST</div>
                  </div>
                  <ChevronRight className="ml-auto h-4 w-4 text-[#9CA3AF]" />
                </a>
              </div>
            </div>

            {/* Contact form */}
            <div className="rounded-[12px] border border-black/[0.07] bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                Message us
              </p>
              <h3 className="mt-1 mb-4 text-[15px] font-semibold text-[#1F2937]">
                Send a request
              </h3>
              {sent ? (
                <div className="rounded-[10px] bg-[#27AE60]/10 p-4 text-center">
                  <p className="text-[14px] font-semibold text-[#1f8e4a]">Message sent!</p>
                  <p className="mt-1 text-[12.5px] text-[#6B7280]">
                    We&apos;ll get back to you within 1 business day.
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className="mt-3 text-[12px] font-medium text-[#C97A56] hover:text-[#B86A48]"
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSend} className="space-y-3">
                  <div>
                    <label className="mb-1 block text-[11.5px] font-medium text-[#374151]">
                      Subject
                    </label>
                    <input
                      required
                      value={contactForm.subject}
                      onChange={(e) =>
                        setContactForm((f) => ({ ...f, subject: e.target.value }))
                      }
                      placeholder="Brief summary of your issue"
                      className="h-9 w-full rounded-[8px] border border-black/[0.08] bg-white px-3 text-[12.5px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/15"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11.5px] font-medium text-[#374151]">
                      Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm((f) => ({ ...f, message: e.target.value }))
                      }
                      placeholder="Describe what you're experiencing…"
                      className="w-full resize-none rounded-[8px] border border-black/[0.08] bg-white px-3 py-2 text-[12.5px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#C97A56]/40 focus:outline-none focus:ring-2 focus:ring-[#C97A56]/15"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[9px] bg-[#C97A56] text-[13px] font-semibold text-white transition-colors hover:bg-[#B86A48]"
                  >
                    Send message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
