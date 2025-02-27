"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()
  
  useEffect(() => {
    // Check authentication status on the client side
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check")
        if (response.ok) {
          router.push("/")
        }
      } catch (error) {
        console.error("Auth check error:", error)
      } finally {
        setIsCheckingAuth(false)
      }
    }
    
    checkAuth()
  }, [router])
  
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <p className="text-muted-foreground">checking authentication...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  )
}