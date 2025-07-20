"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"

interface UserData {
  name: string
  username: string
  occupation: string
  skillsOffered: string[]
  learningGoals: string[]
  hasOnboarded: boolean
}

export default function DashboardPage() {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/")
      return
    }

    if (isLoaded && isSignedIn) {
      fetchUserData()
    }
  }, [isLoaded, isSignedIn, router])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user")
      if (response.ok) {
        const data = await response.json()
        if (data.user && !data.user.hasOnboarded) {
          router.push("/onboard")
          return
        }
        setUserData(data.user)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <p>No user data found</p>
            <button 
              onClick={() => router.push("/onboard")}
              className="mt-4 bg-black text-white px-4 py-2 rounded"
            >
              Complete Onboarding
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {userData.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {userData.name}</p>
              <p><span className="font-medium">Username:</span> @{userData.username}</p>
              <p><span className="font-medium">Occupation:</span> {userData.occupation}</p>
            </div>
          </div>

          {/* Skills Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Skills I Can Teach</h2>
            {userData.skillsOffered.length > 0 ? (
              <ul className="space-y-1">
                {userData.skillsOffered.map((skill, index) => (
                  <li key={index} className="text-gray-700">• {skill}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No skills added yet</p>
            )}
          </div>

          {/* Learning Goals Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Learning Goals</h2>
            {userData.learningGoals.length > 0 ? (
              <ul className="space-y-1">
                {userData.learningGoals.map((goal, index) => (
                  <li key={index} className="text-gray-700">• {goal}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No learning goals set</p>
            )}
          </div>
        </div>

        <div className="mt-8">
          <button 
            onClick={() => router.push("/onboard")}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Edit Profile
          </button>
        </div>
      </main>
    </div>
  )
}
