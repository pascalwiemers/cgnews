"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useClerk } from "@clerk/nextjs"

export default function SignOutPage() {
  const { signOut } = useClerk()
  const router = useRouter()

  useEffect(() => {
    signOut(() => {
      router.push("/")
    })
  }, [signOut, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Signing out...</h1>
        <p className="text-muted-foreground">
          Please wait while we sign you out.
        </p>
      </div>
    </div>
  )
}
