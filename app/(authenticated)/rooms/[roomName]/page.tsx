"use client"

import { useRoom } from "@/hooks/use-room"
import { PreJoinForm } from "@/components/pre-join/pre-join-form"
import { RoomView } from "@/components/room/room-view"
import { ProtectedRoute } from "@/components/protected-route"
import { LiveKitRoom } from "@livekit/components-react"

export default function Page({ params }: { params: { roomName: string } }) {
  const { connectionDetails, isInRoom, error } = useRoom()

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background">
        {!connectionDetails ? (
          <PreJoinForm 
            roomName={params.roomName}
            error={error || undefined}
          />
        ) : (
          <LiveKitRoom
            serverUrl={connectionDetails.serverUrl}
            token={connectionDetails.participantToken}
            connect={isInRoom}
            onDisconnected={() => {
              // Handle disconnection if needed
            }}
          >
            <RoomView />
          </LiveKitRoom>
        )}
      </main>
    </ProtectedRoute>
  )
}
