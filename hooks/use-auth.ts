import { useAuthStore } from "@/stores/auth-store"
import type { AtpAgent } from "@atproto/api"
import { useRouter } from "next/navigation"

export function useAuth() {
  const { agent, session, isAuthenticated, resumeSession, register, login, logout, profile } = useAuthStore()
  const router = useRouter()

  return {
    agent: agent as AtpAgent,
    session,
    isAuthenticated,
    login,
    logout,
    register,
    resumeSession,
    profile
  }
}

