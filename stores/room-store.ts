import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { LocalUserChoices } from "@livekit/components-react"
import type { ConnectionDetails } from "@/lib/types"


interface RoomState {
  isInitializing: boolean
  error: string | null
  initializeRoom: (roomName: string, participantName: string, e2ee?: boolean, sharedPassphrase?: string) => Promise<void>
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
      error: null,

      initializeRoom: async (roomName, participantName, e2ee = false, sharedPassphrase) => {
        const state = get();
        // If we already have connection details and they match the current room, don't reinitialize
        if (
          state.connectionDetails?.roomName === roomName &&
          state.connectionDetails?.participantName === participantName
        ) {
          return;
        }

        set({ isInitializing: true, error: null, connectionDetails: null });

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

          set({ connectionDetails: details, isInitializing: false, error: null });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to initialize room";
          console.error("Failed to initialize room:", err);
          set({ error: errorMessage, isInitializing: false, connectionDetails: null });
        }
      },

      setLocalUser: (user) => set({ localUser: user }),
      setLastUsedDevices: (devices) => set({ lastUsedDevices: devices }),

      joinRoom: () => {
        const state = get();
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
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
    }
  )
);
