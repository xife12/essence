'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader } from 'lucide-react'

export default function LandingPageRedirect() {
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    // Sofortige Weiterleitung zum neuen Builder
    if (params.id) {
      const newPath = `/landingpages/${params.id}/builder`
      console.log('🔄 Redirecting to:', newPath)
      
      // Verwende push statt replace für bessere Kompatibilität
      router.push(newPath)
      
      // Fallback mit window.location für hartnäckige Fälle
      const timer = setTimeout(() => {
        window.location.href = newPath
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [params.id, router])

  // Alternativ: Sofortige clientseitige Weiterleitung
  if (typeof window !== 'undefined' && params.id) {
    const newPath = `/landingpages/${params.id}/builder`
    if (window.location.pathname !== newPath) {
      window.location.href = newPath
      return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
        <Loader className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Weiterleitung zum Builder...
        </h1>
            <p className="text-gray-600">
          Sie werden automatisch zum neuen Landingpage Builder weitergeleitet.
        </p>
        <div className="mt-4">
          <a 
            href={`/landingpages/${params.id}/builder`}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Hier klicken, falls die Weiterleitung nicht funktioniert
          </a>
      </div>
    </div>
          </div>
  )
} 