"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export function RegisterForm() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const { agent } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const session = await agent.createAccount({
        email,
        handle: username,
        password,
      })
      if (!session) {
        throw new Error("Registration failed")
      }
      // After successful registration, redirect to login page with the redirect parameter
      if (redirect) {
        const decodedPath = decodeURIComponent(redirect)
        // Check if the redirect path is a full URL or just a path
        if (decodedPath.startsWith('http')) {
          const loginUrl = `/login?redirect=${encodeURIComponent(decodedPath)}`
          router.push(loginUrl)
        } else {
          // Construct the full URL using NEXT_PUBLIC_APP_URL
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
          const fullUrl = baseUrl + (decodedPath.startsWith('/') ? decodedPath : `/${decodedPath}`)
          const loginUrl = `/login?redirect=${encodeURIComponent(fullUrl)}`
          router.push(loginUrl)
        }
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error("Registration failed:", error)
      toast.toast({
        title: "Registration failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      })
      // Handle registration error (e.g., show error message to user)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="username">Username</Label>
        <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <Button type="submit">Register</Button>
    </form>
  )
}

