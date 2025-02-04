import { useRoomStore } from "@/stores/room-store"
import { useCallback } from "react"
import type { LocalUserChoices } from "@livekit/components-react"
import type { ConnectionDetails } from "@/lib/types"
import { useRoomContextSafe } from "@/components/providers/room-context-provider"

export function useRoom() {
  const { isInRoom, localUser, connectionDetails, setLocalUser, setConnectionDetails, joinRoom, leaveRoom } =
    useRoomStore()
  const { room } = useRoomContextSafe()

  const setLocalUserCallback = useCallback(
    (user: LocalUserChoices) => {
      setLocalUser(user)
    },
    [setLocalUser],
  )

  const setConnectionDetailsCallback = useCallback(
    (details: ConnectionDetails) => {
      setConnectionDetails(details)
    },
    [setConnectionDetails],
  )

  const joinRoomCallback = useCallback(() => {
    joinRoom()
  }, [joinRoom])

  const leaveRoomCallback = useCallback(() => {
    leaveRoom()
  }, [leaveRoom])

  return {
    isInRoom,
    localUser,
    connectionDetails,
    setLocalUser: setLocalUserCallback,
    setConnectionDetails: setConnectionDetailsCallback,
    joinRoom: joinRoomCallback,
    leaveRoom: leaveRoomCallback,
    room,
  }
}

