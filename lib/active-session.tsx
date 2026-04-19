"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

const STORAGE_KEY = "hydrawav3.active-session.v1"

export type ActiveSession = {
  id: string
  patientId: string
  patientName: string
  protocol: string
  room?: string
  startedAt: number
}

type ActiveSessionContextValue = {
  session: ActiveSession | null
  startSession: (input: Omit<ActiveSession, "id" | "startedAt">) => ActiveSession
  endSession: () => void
  ready: boolean
}

const ActiveSessionContext = createContext<ActiveSessionContextValue | null>(null)

export function ActiveSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<ActiveSession | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as ActiveSession
        if (parsed && typeof parsed.startedAt === "number") {
          setSession(parsed)
        }
      }
    } catch {
      // ignore
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      if (session) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
      } else {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // ignore
    }
  }, [session, ready])

  const startSession = useCallback<ActiveSessionContextValue["startSession"]>(
    (input) => {
      const cryptoApi = typeof window !== "undefined" ? window.crypto : undefined
      const id =
        cryptoApi && typeof cryptoApi.randomUUID === "function"
          ? cryptoApi.randomUUID()
          : `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      const next: ActiveSession = {
        ...input,
        id,
        startedAt: Date.now(),
      }
      setSession(next)
      return next
    },
    [],
  )

  const endSession = useCallback(() => {
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({ session, startSession, endSession, ready }),
    [session, startSession, endSession, ready],
  )

  return (
    <ActiveSessionContext.Provider value={value}>
      {children}
    </ActiveSessionContext.Provider>
  )
}

export function useActiveSession(): ActiveSessionContextValue {
  const ctx = useContext(ActiveSessionContext)
  if (!ctx) {
    throw new Error("useActiveSession must be used within ActiveSessionProvider")
  }
  return ctx
}

/** Formatted MM:SS elapsed since `startedAt`. Returns "00:00" when not active. */
export function useElapsed(startedAt?: number | null): string {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    if (!startedAt) {
      setNow(null)
      return
    }
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [startedAt])

  if (!startedAt || now === null) return "00:00"
  const totalSecs = Math.max(0, Math.floor((now - startedAt) / 1000))
  const mm = Math.floor(totalSecs / 60)
  const ss = totalSecs % 60
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`
}
