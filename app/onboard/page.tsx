"use client"

import { useState, useMemo, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"



// List of timezones for the dropdown
const timezones = [
  "UTC-12:00", "UTC-11:00", "UTC-10:00", "UTC-09:00", "UTC-08:00", 
  "UTC-07:00", "UTC-06:00", "UTC-05:00", "UTC-04:00", "UTC-03:00",
  "UTC-02:00", "UTC-01:00", "UTC+00:00", "UTC+01:00", "UTC+02:00",
  "UTC+03:00", "UTC+03:30", "UTC+04:00", "UTC+04:30", "UTC+05:00",
  "UTC+05:30", "UTC+05:45", "UTC+06:00", "UTC+06:30", "UTC+07:00",
  "UTC+08:00", "UTC+08:45", "UTC+09:00", "UTC+09:30", "UTC+10:00",
  "UTC+10:30", "UTC+11:00", "UTC+12:00", "UTC+12:45", "UTC+13:00",
  "UTC+14:00"
];

// Options for various form fields
const SKILL_OPTIONS = ["JavaScript", "Python", "Graphic Design", "Marketing", "Creative Writing", "Data Science"];
const INTEREST_OPTIONS = ["Technology", "Art", "Sports", "Music", "Reading", "Travel"];
const LANGUAGE_OPTIONS = ["English", "Spanish", "French", "German", "Mandarin", "Hindi"];
const AVAILABILITY_OPTIONS = ["Weekdays (Morning)", "Weekdays (Afternoon)", "Weekdays (Evening)", "Weekends (Morning)", "Weekends (Afternoon)", "Weekends (Evening)"];
const INTENT_OPTIONS = [
    { id: "learn", label: "I want to learn new skills." },
    { id: "teach", label: "I want to teach my skills to others." },
    { id: "both", label: "I'm interested in both learning and teaching." }
];

export default function OnboardPage() {
  const { user } = useUser()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(()=>{
    console.log("User data loaded:", user);
    const getUserData = async()=>{
      const response = await fetch("/api/user");
      const data = await response.json();
      console.log(data);

    }
    getUserData();
    if (!user) {
      setFormData((prev)=>({ ...prev, name: user?.fullName || "" , username: user?.username || "" }))
      return
    }
  }, [user])

  // Expanded state to match the full Prisma schema
  const [formData, setFormData] = useState({
    name: user?.fullName || "",
    username: user?.username || "",
    bio: "",
    occupation: "",
    location: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Auto-detect timezone
    ageGroup: "",
    skillsOffered: [],
    learningGoals: [],
    interests: [],
    preferredLanguages: ["English"],
    userIntent: ["learn"],
    userAvailability: [],
    socialLinks: {
        twitter: "",
        linkedin: "",
        github: "",
        website: ""
    },
    walletAddress: ""
  })

  // A memoized default timezone for the user
  const defaultTimezone = useMemo(() => {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezones.includes(userTimezone) ? userTimezone : "";
  }, []);
  
  // Generic handler for simple text inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handler for social media links, which are in a nested object
  const handleSocialLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        socialLinks: {
            ...prev.socialLinks,
            [name]: value
        }
    }));
  };

  // Handler for checkboxes which manages array state
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData(prev => {
        const currentValues = prev[name] as string[];
        if (checked) {
            return { ...prev, [name]: [...currentValues, value] };
        } else {
            return { ...prev, [name]: currentValues.filter(item => item !== value) };
        }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return;
    setIsSubmitting(true)

    try {
      // The clerkId is essential for linking the profile to the authenticated user
      const payload = {
        ...formData,
        clerkId: user?.id,
        email: user?.primaryEmailAddress?.emailAddress,
      };

      const response = await fetch("/api/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        // Redirect to the dashboard or next page upon successful onboarding
        router.push("/dashboard")
      } else {
        const errorData = await response.json();
        console.error("Onboarding failed:", errorData.error);
        // Here you would typically show an error message to the user
      }
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Helper to render checkbox groups
  const renderCheckboxGroup = (name: keyof typeof formData, options: string[], legend: string) => (
      <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-2">{legend}</legend>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {options.map(option => (
                  <label key={option} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                      <input
                          type="checkbox"
                          name={name}
                          value={option}
                          checked={(formData[name] as string[]).includes(option)}
                          onChange={handleCheckboxChange}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-600">{option}</span>
                  </label>
              ))}
          </div>
      </fieldset>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar /> */}
      
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Welcome aboard!</h1>
            <p className="mt-3 text-lg text-gray-500">Let's set up your profile to connect with others.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-12 bg-white p-8 rounded-xl shadow-md space-y-8">
          {/* Personal Information Section */}
          <div className="space-y-6 border-b border-gray-200 pb-8">
            <h2 className="text-xl font-semibold text-gray-800">Personal Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required />
              </div>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input id="username" name="username" type="text" value={formData.username} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required />
              </div>
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Your Bio</label>
              <textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Tell us a little about yourself..."></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                <select id="occupation" name="occupation" value={formData.occupation} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required>
                  <option value="">Select occupation...</option>
                  <option value="Student">Student</option>
                  <option value="Working Professional">Working Professional</option>
                  <option value="Freelancer">Freelancer</option>
                  <option value="Entrepreneur">Entrepreneur</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                <select id="ageGroup" name="ageGroup" value={formData.ageGroup} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required>
                    <option value="">Select age group...</option>
                    <option value="13-17">13-17</option>
                    <option value="18-24">18-24</option>
                    <option value="25-34">25-34</option>
                    <option value="35-44">35-44</option>
                    <option value="45-54">45-54</option>
                    <option value="55+">55+</option>
                </select>
              </div>
               <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input id="location" name="location" type="text" value={formData.location} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., San Francisco, CA" />
              </div>
              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <select id="timezone" name="timezone" value={formData.timezone || defaultTimezone} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required>
                  <option value="">Select timezone...</option>
                  {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* User Intent Section */}
          <fieldset className="space-y-4 border-b border-gray-200 pb-8">
             <legend className="text-xl font-semibold text-gray-800">What are you here for?</legend>
             {INTENT_OPTIONS.map(option => (
                <label key={option.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-indigo-50 cursor-pointer">
                    <input
                        type="radio"
                        name="userIntent"
                        value={option.id}
                        checked={formData.userIntent[0] === option.id}
                        onChange={(e) => setFormData(prev => ({...prev, userIntent: [e.target.value]}))}
                        className="h-5 w-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="text-md font-medium text-gray-700">{option.label}</span>
                </label>
             ))}
          </fieldset>

          {/* Skills & Interests Section */}
          <div className="space-y-6 border-b border-gray-200 pb-8">
            <h2 className="text-xl font-semibold text-gray-800">Skills & Interests</h2>
            <div className="space-y-6">
                {renderCheckboxGroup('skillsOffered', SKILL_OPTIONS, 'Skills you can offer/teach')}
                {renderCheckboxGroup('learningGoals', SKILL_OPTIONS, 'Skills you want to learn')}
                {renderCheckboxGroup('interests', INTEREST_OPTIONS, 'Your Interests & Hobbies')}
            </div>
          </div>

          {/* Availability and Languages Section */}
          <div className="space-y-6 border-b border-gray-200 pb-8">
             <h2 className="text-xl font-semibold text-gray-800">Preferences</h2>
             <div className="space-y-6">
                {renderCheckboxGroup('userAvailability', AVAILABILITY_OPTIONS, 'Your Availability')}
                {renderCheckboxGroup('preferredLanguages', LANGUAGE_OPTIONS, 'Preferred Languages')}
             </div>
          </div>
          
          {/* Social & Wallet Section */}
          <div className="space-y-6">
             <h2 className="text-xl font-semibold text-gray-800">Optional Details</h2>
             <p className="text-sm text-gray-500">Help others get to know you better by adding your social links.</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">Twitter Profile URL</label>
                    <input id="twitter" name="twitter" type="url" value={formData.socialLinks.twitter} onChange={handleSocialLinkChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="https://twitter.com/username" />
                 </div>
                 <div>
                    <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile URL</label>
                    <input id="linkedin" name="linkedin" type="url" value={formData.socialLinks.linkedin} onChange={handleSocialLinkChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="https://linkedin.com/in/username" />
                 </div>
                 <div>
                    <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-1">GitHub Profile URL</label>
                    <input id="github" name="github" type="url" value={formData.socialLinks.github} onChange={handleSocialLinkChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="https://github.com/username" />
                 </div>
                 <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">Personal Website/Portfolio</label>
                    <input id="website" name="website" type="url" value={formData.socialLinks.website} onChange={handleSocialLinkChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="https://your-website.com" />
                 </div>
             </div>
             <div>
                <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700 mb-1">Wallet Address (Optional)</label>
                <input id="walletAddress" name="walletAddress" type="text" value={formData.walletAddress} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="0x..." />
             </div>
          </div>

          {/* Submission Button */}
          <div className="pt-5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving Profile..." : "Complete Onboarding"}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
