"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useSupabaseClient } from "@/lib/supabase/client"

type TestNote = {
  id: string
  note: string
  user_id: string
  created_at: string
}

export default function AuthTestPage() {
  const { user, isLoaded } = useUser()
  const supabase = useSupabaseClient()
  const [notes, setNotes] = useState<TestNote[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function loadNotes() {
    setError(null)

    const { data, error } = await supabase
      .from("test_notes")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      setError(error.message)
      return
    }

    setNotes(data ?? [])
  }

  async function addNote() {
    setLoading(true)
    setError(null)

    const { error } = await supabase.from("test_notes").insert({
      note: `Test note from ${
        user?.primaryEmailAddress?.emailAddress ?? "unknown user"
      }`,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    await loadNotes()
  }

  useEffect(() => {
    if (isLoaded && user) {
      loadNotes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user])

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F2EDE6]">
        <p className="text-sm text-[#162532]/70">Loading auth...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F2EDE6] p-8">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold text-[#162532]">
          Clerk + Supabase Auth Test
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Signed in as: {user?.primaryEmailAddress?.emailAddress}
        </p>

        <button
          onClick={addNote}
          disabled={loading}
          className="mt-5 rounded-lg bg-[#C97A56] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Inserting..." : "Insert test row"}
        </button>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 space-y-3">
          {notes.length === 0 ? (
            <p className="text-sm text-gray-500">
              No rows yet. Click the button to test Supabase insert/read.
            </p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="rounded-lg border p-3 text-sm">
                <p className="font-medium">{note.note}</p>
                <p className="mt-1 text-xs text-gray-500">
                  user_id: {note.user_id}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}