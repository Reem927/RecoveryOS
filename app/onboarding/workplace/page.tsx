"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Building2,
  ChevronRight,
  Loader2,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react"
import { StepIndicator } from "@/components/onboarding/step-indicator"
import {
  createClinic,
  requestJoinClinic,
  searchClinicsByType,
} from "../actions"
import { CLINIC_TYPES } from "../constants"

type ClinicResult = Awaited<ReturnType<typeof searchClinicsByType>>[number]

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 text-[12px] text-red-400">{msg}</p>
}

// ─── Create new clinic form ────────────────────────────────────────────────

function CreateClinicForm({
  clinicType,
  onCreated,
  onCancel,
}: {
  clinicType: string
  onCreated: () => void
  onCancel: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setFieldErrors({})
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createClinic({
        name: fd.get("name") as string,
        clinicType: clinicType as "pt_chiro" | "sports_rehab" | "athletic_center",
        address: (fd.get("address") as string) ?? "",
        phone: (fd.get("phone") as string) ?? "",
        email: (fd.get("email") as string) ?? "",
      })
      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {})
        setError(result.error)
        return
      }
      onCreated()
    })
  }

  const typeLabel =
    CLINIC_TYPES.find((t) => t.value === clinicType)?.label ?? clinicType

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[12px] border border-white/[0.10] bg-white/[0.04] p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[14px] font-semibold text-white">Create new clinic</p>
          <p className="text-[12px] text-white/40">{typeLabel}</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 hover:text-white/70 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div>
        <label className="mb-1 block text-[12px] font-medium text-white/60">
          Clinic name <span className="text-[#C97A56]">*</span>
        </label>
        <input
          name="name"
          required
          placeholder="e.g. Peak Performance Rehab"
          className="h-10 w-full rounded-[8px] border border-white/[0.10] bg-white/[0.05] px-3 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-[#C97A56]/60 focus:ring-1 focus:ring-[#C97A56]/20"
        />
        <FieldError msg={fieldErrors.name} />
      </div>

      <div>
        <label className="mb-1 block text-[12px] font-medium text-white/60">
          Address <span className="text-white/30 font-normal">(optional)</span>
        </label>
        <input
          name="address"
          placeholder="e.g. 123 Main St, San Francisco, CA"
          className="h-10 w-full rounded-[8px] border border-white/[0.10] bg-white/[0.05] px-3 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-[#C97A56]/60 focus:ring-1 focus:ring-[#C97A56]/20"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-[12px] font-medium text-white/60">
            Phone
          </label>
          <input
            name="phone"
            type="tel"
            placeholder="+1 555 000 0000"
            className="h-10 w-full rounded-[8px] border border-white/[0.10] bg-white/[0.05] px-3 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-[#C97A56]/60 focus:ring-1 focus:ring-[#C97A56]/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-medium text-white/60">
            Email
          </label>
          <input
            name="email"
            type="email"
            placeholder="clinic@example.com"
            className="h-10 w-full rounded-[8px] border border-white/[0.10] bg-white/[0.05] px-3 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-[#C97A56]/60 focus:ring-1 focus:ring-[#C97A56]/20"
          />
          <FieldError msg={fieldErrors.email} />
        </div>
      </div>

      {error && (
        <p className="rounded-[8px] bg-red-500/10 px-3 py-2 text-[12px] text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#C97A56] text-[13px] font-semibold text-white transition-colors hover:bg-[#B86A48] disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create clinic"}
      </button>
    </form>
  )
}

// ─── Clinic search results ─────────────────────────────────────────────────

function ClinicCard({
  clinic,
  onJoin,
  joining,
}: {
  clinic: ClinicResult
  onJoin: (id: string) => void
  joining: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => onJoin(clinic.id)}
      disabled={joining}
      className="flex w-full items-start gap-3 rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left transition-colors hover:border-[#C97A56]/40 hover:bg-white/[0.06] disabled:opacity-50"
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#162532] text-[#C97A56]">
        <Building2 className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-white">{clinic.name}</p>
        {clinic.address && (
          <p className="truncate text-[12px] text-white/40">{clinic.address}</p>
        )}
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/30">
          <Users className="h-3 w-3" />
          {clinic.practitioner_count}{" "}
          {clinic.practitioner_count === 1 ? "practitioner" : "practitioners"}
        </p>
      </div>
      {joining ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-white/40" />
      ) : (
        <ChevronRight className="h-4 w-4 shrink-0 text-white/25" />
      )}
    </button>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────

