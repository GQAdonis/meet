import { useCallback } from 'react'
import { useUiStore } from '@/store/ui-store'
import type { UiState } from '@/store/ui-store'

export function useChat() {
  const isOpen = useUiStore((state: UiState) => state.chat.isOpen)
  const unreadCount = useUiStore((state: UiState) => state.chat.unreadCount)
  const toggleChat = useUiStore((state: UiState) => state.actions.toggleChat)
  const setChat = useUiStore((state: UiState) => state.actions.setChat)
  const resetUnreadCount = useUiStore((state: UiState) => state.actions.resetUnreadCount)
  const incrementUnreadCount = useUiStore((state: UiState) => state.actions.incrementUnreadCount)

  const openChat = useCallback(() => {
    setChat(true)
    resetUnreadCount()
  }, [setChat, resetUnreadCount])

  const closeChat = useCallback(() => {
    setChat(false)
  }, [setChat])

  return {
    isOpen,
    unreadCount,
    toggleChat,
    openChat,
    closeChat,
    incrementUnreadCount
  } as const
} 