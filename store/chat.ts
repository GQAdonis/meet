import { create } from 'zustand';
import { Room, RemoteParticipant, DataPacket_Kind } from 'livekit-client';

export interface ChatMessage {
  id: string;
  message: string;
  from?: {
    identity?: string;
    name?: string;
  };
  timestamp: number;
  isSelf: boolean;
  roomName: string;
  status: 'sending' | 'sent' | 'error';
}

interface MessagesByRoom {
  [roomName: string]: ChatMessage[];
}

export interface ChatState {
  isOpen: boolean;
  messagesByRoom: MessagesByRoom;
  room: Room | null;
  currentRoomName: string | null;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (text: string) => Promise<void>;
  setRoom: (room: Room) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessageStatus: (messageId: string, status: ChatMessage['status']) => void;
  getMessagesForRoom: (roomName: string) => ChatMessage[];
}

export const useChatStore = create<ChatState>((set, get) => ({
  isOpen: false,
  messagesByRoom: {},
  room: null,
  currentRoomName: null,
  toggleChat: () => {
    const currentState = get().isOpen;
    set({ isOpen: !currentState });
  },
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  setRoom: (room: Room) => {
    const roomName = room.name;
    
    // Clean up previous room listeners if any
    const prevRoom = get().room;
    if (prevRoom) {
      prevRoom.off('dataReceived', () => {});
    }

    set({ 
      room,
      currentRoomName: roomName,
      messagesByRoom: {
        ...get().messagesByRoom,
        [roomName]: get().messagesByRoom[roomName] || []
      }
    });
    
    // Set up room event listeners for receiving messages
    room.on('dataReceived', (
      payload: Uint8Array,
      participant?: RemoteParticipant,
      kind?: DataPacket_Kind,
      topic?: string
    ) => {
      if (topic === 'chat') {
        try {
          const decoder = new TextDecoder();
          const msg = decoder.decode(payload);
          const messageId = `${Date.now()}-${Math.random()}`;
          
          // Only add received messages that aren't from self
          if (participant?.identity !== room.localParticipant.identity) {
            get().addMessage({
              id: messageId,
              message: msg,
              from: {
                identity: participant?.identity,
                name: participant?.name
              },
              timestamp: Date.now(),
              isSelf: false,
              roomName: room.name,
              status: 'sent'
            });
          }
        } catch (error) {
          console.error('Error processing received message:', error);
        }
      }
    });
  },
  sendMessage: async (text: string) => {
    const { room, currentRoomName } = get();
    console.log('Sending message:', { text, room, currentRoomName });
    
    if (!room || !text.trim() || !currentRoomName) {
      console.log('Missing required data:', { room: !!room, text: !!text.trim(), currentRoomName });
      return;
    }

    const messageId = `${Date.now()}-${Math.random()}`;
    const trimmedMessage = text.trim();
    
    // First add message to local state as 'sending'
    const message: ChatMessage = {
      id: messageId,
      message: trimmedMessage,
      from: {
        identity: room.localParticipant.identity,
        name: room.localParticipant.name
      },
      timestamp: Date.now(),
      isSelf: true,
      roomName: currentRoomName,
      status: 'sending'
    };
    
    console.log('Adding message to store:', message);
    get().addMessage(message);

    try {
      // Then send through LiveKit data channel
      const encoder = new TextEncoder();
      const data = encoder.encode(trimmedMessage);
      console.log('Publishing to LiveKit:', { topic: 'chat', data });
      await room.localParticipant.publishData(data, { topic: 'chat' });
      
      // Update status to sent on success
      console.log('Message sent successfully, updating status');
      get().updateMessageStatus(messageId, 'sent');
    } catch (error) {
      console.error('Failed to send message:', error);
      get().updateMessageStatus(messageId, 'error');
      throw error;
    }
  },
  addMessage: (message: ChatMessage) => {
    console.log('addMessage called with:', message);
    set((state) => {
      const currentMessages = state.messagesByRoom[message.roomName] || [];
      console.log('Current messages:', currentMessages);
      const newState = {
        messagesByRoom: {
          ...state.messagesByRoom,
          [message.roomName]: [...currentMessages, message]
        }
      };
      console.log('New state:', newState);
      return newState;
    });
  },
  updateMessageStatus: (messageId: string, status: ChatMessage['status']) => {
    set((state) => {
      const newMessagesByRoom = { ...state.messagesByRoom };
      
      Object.keys(newMessagesByRoom).forEach(roomName => {
        newMessagesByRoom[roomName] = newMessagesByRoom[roomName].map(msg =>
          msg.id === messageId ? { ...msg, status } : msg
        );
      });
      
      return { messagesByRoom: newMessagesByRoom };
    });
  },
  getMessagesForRoom: (roomName: string) => {
    return get().messagesByRoom[roomName] || [];
  }
})); 