export default function WorkplacePage() {
  const router = useRouter()

  // step A: pick clinic type
  const [selectedType, setSelectedType] = useState<string | null>(null)

  // step B: search or create
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<ClinicResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const [joinError, setJoinError] = useState("")

  async function search(q: string) {
    if (!selectedType) return
    setSearching(true)
    const data = await searchClinicsByType(selectedType, q)
    setResults(data)
    setSearching(false)
  }

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setQuery(q)
    search(q)
  }

  async function handleJoin(clinicId: string) {
    setJoiningId(clinicId)
    setJoinError("")
    const result = await requestJoinClinic(clinicId)
    if (!result.ok) {
      setJoinError(result.error)
      setJoiningId(null)
      return
    }
    router.push("/onboarding/complete")
  }

  function handleTypeSelect(type: string) {
    setSelectedType(type)
    search("")
  }

  // ── Type selection screen ──
  if (!selectedType) {
    return (
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 flex-col justify-between border-r border-white/[0.06] bg-white/[0.02] px-8 py-12 lg:flex">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C97A56]">
              RecoveryOS
            </p>
            <h2 className="mt-6 text-[20px] font-bold tracking-tight text-white">
              Your workplace
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-white/45">
              Join your existing clinic or create a new one.
            </p>
            <div className="mt-10">
              <StepIndicator current={3} />
            </div>
          </div>
          <p className="text-[11px] text-white/20">Step 3 of 3</p>
        </aside>

        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C97A56] lg:hidden">
                Step 3 of 3
              </p>
              <h1 className="mt-2 text-[26px] font-bold tracking-tight text-white">
                What type of practice?
              </h1>
              <p className="mt-1 text-[14px] text-white/45">
                This helps match you with the right clinics.
              </p>
            </div>

            <div className="space-y-3">
              {CLINIC_TYPES.map((ct) => (
                <button
                  key={ct.value}
                  type="button"
                  onClick={() => handleTypeSelect(ct.value)}
                  className="flex w-full items-center gap-4 rounded-[12px] border border-white/[0.08] bg-white/[0.03] px-4 py-4 text-left transition-colors hover:border-[#C97A56]/50 hover:bg-white/[0.06]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#162532] text-[#C97A56]">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <span className="text-[15px] font-semibold text-white">
                    {ct.label}
                  </span>
                  <ChevronRight className="ml-auto h-4 w-4 text-white/25" />
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ── Search / create screen ──
  const typeLabel = CLINIC_TYPES.find((t) => t.value === selectedType)?.label

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-72 shrink-0 flex-col justify-between border-r border-white/[0.06] bg-white/[0.02] px-8 py-12 lg:flex">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C97A56]">
            RecoveryOS
          </p>
          <h2 className="mt-6 text-[20px] font-bold tracking-tight text-white">
            Your workplace
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-white/45">
            Search for your clinic or create a new one.
          </p>
          <div className="mt-10">
            <StepIndicator current={3} />
          </div>
        </div>
        <p className="text-[11px] text-white/20">Step 3 of 3</p>
      </aside>

      <main className="flex flex-1 justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <button
              type="button"
              onClick={() => { setSelectedType(null); setResults([]) }}
              className="mb-3 text-[12px] text-white/35 hover:text-white/60 transition-colors"
            >
              ← Change type
            </button>
            <h1 className="text-[24px] font-bold tracking-tight text-white">
              {typeLabel}
            </h1>
            <p className="mt-1 text-[14px] text-white/45">
              Search for your clinic, or create a new one.
            </p>
          </div>

          {/* Search */}
          {!showCreate && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  value={query}
                  onChange={handleQueryChange}
                  placeholder="Search by clinic name…"
                  autoFocus
                  className="h-11 w-full rounded-[10px] border border-white/[0.10] bg-white/[0.05] pl-9 pr-3 text-[14px] text-white placeholder:text-white/25 outline-none focus:border-[#C97A56]/60 focus:ring-2 focus:ring-[#C97A56]/20"
                />
              </div>

              {searching && (
                <div className="flex items-center gap-2 py-3 text-[13px] text-white/30">
                  <Loader2 className="h-4 w-4 animate-spin" /> Searching…
                </div>
              )}

              {!searching && results.length > 0 && (
                <div className="space-y-2">
                  {results.map((c) => (
                    <ClinicCard
                      key={c.id}
                      clinic={c}
                      onJoin={handleJoin}
                      joining={joiningId === c.id}
                    />
                  ))}
                </div>
              )}

              {!searching && results.length === 0 && query.length > 0 && (
                <p className="py-3 text-center text-[13px] text-white/30">
                  No clinics found for &quot;{query}&quot;
                </p>
              )}

              {joinError && (
                <p className="rounded-[8px] bg-red-500/10 px-3 py-2 text-[13px] text-red-400">
                  {joinError}
                </p>
              )}

              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-dashed border-white/[0.15] text-[13px] font-medium text-white/50 transition-colors hover:border-[#C97A56]/50 hover:text-[#C97A56]"
              >
                <Plus className="h-4 w-4" />
                Create a new clinic
              </button>
            </div>
          )}

          {showCreate && (
            <CreateClinicForm
              clinicType={selectedType}
              onCreated={() => router.push("/onboarding/complete")}
              onCancel={() => setShowCreate(false)}
            />
          )}
        </div>
      </main>
    </div>
  )
}
