import { create } from "zustand"
import { AtpAgent, type AtpSessionData, type AtpSessionEvent } from "@atproto/api"
import { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs"

interface AuthState {
  agent: AtpAgent | null
  session: () => AtpSessionData | null
  profile: ProfileViewDetailed | null
  isLoading: boolean
  setLoading: (isLoading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
  isAuthenticated: () => boolean
  login: (identifier: string, password: string) => Promise<AtpSessionData | null>
  logout: () => Promise<void>
  setAgent: (agent: AtpAgent | null) => void
  resumeSession: (session: AtpSessionData) => Promise<void>,
  register: (identifier: string, password: string) => Promise<AtpSessionData | null>
  _session: AtpSessionData | null
}

export const useAuthStore = create<AuthState>((set, get) => ({
  agent: null,
  _session: null,
  session: () : AtpSessionData | null => {
    const session = get()._session
    if (session) return session
    if (typeof window === 'undefined') return null
    const storedSession = localStorage.getItem("atpSession")
    if (!storedSession) return null
    set({ _session: JSON.parse(storedSession) })
    return JSON.parse(storedSession)
  },
  profile: null,
  isLoading: false,
  setLoading: (isLoading: boolean) => set({ isLoading }),
  error: null,
  setError: (error: string | null) => set({ error }),
  isAuthenticated: () => get().session() !== null,
  /*setSession: async (session) => {
    const agent = get().agent
    if (session && agent) {
      try {
        const profile = await agent.app.bsky.actor.getProfile({ actor: session.handle })
        set({ session, profile: profile.data })
      } catch (error) {
        console.error('Failed to fetch profile:', error)
        set({ session, profile: null })
      }
    } else {
      set({ session, profile: null })
    }
  },*/
  setAgent: (agent) => set({ agent }),
  login: async (identifier: string, password: string) : Promise<AtpSessionData | null> => {
    try {
      console.log("Starting login attempt for:", identifier)
      const agent = get().agent
      if (!agent) {
        console.error("Login failed: AtpAgent not initialized")
        throw new Error("AtpAgent not initialized")
      }
      console.log("Attempting login with agent...")
      const response = await agent.login({ identifier, password })
      console.log("Login response received:", response)
      
      // Ensure active property is always boolean
      const sessionData = {
        ...response.data,
        active: response.data.active ?? true
      }
      console.log("Session data created:", sessionData)

      // Fetch profile data
      console.log("Fetching profile data...")
      const profile = await agent.app.bsky.actor.getProfile({ actor: response.data.handle })
      console.log("Profile data received:", profile)

      set({ _session: sessionData, profile: profile.data })
      console.log("Login successful, state updated")
      return sessionData
    } catch (error) {
      console.error("Login failed:", error)
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack
        })
      }
      set({ _session: null, isLoading: false, error: error instanceof Error ? error.message : "Login failed" })
      return null
    }
  },
  logout: async () => {
    const agent = get().agent
    if (!agent) throw new Error("AtpAgent not initialized")
    await agent.logout()
    set({ _session: null, profile: null })
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
    set({ _session: session, profile: profile.data })
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
      set({ _session: sessionData, profile: profile.data })
      return sessionData
    } catch (error) {
      console.error("Registration failed:", error)
      set({ _session: null, isLoading: false, error: "Registration failed" })
      return null
    }
  },
}))

// Initialize a single AtpAgent instance
const agent = new AtpAgent({ 
    service: "https://bsky.social",
    persistSession: (evt: AtpSessionEvent, session?: AtpSessionData) => {
        if (typeof window === 'undefined') return;

      if (evt === 'create-failed' || evt === 'expired' || evt === 'network-error') {
        localStorage.removeItem("atpSession")
        return
      }

      if (session) {
        localStorage.setItem("atpSession", JSON.stringify(session))
      } else {
        localStorage.removeItem("atpSession")
      }
    }
 })
useAuthStore.getState().setAgent(agent)

// Handle session persistence
const handleSessionUpdate = async (session: AtpSessionData | null) : Promise<void> =>  {
  if (typeof window === 'undefined') return; // Skip on server side
  
  if (session) {
    const profile = await agent.app.bsky.actor.getProfile({ actor: session.handle })
    await useAuthStore.setState({_session: session, profile: profile.data})
    localStorage.setItem("atpSession", JSON.stringify(session))
  } else {
    await useAuthStore.setState({_session: null, profile: null})
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
        useAuthStore.setState({ _session: session, profile: profile.data, isLoading: false, error: null })
        localStorage.setItem("atpSession", JSON.stringify(session))
      }).catch(() => {
        handleSessionUpdate(null)
      })
    } catch {
      handleSessionUpdate(null)
    }
  }
}
