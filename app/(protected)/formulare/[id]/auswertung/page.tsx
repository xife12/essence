'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download, BarChart3, Users, TrendingUp, Eye, Calendar, Filter } from 'lucide-react'
import { FormsAPI, Form, FormSubmission } from '@/app/lib/api/forms'
import FormNavigation from '@/app/components/formbuilder/FormNavigation'

export default function FormAnalytics() {
  const params = useParams()
  const router = useRouter()
  const formId = params.id as string

  const [form, setForm] = useState<Form | null>(null)
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  useEffect(() => {
    loadData()
  }, [formId, dateRange])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [formData, submissionsData] = await Promise.all([
        FormsAPI.getById(formId),
        FormsAPI.getSubmissions(formId)
      ])
      
      if (!formData) {
        alert('Formular nicht gefunden')
        router.back()
        return
      }
      
      setForm(formData)
      setSubmissions(submissionsData)
    } catch (error) {
      console.error('❌ Error loading analytics data:', error)
      alert('Fehler beim Laden der Auswertung')
    } finally {
      setIsLoading(false)
    }
  }

  const exportSubmissions = async () => {
    try {
      const blob = await FormsAPI.exportSubmissions(formId, 'csv')
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `formular-${form?.name}-submissions.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('❌ Error exporting submissions:', error)
      alert('Fehler beim Export')
    }
  }

  // Analytics calculations
  const getFilteredSubmissions = () => {
    if (dateRange === 'all') return submissions
    
    const now = new Date()
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    
    return submissions.filter(s => new Date(s.created_at) >= cutoff)
  }

  const filteredSubmissions = getFilteredSubmissions()
  const totalSubmissions = filteredSubmissions.length
  
  // Daily submissions for chart
  const getDailySubmissions = () => {
    const dailyData: { [key: string]: number } = {}
    
    filteredSubmissions.forEach(submission => {
      const date = new Date(submission.created_at).toISOString().split('T')[0]
      dailyData[date] = (dailyData[date] || 0) + 1
    })
    
    return Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }))
  }

  const dailyData = getDailySubmissions()
  const averageDaily = totalSubmissions / (dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Auswertung wird geladen...</p>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Formular nicht gefunden</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FormNavigation
        formId={formId}
        formName={form.name}
        currentPage="auswertung"
      />

      {/* Export Actions */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Formular-Auswertung</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Date Range Filter */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Letzte 7 Tage</option>
              <option value="30d">Letzte 30 Tage</option>
              <option value="90d">Letzte 90 Tage</option>
              <option value="all">Gesamter Zeitraum</option>
            </select>

            <button
              onClick={exportSubmissions}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gesamte Eingaben</p>
                <p className="text-2xl font-semibold text-gray-900">{totalSubmissions}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Durchschnitt/Tag</p>
                <p className="text-2xl font-semibold text-gray-900">{averageDaily.toFixed(1)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Formular-Status</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {form.is_active ? (
                    <span className="text-green-600">Aktiv</span>
                  ) : (
                    <span className="text-red-600">Inaktiv</span>
                  )}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Formular-Typ</p>
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {form.form_type.replace('_', ' ')}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Submissions Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Eingaben pro Tag</h3>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            
            {dailyData.length > 0 ? (
              <div className="space-y-2">
                {dailyData.slice(-10).map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString('de-DE')}
                    </span>
                    <div className="flex items-center gap-2 flex-1 mx-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ 
                            width: `${Math.max(10, (day.count / Math.max(...dailyData.map(d => d.count))) * 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-right">
                        {day.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Noch keine Daten für diesen Zeitraum</p>
              </div>
            )}
          </div>

          {/* Form Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Formular-Details</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Erstellt am:</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(form.created_at).toLocaleDateString('de-DE')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Letzte Änderung:</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(form.updated_at).toLocaleDateString('de-DE')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Multi-Step:</span>
                <span className="text-sm font-medium text-gray-900">
                  {form.is_multi_step ? 'Ja' : 'Nein'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Auto-Lead Erstellung:</span>
                <span className="text-sm font-medium text-gray-900">
                  {form.auto_lead_creation ? 'Aktiv' : 'Inaktiv'}
                </span>
              </div>
              
              {form.notification_email && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Benachrichtigung:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {form.notification_email}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Letzte Eingaben</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter className="w-4 h-4" />
                {filteredSubmissions.length} von {submissions.length} Eingaben
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {filteredSubmissions.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Eingegangen am
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP-Adresse
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead erstellt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubmissions.slice(0, 20).map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {submission.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(submission.created_at).toLocaleString('de-DE')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.ip_address || 'Unbekannt'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {submission.lead_id ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Ja
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Nein
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          onClick={() => {
                            console.log('Submission data:', submission.submission_data)
                            alert('Submission Details:\n\n' + JSON.stringify(submission.submission_data, null, 2))
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Anzeigen
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Noch keine Eingaben</p>
                <p className="text-sm">
                  {dateRange === 'all' 
                    ? 'Dieses Formular hat noch keine Eingaben erhalten.'
                    : 'Keine Eingaben im gewählten Zeitraum.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 