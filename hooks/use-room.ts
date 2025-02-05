import { useRoomStore } from "@/stores/room-store"

/**
 * Hook to manage room state and actions.
 * Provides access to room connection details, local user settings, and room lifecycle methods.
 */
export function useRoom() {
  const { 
    isInRoom, 
    localUser, 
    connectionDetails, 
    setLocalUser,
    joinRoom, 
    leaveRoom, 
    lastUsedDevices, 
    setLastUsedDevices,
    initializeRoom,
    isInitializing,
    error,
    initialized
  } = useRoomStore()

  return {
    // Room state
    isInRoom,
    isInitializing,
    error,
    initialized,
    connectionDetails,

    // User state
    localUser,
    lastUsedDevices,

    // Actions
    initializeRoom,
    setLocalUser,
    setLastUsedDevices,
    joinRoom,
    leaveRoom,
  }
}
