import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

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

export const useUiStore = create<UiState>()(
  persist(
    immer((set) => ({
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
          set((state) => {
            state.sidebar.isOpen = !state.sidebar.isOpen
          }),
        setSidebarWidth: (width: number) =>
          set((state) => {
            state.sidebar.width = width
          }),
        toggleChat: () =>
          set((state) => {
            state.chat.isOpen = !state.chat.isOpen
          }),
        setChat: (isOpen: boolean) =>
          set((state) => {
            state.chat.isOpen = isOpen
          }),
        resetUnreadCount: () =>
          set((state) => {
            state.chat.unreadCount = 0
          }),
        incrementUnreadCount: () =>
          set((state) => {
            if (!state.chat.isOpen) {
              state.chat.unreadCount += 1
            }
          })
      }
    })), {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebar: {
          width: state.sidebar.width,
          isCollapsed: state.sidebar.isCollapsed
        }
      })
    }
  )
) 