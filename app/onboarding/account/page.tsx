"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2 } from "lucide-react"
import { StepIndicator } from "@/components/onboarding/step-indicator"
import { submitAccountInfo } from "../actions"
import { PRACTITIONER_TITLES } from "../constants"

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 text-[12px] text-red-400">{msg}</p>
}

export default function AccountInfoPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [globalError, setGlobalError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setGlobalError("")
    setFieldErrors({})
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await submitAccountInfo({
        firstName: fd.get("firstName") as string,
        lastName: fd.get("lastName") as string,
        title: fd.get("title") as (typeof PRACTITIONER_TITLES)[number],
        phone: (fd.get("phone") as string) ?? "",
      })
      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {})
        setGlobalError(result.error)
        return
      }
      router.push("/onboarding/credentials")
    })
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <aside className="hidden w-72 shrink-0 flex-col justify-between border-r border-white/[0.06] bg-white/[0.02] px-8 py-12 lg:flex">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C97A56]">
            RecoveryOS
          </p>
          <h2 className="mt-6 text-[20px] font-bold tracking-tight text-white">
            Set up your account
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-white/45">
            Your name and title appear on patient notes and clinic records.
          </p>
          <div className="mt-10">
            <StepIndicator current={1} />
          </div>
        </div>
        <p className="text-[11px] text-white/20">Step 1 of 3</p>
      </aside>

      {/* Right panel */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Mobile heading */}
          <div className="mb-8 lg:hidden">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C97A56]">
              Step 1 of 3
            </p>
            <h1 className="mt-2 text-[26px] font-bold tracking-tight text-white">
              Account info
            </h1>
          </div>

          {/* Desktop heading */}
          <div className="mb-8 hidden lg:block">
            <h1 className="text-[26px] font-bold tracking-tight text-white">
              Your details
            </h1>
            <p className="mt-1 text-[14px] text-white/45">
              How you&apos;ll appear to your clinic and patients.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-white/70">
                  First name <span className="text-[#C97A56]">*</span>
                </label>
                <input
                  name="firstName"
                  required
                  placeholder="e.g. Jordan"
                  className="h-11 w-full rounded-[10px] border border-white/[0.10] bg-white/[0.05] px-3 text-[14px] text-white placeholder:text-white/25 outline-none transition focus:border-[#C97A56]/70 focus:ring-2 focus:ring-[#C97A56]/20"
                />
                <FieldError msg={fieldErrors.firstName} />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-white/70">
                  Last name <span className="text-[#C97A56]">*</span>
                </label>
                <input
                  name="lastName"
                  required
                  placeholder="e.g. Ruiz"
                  className="h-11 w-full rounded-[10px] border border-white/[0.10] bg-white/[0.05] px-3 text-[14px] text-white placeholder:text-white/25 outline-none transition focus:border-[#C97A56]/70 focus:ring-2 focus:ring-[#C97A56]/20"
                />
                <FieldError msg={fieldErrors.lastName} />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-white/70">
                Professional title <span className="text-[#C97A56]">*</span>
              </label>
              <select
                name="title"
                required
                defaultValue=""
                className="h-11 w-full appearance-none rounded-[10px] border border-white/[0.10] bg-white/[0.05] px-3 text-[14px] text-white outline-none transition focus:border-[#C97A56]/70 focus:ring-2 focus:ring-[#C97A56]/20 [&>option]:bg-[#162532] [&>option]:text-white"
              >
                <option value="" disabled className="text-white/40">
                  Select your title…
                </option>
                {PRACTITIONER_TITLES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <FieldError msg={fieldErrors.title} />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-white/70">
                Phone{" "}
                <span className="text-white/30 font-normal">(optional)</span>
              </label>
              <input
                name="phone"
                type="tel"
                placeholder="e.g. +1 555 000 0000"
                className="h-11 w-full rounded-[10px] border border-white/[0.10] bg-white/[0.05] px-3 text-[14px] text-white placeholder:text-white/25 outline-none transition focus:border-[#C97A56]/70 focus:ring-2 focus:ring-[#C97A56]/20"
              />
              <FieldError msg={fieldErrors.phone} />
            </div>

            {globalError && (
              <p className="rounded-[8px] bg-red-500/10 px-3 py-2 text-[13px] text-red-400">
                {globalError}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-[#C97A56] text-[15px] font-semibold text-white shadow-[0_8px_24px_-8px_rgba(201,122,86,0.55)] transition-colors hover:bg-[#B86A48] disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
