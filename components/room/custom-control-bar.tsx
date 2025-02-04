'use client';

import { useLocalParticipant } from "@livekit/components-react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Video, VideoOff, MessageSquare, PhoneOff } from "lucide-react"
import { useRoom } from "@/hooks/use-room"
import { useRouter } from "next/navigation"

interface CustomControlBarProps {
  onChatToggle: () => void
}

export function CustomControlBar({ onChatToggle }: CustomControlBarProps) {
  const { room } = useRoom()
  const { localParticipant } = useLocalParticipant()
  const router = useRouter()

  const toggleAudio = () => {
    localParticipant?.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled)
  }

  const toggleVideo = () => {
    localParticipant?.setCameraEnabled(!localParticipant.isCameraEnabled)
  }

  const leaveRoom = () => {
    if (room) {
      room.disconnect()
      router.push('/')
    }
  }

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 p-3 flex items-center space-x-4 rounded-full bg-background/80 dark:bg-background/70 backdrop-blur-sm border border-border/50 shadow-lg">
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleAudio}
          className="hover:bg-muted/50"
        >
          {localParticipant?.isMicrophoneEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleVideo}
          className="hover:bg-muted/50"
        >
          {localParticipant?.isCameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onChatToggle}
          className="hover:bg-muted/50"
        >
          <MessageSquare className="w-4 h-4" />
        </Button>
      </div>
      <div className="w-px h-6 bg-border/50" />
      <Button 
        variant="ghost" 
        size="icon"
        onClick={leaveRoom}
        className="hover:bg-red-500/10 hover:text-red-500"
      >
        <PhoneOff className="w-4 h-4" />
      </Button>
    </div>
  )
}
