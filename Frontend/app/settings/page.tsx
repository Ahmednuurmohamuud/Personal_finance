"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { ProfileSection } from "@/components/settings/profile-section"
import { FinancialPreferences } from "@/components/settings/financial-preferences"
import { SecuritySettings } from "@/components/settings/security-settings"
import { AccountManagement } from "@/components/settings/account-management"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { logout } = useAuth()
  const router = useRouter()

  const handleSaveProfile = async (data: { username: string; avatar?: string }) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)

    toast({
      title: "Profile updated",
      description: "Your profile information has been successfully updated.",
    })
  }

  const handleSaveFinancialPreferences = async (data: {
    currency: string
    monthlyIncome: number
    savingsGoal: number
  }) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)

    toast({
      title: "Preferences saved",
      description: "Your financial preferences have been updated.",
    })
  }

  const handleChangePassword = async (data: { currentPassword: string; newPassword: string }) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)

    toast({
      title: "Password changed",
      description: "Your password has been successfully updated.",
    })
  }

  const handleExportData = async () => {
    setIsLoading(true)
    // Simulate data export
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)

    toast({
      title: "Data exported",
      description: "Your financial data has been exported and will be downloaded shortly.",
    })
  }

  const handleDeactivateAccount = async () => {
    setIsLoading(true)
    // Simulate account deactivation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast({
      title: "Account deactivated",
      description: "Your account has been permanently deactivated.",
      variant: "destructive",
    })

    // Log out and redirect to login
    logout()
    router.push("/login")
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-8">
              <ProfileSection onSave={handleSaveProfile} isLoading={isLoading} />
              <FinancialPreferences onSave={handleSaveFinancialPreferences} isLoading={isLoading} />
            </div>

            <div className="space-y-8">
              <SecuritySettings onChangePassword={handleChangePassword} isLoading={isLoading} />
              <AccountManagement
                onDeactivateAccount={handleDeactivateAccount}
                onExportData={handleExportData}
                isLoading={isLoading}
              />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
