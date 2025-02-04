import { useAuthStore } from "@/stores/auth-store"
import type { AtpAgent } from "@atproto/api"
import { useRouter } from "next/navigation"

export function useAuth() {
  const { agent, session, isAuthenticated, setSession } = useAuthStore()
  const router = useRouter()

  const login = async (identifier: string, password: string) => {
    if (!agent) throw new Error("AtpAgent not initialized")
    await agent.login({ identifier, password })
  }

  const logout = async () => {
    if (!agent) throw new Error("AtpAgent not initialized")
    await agent.logout()
    setSession(null)
    router.push("/")
  }

  return {
    agent: agent as AtpAgent,
    session,
    isAuthenticated,
    login,
    logout,
  }
}

