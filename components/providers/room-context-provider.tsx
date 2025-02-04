'use client';

import { Room } from 'livekit-client';
import { createContext, useContext, ReactNode, useState, useCallback } from 'react';

interface RoomContextType {
  room: Room | null;
  setRoom: (room: Room | null) => void;
}

const RoomContext = createContext<RoomContextType>({ 
  room: null,
  setRoom: () => {} 
});

export function RoomContextProvider({ children }: { children: ReactNode }) {
  const [room, setRoom] = useState<Room | null>(null);

  const handleSetRoom = useCallback((newRoom: Room | null) => {
    setRoom(newRoom);
  }, []);

  return (
    <RoomContext.Provider value={{ room, setRoom: handleSetRoom }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoomContextSafe() {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error('useRoomContextSafe must be used within a RoomContextProvider');
  }
  return context;
}
