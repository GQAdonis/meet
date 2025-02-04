"use client"

import { useRoom } from "@/hooks/use-room"
import { PreJoinForm } from "@/components/pre-join/pre-join-form"
import { RoomView } from "@/components/room/room-view"
import { ProtectedRoute } from "@/components/protected-route"
import { useEffect, useState } from "react"

export default function Page({ params }: { params: { roomName: string } }) {
  const { isInRoom } = useRoom()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-background">
          <PreJoinForm roomName={params.roomName} />
        </main>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background">
        {isInRoom ? <RoomView roomName={params.roomName} /> : <PreJoinForm roomName={params.roomName} />}
      </main>
    </ProtectedRoute>
  )
}

