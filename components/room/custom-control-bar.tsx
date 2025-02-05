'use client';

import { useLocalParticipant } from "@livekit/components-react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Video, VideoOff, MessageSquare, PhoneOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRoomContext } from "@livekit/components-react";

interface CustomControlBarProps {
  onChatToggle: () => void
  hasUnreadMessages?: boolean
}

export function CustomControlBar({ onChatToggle, hasUnreadMessages }: CustomControlBarProps) {
  const room = useRoomContext()
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
    <div className="fixed md:absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 p-2 md:p-3 flex items-center space-x-2 md:space-x-4 rounded-full bg-background/80 dark:bg-background/70 backdrop-blur-sm border border-border/50 shadow-lg">
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleAudio}
          className="hover:bg-muted/50 h-10 w-10 md:h-11 md:w-11"
        >
          {localParticipant?.isMicrophoneEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleVideo}
          className="hover:bg-muted/50 h-10 w-10 md:h-11 md:w-11"
        >
          {localParticipant?.isCameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onChatToggle}
          className="hover:bg-muted/50 h-10 w-10 md:h-11 md:w-11"
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4" />
            {hasUnreadMessages && (
              <span className="absolute -top-1 -right-1 bg-primary w-2 h-2 rounded-full" />
            )}
          </div>
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
