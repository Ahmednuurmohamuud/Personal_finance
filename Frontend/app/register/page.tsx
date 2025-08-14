"use client"

import { RegisterForm } from "@/components/auth/register-form"
import Script from "next/script"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-950 p-4 relative overflow-hidden">
      {/* Google Identity Services script */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />

      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-emerald-600/5 bg-[radial-gradient(circle_at_1px_1px,_rgba(5,150,105,0.15)_1px,_transparent_0)] bg-[length:20px_20px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
            Join Us Today!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
            Start your journey to financial freedom
          </p>
        </div>

        <RegisterForm />
      </div>
    </div>
  )
}
