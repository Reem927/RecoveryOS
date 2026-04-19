"use client"

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export type ActiveSession = {
  clientId: string
  clientName: string
  protocol: string
  bodyRegion: string
  goal: string
  durationMinutes: number
  intensity: number
  startedAt?: string
}

type ActiveSessionContextValue = {
  activeSession: ActiveSession | null
  setActiveSession: (session: ActiveSession | null) => void
  clearActiveSession: () => void
}

const ActiveSessionContext =
  createContext<ActiveSessionContextValue | null>(null)

export function ActiveSessionProvider({
  children,
}: {
  children: ReactNode
}) {
  const [activeSession, setActiveSessionState] =
    useState<ActiveSession | null>(null)

  const value = useMemo<ActiveSessionContextValue>(
    () => ({
      activeSession,
      setActiveSession: setActiveSessionState,
      clearActiveSession: () => setActiveSessionState(null),
    }),
    [activeSession],
  )

  return (
    <ActiveSessionContext.Provider value={value}>
      {children}
    </ActiveSessionContext.Provider>
  )
}

export function useActiveSession() {
  const context = useContext(ActiveSessionContext)

  if (!context) {
    throw new Error(
      "useActiveSession must be used within ActiveSessionProvider",
    )
  }

  return context
}