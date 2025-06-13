'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Smartphone, Tablet, Monitor } from 'lucide-react';
import supabase from '../../lib/supabaseClient';

interface LandingPage {
  id: string;
  title: string;
  slug: string;
  headline?: string;
  subheadline?: string;
  description?: string;
  is_active: boolean;
  blocks?: LandingPageBlock[];
}

interface LandingPageBlock {
  id: string;
  block_type: string;
  position: number;
  content_json: Record<string, any>;
  layout: string;
  preset: string;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export default function LandingPagePreview() {
  const params = useParams();
  const router = useRouter();
  const landingPageId = params.id as string;
  
  const [landingPage, setLandingPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDevice, setActiveDevice] = useState<DeviceType>('desktop');

  useEffect(() => {
    loadLandingPage();
  }, [landingPageId]);

  const loadLandingPage = async () => {
    try {
      const { data: landingPageData, error: pageError } = await supabase
        .from('landingpage')
        .select('*')
        .eq('id', landingPageId)
        .single();

      if (pageError) throw pageError;

      const { data: blocksData, error: blocksError } = await supabase
        .from('landingpage_block')
        .select('*')
        .eq('landingpage_id', landingPageId)
        .order('position', { ascending: true });

      if (blocksError) throw blocksError;

      setLandingPage({
        ...landingPageData,
        blocks: blocksData
      });
    } catch (error) {
      console.error('Fehler beim Laden der Landingpage:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceClass = () => {
    switch (activeDevice) {
      case 'mobile':
        return 'w-[375px] h-[812px]';
      case 'tablet':
        return 'w-[768px] h-[1024px]';
      case 'desktop':
      default:
        return 'w-full h-full min-h-[600px]';
    }
  };

  const getDeviceIcon = (device: DeviceType) => {
    switch (device) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      case 'desktop':
      default:
        return Monitor;
    }
  };

  const renderBlock = (block: LandingPageBlock) => {
    const content = block.content_json || {};
    
    switch (block.block_type) {
      case 'hero':
        return (
          <div key={block.id} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {content.title || landingPage?.headline || 'Willkommen'}
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                {content.subtitle || landingPage?.subheadline || 'Ihre Fitness-Reise beginnt hier'}
              </p>
              {content.cta_text && (
                <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
                  {content.cta_text}
                </button>
              )}
            </div>
          </div>
        );

      case 'text':
        return (
          <div key={block.id} className="py-12">
            <div className="container mx-auto px-4">
              {content.title && (
                <h2 className="text-3xl font-bold mb-6 text-center">{content.title}</h2>
              )}
              {content.text && (
                <div className="prose prose-lg mx-auto text-center">
                  <p>{content.text}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'image':
        return (
          <div key={block.id} className="py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                {content.image_url ? (
                  <img
                    src={content.image_url}
                    alt={content.alt_text || 'Bild'}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Bild-Placeholder</p>
                  </div>
                )}
                {content.caption && (
                  <p className="text-center text-gray-600 mt-4">{content.caption}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'button':
        return (
          <div key={block.id} className="py-8">
            <div className="container mx-auto px-4 text-center">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                {content.text || 'Button Text'}
              </button>
            </div>
          </div>
        );

      case 'testimonial':
        return (
          <div key={block.id} className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto text-center">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                  <p className="text-lg italic mb-6">
                    "{content.quote || 'Großartiges Fitnessstudio mit kompetenten Trainern!'}"
                  </p>
                  <div className="flex items-center justify-center">
                    <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                    <div>
                      <p className="font-semibold">{content.author || 'Max Mustermann'}</p>
                      <p className="text-gray-600 text-sm">{content.role || 'Mitglied seit 2023'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div key={block.id} className="py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">Unsere Preise</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {[1, 2, 3].map((plan) => (
                  <div key={plan} className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <h3 className="text-xl font-semibold mb-4">Plan {plan}</h3>
                    <div className="text-3xl font-bold mb-4">
                      {plan === 1 ? '29' : plan === 2 ? '49' : '79'}€
                      <span className="text-sm text-gray-600">/Monat</span>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Auswählen
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div key={block.id} className="py-8">
            <div className="container mx-auto px-4">
              <div className="bg-gray-100 p-6 rounded-lg text-center">
                <p className="text-gray-600">
                  Block-Typ: {block.block_type} (Vorschau wird entwickelt)
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Vorschau...</p>
        </div>
      </div>
    );
  }

  if (!landingPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Landingpage nicht gefunden</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* DeviceBar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-4 shadow-sm">
        <button
          onClick={() => router.push(`/landingpages/${landingPageId}/builder`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Zurück</span>
        </button>
        <div className="flex-1"></div>
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          {(['desktop', 'tablet', 'mobile'] as DeviceType[]).map((device) => {
            const Icon = getDeviceIcon(device);
            return (
              <button
                key={device}
                onClick={() => setActiveDevice(device)}
                className={`p-2 rounded-md transition-colors ${
                  activeDevice === device
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title={device === 'desktop' ? 'Desktop' : device === 'tablet' ? 'Tablet' : 'Mobil'}
              >
                <Icon size={20} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div
          className={`${getDeviceClass()} bg-white shadow-2xl overflow-auto ${
            activeDevice !== 'desktop' ? 'rounded-lg' : ''
          }`}
        >
          {/* Preview Content */}
          <div className="min-h-full">
            {landingPage.blocks && landingPage.blocks.length > 0 ? (
              landingPage.blocks.map(renderBlock)
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Diese Landingpage hat noch keine Inhalte
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 