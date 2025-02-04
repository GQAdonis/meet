'use client';

import { useLocalParticipant } from "@livekit/components-react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Video, VideoOff, MessageSquare, PhoneOff } from "lucide-react"
import { useRoom } from "@/hooks/use-room"

interface CustomControlBarProps {
  onChatToggle: () => void
}

export function CustomControlBar({ onChatToggle }: CustomControlBarProps) {
  const { room } = useRoom()
  const { localParticipant } = useLocalParticipant()

  const toggleAudio = () => {
    localParticipant?.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled)
  }

  const toggleVideo = () => {
    localParticipant?.setCameraEnabled(!localParticipant.isCameraEnabled)
  }

  const leaveRoom = () => {
    room.disconnect()
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-50 flex justify-center space-x-4">
      <Button variant="outline" size="icon" onClick={toggleAudio}>
        {localParticipant?.isMicrophoneEnabled ? <Mic /> : <MicOff />}
      </Button>
      <Button variant="outline" size="icon" onClick={toggleVideo}>
        {localParticipant?.isCameraEnabled ? <Video /> : <VideoOff />}
      </Button>
      <Button variant="outline" size="icon" onClick={onChatToggle}>
        <MessageSquare />
      </Button>
      <Button variant="destructive" size="icon" onClick={leaveRoom}>
        <PhoneOff />
      </Button>
    </div>
  )
}

