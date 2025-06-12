'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, Eye, Globe, Share2, QrCode, BarChart3, Palette, Mail, Shield, ArrowLeft } from 'lucide-react';
import supabase from '../../../../lib/supabaseClient';

interface LandingPage {
  id: string;
  title: string;
  slug: string;
  headline?: string;
  subheadline?: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  og_image_id?: string;
  design_template?: string;
  typography_set?: string;
  container_width?: string;
  background_config?: Record<string, any>;
  is_active: boolean;
  tracking_pixel_id?: string;
  campaign_id?: string;
  ci_template_id?: string;
  form_enabled: boolean;
  form_target_table?: string;
  redirect_url?: string;
  qr_code_url?: string;
  created_at: string;
  updated_at: string;
}

type SettingsTab = 'general' | 'seo' | 'design' | 'publishing' | 'analytics';

export default function LandingPageSettings() {
  const params = useParams();
  const router = useRouter();
  const landingPageId = params.id as string;
  
  const [landingPage, setLandingPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [hasChanges, setHasChanges] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    headline: '',
    subheadline: '',
    description: '',
    meta_title: '',
    meta_description: '',
    design_template: 'modern',
    typography_set: 'inter',
    container_width: '1200px',
    is_active: false,
    form_enabled: false,
    redirect_url: '',
    tracking_pixel_id: '',
    background_config: {
      type: 'solid',
      color: '#ffffff'
    }
  });

  useEffect(() => {
    loadLandingPage();
  }, [landingPageId]);

  const loadLandingPage = async () => {
    try {
      const { data, error } = await supabase
        .from('landingpage')
        .select('*')
        .eq('id', landingPageId)
        .single();

      if (error) throw error;

      setLandingPage(data);
      setFormData({
        title: data.title || '',
        slug: data.slug || '',
        headline: data.headline || '',
        subheadline: data.subheadline || '',
        description: data.description || '',
        meta_title: data.meta_title || '',
        meta_description: data.meta_description || '',
        design_template: data.design_template || 'modern',
        typography_set: data.typography_set || 'inter',
        container_width: data.container_width || '1200px',
        is_active: data.is_active,
        form_enabled: data.form_enabled,
        redirect_url: data.redirect_url || '',
        tracking_pixel_id: data.tracking_pixel_id || '',
        background_config: data.background_config || { type: 'solid', color: '#ffffff' }
      });
    } catch (error) {
      console.error('Fehler beim Laden der Landingpage:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('landingpage')
        .update({
          title: formData.title,
          slug: formData.slug,
          headline: formData.headline,
          subheadline: formData.subheadline,
          description: formData.description,
          meta_title: formData.meta_title,
          meta_description: formData.meta_description,
          design_template: formData.design_template,
          typography_set: formData.typography_set,
          container_width: formData.container_width,
          is_active: formData.is_active,
          form_enabled: formData.form_enabled,
          redirect_url: formData.redirect_url,
          tracking_pixel_id: formData.tracking_pixel_id,
          background_config: formData.background_config,
          updated_at: new Date().toISOString()
        })
        .eq('id', landingPageId);

      if (error) throw error;

      setHasChanges(false);
      await loadLandingPage();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Fehler beim Speichern der Einstellungen');
    } finally {
      setSaving(false);
    }
  };

  const generateQRCode = async () => {
    try {
      // Hier würde die QR-Code-Generierung implementiert
      alert('QR-Code-Generierung wird implementiert');
    } catch (error) {
      console.error('Fehler beim Generieren des QR-Codes:', error);
    }
  };

  const tabs = [
    { id: 'general', label: 'Allgemein', icon: Globe },
    { id: 'seo', label: 'SEO & Meta', icon: BarChart3 },
    { id: 'design', label: 'Design & Layout', icon: Palette },
    { id: 'publishing', label: 'Veröffentlichung', icon: Share2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Einstellungen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            Zurück
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Landingpage Einstellungen</h1>
            <p className="text-gray-600">{landingPage?.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/landingpages/${landingPageId}/vorschau`)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Eye size={16} />
            Vorschau
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {saving ? 'Speichert...' : 'Speichern'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Grundeinstellungen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titel *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Landingpage Titel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL-Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="url-slug"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hauptüberschrift
                </label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => handleInputChange('headline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Willkommen in unserem Studio"
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unterüberschrift
                </label>
                <input
                  type="text"
                  value={formData.subheadline}
                  onChange={(e) => handleInputChange('subheadline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ihre Fitness-Reise beginnt hier"
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beschreibung
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Beschreiben Sie Ihr Angebot..."
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Status & Funktionen</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-gray-900">Landingpage aktiv</label>
                    <p className="text-sm text-gray-600">Ist die Landingpage öffentlich verfügbar?</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-gray-900">Formular aktiviert</label>
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
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">SEO & Meta-Tags</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => handleInputChange('meta_title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="SEO-optimierter Titel für Suchmaschinen"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Empfohlen: 50-60 Zeichen ({formData.meta_title.length}/60)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={formData.meta_description}
                    onChange={(e) => handleInputChange('meta_description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Beschreibung für Suchmaschinen-Snippets"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Empfohlen: 150-160 Zeichen ({formData.meta_description.length}/160)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Social Media</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Open Graph Bild
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <p className="text-gray-600">Bild für Social Media Shares (1200x630px empfohlen)</p>
                    <button className="mt-2 px-4 py-2 text-blue-600 hover:text-blue-700">
                      Bild auswählen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Design Tab */}
        {activeTab === 'design' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Layout & Design</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Design Template
                  </label>
                  <select
                    value={formData.design_template}
                    onChange={(e) => handleInputChange('design_template', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="modern">Modern</option>
                    <option value="classic">Classic</option>
                    <option value="minimal">Minimal</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schriftart
                  </label>
                  <select
                    value={formData.typography_set}
                    onChange={(e) => handleInputChange('typography_set', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="inter">Inter</option>
                    <option value="roboto">Roboto</option>
                    <option value="open-sans">Open Sans</option>
                    <option value="poppins">Poppins</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Container Breite
                  </label>
                  <select
                    value={formData.container_width}
                    onChange={(e) => handleInputChange('container_width', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="1200px">Standard (1200px)</option>
                    <option value="1400px">Breit (1400px)</option>
                    <option value="full">Vollbreite</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Hintergrund</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hintergrund Typ
                  </label>
                  <select
                    value={formData.background_config.type}
                    onChange={(e) => handleInputChange('background_config', {
                      ...formData.background_config,
                      type: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="solid">Einfarbig</option>
                    <option value="gradient">Verlauf</option>
                    <option value="image">Bild</option>
                  </select>
                </div>

                {formData.background_config.type === 'solid' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hintergrundfarbe
                    </label>
                    <input
                      type="color"
                      value={formData.background_config.color}
                      onChange={(e) => handleInputChange('background_config', {
                        ...formData.background_config,
                        color: e.target.value
                      })}
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Publishing Tab */}
        {activeTab === 'publishing' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Veröffentlichung</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Landingpage URL</h4>
                    <p className="text-sm text-gray-600">
                      https://yourdomain.com/landingpages/{formData.slug}
                    </p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-white">
                    <Share2 size={16} />
                    Kopieren
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weiterleitung nach Formular-Absendung
                  </label>
                  <input
                    type="url"
                    value={formData.redirect_url}
                    onChange={(e) => handleInputChange('redirect_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://yourdomain.com/danke"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">QR-Code</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">
                    QR-Code für einfaches Teilen der Landingpage
                  </p>
                </div>
                <button
                  onClick={generateQRCode}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <QrCode size={16} />
                  QR-Code generieren
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Tracking & Analytics</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tracking Pixel ID
                  </label>
                  <input
                    type="text"
                    value={formData.tracking_pixel_id}
                    onChange={(e) => handleInputChange('tracking_pixel_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Google Analytics, Facebook Pixel, etc."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">--</p>
                    <p className="text-sm text-gray-600">Seitenaufrufe</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">--</p>
                    <p className="text-sm text-gray-600">Konversionen</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">--%</p>
                    <p className="text-sm text-gray-600">Konversionsrate</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Performance</h3>
              <div className="space-y-4">
                <div className="text-center text-gray-600">
                  <BarChart3 size={48} className="mx-auto mb-4 text-gray-400" />
                  <p>Analytics-Dashboard wird implementiert</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Changes Bar */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-lg px-6 py-3 flex items-center gap-4">
          <p className="text-gray-700">Sie haben ungespeicherte Änderungen</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setFormData({
                  title: landingPage?.title || '',
                  slug: landingPage?.slug || '',
                  headline: landingPage?.headline || '',
                  subheadline: landingPage?.subheadline || '',
                  description: landingPage?.description || '',
                  meta_title: landingPage?.meta_title || '',
                  meta_description: landingPage?.meta_description || '',
                  design_template: landingPage?.design_template || 'modern',
                  typography_set: landingPage?.typography_set || 'inter',
                  container_width: landingPage?.container_width || '1200px',
                  is_active: landingPage?.is_active || false,
                  form_enabled: landingPage?.form_enabled || false,
                  redirect_url: landingPage?.redirect_url || '',
                  tracking_pixel_id: landingPage?.tracking_pixel_id || '',
                  background_config: landingPage?.background_config || { type: 'solid', color: '#ffffff' }
                });
                setHasChanges(false);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Verwerfen
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Speichert...' : 'Speichern'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 