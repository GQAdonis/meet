'use client';

import { ParticipantTile, TrackReference } from "@livekit/components-react"
import { Participant, Track } from "livekit-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface CustomParticipantTileProps {
  participant: Participant
  onStartPrivateChat: (participantIdentity: string) => void
  trackRef?: TrackReference
}

export function CustomParticipantTile({ participant, onStartPrivateChat, trackRef }: CustomParticipantTileProps) {
  const isScreenShare = trackRef?.publication.source === Track.Source.ScreenShare;
  return (
    <div className="relative">
      <div className="w-full h-full bg-secondary">
        <ParticipantTile
          className="w-full h-full"
          trackRef={trackRef}
          disableSpeakingIndicator={isScreenShare}
        />
      </div>
      <div className="absolute bottom-2 left-2 flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar>
              <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${participant.identity ?? ''}`} />
              <AvatarFallback>{(participant.identity ?? '').slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onStartPrivateChat(participant.identity)}>Private Chat</DropdownMenuItem>
            {/* Add more actions here */}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm">
          <p>{participant.identity ?? 'Unknown'}</p>
          <p className="text-xs text-gray-300">{participant.metadata ? `@${participant.metadata}` : ''}</p>
        </div>
      </div>
    </div>
  )
}
