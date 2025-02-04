'use client';

import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <RegisterForm />
    </div>
  )
}

