'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Weiterleitung zum Dashboard oder Login
    const redirectTo = '/dashboard'
    
    // Kurze Verzögerung für bessere UX
    const timer = setTimeout(() => {
      router.push(redirectTo)
    }, 100)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          MemberCore
        </h1>
        <p className="text-gray-600">
          Fitness-Studio Verwaltungssystem wird geladen...
        </p>
      </div>
    </div>
  )
} 