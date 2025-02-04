"use client"

import { useRoom } from "@/hooks/use-room"
import { PreJoinForm } from "@/components/pre-join/pre-join-form"
import { RoomView } from "@/components/room/room-view"
import { ProtectedRoute } from "@/components/protected-route"

export default function Page({ params }: { params: { roomName: string } }) {
  const { isInRoom } = useRoom()

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background">
        {isInRoom ? <RoomView roomName={params.roomName} /> : <PreJoinForm roomName={params.roomName} />}
      </main>
    </ProtectedRoute>
  )
}

