import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

const generateRoomName = () => {
  // Generate a readable but random room name
  const adjectives = ['swift', 'bright', 'cosmic', 'azure', 'golden', 'crystal', 'stellar', 'vivid'];
  const nouns = ['summit', 'nexus', 'harbor', 'vertex', 'prism', 'zenith', 'aurora', 'vista'];
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomId = uuidv4().split('-')[0]; // Use first segment of UUID
  
  return `${randomAdjective}-${randomNoun}-${randomId}`;
};

interface RoomState {
  roomName: string;
  setRoomName: (name: string) => void;
  generateNewRoomName: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomName: generateRoomName(),
  setRoomName: (name: string) => set({ roomName: name }),
  generateNewRoomName: () => set({ roomName: generateRoomName() }),
})); 