import { create } from "zustand"
import { AtpAgent, type AtpSessionData, type AtpSessionEvent } from "@atproto/api"

interface AuthState {
  agent: AtpAgent | null
  session: AtpSessionData | null
  isAuthenticated: boolean
  setSession: (session: AtpSessionData | null) => void
  setAgent: (agent: AtpAgent | null) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  agent: null,
  session: null,
  isAuthenticated: false,
  setSession: (session) => set({ session, isAuthenticated: !!session }),
  setAgent: (agent) => set({ agent }),
}))

// Initialize a single AtpAgent instance
const agent = new AtpAgent({ service: "https://bsky.social" })
useAuthStore.getState().setAgent(agent)

// Handle session persistence
const handleSessionUpdate = (session: AtpSessionData | null) => {
  if (typeof window === 'undefined') return; // Skip on server side
  
  if (session) {
    useAuthStore.getState().setSession(session)
    localStorage.setItem("atpSession", JSON.stringify(session))
  } else {
    useAuthStore.getState().setSession(null)
    localStorage.removeItem("atpSession")
  }
}

// Try to resume session from localStorage only on client side
if (typeof window !== 'undefined') {
  const storedSession = localStorage.getItem("atpSession")
  if (storedSession) {
    try {
      const session = JSON.parse(storedSession)
      agent.resumeSession(session).then(() => {
        handleSessionUpdate(session)
      }).catch(() => {
        handleSessionUpdate(null)
      })
    } catch {
      handleSessionUpdate(null)
    }
  }
}
