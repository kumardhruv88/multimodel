const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVEN_API_KEY
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM" // Rachel voice (free)

export async function speakText(text: string): Promise<void> {
  // First try ElevenLabs
  if (ELEVENLABS_API_KEY) {
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text: text.slice(0, 500),
            model_id: "eleven_monolingual_v1",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }
      )

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        await new Promise<void>((resolve, reject) => {
          audio.onended = () => resolve()
          audio.onerror = () => reject()
          audio.play()
        })
        return
      }
    } catch (e) {
      console.warn("ElevenLabs TTS failed, using browser TTS:", e)
    }
  }

  // Fallback: browser SpeechSynthesis
  return new Promise<void>((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 500))
    utterance.rate = 1.0
    utterance.onend = () => resolve()
    utterance.onerror = () => resolve()
    window.speechSynthesis.speak(utterance)
  })
}
