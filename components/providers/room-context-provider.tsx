'use client';

import { Room } from 'livekit-client';
import { createContext, useContext, ReactNode, useMemo } from 'react';

interface RoomContextType {
  room: Room | null;
}

const RoomContext = createContext<RoomContextType>({ room: null });

export function RoomContextProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => ({ room: null }), []);

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoomContextSafe() {
  const context = useContext(RoomContext);
  return context;
}
