'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Settings, PenTool, BarChart3, Eye, ArrowLeft } from 'lucide-react'

interface FormNavigationProps {
  formId: string
  formName?: string
  currentPage: 'builder' | 'einstellungen' | 'auswertung' | 'vorschau'
}

export default function FormNavigation({ formId, formName, currentPage }: FormNavigationProps) {
  const router = useRouter()

  const navigationItems = [
    {
      key: 'builder',
      label: 'Builder',
      icon: PenTool,
      path: `/formulare/${formId}/builder`
    },
    {
      key: 'einstellungen',
      label: 'Einstellungen',
      icon: Settings,
      path: `/formulare/${formId}/einstellungen`
    },
    {
      key: 'auswertung',
      label: 'Auswertung',
      icon: BarChart3,
      path: `/formulare/${formId}/auswertung`
    },
    {
      key: 'vorschau',
      label: 'Vorschau',
      icon: Eye,
      path: `/formulare/${formId}/vorschau`
    }
  ]

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Back button and title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/formulare')}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {formName || 'Formular bearbeiten'}
              </h1>
              <p className="text-sm text-gray-600">ID: {formId.substring(0, 8)}...</p>
            </div>
          </div>

          {/* Navigation tabs */}
          <nav className="flex space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.key

              return (
                <button
                  key={item.key}
                  onClick={() => router.push(item.path)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
} 