import { create } from 'zustand'

export interface UiState {
  sidebar: {
    isOpen: boolean
    width: number
    isCollapsed: boolean
  }
  chat: {
    isOpen: boolean
    unreadCount: number
  }
  actions: {
    toggleSidebar: () => void
    setSidebarWidth: (width: number) => void
    toggleChat: () => void
    setChat: (isOpen: boolean) => void
    resetUnreadCount: () => void
    incrementUnreadCount: () => void
  }
}

export const useUiStore = create<UiState>((set) => ({
  sidebar: {
    isOpen: false,
    width: 400,
    isCollapsed: false
  },
  chat: {
    isOpen: false,
    unreadCount: 0
  },
  actions: {
    toggleSidebar: () => 
      set((state) => ({
        ...state,
        sidebar: {
          ...state.sidebar,
          isOpen: !state.sidebar.isOpen
        }
      })),
    setSidebarWidth: (width: number) =>
      set((state) => ({
        ...state,
        sidebar: {
          ...state.sidebar,
          width
        }
      })),
    toggleChat: () =>
      set((state) => ({
        ...state,
        chat: {
          ...state.chat,
          isOpen: !state.chat.isOpen
        }
      })),
    setChat: (isOpen: boolean) =>
      set((state) => ({
        ...state,
        chat: {
          ...state.chat,
          isOpen
        }
      })),
    resetUnreadCount: () =>
      set((state) => ({
        ...state,
        chat: {
          ...state.chat,
          unreadCount: 0
        }
      })),
    incrementUnreadCount: () =>
      set((state) => ({
        ...state,
        chat: {
          ...state.chat,
          unreadCount: !state.chat.isOpen ? state.chat.unreadCount + 1 : state.chat.unreadCount
        }
      }))
  }
})) 