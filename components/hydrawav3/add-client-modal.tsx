"use client"

import { useState } from "react"
import { UserPlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

type NewClient = {
  id: string
  full_name: string
  nickname: string | null
  age: number | null
  gender: string | null
  height_ft: number | null
  height_in: number | null
  weight_lbs: number | null
  email: string | null
  phone: string | null
  focus_region: string | null
  intake: { notes?: string } | null
  created_at: string
}

type Props = {
  onAdded: (client: NewClient) => void
}

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"]

export function AddClientModal({ onAdded }: Props) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [nickname, setNickname] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")
  const [heightFt, setHeightFt] = useState("")
  const [heightIn, setHeightIn] = useState("")
  const [weight, setWeight] = useState("")

  function reset() {
    setNickname("")
    setAge("")
    setGender("")
    setHeightFt("")
    setHeightIn("")
    setWeight("")
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!age || !gender || heightFt === "" || heightIn === "" || !weight) {
      setError("Please fill in all required fields.")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nickname.trim() || null,
          age: Number(age),
          gender,
          height_ft: Number(heightFt),
          height_in: Number(heightIn),
          weight_lbs: Number(weight),
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Failed to add client")
      }

      const created: NewClient = await res.json()
      onAdded(created)
      setOpen(false)
      reset()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-[10px] bg-[#C97A56] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#B86A48] transition-colors"
      >
        <UserPlus className="h-4 w-4" />
        Add Client
      </button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
        <DialogContent className="bg-white border border-black/[0.09] rounded-[16px] shadow-xl max-w-md p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-black/[0.06]">
            <DialogTitle className="text-[#1F2937] text-base font-semibold">
              New Client
            </DialogTitle>
            <p className="text-xs text-[#9CA3AF] mt-0.5">All fields required unless marked optional</p>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 space-y-4">

              {/* Nickname */}
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">
                  Nickname <span className="text-[#9CA3AF] font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full rounded-[10px] border border-black/[0.09] bg-[#FAFAFA] px-3.5 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#C97A56]/30 focus:border-[#C97A56]/50"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">
                  Age <span className="text-[#C97A56]">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 34"
                  className="w-full rounded-[10px] border border-black/[0.09] bg-[#FAFAFA] px-3.5 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#C97A56]/30 focus:border-[#C97A56]/50"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">
                  Gender <span className="text-[#C97A56]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {GENDER_OPTIONS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`rounded-[10px] border px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                        gender === g
                          ? "border-[#C97A56] bg-[#C97A56]/10 text-[#C97A56]"
                          : "border-black/[0.09] bg-[#FAFAFA] text-[#374151] hover:border-[#C97A56]/40"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Height */}
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">
                  Height <span className="text-[#C97A56]">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      min={0}
                      max={8}
                      value={heightFt}
                      onChange={(e) => setHeightFt(e.target.value)}
                      placeholder="5"
                      className="w-full rounded-[10px] border border-black/[0.09] bg-[#FAFAFA] px-3.5 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#C97A56]/30 focus:border-[#C97A56]/50 pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF]">ft</span>
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      min={0}
                      max={11}
                      value={heightIn}
                      onChange={(e) => setHeightIn(e.target.value)}
                      placeholder="10"
                      className="w-full rounded-[10px] border border-black/[0.09] bg-[#FAFAFA] px-3.5 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#C97A56]/30 focus:border-[#C97A56]/50 pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF]">in</span>
                  </div>
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">
                  Weight <span className="text-[#C97A56]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="155"
                    className="w-full rounded-[10px] border border-black/[0.09] bg-[#FAFAFA] px-3.5 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#C97A56]/30 focus:border-[#C97A56]/50 pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF]">lbs</span>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 rounded-[8px] px-3 py-2">{error}</p>
              )}
            </div>

            <DialogFooter className="px-6 pb-6 pt-2 gap-2">
              <button
                type="button"
                onClick={() => { setOpen(false); reset() }}
                className="flex-1 rounded-[10px] border border-black/[0.09] bg-white px-4 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-[10px] bg-[#C97A56] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#B86A48] transition-colors disabled:opacity-60"
              >
                {saving ? "Adding…" : "Add Client"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
