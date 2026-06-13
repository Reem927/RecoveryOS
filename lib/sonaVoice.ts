const VOICE_ID = process.env.NEXT_PUBLIC_SONA_VOICE_ID ?? ""
const API_KEY  = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ?? ""


export async function sonaSpeak(text: string): Promise<void> {
  if (!VOICE_ID || !API_KEY) return


  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5",
        speed: 1.02,
        voice_settings: {
          stability: 0.30,
          similarity_boost: 0.50,
          style: 0.50,
          use_speaker_boost: true,
        },
      }),
    }
  )


  if (!response.ok) return


  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)


  await new Promise<void>((resolve) => {
    audio.onended = () => { URL.revokeObjectURL(url); resolve() }
    audio.onerror = () => { URL.revokeObjectURL(url); resolve() }
    audio.play().catch(() => resolve())
  })
}



