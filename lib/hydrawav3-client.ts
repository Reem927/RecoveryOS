// ─────────────────────────────────────────────────────────────────────────────
// Hydrawav3 · Device Client
// Swappable interface for sending protocol payloads to the Hydrawav3 device.
// MockHydrawavClient logs payloads for dev/demo; RealHydrawavClient hits the
// production MQTT relay after authenticating.
// ─────────────────────────────────────────────────────────────────────────────

import type { HydrawavPayload } from "@/lib/hydrawav3-protocol"

export interface HydrawavClient {
  startSession(payload: HydrawavPayload): Promise<{ success: boolean; message: string }>
  pauseSession(): Promise<void>
  stopSession(): Promise<void>
  resumeSession(): Promise<void>
}

const API_BASE = "http://54.241.236.53:8080/api/v1"
const MQTT_TOPIC = "HydraWav3Pro/config"

export class MockHydrawavClient implements HydrawavClient {
  async startSession(
    payload: HydrawavPayload,
  ): Promise<{ success: boolean; message: string }> {
    console.log("[MockHydrawavClient] startSession →", payload)
    await delay(800)
    return { success: true, message: "Mock session started" }
  }

  async pauseSession(): Promise<void> {
    console.log("[MockHydrawavClient] pauseSession (playCmd=2)")
    await delay(200)
  }

  async stopSession(): Promise<void> {
    console.log("[MockHydrawavClient] stopSession (playCmd=3)")
    await delay(200)
  }

  async resumeSession(): Promise<void> {
    console.log("[MockHydrawavClient] resumeSession (playCmd=4)")
    await delay(200)
  }
}

export class RealHydrawavClient implements HydrawavClient {
  private token: string | null = null
  private lastPayload: HydrawavPayload | null = null

  private async login(): Promise<string> {
    if (this.token) return this.token
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "testpractitioner",
        password: "1234",
        rememberMe: true,
      }),
    })
    if (!res.ok) {
      throw new Error(`Hydrawav3 auth failed: ${res.status}`)
    }
    const data = (await res.json()) as { token?: string; accessToken?: string }
    const token = data.token ?? data.accessToken
    if (!token) throw new Error("Hydrawav3 auth response missing token")
    this.token = token
    return token
  }

  private async publish(payload: HydrawavPayload): Promise<void> {
    const token = await this.login()
    const res = await fetch(`${API_BASE}/mqtt/publish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        topic: MQTT_TOPIC,
        payload: JSON.stringify(payload),
      }),
    })
    if (!res.ok) {
      throw new Error(`Hydrawav3 publish failed: ${res.status}`)
    }
  }

  async startSession(
    payload: HydrawavPayload,
  ): Promise<{ success: boolean; message: string }> {
    try {
      this.lastPayload = payload
      await this.publish({ ...payload, playCmd: 1 })
      return { success: true, message: "Session started" }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown device error"
      return { success: false, message }
    }
  }

  async pauseSession(): Promise<void> {
    if (!this.lastPayload) return
    await this.publish({ ...this.lastPayload, playCmd: 2 })
  }

  async stopSession(): Promise<void> {
    if (!this.lastPayload) return
    await this.publish({ ...this.lastPayload, playCmd: 3 })
  }

  async resumeSession(): Promise<void> {
    if (!this.lastPayload) return
    await this.publish({ ...this.lastPayload, playCmd: 4 })
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

let cachedClient: HydrawavClient | null = null

export function getClient(): HydrawavClient {
  if (cachedClient) return cachedClient
  const useReal = process.env.NEXT_PUBLIC_USE_REAL_DEVICE === "true"
  cachedClient = useReal ? new RealHydrawavClient() : new MockHydrawavClient()
  return cachedClient
}
