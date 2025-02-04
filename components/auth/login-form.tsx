"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export function LoginForm() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const { login } = useAuth()
  const router = useRouter()
  const toast = useToast()

  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const session = await login(identifier, password)
      if (!session) {
        throw new Error("Login failed")
      }
      if (redirectPath) {
        const decodedPath = decodeURIComponent(redirectPath)
        // Check if the redirect path is a full URL or just a path
        if (decodedPath.startsWith('http')) {
          window.location.href = decodedPath
        } else {
          // Construct the full URL using NEXT_PUBLIC_APP_URL
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
          const fullUrl = baseUrl + (decodedPath.startsWith('/') ? decodedPath : `/${decodedPath}`)
          window.location.href = fullUrl
        }
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error("Login failed:", error)
      // Handle login error (e.g., show error message to user)
      toast.toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="identifier">Username or Email</Label>
        <Input
          id="identifier"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <Button type="submit">Login</Button>
    </form>
  )
}
