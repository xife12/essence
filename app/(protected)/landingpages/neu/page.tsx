'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Zap, Layout, Globe, FileText, Check, Info, X, Eye } from 'lucide-react';
import supabase from '../../../lib/supabaseClient';

interface Campaign {
  id: string;
  name: string;
}

interface CITemplate {
  id: string;
  name: string;
  primary_color: string;
}

interface PageTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preview_image_id?: string;
}

interface DesignTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  features: string[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

type StepType = 'basic' | 'template' | 'design' | 'review';

export default function NewLandingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<StepType>('basic');
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [ciTemplates, setCITemplates] = useState<CITemplate[]>([]);
  const [pageTemplates, setPageTemplates] = useState<PageTemplate[]>([]);
  const [showTemplatePreview, setShowTemplatePreview] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    headline: '',
    subheadline: '',
    description: '',
    campaign_id: '',
    ci_template_id: '',
    page_template_id: '',
    design_template: 'modern',
    form_enabled: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Design Templates with detailed information
  const designTemplates: DesignTemplate[] = [
    {
      id: 'modern',
      name: 'Modern',
      description: 'Zeitgemäßes Design mit klaren Linien und großzügigen Abständen',
      preview: 'Große Headlines, viel Weißraum, runde Buttons, sanfte Schatten',
      features: ['Große Schriftarten (3.5rem Headlines)', 'Großzügige Abstände (6rem Padding)', 'Runde Ecken (12px Border Radius)', 'Sanfte Übergänge', 'Minimale Schatten'],
      colors: { primary: '#3B82F6', secondary: '#1E40AF', accent: '#06B6D4' }
    },
    {
      id: 'classic',
      name: 'Classic',
      description: 'Traditionelles, vertrauensvolles Design mit ausgewogenen Proportionen',
      preview: 'Ausgewogene Headlines, traditionelle Abstände, rechteckige Buttons',
      features: ['Klassische Schriftgrößen (2.5rem Headlines)', 'Traditionelle Abstände (4rem Padding)', 'Leichte Rundungen (6px Border Radius)', 'Subtile Übergänge', 'Dezente Rahmen'],
      colors: { primary: '#374151', secondary: '#6B7280', accent: '#10B981' }
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Reduziertes Design mit Fokus auf Inhalt und maximaler Klarheit',
      preview: 'Kleine Headlines, minimale Abstände, einfache Buttons, keine Schatten',
      features: ['Reduzierte Schriftgrößen (2rem Headlines)', 'Kompakte Abstände (2rem Padding)', 'Keine Rundungen (0px Border Radius)', 'Keine Übergänge', 'Nur Linien, keine Schatten'],
      colors: { primary: '#000000', secondary: '#6B7280', accent: '#EF4444' }
    },
    {
      id: 'bold',
      name: 'Bold',
      description: 'Auffälliges Design mit starken Kontrasten und großen Elementen',
      preview: 'Extra große Headlines, intensive Farben, markante Buttons',
      features: ['Sehr große Schriftarten (5rem Headlines)', 'Extreme Abstände (8rem Padding)', 'Starke Rundungen (20px Border Radius)', 'Schnelle Übergänge', 'Starke Schatten'],
      colors: { primary: '#DC2626', secondary: '#7C2D12', accent: '#F59E0B' }
    }
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load campaigns
      const { data: campaignsData } = await supabase
        .from('campaigns')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      // Load CI templates
      const { data: ciData } = await supabase
        .from('ci_templates')
        .select('id, name, primary_color')
        .order('name');

      // Load page templates
      const { data: templatesData } = await supabase
        .from('page_templates')
        .select('id, name, description, category, preview_image_id')
        .eq('is_system', true)
        .order('category, name');

      setCampaigns(campaignsData || []);
      setCITemplates(ciData || []);
      setPageTemplates(templatesData || []);
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from title
    if (field === 'title' && typeof value === 'string') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({
        ...prev,
        slug
      }));
    }

    // Clear errors
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateStep = (step: StepType): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 'basic') {
      if (!formData.title.trim()) {
        newErrors.title = 'Titel ist erforderlich';
      }
      if (!formData.slug.trim()) {
        newErrors.slug = 'URL-Slug ist erforderlich';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    const steps: StepType[] = ['basic', 'template', 'design', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const steps: StepType[] = ['basic', 'template', 'design', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      console.log('Creating landingpage with data:', formData);
      
      // Prepare data for insert
      const insertData = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        headline: formData.headline?.trim() || null,
        subheadline: formData.subheadline?.trim() || null,
        description: formData.description?.trim() || null,
        campaign_id: formData.campaign_id || null,
        ci_template_id: formData.ci_template_id || null,
        page_template_id: formData.page_template_id || null,
        design_template: formData.design_template || 'modern',
        form_enabled: Boolean(formData.form_enabled),
        is_active: false
      };

      console.log('Insert data:', insertData);

      const { data, error } = await supabase
        .from('landingpage')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Created landingpage:', data);

      // If template selected, apply template blocks
      if (formData.page_template_id) {
        // TODO: Apply template blocks
        console.log('Applying template blocks...');
      }

      router.push(`/landingpages/${data.id}/builder`);
    } catch (error: any) {
      console.error('Fehler beim Erstellen der Landingpage:', error);
      
      // Better error message
      let errorMessage = 'Fehler beim Erstellen der Landingpage';
      if (error?.message) {
        errorMessage += ': ' + error.message;
      }
      if (error?.code) {
        errorMessage += ' (Code: ' + error.code + ')';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 'basic', title: 'Grundlagen', description: 'Titel und grundlegende Informationen' },
    { id: 'template', title: 'Vorlage', description: 'Wählen Sie eine Vorlage (optional)' },
    { id: 'design', title: 'Design', description: 'Design-Template und CI-Template' },
    { id: 'review', title: 'Überprüfung', description: 'Einstellungen überprüfen und erstellen' }
  ];

  const TemplatePreviewModal = ({ templateId }: { templateId: string }) => {
    const template = designTemplates.find(t => t.id === templateId);
    if (!template) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {template.name} Design Template
              </h3>
              <button
                onClick={() => setShowTemplatePreview(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Visual Preview */}
            <div className="mb-6 border rounded-lg overflow-hidden">
              <div className="bg-gray-100 p-4 text-center text-sm text-gray-600">
                Live Preview - {template.name} Template
              </div>
              <div 
                className="p-8 text-center"
                style={{ 
                  backgroundColor: template.colors.primary + '10',
                  borderColor: template.colors.primary
                }}
              >
                <h1 
                  className={`font-bold mb-4 ${
                    template.id === 'bold' ? 'text-5xl' : 
                    template.id === 'modern' ? 'text-4xl' : 
                    template.id === 'minimal' ? 'text-2xl' : 'text-3xl'
                  }`}
                  style={{ color: template.colors.primary }}
                >
                  Willkommen
                </h1>
                <p className="text-gray-600 mb-6">
                  {template.preview}
                </p>
                <button
                  className={`px-6 py-3 text-white font-semibold ${
                    template.id === 'modern' ? 'rounded-lg' :
                    template.id === 'classic' ? 'rounded-md' :
                    template.id === 'minimal' ? 'rounded-none' : 'rounded-xl'
                  }`}
                  style={{ backgroundColor: template.colors.accent }}
                >
                  Beispiel Button
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Beschreibung</h4>
              <p className="text-gray-600">{template.description}</p>
            </div>

            {/* Features */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Eigenschaften</h4>
              <ul className="space-y-2">
                {template.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Color Palette */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Standard-Farbpalette</h4>
              <div className="flex gap-4">
                <div className="text-center">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-gray-200 mb-2"
                    style={{ backgroundColor: template.colors.primary }}
                  ></div>
                  <span className="text-xs text-gray-600">Primär</span>
                </div>
                <div className="text-center">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-gray-200 mb-2"
                    style={{ backgroundColor: template.colors.secondary }}
                  ></div>
                  <span className="text-xs text-gray-600">Sekundär</span>
                </div>
                <div className="text-center">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-gray-200 mb-2"
                    style={{ backgroundColor: template.colors.accent }}
                  ></div>
                  <span className="text-xs text-gray-600">Akzent</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * Farben werden durch CI-Template überschrieben, falls ausgewählt
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  handleInputChange('design_template', template.id);
                  setShowTemplatePreview(null);
                }}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Template auswählen
              </button>
              <button
                onClick={() => setShowTemplatePreview(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titel *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="z.B. Willkommen bei FitnessStudio Pro"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL-Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.slug ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="willkommen-fitnessstudio-pro"
              />
              {errors.slug && (
                <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
              )}
              <p className="text-gray-600 text-sm mt-1">
                URL: https://yourdomain.com/landingpages/{formData.slug}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hauptüberschrift
              </label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => handleInputChange('headline', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Willkommen in Ihrem neuen Fitnessstudio"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unterüberschrift
              </label>
              <input
                type="text"
                value={formData.subheadline}
                onChange={(e) => handleInputChange('subheadline', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ihre Fitness-Reise beginnt hier"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beschreibung
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Beschreiben Sie das Angebot und die Ziele dieser Landingpage..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kampagne zuordnen (optional)
              </label>
              <select
                value={formData.campaign_id}
                onChange={(e) => handleInputChange('campaign_id', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Keine Kampagne</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'template':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Vorlage auswählen (optional)</h3>
              <p className="text-gray-600 mb-6">
                Starten Sie mit einer vorgefertigten Vorlage oder beginnen Sie mit einer leeren Seite.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Empty template */}
              <div
                onClick={() => handleInputChange('page_template_id', '')}
                className={`p-6 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.page_template_id === ''
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <Plus size={32} className="text-gray-400" />
                  </div>
                  <h4 className="font-semibold">Leere Seite</h4>
                  <p className="text-sm text-gray-600 mt-2">
                    Beginnen Sie mit einer komplett leeren Landingpage
                  </p>
                </div>
              </div>

              {/* Template options */}
              {pageTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleInputChange('page_template_id', template.id)}
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.page_template_id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col text-center">
                    <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                      <Layout size={32} className="text-gray-400" />
                    </div>
                    <h4 className="font-semibold">{template.name}</h4>
                    <p className="text-sm text-gray-600 mt-2">{template.description}</p>
                    <span className="text-xs text-blue-600 mt-2 font-medium">
                      {template.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'design':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Design & Styling</h3>
              <p className="text-gray-600 mb-6">
                Wählen Sie zuerst das grundlegende Design-Template und dann optional ein CI-Template für Ihre Markenidentität.
              </p>
            </div>

            {/* Design Template Selection */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Design Template *
                </label>
                <div className="relative group">
                  <Info size={16} className="text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    Grundlegendes Layout & Styling-Framework
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {designTemplates.map((template) => (
                  <div key={template.id} className="relative">
                    <button
                      onClick={() => handleInputChange('design_template', template.id)}
                      className={`w-full p-4 border-2 rounded-lg text-center transition-colors ${
                        formData.design_template === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div 
                        className={`w-12 h-12 rounded-lg mx-auto mb-2 ${
                          template.id === 'modern' ? 'rounded-lg' :
                          template.id === 'classic' ? 'rounded-md' :
                          template.id === 'minimal' ? 'rounded-none' : 'rounded-xl'
                        }`}
                        style={{ backgroundColor: template.colors.primary }}
                      ></div>
                      <span className="text-sm font-medium">{template.name}</span>
                    </button>
                    
                    {/* Info Icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTemplatePreview(template.id);
                      }}
                      className="absolute top-2 right-2 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                      title="Beispiel anzeigen"
                    >
                      <Eye size={12} className="text-gray-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* CI Template Selection */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  CI-Template (optional)
                </label>
                <div className="relative group">
                  <Info size={16} className="text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    Marken-spezifische Farben, Schriften & Assets
                  </div>
                </div>
              </div>
              <select
                value={formData.ci_template_id}
                onChange={(e) => handleInputChange('ci_template_id', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Standard Design verwenden</option>
                {ciTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-600 mt-2">
                Das CI-Template überschreibt Farben und Schriften des Design-Templates mit Ihren Markenfarben.
              </p>
            </div>

            {/* Form Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="font-medium text-gray-900">Formulare aktivieren</label>
                <p className="text-sm text-gray-600">Lead-Erfassung über integrierte Formulare</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.form_enabled}
                  onChange={(e) => handleInputChange('form_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Überprüfung & Erstellung</h3>
              <p className="text-gray-600 mb-6">
                Überprüfen Sie Ihre Einstellungen und erstellen Sie die Landingpage.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="font-medium">Titel:</span>
                <span>{formData.title}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="font-medium">URL:</span>
                <span className="text-blue-600">https://yourdomain.com/landingpages/{formData.slug}</span>
              </div>
              {formData.headline && (
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="font-medium">Überschrift:</span>
                  <span>{formData.headline}</span>
                </div>
              )}
              {formData.campaign_id && (
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="font-medium">Kampagne:</span>
                  <span>{campaigns.find(c => c.id === formData.campaign_id)?.name}</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="font-medium">Template:</span>
                <span>
                  {formData.page_template_id
                    ? pageTemplates.find(t => t.id === formData.page_template_id)?.name
                    : 'Leere Seite'
                  }
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="font-medium">Design:</span>
                <span className="capitalize">
                  {designTemplates.find(t => t.id === formData.design_template)?.name || formData.design_template}
                </span>
              </div>
              {formData.ci_template_id && (
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="font-medium">CI-Template:</span>
                  <span>{ciTemplates.find(t => t.id === formData.ci_template_id)?.name}</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="font-medium">Formulare:</span>
                <span>{formData.form_enabled ? 'Aktiviert' : 'Deaktiviert'}</span>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Zap className="text-blue-600" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900">Nächste Schritte</h4>
                  <p className="text-blue-700 text-sm mt-1">
                    Nach der Erstellung können Sie Inhalte hinzufügen, das Design anpassen und die Landingpage veröffentlichen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              Zurück
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Neue Landingpage erstellen</h1>
              <p className="text-gray-600">Schritt {steps.findIndex(s => s.id === currentStep) + 1} von {steps.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {isCompleted ? <Check size={16} /> : index + 1}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-px ml-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 'basic'}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Zurück
          </button>
          
          {currentStep === 'review' ? (
            <button
              onClick={handleCreate}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Erstelle...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Landingpage erstellen
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Weiter
            </button>
          )}
        </div>
      </div>

      {/* Template Preview Modal */}
      {showTemplatePreview && (
        <TemplatePreviewModal templateId={showTemplatePreview} />
      )}
    </div>
  );
} 