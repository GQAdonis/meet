"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX, Volume1 } from "lucide-react"
import { cn } from "@/lib/utils"

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

    // Add ended event listener to reset state if audio ends
    const handleEnded = () => setIsPlaying(false)
    audioRef.current.addEventListener('ended', handleEnded)

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded)
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

  const toggleAudio = (e: React.MouseEvent) => {
    e.preventDefault()  // Prevent form submission
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <Button 
      type="button" 
      variant="outline" 
      size="icon" 
      onClick={toggleAudio} 
      className={cn(
        "h-8 w-8 transition-colors",
        isPlaying && "bg-primary/10 hover:bg-primary/20"
      )}
    >
      {isPlaying ? (
        <Volume1 className="h-4 w-4 animate-pulse text-primary" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </Button>
  )
}
