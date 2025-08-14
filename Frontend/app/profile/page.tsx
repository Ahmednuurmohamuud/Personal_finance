"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProfilePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to settings page since profile is part of settings
    router.push("/settings")
  }, [router])

  return null
}
