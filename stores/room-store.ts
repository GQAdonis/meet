import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { LocalUserChoices } from "@livekit/components-react"
import type { ConnectionDetails } from "@/lib/types"
import { Room } from "livekit-client"

interface RoomState {
  isInitializing: boolean
  initialized: boolean
  error: string | null
  initializeRoom: (roomName: string, participantName: string, room: Room | null, sharedPassphrase?: string) => Promise<Room | Error | null>
  isInRoom: boolean
  localUser: LocalUserChoices | null
  connectionDetails: ConnectionDetails | null
  lastUsedDevices: {
    audioDeviceId?: string;
    videoDeviceId?: string;
  } | null;
  setLocalUser: (user: LocalUserChoices) => void
  setLastUsedDevices: (devices: { audioDeviceId?: string; videoDeviceId?: string }) => void
  joinRoom: () => void
  leaveRoom: () => void
}

const handleApiError = async (response: Response, defaultMessage: string) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || defaultMessage);
  }
  return response;
};

export const useRoomStore = create<RoomState>()(
  persist(
    (set, get) => ({
      isInRoom: false,
      localUser: null,
      connectionDetails: null,
      lastUsedDevices: null,
      isInitializing: false,
      initialized: false,
      error: null,

      initializeRoom: async (roomName: string, participantName: string, room: Room | null, sharedPassphrase?: string) : Promise<Room | Error | null> => {
        const state = get();
        // If we already have connection details and they match the current room, don't reinitialize
        if (
          state.connectionDetails?.roomName === roomName &&
          state.connectionDetails?.participantName === participantName &&
          room !== null &&
          room.name === roomName
        ) {
          return room;
        }

        set({ isInitializing: true, initialized: false, error: null, connectionDetails: null });

        const e2ee = sharedPassphrase !== undefined;

        try {
          // Create room
          await handleApiError(
            await fetch("/api/rooms/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ roomName, e2ee, sharedPassphrase }),
            }),
            "Failed to create room"
          );

          // Get connection details
          const res = await handleApiError(
            await fetch(
              `/api/connection-details?roomName=${roomName}&participantName=${encodeURIComponent(participantName)}`
            ),
            "Failed to get connection details"
          );

          const details = await res.json();
          if (!details.serverUrl || !details.participantToken) {
            throw new Error("Invalid connection details received");
          }

          set({ connectionDetails: details, isInitializing: false, initialized: true, error: null });
          return new Room(details.serverUrl);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to initialize room";
          console.error("Failed to initialize room:", err);
          set({ error: String(errorMessage), isInitializing: false, initialized: false, connectionDetails: null });
          const errRet = err instanceof Error ? err : new Error(errorMessage);
          return errRet;
        }
      },

      setLocalUser: (user) => set({ localUser: user }),
      setLastUsedDevices: (devices) => set({ lastUsedDevices: devices }),

      joinRoom: () => {
        const state = get();

        if (!state.initialized) {
          console.error("Cannot join room: room not initialized");
          return;
        }

        if (!state.connectionDetails || !state.localUser) {
          console.error("Cannot join room: missing connection details or local user settings");
          return;
        }
        set({ isInRoom: true });
      },

      leaveRoom: () => {
        set({
          isInRoom: false,
          localUser: null,
          connectionDetails: null,
        });
      },
    }),
    {
      name: "room-storage",
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
