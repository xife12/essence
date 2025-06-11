'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Upload, Download, Eye, Trash2, Plus, Image } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CITemplatesAPI, CILogo } from '@/app/lib/api/ci-templates'

interface LogoUpload {
  logo_type: 'primary' | 'white' | 'black' | 'favicon' | 'action_special'
  file?: File
  preview?: string
  description?: string
}

export default function MasterLogosPage() {
  const searchParams = useSearchParams()
  const masterId = searchParams?.get('id')
  
  const [logos, setLogos] = useState<CILogo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadData, setUploadData] = useState<LogoUpload>({
    logo_type: 'primary'
  })

  useEffect(() => {
    if (masterId) {
      loadLogos()
    }
  }, [masterId])

  const loadLogos = async () => {
    if (!masterId) return
    
    try {
      const logoData = await CITemplatesAPI.getLogos(masterId)
      setLogos(logoData)
    } catch (error) {
      console.error('Error loading logos:', error)
    }
  }

  const logoTypes = [
    { value: 'primary', label: 'Haupt-Logo', description: 'Primäres Logo für normale Hintergründe' },
    { value: 'white', label: 'Weißes Logo', description: 'Für dunkle Hintergründe' },
    { value: 'black', label: 'Schwarzes Logo', description: 'Für helle Hintergründe' },
    { value: 'favicon', label: 'Favicon', description: 'Für Browser-Tabs (.ico, 32x32px)' },
    { value: 'action_special', label: 'Spezial-Format', description: 'Weitere Formate (z.B. quadratisch)' }
  ]

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const preview = URL.createObjectURL(file)
      setUploadData(prev => ({ ...prev, file, preview }))
    }
  }

  const uploadLogo = async () => {
    if (!masterId || !uploadData.file) return

    setIsLoading(true)
    try {
      // TODO: Hier würde der File-Upload implementiert werden
      // Für jetzt verwenden wir einen Placeholder
      const fileAssetId = 'placeholder-file-id'
      
      await CITemplatesAPI.addLogo({
        ci_template_id: masterId,
        logo_type: uploadData.logo_type,
        file_asset_id: fileAssetId,
        is_inherited: false,
        description: uploadData.description
      })
      
      await loadLogos()
      setShowUploadModal(false)
      setUploadData({ logo_type: 'primary' })
      alert('Logo erfolgreich hochgeladen!')
    } catch (error) {
      console.error('Error uploading logo:', error)
      alert('Fehler beim Hochladen des Logos')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/ci-styling"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Zurück zum Dashboard</span>
            </Link>
            <div className="border-l border-gray-300 pl-4">
              <h1 className="text-2xl font-bold text-gray-900">Logo-Verwaltung</h1>
              <p className="text-sm text-gray-600">
                Verwalten Sie alle Logo-Varianten für Ihr Master Corporate Identity
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Logo hinzufügen</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Empfehlungen */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Logo-Empfehlungen</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>Format:</strong> PNG mit transparentem Hintergrund</p>
            <p>• <strong>Auflösung:</strong> Mindestens 1000px Breite für Print-Qualität</p>
            <p>• <strong>Favicon:</strong> 32x32px oder 64x64px, als .ico oder .png</p>
            <p>• <strong>Dateigröße:</strong> Maximal 2MB pro Logo</p>
          </div>
        </div>

        {/* Logo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {logoTypes.map((type) => {
            const existingLogo = logos.find(logo => logo.logo_type === type.value)
            
            return (
              <div key={type.value} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{type.label}</h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                  {existingLogo && (
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 rounded">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {existingLogo ? (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Logo hochgeladen</p>
                    <p className="text-xs text-gray-500 mt-1">{existingLogo.description}</p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">Kein Logo hochgeladen</p>
                    <button
                      onClick={() => {
                        setUploadData({ logo_type: type.value as any })
                        setShowUploadModal(true)
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Jetzt hochladen
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Logo hochladen</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo-Typ
                </label>
                <select
                  value={uploadData.logo_type}
                  onChange={(e) => setUploadData(prev => ({ ...prev, logo_type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  {logoTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Datei auswählen
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {uploadData.preview && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <img
                    src={uploadData.preview}
                    alt="Vorschau"
                    className="max-w-full h-32 mx-auto object-contain"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beschreibung (optional)
                </label>
                <input
                  type="text"
                  value={uploadData.description || ''}
                  onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="z.B. Sommerversion 2025"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                onClick={uploadLogo}
                disabled={isLoading || !uploadData.file}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Hochladen...' : 'Hochladen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 