import { useRoomStore } from "@/stores/room-store"
import { useCallback } from "react"
import type { LocalUserChoices } from "@livekit/components-react"
import type { ConnectionDetails } from "@/lib/types"
import { useRoomContextSafe } from "@/components/providers/room-context-provider"

export function useRoom() {
  const { isInRoom, localUser, connectionDetails, setLocalUser, setConnectionDetails, joinRoom, leaveRoom, lastUsedDevices, setLastUsedDevices, skipPreJoin, setSkipPreJoin } =
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

  const setLastUsedDevicesCallback = useCallback(
    (devices: any) => {
      setLastUsedDevices(devices)
    },
    [setLastUsedDevices],
  )

  const setSkipPreJoinCallback = useCallback(
    (skip: boolean) => {
      setSkipPreJoin(skip)
    },
    [setSkipPreJoin],
  )

  const joinRoomCallback = useCallback(() => {
    joinRoom()
  }, [joinRoom])

  const leaveRoomCallback = useCallback(() => {
    const state = useRoomStore.getState()
    leaveRoom(state)
  }, [leaveRoom])

  return {
    isInRoom,
    localUser,
    connectionDetails,
    lastUsedDevices,
    skipPreJoin,
    setLocalUser: setLocalUserCallback,
    setConnectionDetails: setConnectionDetailsCallback,
    setLastUsedDevices: setLastUsedDevicesCallback,
    setSkipPreJoin: setSkipPreJoinCallback,
    joinRoom: joinRoomCallback,
    leaveRoom: leaveRoomCallback,
    room,
  }
}
