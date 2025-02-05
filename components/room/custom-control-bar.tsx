'use client';

import { useLocalParticipant } from "@livekit/components-react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Video, VideoOff, MessageSquare, PhoneOff, MonitorUp, MonitorOff, Circle, StopCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRoomContext } from "@livekit/components-react";
import React from "react";

interface CustomControlBarProps {
  onChatToggle: () => void
  hasUnreadMessages?: boolean
  isRoomCreator?: boolean
  onRecordingChange?: (isRecording: boolean) => void
}

export function CustomControlBar({ onChatToggle, hasUnreadMessages, isRoomCreator, onRecordingChange }: CustomControlBarProps) {
  const room = useRoomContext()
  const { localParticipant } = useLocalParticipant()
  const router = useRouter()
  const [isRecording, setIsRecording] = React.useState(false)

  const toggleAudio = () => {
    localParticipant?.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled)
  }

  const toggleVideo = () => {
    localParticipant?.setCameraEnabled(!localParticipant.isCameraEnabled)
  }

  const toggleRecording = async () => {
    try {
      if (isRecording) {
        const response = await fetch('/api/record/stop', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomName: room?.name
          })
        })
        
        if (!response.ok) {
          throw new Error('Failed to stop recording')
        }
        setIsRecording(false)
        onRecordingChange?.(false)
      } else {
        const response = await fetch('/api/record/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomName: room?.name
          })
        })

        if (!response.ok) {
          throw new Error('Failed to start recording')
        }
        setIsRecording(true)
        onRecordingChange?.(true)
      }
    } catch (e) {
      console.error('Error toggling recording:', e)
    }
  }

  const toggleScreenShare = async () => {
    if (localParticipant?.isScreenShareEnabled) {
      await localParticipant?.setScreenShareEnabled(false)
    } else {
      try {
        await localParticipant?.setScreenShareEnabled(true)
      } catch (e) {
        console.error('Error sharing screen:', e)
      }
    }
  }

  const leaveRoom = () => {
    if (room) {
      room.disconnect()
      router.push('/')
    }
  }

  return (
    <div className="fixed md:absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 p-2 md:p-3 flex items-center space-x-2 md:space-x-4 rounded-full bg-background/80 dark:bg-background/70 backdrop-blur-sm border border-border/50 shadow-lg z-50 pointer-events-auto">
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleAudio}
          className="hover:bg-muted/50 h-10 w-10 md:h-11 md:w-11 relative z-50 pointer-events-auto"
        >
          {localParticipant?.isMicrophoneEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleVideo}
          className="hover:bg-muted/50 h-10 w-10 md:h-11 md:w-11 relative z-50 pointer-events-auto"
        >
          {localParticipant?.isCameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onChatToggle}
          className="hover:bg-muted/50 h-10 w-10 md:h-11 md:w-11 relative z-50 pointer-events-auto"
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4" />
            {hasUnreadMessages && (
              <span className="absolute -top-1 -right-1 bg-primary w-2 h-2 rounded-full" />
            )}
          </div>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleScreenShare}
          className="hover:bg-muted/50 h-10 w-10 md:h-11 md:w-11 relative z-50 pointer-events-auto"
        >
          {localParticipant?.isScreenShareEnabled ? 
            <MonitorOff className="w-4 h-4" /> : 
            <MonitorUp className="w-4 h-4" />
          }
        </Button>
        {isRoomCreator && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleRecording}
            className="hover:bg-muted/50 h-10 w-10 md:h-11 md:w-11 relative z-50 pointer-events-auto"
          >
            {isRecording ? (
              <div className="relative">
                <StopCircle className="w-4 h-4 text-red-500" />
                <span className="absolute -top-1 -right-1 animate-pulse">
                  <Circle className="w-2 h-2 fill-red-500 text-red-500" />
                </span>
              </div>
            ) : (
              <Circle className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
      <div className="w-px h-6 bg-border/50" />
      <Button 
        variant="ghost" 
        size="icon"
        onClick={leaveRoom}
        className="hover:bg-red-500/10 hover:text-red-500 relative z-50 pointer-events-auto"
      >
        <PhoneOff className="w-4 h-4" />
      </Button>
    </div>
  )
}
