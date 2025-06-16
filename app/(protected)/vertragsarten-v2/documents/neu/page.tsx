'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  FileText,
  Plus,
  Trash2,
  Eye,
  CheckSquare,
  PenTool,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import ContractsV2API from '../../../lib/api/contracts-v2';
import type { 
  DocumentFormData,
  ValidationResult 
} from '../../../lib/types/contracts-v2';

export default function NeuesDokumentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState<DocumentFormData>({
    name: '',
    description: '',
    show_payment_calendar: true,
    show_service_content: true,
    show_member_data: true,
    header_template: '',
    footer_template: '',
    css_styles: '',
    sections: [
      {
        title: 'Vertragsdetails',
        content: '<p>Hier werden die wichtigsten Vertragsdetails aufgeführt.</p>',
        is_mandatory: true,
        requires_signature: false,
        display_as_checkbox: false
      }
    ]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      // Basis-Validierung
      const validationErrors: string[] = [];
      
      if (!formData.name.trim()) {
        validationErrors.push('Name ist erforderlich');
      }
      
      if (formData.sections.length === 0) {
        validationErrors.push('Mindestens ein Abschnitt ist erforderlich');
      }
      
      formData.sections.forEach((section, index) => {
        if (!section.title.trim()) {
          validationErrors.push(`Abschnitt ${index + 1}: Titel ist erforderlich`);
        }
        if (!section.content.trim()) {
          validationErrors.push(`Abschnitt ${index + 1}: Inhalt ist erforderlich`);
        }
      });

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setLoading(false);
        return;
      }

      // Dokument erstellen
      const response = await ContractsV2API.createDocument(formData);
      
      if (response.error) {
        setErrors([response.error]);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/vertragsarten-v2');
        }, 1500);
      }
    } catch (error) {
      setErrors(['Ein unerwarteter Fehler ist aufgetreten']);
    } finally {
      setLoading(false);
    }
  };

  const addSection = () => {
    setFormData(prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          title: '',
          content: '',
          is_mandatory: false,
          requires_signature: false,
          display_as_checkbox: false
        }
      ]
    }));
  };

  const removeSection = (index: number) => {
    if (formData.sections.length > 1) {
      setFormData(prev => ({
        ...prev,
        sections: prev.sections.filter((_, i) => i !== index)
      }));
    }
  };

  const updateSection = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }));
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dokument erstellt!</h2>
          <p className="text-gray-600">Sie werden automatisch weitergeleitet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/vertragsarten-v2"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Neues Dokument</h1>
              <p className="text-gray-600">Erstellen Sie eine neue Dokumentenvorlage</p>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="text-red-600" size={20} />
              <h3 className="font-medium text-red-800">Fehler beim Speichern</h3>
            </div>
            <ul className="text-red-700 text-sm space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Basis-Informationen */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} />
              Dokument-Informationen
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="z.B. Standard Mitgliedsvertrag"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beschreibung
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Beschreibung des Dokuments..."
                />
              </div>
            </div>
          </div>

          {/* Anzeige-Optionen */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Anzeige-Optionen</h2>
            
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.show_payment_calendar}
                  onChange={(e) => setFormData(prev => ({ ...prev, show_payment_calendar: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Zahlungskalender anzeigen</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.show_service_content}
                  onChange={(e) => setFormData(prev => ({ ...prev, show_service_content: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Leistungsinhalt anzeigen</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.show_member_data}
                  onChange={(e) => setFormData(prev => ({ ...prev, show_member_data: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Mitgliederdaten anzeigen</span>
              </label>
            </div>
          </div>

          {/* Abschnitte */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Dokument-Abschnitte</h2>
              <button
                type="button"
                onClick={addSection}
                className="bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                Abschnitt hinzufügen
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.sections.map((section, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">Abschnitt {index + 1}</h3>
                    {formData.sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSection(index)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Titel *
                      </label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSection(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="z.B. Allgemeine Geschäftsbedingungen"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Inhalt *
                      </label>
                      <textarea
                        value={section.content}
                        onChange={(e) => updateSection(index, 'content', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="HTML-Inhalt des Abschnitts..."
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        HTML wird unterstützt. Verwenden Sie z.B. &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt; für Formatierung.
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={section.is_mandatory}
                          onChange={(e) => updateSection(index, 'is_mandatory', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 flex items-center gap-1">
                          <CheckSquare size={14} />
                          Pflichtabschnitt
                        </span>
                      </label>
                      
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={section.requires_signature}
                          onChange={(e) => updateSection(index, 'requires_signature', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 flex items-center gap-1">
                          <PenTool size={14} />
                          Unterschrift erforderlich
                        </span>
                      </label>
                      
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={section.display_as_checkbox}
                          onChange={(e) => updateSection(index, 'display_as_checkbox', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 flex items-center gap-1">
                          <CheckSquare size={14} />
                          Als Checkbox anzeigen
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Templates */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Template-Einstellungen</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kopfzeile-Template
                </label>
                <textarea
                  value={formData.header_template}
                  onChange={(e) => setFormData(prev => ({ ...prev, header_template: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="HTML für Dokumentenkopf..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fußzeile-Template
                </label>
                <textarea
                  value={formData.footer_template}
                  onChange={(e) => setFormData(prev => ({ ...prev, footer_template: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="HTML für Dokumentenfuß..."
                />
              </div>
            </div>
          </div>

          {/* Vorschau */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Eye size={20} />
              Vorschau
            </h2>
            
            <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
              <div className="prose max-w-none">
                <h1 className="text-xl font-bold mb-4">{formData.name || 'Dokumentname'}</h1>
                
                {formData.description && (
                  <p className="text-gray-600 mb-4">{formData.description}</p>
                )}
                
                {formData.sections.map((section, index) => (
                  <div key={index} className="mb-6">
                    <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      {section.title || `Abschnitt ${index + 1}`}
                      {section.is_mandatory && (
                        <span className="text-red-500 text-sm">(Pflicht)</span>
                      )}
                      {section.requires_signature && (
                        <PenTool size={16} className="text-blue-500" />
                      )}
                    </h2>
                    
                    {section.display_as_checkbox ? (
                      <label className="flex items-center gap-2 p-2 border rounded">
                        <input type="checkbox" className="w-4 h-4" />
                        <span className="text-sm">Ich stimme zu</span>
                      </label>
                    ) : (
                      <div 
                        className="text-sm"
                        dangerouslySetInnerHTML={{ __html: section.content || 'Inhalt...' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between bg-white rounded-lg shadow p-6">
            <Link
              href="/vertragsarten-v2"
              className="text-gray-600 hover:text-gray-800"
            >
              Abbrechen
            </Link>
            
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Speichern...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Dokument erstellen
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}