'use client';

import React from "react"
import { useRoom } from "@/hooks/use-room"
import { VideoConference } from "@livekit/components-react"
import { CustomControlBar } from "@/components/room/custom-control-bar"
import { ChatSidebar } from "@/components/room/chat-sidebar"
import { CustomParticipantTile } from "./custom-participant-tile"
import type { ConnectionDetails } from "@/lib/types"
import { LiveKitProvider } from "@/components/providers/livekit-provider"

export function RoomView({ roomName }: { roomName: string }) {
  const { localUser } = useRoom()
  const [isChatOpen, setIsChatOpen] = React.useState(false)
  const [connectionDetails, setConnectionDetails] = React.useState<ConnectionDetails | null>(null)

  React.useEffect(() => {
    const fetchConnectionDetails = async () => {
      try {
        const url = new URL("/api/connection-details", window.location.origin)
        url.searchParams.append("roomName", roomName)
        url.searchParams.append("participantName", localUser?.username || "Anonymous")

        const response = await fetch(url.toString())
        if (!response.ok) {
          throw new Error("Failed to fetch connection details")
        }
        const details: ConnectionDetails = await response.json()
        setConnectionDetails(details)
      } catch (error) {
        console.error("Error fetching connection details:", error)
        // Handle error (e.g., show error message to user)
      }
    }

    if (localUser) {
      fetchConnectionDetails()
    }
  }, [roomName, localUser])

  if (!localUser || !connectionDetails) return null

  return (
    <LiveKitProvider
      serverUrl={connectionDetails.serverUrl}
      token={connectionDetails.participantToken}
      connect={true}
      audio={localUser.audioEnabled}
      video={localUser.videoEnabled}
    >
      <div className="h-screen w-screen flex">
        <div className="flex-grow relative">
          <VideoConference
            className="h-full w-full"
          />
          <CustomControlBar onChatToggle={() => setIsChatOpen(!isChatOpen)} />
        </div>
        {isChatOpen && <ChatSidebar />}
      </div>
    </LiveKitProvider>
  )
}
