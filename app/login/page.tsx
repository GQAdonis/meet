'use client';

import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function LoginContent() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  const registerUrl = redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register'

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <LoginForm />
      <div className="mt-4 text-center">
        <p>Don't have an account? <Link href={registerUrl} className="text-blue-600 hover:underline">Register</Link></p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}

