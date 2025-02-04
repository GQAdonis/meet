import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { LocalUserChoices } from "@livekit/components-react"
import type { ConnectionDetails } from "@/lib/types"

interface RoomState {
  isInRoom: boolean
  localUser: LocalUserChoices | null
  connectionDetails: ConnectionDetails | null
  lastUsedDevices: {
    audioDeviceId?: string;
    videoDeviceId?: string;
  } | null;
  skipPreJoin: boolean;
  room: any | null; // Add room property to the state interface
  setLocalUser: (user: LocalUserChoices) => void
  setConnectionDetails: (details: ConnectionDetails) => void
  setLastUsedDevices: (devices: { audioDeviceId?: string; videoDeviceId?: string }) => void
  setSkipPreJoin: (skip: boolean) => void
  joinRoom: () => void
  leaveRoom: (state: RoomState) => void
}

export const useRoomStore = create<RoomState>()(persist((set, get) => ({ // Add get parameter to the store function
  isInRoom: false,
  localUser: null,
  connectionDetails: null,
  lastUsedDevices: null,
  skipPreJoin: false,
  room: null, // Initialize room property
  setLocalUser: (user) => set({ localUser: user }),
  setConnectionDetails: (details) => set({ connectionDetails: details }),
  setLastUsedDevices: (devices) => set({ lastUsedDevices: devices }),
  setSkipPreJoin: (skip) => set({ skipPreJoin: skip }),
  joinRoom: () => set({ isInRoom: true }),
  leaveRoom: (state) => {
    // Clean up any active tracks
    const room = state.room;
    if (room) {
      room.localParticipant?.unpublishAllTracks();
      room.disconnect();
    }

    // Reset state
    set({ 
      isInRoom: false, 
      localUser: null, 
      connectionDetails: null,
      room: null
    });
  },
}), {
  name: 'room-storage',
  storage: createJSONStorage(() => sessionStorage),
  skipHydration: true
}))
