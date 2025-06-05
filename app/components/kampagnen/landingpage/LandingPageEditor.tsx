'use client';

import React, { useState } from 'react';
import { X, RotateCw, Layout, Image, Type, MessageSquare } from 'lucide-react';

interface LandingPage {
  id: string;
  campaign_id: string;
  url_slug: string;
  template_type: string;
  headline: string;
  content: any;
  is_published: boolean;
  visits: number;
  conversions: number;
  created_at: string;
  updated_at: string;
}

interface LandingPageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  landingPage: LandingPage | null;
  onSave: (landingPage: Partial<LandingPage>) => Promise<void>;
}

export default function LandingPageEditor({ 
  isOpen, 
  onClose, 
  campaignId, 
  landingPage, 
  onSave 
}: LandingPageEditorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    landingPage?.template_type || 'angebot'
  );
  const [headline, setHeadline] = useState<string>(
    landingPage?.headline || ''
  );
  const [content, setContent] = useState<any>(
    landingPage?.content || {
      subheadline: '',
      cta_text: 'Jetzt anmelden',
      cta_color: '#3B82F6',
      primary_image: '',
      description: '',
      testimonials: [],
      form_title: 'Interesse? Kontaktieren Sie uns!',
      form_fields: ['name', 'email', 'phone']
    }
  );
  const [loading, setLoading] = useState(false);

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
  };

  const handleHeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeadline(e.target.value);
  };

  const handleContentChange = (field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave({
        template_type: selectedTemplate,
        headline,
        content
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {landingPage ? 'Landingpage bearbeiten' : 'Neue Landingpage erstellen'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template auswählen
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div 
                className={`border rounded-lg p-4 text-center cursor-pointer ${
                  selectedTemplate === 'angebot' 
                    ? 'bg-blue-50 border-blue-500' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleTemplateChange('angebot')}
              >
                <div className="flex justify-center mb-2">
                  <Layout className="h-8 w-8 text-blue-500" />
                </div>
                <h4 className="font-medium">Angebot</h4>
                <p className="text-xs text-gray-500 mt-1">Präsentiert ein spezielles Angebot oder Rabatt</p>
              </div>
              
              <div 
                className={`border rounded-lg p-4 text-center cursor-pointer ${
                  selectedTemplate === 'emotion' 
                    ? 'bg-blue-50 border-blue-500' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleTemplateChange('emotion')}
              >
                <div className="flex justify-center mb-2">
                  <Image className="h-8 w-8 text-blue-500" />
                </div>
                <h4 className="font-medium">Emotion</h4>
                <p className="text-xs text-gray-500 mt-1">Emotionale Bilder und kurze Text-Botschaften</p>
              </div>
              
              <div 
                className={`border rounded-lg p-4 text-center cursor-pointer ${
                  selectedTemplate === 'testimonial' 
                    ? 'bg-blue-50 border-blue-500' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleTemplateChange('testimonial')}
              >
                <div className="flex justify-center mb-2">
                  <MessageSquare className="h-8 w-8 text-blue-500" />
                </div>
                <h4 className="font-medium">Testimonial</h4>
                <p className="text-xs text-gray-500 mt-1">Zeigt Kundenstimmen und Erfahrungsberichte</p>
              </div>
              
              <div 
                className={`border rounded-lg p-4 text-center cursor-pointer ${
                  selectedTemplate === 'vergleich' 
                    ? 'bg-blue-50 border-blue-500' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleTemplateChange('vergleich')}
              >
                <div className="flex justify-center mb-2">
                  <Type className="h-8 w-8 text-blue-500" />
                </div>
                <h4 className="font-medium">Vergleich</h4>
                <p className="text-xs text-gray-500 mt-1">Vergleicht verschiedene Optionen oder Angebote</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Headline
            </label>
            <input
              type="text"
              value={headline}
              onChange={handleHeadlineChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="z.B. 'Jetzt Fitness-Mitglied werden und 2 Monate sparen!'"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unterüberschrift
            </label>
            <input
              type="text"
              value={content.subheadline || ''}
              onChange={(e) => handleContentChange('subheadline', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="z.B. 'Unser limitiertes Sonderangebot für Neukunden'"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Beschreibung
            </label>
            <textarea
              value={content.description || ''}
              onChange={(e) => handleContentChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Beschreiben Sie Ihr Angebot detaillierter..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Call-to-Action Text
              </label>
              <input
                type="text"
                value={content.cta_text || 'Jetzt anmelden'}
                onChange={(e) => handleContentChange('cta_text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. 'Jetzt anmelden'"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Call-to-Action Farbe
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={content.cta_color || '#3B82F6'}
                  onChange={(e) => handleContentChange('cta_color', e.target.value)}
                  className="h-10 w-10 border-0 p-0"
                />
                <input
                  type="text"
                  value={content.cta_color || '#3B82F6'}
                  onChange={(e) => handleContentChange('cta_color', e.target.value)}
                  className="ml-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bild-URL
            </label>
            <input
              type="text"
              value={content.primary_image || ''}
              onChange={(e) => handleContentChange('primary_image', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
            <p className="mt-1 text-xs text-gray-500">
              Geben Sie die URL eines Bildes ein oder laden Sie ein Bild in der MediaLibrary hoch
            </p>
          </div>

          {selectedTemplate === 'testimonial' && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Testimonials / Erfahrungsberichte
                </label>
                <button
                  type="button"
                  className="text-xs text-blue-600"
                  onClick={() => {
                    const testimonials = content.testimonials || [];
                    handleContentChange('testimonials', [
                      ...testimonials,
                      { name: '', text: '', position: '' }
                    ]);
                  }}
                >
                  + Testimonial hinzufügen
                </button>
              </div>
              
              {(content.testimonials || []).map((testimonial: any, index: number) => (
                <div key={index} className="mb-4 p-3 border border-gray-200 rounded-md">
                  <div className="flex justify-between">
                    <h5 className="text-sm font-medium">Testimonial #{index + 1}</h5>
                    <button
                      type="button"
                      className="text-xs text-red-600"
                      onClick={() => {
                        const testimonials = [...content.testimonials];
                        testimonials.splice(index, 1);
                        handleContentChange('testimonials', testimonials);
                      }}
                    >
                      Entfernen
                    </button>
                  </div>
                  
                  <div className="mt-2 space-y-2">
                    <input
                      type="text"
                      value={testimonial.name}
                      onChange={(e) => {
                        const testimonials = [...content.testimonials];
                        testimonials[index].name = e.target.value;
                        handleContentChange('testimonials', testimonials);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Name"
                    />
                    
                    <input
                      type="text"
                      value={testimonial.position}
                      onChange={(e) => {
                        const testimonials = [...content.testimonials];
                        testimonials[index].position = e.target.value;
                        handleContentChange('testimonials', testimonials);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Position (z.B. 'Mitglied seit 2021')"
                    />
                    
                    <textarea
                      value={testimonial.text}
                      onChange={(e) => {
                        const testimonials = [...content.testimonials];
                        testimonials[index].text = e.target.value;
                        handleContentChange('testimonials', testimonials);
                      }}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Erfahrungsbericht"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mt-6">
            <h4 className="font-medium text-blue-800 mb-2">Formular-Einstellungen</h4>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Formular-Titel
              </label>
              <input
                type="text"
                value={content.form_title || 'Interesse? Kontaktieren Sie uns!'}
                onChange={(e) => handleContentChange('form_title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Formularfelder
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(content.form_fields || []).includes('name')}
                    onChange={(e) => {
                      const fields = [...(content.form_fields || [])];
                      if (e.target.checked) {
                        if (!fields.includes('name')) fields.push('name');
                      } else {
                        const index = fields.indexOf('name');
                        if (index > -1) fields.splice(index, 1);
                      }
                      handleContentChange('form_fields', fields);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Name (Pflichtfeld)</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(content.form_fields || []).includes('email')}
                    onChange={(e) => {
                      const fields = [...(content.form_fields || [])];
                      if (e.target.checked) {
                        if (!fields.includes('email')) fields.push('email');
                      } else {
                        const index = fields.indexOf('email');
                        if (index > -1) fields.splice(index, 1);
                      }
                      handleContentChange('form_fields', fields);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">E-Mail (Pflichtfeld)</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(content.form_fields || []).includes('phone')}
                    onChange={(e) => {
                      const fields = [...(content.form_fields || [])];
                      if (e.target.checked) {
                        if (!fields.includes('phone')) fields.push('phone');
                      } else {
                        const index = fields.indexOf('phone');
                        if (index > -1) fields.splice(index, 1);
                      }
                      handleContentChange('form_fields', fields);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Telefon</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(content.form_fields || []).includes('message')}
                    onChange={(e) => {
                      const fields = [...(content.form_fields || [])];
                      if (e.target.checked) {
                        if (!fields.includes('message')) fields.push('message');
                      } else {
                        const index = fields.indexOf('message');
                        if (index > -1) fields.splice(index, 1);
                      }
                      handleContentChange('form_fields', fields);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Nachricht</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
            disabled={loading}
          >
            Abbrechen
          </button>
          
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
            disabled={loading || !headline || !selectedTemplate}
          >
            {loading ? (
              <>
                <RotateCw size={18} className="animate-spin" />
                Speichern...
              </>
            ) : (
              'Speichern'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 