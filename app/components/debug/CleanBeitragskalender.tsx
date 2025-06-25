'use client'

import { useState } from 'react'

interface CleanBeitragskalenderProps {
  memberId: string
}

export default function CleanBeitragskalender({ memberId }: CleanBeitragskalenderProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const cleanBeitragskalender = async () => {
    setLoading(true)
    setResult('')
    
    try {
      const response = await fetch('/api/clean-beitragskalender', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberId })
      })

      const data = await response.json()
      
      if (data.success) {
        if (data.analysis) {
          setResult(`📊 ${data.message}\n\n` +
            `Details:\n` +
            `- Gesamteinträge: ${data.analysis.totalEntries}\n` +
            `- Duplikate: ${data.analysis.duplicatesFound}\n` +
            (data.analysis.duplicateDetails.length > 0 ? 
              `- Duplikate am: ${data.analysis.duplicateDetails.map((d: any) => `${d.date} (${d.count}x)`).join(', ')}\n` : '') +
            `\n${data.analysis.note}`)
        } else {
          setResult(`✅ Erfolgreich bereinigt! ${data.entriesCreated} neue Einträge erstellt.`)
        }
      } else {
        setResult(`❌ Fehler: ${data.error}`)
      }
    } catch (error) {
      setResult(`❌ Netzwerk-Fehler: ${error instanceof Error ? error.message : 'Unbekannt'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">
        🧹 Beitragskalender bereinigen
      </h3>
      <p className="text-sm text-yellow-700 mb-3">
        Diese Funktion löscht alle doppelten Beitragskalender-Einträge und erstellt sie neu basierend auf den aktiven Mitgliedschaften.
      </p>
      <button
        onClick={cleanBeitragskalender}
        disabled={loading}
        className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
      >
        {loading ? 'Bereinige...' : 'Duplikate bereinigen'}
      </button>
      {result && (
        <div className="mt-3 p-2 bg-white rounded border">
          <pre className="text-sm">{result}</pre>
        </div>
      )}
    </div>
  )
} 