"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2, Paperclip, Plus, Trash2, X } from "lucide-react"
import { StepIndicator } from "@/components/onboarding/step-indicator"
import {
  addCertification,
  listCertifications,
  removeCertification,
} from "../actions"

type Cert = Awaited<ReturnType<typeof listCertifications>>[number]

function bytesToHuman(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function AddCertForm({
  onAdded,
  onCancel,
}: {
  onAdded: () => void
  onCancel: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [fileName, setFileName] = useState("")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setFieldErrors({})
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await addCertification(fd)
      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {})
        setError(result.error)
        return
      }
      onAdded()
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[12px] border border-white/[0.10] bg-white/[0.04] p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-semibold text-white">Add certification</p>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 hover:text-white/70 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="mb-1 block text-[12px] font-medium text-white/60">
            Certification name <span className="text-[#C97A56]">*</span>
          </label>
          <input
            name="name"
            required
            placeholder="e.g. CSCS"
            className="h-10 w-full rounded-[8px] border border-white/[0.10] bg-white/[0.05] px-3 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-[#C97A56]/60 focus:ring-1 focus:ring-[#C97A56]/20"
          />
          {fieldErrors.name && (
            <p className="mt-0.5 text-[11px] text-red-400">{fieldErrors.name}</p>
          )}
        </div>

        <div className="col-span-2">
          <label className="mb-1 block text-[12px] font-medium text-white/60">
            Issuing organization <span className="text-[#C97A56]">*</span>
          </label>
          <input
            name="issuingOrg"
            required
            placeholder="e.g. NSCA"
            className="h-10 w-full rounded-[8px] border border-white/[0.10] bg-white/[0.05] px-3 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-[#C97A56]/60 focus:ring-1 focus:ring-[#C97A56]/20"
          />
          {fieldErrors.issuingOrg && (
            <p className="mt-0.5 text-[11px] text-red-400">{fieldErrors.issuingOrg}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-[12px] font-medium text-white/60">
            Issue date
          </label>
          <input
            name="issueDate"
            type="date"
            className="h-10 w-full rounded-[8px] border border-white/[0.10] bg-white/[0.05] px-3 text-[13px] text-white/70 outline-none focus:border-[#C97A56]/60 focus:ring-1 focus:ring-[#C97A56]/20 [color-scheme:dark]"
          />
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-medium text-white/60">
            Expiration date
          </label>
          <input
            name="expirationDate"
            type="date"
            className="h-10 w-full rounded-[8px] border border-white/[0.10] bg-white/[0.05] px-3 text-[13px] text-white/70 outline-none focus:border-[#C97A56]/60 focus:ring-1 focus:ring-[#C97A56]/20 [color-scheme:dark]"
          />
        </div>
      </div>

      {/* File upload */}
      <div>
        <label className="mb-1 block text-[12px] font-medium text-white/60">
          Upload document{" "}
          <span className="text-white/30 font-normal">(PDF, PNG, JPG · max 10 MB)</span>
        </label>
        <label className="flex h-10 cursor-pointer items-center gap-2 rounded-[8px] border border-dashed border-white/[0.15] bg-white/[0.03] px-3 text-[13px] text-white/40 hover:border-white/25 hover:text-white/60 transition-colors">
          <Paperclip className="h-4 w-4 shrink-0" />
          <span className="truncate">{fileName || "Choose file…"}</span>
          <input
            name="file"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="sr-only"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
          />
        </label>
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
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save certification"}
      </button>
    </form>
  )
}

function CertRow({
  cert,
  onRemoved,
}: {
  cert: Cert
  onRemoved: () => void
}) {
  const [isPending, startTransition] = useTransition()

  function handleRemove() {
    startTransition(async () => {
      await removeCertification(cert.id)
      onRemoved()
    })
  }

  return (
    <div className="flex items-start gap-3 rounded-[10px] border border-white/[0.07] bg-white/[0.03] px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-white truncate">{cert.name}</p>
        <p className="text-[12px] text-white/45 truncate">{cert.issuing_org}</p>
        {(cert.expiration_date) && (
          <p className="mt-0.5 text-[11px] text-white/30">
            Expires {cert.expiration_date}
          </p>
        )}
        {cert.file_name && (
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/30">
            <Paperclip className="h-3 w-3" />
            {cert.file_name}
            {cert.file_size != null && ` · ${bytesToHuman(cert.file_size)}`}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={handleRemove}
        disabled={isPending}
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/25 transition-colors hover:text-red-400 disabled:opacity-40"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  )
}

export default function CredentialsPage() {
  const router = useRouter()
  const [certs, setCerts] = useState<Cert[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  async function load() {
    const data = await listCertifications()
    setCerts(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <aside className="hidden w-72 shrink-0 flex-col justify-between border-r border-white/[0.06] bg-white/[0.02] px-8 py-12 lg:flex">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C97A56]">
            RecoveryOS
          </p>
          <h2 className="mt-6 text-[20px] font-bold tracking-tight text-white">
            Licenses & credentials
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-white/45">
            Add the certifications and licenses that define your scope of practice.
          </p>
          <div className="mt-10">
            <StepIndicator current={2} />
          </div>
        </div>
        <p className="text-[11px] text-white/20">Step 2 of 3</p>
      </aside>

      {/* Right panel */}
      <main className="flex flex-1 justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Mobile heading */}
          <div className="mb-8 lg:hidden">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C97A56]">
              Step 2 of 3
            </p>
            <h1 className="mt-2 text-[26px] font-bold tracking-tight text-white">
              Licenses & credentials
            </h1>
          </div>

          {/* Desktop heading */}
          <div className="mb-8 hidden lg:block">
            <h1 className="text-[26px] font-bold tracking-tight text-white">
              Credentials
            </h1>
            <p className="mt-1 text-[14px] text-white/45">
              Add as many as you like — or skip and come back later.
            </p>
          </div>

          {/* Cert list */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center gap-2 py-4 text-[13px] text-white/30">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : certs.length === 0 && !showForm ? (
              <div className="rounded-[12px] border border-dashed border-white/[0.10] py-8 text-center">
                <p className="text-[13px] text-white/30">No credentials added yet.</p>
              </div>
            ) : (
              certs.map((c) => (
                <CertRow
                  key={c.id}
                  cert={c}
                  onRemoved={load}
                />
              ))
            )}

            {showForm ? (
              <AddCertForm
                onAdded={() => { load(); setShowForm(false) }}
                onCancel={() => setShowForm(false)}
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-dashed border-white/[0.15] text-[13px] font-medium text-white/50 transition-colors hover:border-[#C97A56]/50 hover:text-[#C97A56]"
              >
                <Plus className="h-4 w-4" />
                Add a certification
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => router.push("/onboarding/workplace")}
            className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-[#C97A56] text-[15px] font-semibold text-white shadow-[0_8px_24px_-8px_rgba(201,122,86,0.55)] transition-colors hover:bg-[#B86A48]"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>

          <p className="mt-3 text-center text-[12px] text-white/25">
            You can add or update credentials later from your profile.
          </p>
        </div>
      </main>
    </div>
  )
}
