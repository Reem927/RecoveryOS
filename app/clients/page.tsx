"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronRight, Search, UserPlus } from "lucide-react"
import { AppShell } from "@/components/hydrawav3/app-shell"

type Client = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  focus_region: string | null
  intake: { notes?: string } | null
  created_at: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setClients(data) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = clients.filter((c) =>
    c.full_name.toLowerCase().includes(query.toLowerCase()) ||
    (c.email ?? "").toLowerCase().includes(query.toLowerCase()) ||
    (c.focus_region ?? "").toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <AppShell title="Clients" eyebrow={`${clients.length} client${clients.length !== 1 ? "s" : ""}`}>
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search clients by name, email, or focus area…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-[10px] border border-black/[0.09] bg-white pl-9 pr-4 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#C97A56]/30"
            />
          </div>
          <Link
            href="/clients/new"
            className="inline-flex items-center gap-2 rounded-[10px] bg-[#C97A56] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#B86A48] transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Add Client
          </Link>
        </div>

        {loading && (
          <div className="rounded-[12px] border border-black/[0.07] bg-white p-10 text-center text-sm text-[#9CA3AF]">
            Loading clients…
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="rounded-[12px] border border-black/[0.07] bg-white p-12 text-center">
            <p className="text-sm font-medium text-[#374151]">
              {clients.length === 0 ? "No clients yet." : "No clients match your search."}
            </p>
            {clients.length === 0 && (
              <p className="mt-1 text-xs text-[#9CA3AF]">
                Add your first client to get started with recovery intelligence.
              </p>
            )}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="rounded-[12px] border border-black/[0.07] bg-white overflow-hidden">
            <ul className="divide-y divide-black/[0.05]">
              {filtered.map((client) => {
                const initials = client.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
                return (
                  <li key={client.id}>
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-[#F2EDE6]/60 transition-colors"
                    >
                      <div className="h-10 w-10 shrink-0 rounded-full bg-[#C97A56]/15 flex items-center justify-center text-sm font-semibold text-[#C97A56]">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#1F2937]">{client.full_name}</div>
                        <div className="text-xs text-[#9CA3AF] truncate">
                          {client.email ?? client.phone ?? "No contact info"}
                        </div>
                      </div>
                      {client.focus_region && (
                        <span className="hidden sm:inline-flex items-center rounded-full bg-[#C97A56]/10 px-2.5 py-1 text-xs font-medium text-[#C97A56] capitalize">
                          {client.focus_region}
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-[#9CA3AF] shrink-0" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </AppShell>
  )
}
