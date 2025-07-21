"use client"

import { UserButton, SignInButton, useUser, SignUpButton } from "@clerk/nextjs"
import Link from "next/link"
import { useEffect } from "react"

export default function Navbar() {
  const { isSignedIn, user } = useUser()

  useEffect(() => {
    if (isSignedIn && user) {
      console.log("User is signed in:", user)
       const saveUserData = async() =>{
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
        
      })

      const data = await response.json();
      console.log("User data saved:", data);
    }

    saveUserData();
    } else {
      console.log("User is not signed in")
    }
  }, [isSignedIn, user])

 

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              SkillSwap
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                   <SignInButton mode="modal">
                <button  className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button > 
                  Sign Up
                </button>
                </SignUpButton></>
         
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
