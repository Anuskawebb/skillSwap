"use client"

import { SignUpButton, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Navbar from "@/components/navbar"
import Link from "next/link"

export default function HomePage() {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Check if user needs onboarding
      fetch("/api/user")
        .then(res => res.json())
        .then(data => {
          if (data.user && !data.user.hasOnboarded) {
            router.push("/onboard")
          } else if (data.user && data.user.hasOnboarded) {
            router.push("/dashboard")
          }
        })
        .catch(console.error)
    }
  }, [isLoaded, isSignedIn, router])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to SkillSwap
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Learn new skills and teach what you know
          </p>
          
          <div className="space-x-4">
            {!isSignedIn && (
              <SignUpButton mode="modal">
                <button className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800">
                  Get Started
                </button>
              </SignUpButton>
            )}
            
            <Link href="/dashboard" className="border border-gray-300 text-gray-700 px-6 py-3 rounded hover:bg-gray-100 inline-block">
              Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
