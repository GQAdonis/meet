import { create } from "zustand"
import type { LocalUserChoices } from "@livekit/components-react"
import type { ConnectionDetails } from "@/lib/types"

interface RoomState {
  isInRoom: boolean
  localUser: LocalUserChoices | null
  connectionDetails: ConnectionDetails | null
  setLocalUser: (user: LocalUserChoices) => void
  setConnectionDetails: (details: ConnectionDetails) => void
  joinRoom: () => void
  leaveRoom: () => void
}

export const useRoomStore = create<RoomState>((set) => ({
  isInRoom: false,
  localUser: null,
  connectionDetails: null,
  setLocalUser: (user) => set({ localUser: user }),
  setConnectionDetails: (details) => set({ connectionDetails: details }),
  joinRoom: () => set({ isInRoom: true }),
  leaveRoom: () => set({ isInRoom: false, localUser: null, connectionDetails: null }),
}))

