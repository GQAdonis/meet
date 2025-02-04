"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX } from "lucide-react"

interface AudioTestProps {
  audioDeviceId: string
}

// Extend HTMLAudioElement with setSinkId
interface ExtendedHTMLAudioElement extends HTMLAudioElement {
  setSinkId(deviceId: string): Promise<void>;
}

export function AudioTest({ audioDeviceId }: AudioTestProps) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  React.useEffect(() => {
    audioRef.current = new Audio("/test-audio.mp3")
    audioRef.current.loop = true

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  React.useEffect(() => {
    if (audioRef.current) {
      (audioRef.current as ExtendedHTMLAudioElement).setSinkId(audioDeviceId).catch(console.error);
    }
  }, [audioDeviceId])

  const toggleAudio = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleAudio} className="h-8 w-8">
      {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </Button>
  )
}
