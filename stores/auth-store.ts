import { create } from "zustand"
import { AtpAgent, type AtpSessionData, type AtpSessionEvent } from "@atproto/api"
import { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs"

interface AuthState {
  agent: AtpAgent | null
  session: AtpSessionData | null
  profile: ProfileViewDetailed | null
  isLoading: boolean
  setLoading: (isLoading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
  isAuthenticated: () => boolean
  login: (identifier: string, password: string) => Promise<AtpSessionData | null>
  logout: () => Promise<void>
  setSession: (session: AtpSessionData | null) => void
  setAgent: (agent: AtpAgent | null) => void
  resumeSession: (session: AtpSessionData) => Promise<void>,
  register: (identifier: string, password: string) => Promise<AtpSessionData | null>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  agent: null,
  session: null,
  profile: null,
  isLoading: false,
  setLoading: (isLoading: boolean) => set({ isLoading }),
  error: null,
  setError: (error: string | null) => set({ error }),
  isAuthenticated: () => get().session !== null,
  setSession: (session) => set({ session, }),
  setAgent: (agent) => set({ agent }),
  login: async (identifier: string, password: string) : Promise<AtpSessionData | null> => {
    try {
      const agent = get().agent
      if (!agent) throw new Error("AtpAgent not initialized")
      const response = await agent.login({ identifier, password })
      // Ensure active property is always boolean
      const sessionData = {
        ...response.data,
        active: response.data.active ?? true
      }
      // Fetch profile data
      const profile = await agent.app.bsky.actor.getProfile({ actor: response.data.handle })
      set({ session: sessionData, profile: profile.data })
      return sessionData
    } catch (error) {
      console.error("Login failed:", error)
      set({ session: null, isLoading: false, error: "Login failed" })
      return null
    }
  },
  logout: async () => {
    const agent = get().agent
    if (!agent) throw new Error("AtpAgent not initialized")
    await agent.logout()
    set({ session: null, profile: null })
  },
  resumeSession: async (session: AtpSessionData) => {
    const agent = get().agent
    if (!agent) {
      console.error("AtpAgent not initialized")
      return
    }
    await agent.resumeSession(session)
    // Fetch profile data
    const profile = await agent.app.bsky.actor.getProfile({ actor: session.handle })
    set({ session, profile: profile.data })
  },
  register: async (identifier: string, password: string) : Promise<AtpSessionData | null> => {
    try {
      const agent = get().agent
      if (!agent) throw new Error("AtpAgent not initialized")
      const response = await agent.createAccount({
        email: identifier,
        handle: identifier,
        password,
      })
      const sessionData = {
        ...response.data,
        active: true
      }
      // Fetch profile data
      const profile = await agent.app.bsky.actor.getProfile({ actor: response.data.handle })
      set({ session: sessionData, profile: profile.data })
      return sessionData
    } catch (error) {
      console.error("Registration failed:", error)
      set({ session: null, isLoading: false, error: "Registration failed" })
      return null
    }
  },
}))

// Initialize a single AtpAgent instance
const agent = new AtpAgent({ 
    service: "https://bsky.social",
    persistSession: (evt: AtpSessionEvent, session?: AtpSessionData) => {
        if (typeof window === 'undefined') return;

      if (session) {
        localStorage.setItem("atpSession", JSON.stringify(session))
      } else {
        localStorage.removeItem("atpSession")
      }
    }
 })
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
      agent.resumeSession(session).then(async () => {
        // Fetch profile data after resuming session
        const profile = await agent.app.bsky.actor.getProfile({ actor: session.handle })
        useAuthStore.setState({ session, profile: profile.data, isLoading: false, error: null })
        localStorage.setItem("atpSession", JSON.stringify(session))
      }).catch(() => {
        handleSessionUpdate(null)
      })
    } catch {
      handleSessionUpdate(null)
    }
  }
}
