'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Save, 
  Eye, 
  ArrowLeft, 
  Settings, 
  Smartphone, 
  Monitor, 
  GripVertical,
  Trash2,
  Copy,
  Edit3,
  Palette,
  Move,
  Layout,
  DollarSign,
  Check,
  Star,
  Type,
  Target,
  Image as ImageIcon,
  MousePointer,
  MessageSquare,
  User
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import supabase from '../../../lib/supabaseClient';

interface LandingPageBlock {
  id: string;
  landingpage_id: string;
  block_type: 'text' | 'image' | 'form' | 'button' | 'testimonial' | 'video' | 'headline' | 'spacer' | 'hero' | 'gallery' | 'pricing' | 'contact' | 'flexbox' | 'price_table' | 'single_image' | 'faq' | 'services' | 'timer' | 'schedule';
  position: number;
  content_json: any;
  file_asset_id?: string;
  testimonial_id?: string;
  carousel_config?: any;
  popup_config?: any;
  created_at: string;
}

interface LandingPage {
  id: string;
  title: string;
  slug: string;
  headline?: string;
  subheadline?: string;
  description?: string;
  design_template?: string;
  typography_set?: string;
  container_width?: string;
  background_config?: any;
  is_active: boolean;
  tracking_pixel_id?: string;
  form_enabled: boolean;
  form_target_table: string;
  redirect_url?: string;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

const BLOCK_TYPES = [
  // Core Module
  { type: 'hero', label: 'Hero Section', icon: '🎯', description: 'Hauptbereich mit großer Überschrift und CTA', category: 'core' },
  { type: 'text', label: 'Text Block', icon: '📝', description: 'Formatierter Textinhalt', category: 'core' },
  { type: 'price_table', label: 'Preistabelle', icon: '💰', description: 'Vertragsarten-Übersicht', category: 'core' },
  { type: 'testimonial', label: 'Testimonials', icon: '💬', description: 'Kundenbewertungen mit Carousel', category: 'core' },
  { type: 'gallery', label: 'Gallery', icon: '🖼️', description: 'Bildergalerie mit Carousel', category: 'core' },
  { type: 'button', label: 'Button/CTA', icon: '🔘', description: 'Call-to-Action Button', category: 'core' },
  { type: 'single_image', label: 'Einzelbild', icon: '📷', description: 'Einzelnes Bild mit optionalem Link', category: 'core' },
  { type: 'contact', label: 'Kontakt & Standort', icon: '📍', description: 'Kontaktinformationen und Karte', category: 'core' },
  { type: 'spacer', label: 'Abstand', icon: '📏', description: 'Abstände zwischen Blöcken', category: 'core' },
  
  // Extended Module
  { type: 'faq', label: 'FAQ', icon: '❓', description: 'Häufige Fragen mit Akkordeon', category: 'extended' },
  { type: 'services', label: 'Dienstleistungen', icon: '⚡', description: 'Angebote mit Icons oder Bildern', category: 'extended' },
  { type: 'timer', label: 'Timer/Countdown', icon: '⏰', description: 'Countdown für Angebote', category: 'extended' },
  { type: 'schedule', label: 'Kursplan', icon: '📅', description: 'Kursplan einbetten', category: 'extended' },
  
  // Layout Module
  { type: 'flexbox', label: 'Flexbox', icon: '📐', description: 'Flexible Container', category: 'layout' },
  
  // Form Module
  { type: 'form', label: 'Formular', icon: '📋', description: 'Lead-Generierung', category: 'forms' },
];

const UI_TEMPLATES = [
  { 
    id: 'fitness_modern', 
    name: 'Fitness Modern', 
    colors: { primary: '#3B82F6', secondary: '#10B981', accent: '#F59E0B' },
    fonts: { heading: 'Inter', body: 'Inter' },
    description: 'Modern, energisch, klare Linien'
  },
  { 
    id: 'corporate_clean', 
    name: 'Corporate Clean', 
    colors: { primary: '#1F2937', secondary: '#6B7280', accent: '#3B82F6' },
    fonts: { heading: 'Roboto', body: 'Roboto' },
    description: 'Professionell, minimalistisch'
  },
  { 
    id: 'wellness_warm', 
    name: 'Wellness Warm', 
    colors: { primary: '#059669', secondary: '#D97706', accent: '#DC2626' },
    fonts: { heading: 'Poppins', body: 'Poppins' },
    description: 'Warm, entspannend, natürlich'
  }
];

const TYPOGRAPHY_SETS = [
  {
    id: 'compact',
    name: 'Compact',
    lineHeight: '1.4',
    spacing: 'dense',
    description: 'Dichter Text, kleinere Abstände'
  },
  {
    id: 'airy',
    name: 'Airy',
    lineHeight: '1.6', 
    spacing: 'loose',
    description: 'Großzügige Abstände, mehr Whitespace'
  }
];

const PRESET_FORMS = [
  {
    id: 'contact',
    name: 'Kontakt',
    fields: [
      { type: 'text', name: 'name', label: 'Name', required: true },
      { type: 'email', name: 'email', label: 'E-Mail', required: true },
      { type: 'tel', name: 'phone', label: 'Telefon', required: false },
      { type: 'textarea', name: 'message', label: 'Nachricht', required: false }
    ]
  },
  {
    id: 'trial_training',
    name: 'Probetraining',
    fields: [
      { type: 'text', name: 'name', label: 'Name', required: true },
      { type: 'email', name: 'email', label: 'E-Mail', required: true },
      { type: 'tel', name: 'phone', label: 'Telefon', required: true },
      { type: 'date', name: 'preferred_date', label: 'Wunschtermin', required: false }
    ]
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    fields: [
      { type: 'email', name: 'email', label: 'E-Mail', required: true },
      { type: 'text', name: 'name', label: 'Name', required: false }
    ]
  }
];

// Helper Components (inline)
const TestimonialSelector = ({ selectedId, onSelect }: { selectedId: string, onSelect: (id: string) => void }) => {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('id, name, firstname, lastname, rating')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-sm text-gray-600">Lade Testimonials...</div>;
  }

  return (
    <select
      value={selectedId || ''}
      onChange={(e) => onSelect(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">Bitte wählen...</option>
      {testimonials.map((testimonial) => (
        <option key={testimonial.id} value={testimonial.id}>
          {testimonial.firstname && testimonial.lastname 
            ? `${testimonial.firstname} ${testimonial.lastname}`
            : testimonial.name
          } - {testimonial.rating}/5 ⭐
        </option>
      ))}
    </select>
  );
};

const ContractTypeSelector = ({ selectedId, onSelect }: { selectedId: string, onSelect: (id: string) => void }) => {
  const [contractTypes, setContractTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadContractTypes();
  }, []);

  const loadContractTypes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contract_types')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      setContractTypes(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Vertragsarten:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-sm text-gray-600">Lade Vertragsarten...</div>;
  }

  return (
    <select
      value={selectedId || ''}
      onChange={(e) => onSelect(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">Bitte wählen...</option>
      {contractTypes.map((contractType) => (
        <option key={contractType.id} value={contractType.id}>
          {contractType.name} - €{contractType.price_per_month}/Monat ({contractType.term} Monate)
        </option>
      ))}
    </select>
  );
};

// Spacer Block Component (inline)
const SpacerBlock = ({ content, isSelected }: { content: { height: string }, isSelected?: boolean }) => {
  return (
    <div className="relative">
      {isSelected && (
        <div className="absolute top-2 left-2 z-20 px-2 py-1 bg-blue-600 text-white text-xs rounded flex items-center gap-1">
          <div className="w-3 h-3 border border-white"></div>
          Abstand
        </div>
      )}
      <div 
        style={{ height: content.height || '50px' }}
        className={`w-full ${isSelected ? 'bg-gray-100 border-2 border-dashed border-gray-300' : ''}`}
      >
        {isSelected && (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            {content.height || '50px'} Abstand
          </div>
        )}
      </div>
    </div>
  );
};

// Missing Block Components (inline)
const FlexboxBlock = ({ content, isSelected }: { content: any, isSelected?: boolean }) => {
  const justifyClasses = {
    'flex-start': 'justify-start',
    'center': 'justify-center',
    'flex-end': 'justify-end',
    'space-between': 'justify-between',
    'space-around': 'justify-around'
  };

  const alignClasses = {
    'flex-start': 'items-start',
    'center': 'items-center',
    'flex-end': 'items-end',
    'stretch': 'items-stretch'
  };

  return (
    <div className="relative">
      {isSelected && (
        <div className="absolute top-2 left-2 z-20 px-2 py-1 bg-blue-600 text-white text-xs rounded flex items-center gap-1">
          <Layout size={12} />
          Flexbox
        </div>
      )}
      <div 
        className={`
          flex
          ${content.direction === 'column' ? 'flex-col' : 'flex-row'}
          ${justifyClasses[content.justify] || 'justify-start'}
          ${alignClasses[content.align] || 'items-start'}
          ${content.wrap ? 'flex-wrap' : ''}
          p-4
        `}
        style={{
          gap: content.gap || '1rem',
          backgroundColor: content.backgroundColor || 'transparent',
          padding: content.padding || '1rem',
          borderRadius: content.borderRadius || '0'
        }}
      >
        {content.children && content.children.length > 0 ? (
          content.children.map((child: any, index: number) => (
            <div key={index} className="flex-1 min-w-0">
              {/* Child content would go here */}
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded p-4 text-center">
                <p className="text-gray-600">Drop Zone {index + 1}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="w-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Layout size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Flexbox Container - Fügen Sie Inhalte in den Einstellungen hinzu</p>
          </div>
        )}
      </div>
    </div>
  );
};

const PriceTableBlock = ({ content, isSelected }: { content: any, isSelected?: boolean }) => {
  const [contractType, setContractType] = useState<any>(null);

  useEffect(() => {
    if (content.contract_type_id) {
      loadContractType();
    }
  }, [content.contract_type_id]);

  const loadContractType = async () => {
    try {
      const { data, error } = await supabase
        .from('contract_types')
        .select('*')
        .eq('id', content.contract_type_id)
        .single();
      
      if (error) throw error;
      setContractType(data);
    } catch (error) {
      console.error('Fehler beim Laden der Vertragsart:', error);
    }
  };

  const colorSchemes = {
    blue: 'border-blue-500 bg-blue-50',
    green: 'border-green-500 bg-green-50',
    purple: 'border-purple-500 bg-purple-50',
    orange: 'border-orange-500 bg-orange-50'
  };

  const buttonColors = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    orange: 'bg-orange-600 hover:bg-orange-700'
  };

  return (
    <div className="p-4 relative">
      {isSelected && (
        <div className="absolute -top-2 -left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded flex items-center gap-1">
          <DollarSign size={12} />
          Preistabelle
        </div>
      )}

      {contractType ? (
        <div className={`max-w-sm mx-auto bg-white rounded-lg border-2 ${colorSchemes[content.color_scheme] || colorSchemes.blue} p-6`}>
          {content.show_popular_badge && (
            <div className="text-center mb-4">
              <span className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                BELIEBT
              </span>
            </div>
          )}
          
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{contractType.name}</h3>
            {contractType.description && (
              <p className="text-gray-600 text-sm mb-4">{contractType.description}</p>
            )}
            
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">€{contractType.price_per_month}</span>
              <span className="text-gray-600">/Monat</span>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-center text-sm text-gray-600">
                <Check size={16} className="text-green-500 mr-2" />
                Laufzeit: {contractType.term} Monate
              </div>
              {contractType.bonus_period && (
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <Star size={16} className="text-yellow-500 mr-2" />
                  +{contractType.bonus_period} Bonus-Monate
                </div>
              )}
              {contractType.has_group_discount && (
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <Check size={16} className="text-green-500 mr-2" />
                  Gruppenrabatt verfügbar
                </div>
              )}
            </div>

            <button className={`w-full py-3 px-6 text-white font-semibold rounded-lg transition-colors ${buttonColors[content.color_scheme] || buttonColors.blue}`}>
              {content.button_text || 'Jetzt buchen'}
            </button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <DollarSign size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Preistabelle - Wählen Sie eine Vertragsart in den Einstellungen</p>
        </div>
      )}
    </div>
  );
};

// Block Components (inline definitions)
const TextBlock = ({ content, isSelected }: { content: any, isSelected?: boolean }) => {
  const fontSizeClasses = { small: 'text-sm', medium: 'text-base', large: 'text-lg' };
  const alignmentClasses = { left: 'text-left', center: 'text-center', right: 'text-right' };

  return (
    <div className="p-4 relative">
      {isSelected && (
        <div className="absolute -top-2 -left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded flex items-center gap-1">
          <Type size={12} />
          Text
        </div>
      )}
      <div className={`${fontSizeClasses[content.fontSize] || 'text-base'} ${alignmentClasses[content.textAlign] || 'text-left'}`}>
        {content.content || (
          <div className="text-gray-400 italic">Text Block - Konfigurieren Sie den Inhalt in den Einstellungen</div>
        )}
      </div>
    </div>
  );
};

const HeroBlock = ({ content, isSelected, template }: { content: any, isSelected?: boolean, template?: any }) => {
  const alignmentClasses = { left: 'text-left', center: 'text-center', right: 'text-right' };
  const backgroundStyle = {
    backgroundImage: content.backgroundImage ? `url(${content.backgroundImage})` : undefined,
    backgroundColor: content.backgroundColor || template?.colors?.primary || '#f8fafc',
    backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'
  };
  const textColor = content.backgroundImage ? 'text-white' : 'text-gray-900';
  const subtextColor = content.backgroundImage ? 'text-gray-200' : 'text-gray-600';
  const buttonColor = template?.colors?.accent || '#3B82F6';

  return (
    <div className="relative">
      {isSelected && (
        <div className="absolute top-2 left-2 z-20 px-2 py-1 bg-blue-600 text-white text-xs rounded flex items-center gap-1">
          <Target size={12} />
          Hero
        </div>
      )}
      <div className="min-h-[400px] flex items-center justify-center p-8 relative" style={backgroundStyle}>
        {content.backgroundImage && <div className="absolute inset-0 bg-black bg-opacity-40"></div>}
        <div className={`relative z-10 max-w-4xl mx-auto ${alignmentClasses[content.textAlign]}`}>
          {content.headline ? (
            <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${textColor}`}>{content.headline}</h1>
          ) : (
            <div className="text-center py-8">
              <Target size={48} className={`mx-auto mb-4 ${textColor.replace('text-', 'text-opacity-40 text-')}`} />
              <p className={`text-lg ${textColor.replace('text-', 'text-opacity-60 text-')}`}>
                Hero Section - Konfigurieren Sie den Inhalt in den Einstellungen
              </p>
            </div>
          )}
          {content.subheadline && <p className={`text-xl md:text-2xl mb-8 ${subtextColor}`}>{content.subheadline}</p>}
          {content.buttonText && (
            <button className="inline-block px-8 py-4 text-lg font-semibold rounded-lg transition-colors" 
                    style={{ backgroundColor: buttonColor, color: 'white' }}>
              {content.buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ImageBlock = ({ content, isSelected }: { content: any, isSelected?: boolean }) => {
  const alignmentClasses = { left: 'text-left', center: 'text-center', right: 'text-right' };
  const imageAlignmentClasses = { left: 'mr-auto', center: 'mx-auto', right: 'ml-auto' };

  return (
    <div className="p-4 relative">
      {isSelected && (
        <div className="absolute -top-2 -left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded flex items-center gap-1">
          <ImageIcon size={12} />
          Bild
        </div>
      )}
      {content.src ? (
        <div className={`${alignmentClasses[content.alignment]}`}>
          <img src={content.src} alt={content.alt} 
               className={`max-w-full h-auto rounded-lg ${imageAlignmentClasses[content.alignment]}`}
               style={{ width: content.width || 'auto', height: content.height || 'auto' }} />
          {content.caption && <p className="text-sm text-gray-600 mt-2 italic">{content.caption}</p>}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4"><ImageIcon size={48} className="mx-auto" /></div>
          <p className="text-gray-600 mb-2">Bildblock - Konfigurieren Sie das Bild in den Einstellungen</p>
        </div>
      )}
    </div>
  );
};

// Button Block Component mit Popup-Support
const ButtonBlock = ({ content, isSelected, template }: { content: any, isSelected?: boolean, template?: any }) => {
  const [showPopup, setShowPopup] = useState(false);
  
  const handleButtonClick = () => {
    if (content.action === 'popup') {
      setShowPopup(true);
    } else if (content.link) {
      window.open(content.link, '_blank');
    }
  };

  const selectedForm = PRESET_FORMS.find(f => f.id === content.popupFormType) || PRESET_FORMS[0];

  return (
    <div className={`relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      {isSelected && (
        <div className="absolute top-2 left-2 z-20 px-2 py-1 bg-blue-600 text-white text-xs rounded">
          Button
        </div>
      )}
      <div className={`text-${content.alignment || 'center'} p-4`}>
        <button
          onClick={handleButtonClick}
          className={`px-6 py-3 rounded-lg transition-colors ${
            content.style === 'primary' 
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : content.style === 'secondary'
              ? 'bg-gray-600 text-white hover:bg-gray-700'
              : 'border border-blue-600 text-blue-600 hover:bg-blue-50'
          } ${
            content.size === 'small' ? 'px-4 py-2 text-sm' :
            content.size === 'large' ? 'px-8 py-4 text-lg' :
            'px-6 py-3'
          }`}
          style={{
            backgroundColor: template?.colors?.primary && content.style === 'primary' ? template.colors.primary : undefined
          }}
        >
          {content.text || 'Button Text'}
        </button>
      </div>

      {/* Popup Modal */}
      {showPopup && content.action === 'popup' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-lg max-w-md w-full ${
            content.popupSize === 'small' ? 'max-w-sm' :
            content.popupSize === 'large' ? 'max-w-lg' :
            'max-w-md'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{selectedForm.name}</h3>
                <button
                  onClick={() => setShowPopup(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form className="space-y-4">
                {selectedForm.fields.map((field, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label} {field.required && '*'}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        required={field.required}
                      />
                    ) : (
                      <input
                        type={field.type}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowPopup(false)}
                    className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Senden
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TestimonialBlock = ({ content, isSelected }: { content: any, isSelected?: boolean }) => {
  const [selectedTestimonial, setSelectedTestimonial] = useState<any>(null);

  useEffect(() => {
    if (content.testimonial_id) {
      loadSelectedTestimonial();
    }
  }, [content.testimonial_id]);

  const loadSelectedTestimonial = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select(`*, file_asset:file_asset_id (id, filename, file_url)`)
        .eq('id', content.testimonial_id)
        .single();
      if (error) throw error;
      setSelectedTestimonial(data);
    } catch (error) {
      console.error('Fehler beim Laden des Testimonials:', error);
      setSelectedTestimonial(null);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={16} className={star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} />
      ))}
    </div>
  );

  return (
    <div className="p-4 relative">
      {isSelected && (
        <div className="absolute -top-2 -left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded flex items-center gap-1">
          <MessageSquare size={12} />
          Testimonial
        </div>
      )}
      {selectedTestimonial ? (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-start gap-4 mb-4">
            {content.showImage && selectedTestimonial.file_asset ? (
              <img src={selectedTestimonial.file_asset.file_url} alt={selectedTestimonial.name} 
                   className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-gray-600" />
              </div>
            )}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">
                {selectedTestimonial.firstname && selectedTestimonial.lastname 
                  ? `${selectedTestimonial.firstname} ${selectedTestimonial.lastname}`
                  : selectedTestimonial.name}
              </h4>
              {content.showLocation && selectedTestimonial.location && (
                <p className="text-sm text-gray-600">{selectedTestimonial.location}</p>
              )}
              {content.showRating && <div className="mt-1">{renderStars(selectedTestimonial.rating)}</div>}
            </div>
          </div>
          <p className="text-gray-700 italic">"{selectedTestimonial.text_content}"</p>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4"><MessageSquare size={48} className="mx-auto" /></div>
          <p className="text-gray-600 mb-2">Testimonial - Konfigurieren Sie das Testimonial in den Einstellungen</p>
        </div>
      )}
    </div>
  );
};

// New Block Components

// FAQ Block Component
const FAQBlock = ({ content, isSelected }: { content: any, isSelected?: boolean }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqItems = content.items || [
    { question: 'Beispiel Frage?', answer: 'Beispiel Antwort hier.' }
  ];

  return (
    <div className={`relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      {isSelected && (
        <div className="absolute top-2 left-2 z-20 px-2 py-1 bg-blue-600 text-white text-xs rounded">
          FAQ
        </div>
      )}
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {content.title || 'Häufige Fragen'}
        </h2>
        <div className="space-y-4">
          {faqItems.map((item: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
              >
                <span className="font-medium">{item.question}</span>
                <span className="text-2xl">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <p className="text-gray-700">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Services Block Component  
const ServicesBlock = ({ content, isSelected }: { content: any, isSelected?: boolean }) => {
  const services = content.services || [
    { title: 'Service 1', description: 'Beschreibung hier', icon: '⚡' },
    { title: 'Service 2', description: 'Beschreibung hier', icon: '💪' },
    { title: 'Service 3', description: 'Beschreibung hier', icon: '🎯' }
  ];
  const columns = content.columns || 3;

  return (
    <div className={`relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      {isSelected && (
        <div className="absolute top-2 left-2 z-20 px-2 py-1 bg-blue-600 text-white text-xs rounded">
          Services
        </div>
      )}
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-8 text-center">
          {content.title || 'Unsere Dienstleistungen'}
        </h2>
        <div className={`grid gap-8 ${
          columns === 2 ? 'grid-cols-1 md:grid-cols-2' :
          columns === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        }`}>
          {services.map((service: any, index: number) => (
            <div key={index} className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              {service.buttonText && (
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {service.buttonText}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Timer/Countdown Block Component
const TimerBlock = ({ content, isSelected }: { content: any, isSelected?: boolean }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const targetDate = content.targetDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className={`relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      {isSelected && (
        <div className="absolute top-2 left-2 z-20 px-2 py-1 bg-blue-600 text-white text-xs rounded">
          Timer
        </div>
      )}
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">
          {content.preText || 'Angebot läuft ab in:'}
        </h2>
        <div className="flex justify-center gap-6 mb-6">
          {[
            { label: 'Tage', value: timeLeft.days },
            { label: 'Stunden', value: timeLeft.hours },
            { label: 'Minuten', value: timeLeft.minutes },
            { label: 'Sekunden', value: timeLeft.seconds }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="bg-gray-900 text-white text-3xl font-bold p-4 rounded-lg min-w-[80px]">
                {item.value.toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-gray-600 mt-2">{item.label}</div>
            </div>
          ))}
        </div>
        <p className="text-lg text-gray-700">
          {content.postText || 'Verpassen Sie nicht unser limitiertes Angebot!'}
        </p>
      </div>
    </div>
  );
};

// Schedule Block Component
const ScheduleBlock = ({ content, isSelected }: { content: any, isSelected?: boolean }) => {
  return (
    <div className={`relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      {isSelected && (
        <div className="absolute top-2 left-2 z-20 px-2 py-1 bg-blue-600 text-white text-xs rounded">
          Kursplan
        </div>
      )}
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {content.title || 'Kursplan'}
        </h2>
        {content.iframeUrl ? (
          <iframe
            src={content.iframeUrl}
            className="w-full border border-gray-200 rounded-lg"
            style={{ height: content.height || '500px' }}
            title="Kursplan"
          />
        ) : (
          <div className="bg-gray-100 p-12 text-center rounded-lg">
            <p className="text-gray-600">
              Kursplan wird hier angezeigt. Bitte iframe-URL in den Einstellungen eingeben.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Gallery Block Component
const GalleryBlock = ({ content, isSelected }: { content: any, isSelected?: boolean }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = content.images || [
    { src: 'https://via.placeholder.com/400x300?text=Bild+1', alt: 'Bild 1' },
    { src: 'https://via.placeholder.com/400x300?text=Bild+2', alt: 'Bild 2' },
    { src: 'https://via.placeholder.com/400x300?text=Bild+3', alt: 'Bild 3' }
  ];
  const itemsVisible = content.itemsVisible || 3;
  const autoplay = content.autoplay || false;

  useEffect(() => {
    if (autoplay) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [autoplay, images.length]);

  return (
    <div className={`relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      {isSelected && (
        <div className="absolute top-2 left-2 z-20 px-2 py-1 bg-blue-600 text-white text-xs rounded">
          Gallery
        </div>
      )}
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {content.title || 'Galerie'}
        </h2>
        <div className="relative">
          <div className="overflow-hidden rounded-lg">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsVisible)}%)` }}
            >
              {images.map((image: any, index: number) => (
                <div 
                  key={index}
                  className={`flex-shrink-0 px-2`}
                  style={{ width: `${100 / itemsVisible}%` }}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation */}
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
            disabled={currentIndex === 0}
          >
            ←
          </button>
          <button
            onClick={() => setCurrentIndex(Math.min(images.length - itemsVisible, currentIndex + 1))}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
            disabled={currentIndex >= images.length - itemsVisible}
          >
            →
          </button>
        </div>
        
        {/* Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: Math.ceil(images.length / itemsVisible) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * itemsVisible)}
              className={`w-3 h-3 rounded-full ${
                Math.floor(currentIndex / itemsVisible) === index ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Contact Block Component
const ContactBlock = ({ content, isSelected }: { content: any, isSelected?: boolean }) => {
  return (
    <div className={`relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      {isSelected && (
        <div className="absolute top-2 left-2 z-20 px-2 py-1 bg-blue-600 text-white text-xs rounded">
          Kontakt
        </div>
      )}
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-8 text-center">
          {content.title || 'Kontakt & Standort'}
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Kontaktinformationen</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📍</span>
                  <div>
                    <p className="font-medium">Adresse</p>
                    <p className="text-gray-600">{content.address || 'Ihre Adresse hier'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">📞</span>
                  <div>
                    <p className="font-medium">Telefon</p>
                    <p className="text-gray-600">{content.phone || '+49 123 456789'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">✉️</span>
                  <div>
                    <p className="font-medium">E-Mail</p>
                    <p className="text-gray-600">{content.email || 'info@beispiel.de'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {content.openingHours && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Öffnungszeiten</h3>
                <div className="space-y-2 text-gray-600">
                  <p>Mo-Fr: 06:00 - 22:00</p>
                  <p>Sa-So: 08:00 - 20:00</p>
                </div>
              </div>
            )}
          </div>
          
          {content.showMap && (
            <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
              <p className="text-gray-600">Google Maps Integration</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Single Image Block Component  
const SingleImageBlock = ({ content, isSelected }: { content: any, isSelected?: boolean }) => {
  return (
    <div className={`relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      {isSelected && (
        <div className="absolute top-2 left-2 z-20 px-2 py-1 bg-blue-600 text-white text-xs rounded">
          Einzelbild
        </div>
      )}
      <div className={`text-${content.alignment || 'center'} p-4`}>
        {content.link ? (
          <a href={content.link} target="_blank" rel="noopener noreferrer">
            <img
              src={content.src || 'https://via.placeholder.com/600x400?text=Ihr+Bild'}
              alt={content.alt || 'Bildbeschreibung'}
              className="max-w-full h-auto rounded-lg hover:opacity-90 transition-opacity"
            />
          </a>
        ) : (
          <img
            src={content.src || 'https://via.placeholder.com/600x400?text=Ihr+Bild'}
            alt={content.alt || 'Bildbeschreibung'} 
            className="max-w-full h-auto rounded-lg"
          />
        )}
        {content.caption && (
          <p className="text-sm text-gray-600 mt-2">{content.caption}</p>
        )}
      </div>
    </div>
  );
};

export default function LandingPageBuilder() {
  const params = useParams();
  const router = useRouter();
  const landingPageId = params.id as string;

  // States
  const [landingPage, setLandingPage] = useState<LandingPage | null>(null);
  const [blocks, setBlocks] = useState<LandingPageBlock[]>([]);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showSettings, setShowSettings] = useState(false);
  const [showUITemplates, setShowUITemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(UI_TEMPLATES[0]);
  const [draggedBlock, setDraggedBlock] = useState<number | null>(null);

  // Load Data
  useEffect(() => {
    if (landingPageId === 'new') {
      setLandingPage({
        id: 'new',
        title: 'Neue Landingpage',
        slug: '',
        headline: 'Willkommen',
        subheadline: 'Ihre Traumfigur wartet auf Sie',
        description: '',
        is_active: false,
        form_enabled: true,
        form_target_table: 'leads',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setBlocks([]);
      setLoading(false);
    } else {
      loadLandingPage();
    }
  }, [landingPageId]);

  const loadLandingPage = async () => {
    try {
      const { data: pageData, error: pageError } = await supabase
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

      setLandingPage(pageData);
      setBlocks(blocksData || []);
    } catch (error) {
      console.error('Fehler beim Laden der Landingpage:', error);
      router.push('/landingpages');
    } finally {
      setLoading(false);
    }
  };

  const saveLandingPage = async () => {
    if (!landingPage) return;

    setSaving(true);
    try {
      let pageId = landingPageId;

      if (landingPageId === 'new') {
        const { data: newPage, error: pageError } = await supabase
          .from('landingpage')
          .insert([{
            title: landingPage.title,
            slug: landingPage.slug,
            headline: landingPage.headline,
            subheadline: landingPage.subheadline,
            description: landingPage.description,
            is_active: landingPage.is_active,
            form_enabled: landingPage.form_enabled,
            form_target_table: landingPage.form_target_table,
            redirect_url: landingPage.redirect_url,
            meta_title: landingPage.meta_title,
            meta_description: landingPage.meta_description
          }])
          .select()
          .single();

        if (pageError) throw pageError;
        pageId = newPage.id;
        router.replace(`/landingpages/${pageId}`);
      } else {
        const { error: pageError } = await supabase
          .from('landingpage')
          .update({
            title: landingPage.title,
            slug: landingPage.slug,
            headline: landingPage.headline,
            subheadline: landingPage.subheadline,
            description: landingPage.description,
            is_active: landingPage.is_active,
            form_enabled: landingPage.form_enabled,
            form_target_table: landingPage.form_target_table,
            redirect_url: landingPage.redirect_url,
            meta_title: landingPage.meta_title,
            meta_description: landingPage.meta_description
          })
          .eq('id', landingPageId);

        if (pageError) throw pageError;
      }

      await saveBlocks(pageId);
      console.log('Landingpage erfolgreich gespeichert');
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Fehler beim Speichern der Landingpage');
    } finally {
      setSaving(false);
    }
  };

  const saveBlocks = async (pageId: string) => {
    await supabase
      .from('landingpage_block')
      .delete()
      .eq('landingpage_id', pageId);

    if (blocks.length > 0) {
      const blocksToInsert = blocks.map((block, index) => ({
        landingpage_id: pageId,
        block_type: block.block_type,
        position: index,
        content_json: block.content_json,
        file_asset_id: block.file_asset_id,
        testimonial_id: block.testimonial_id,
        carousel_config: block.carousel_config,
        popup_config: block.popup_config
      }));

      const { error } = await supabase
        .from('landingpage_block')
        .insert(blocksToInsert);

      if (error) throw error;
    }
  };

  const addBlock = (blockType: string) => {
    const newBlock: LandingPageBlock = {
      id: `temp-${Date.now()}`,
      landingpage_id: landingPageId,
      block_type: blockType as any,
      position: blocks.length,
      content_json: getDefaultBlockContent(blockType),
      created_at: new Date().toISOString()
    };

    setBlocks([...blocks, newBlock]);
    setSelectedBlockIndex(blocks.length);
  };

  const getDefaultBlockContent = (blockType: string) => {
    switch (blockType) {
      case 'hero':
        return {
          headline: 'Ihre Überschrift hier',
          subheadline: 'Eine überzeugende Unterzeile',
          buttonText: 'Jetzt starten',
          backgroundImage: '',
          textAlign: 'center'
        };
      case 'text':
        return {
          content: 'Ihr Text hier...',
          textAlign: 'left',
          fontSize: 'medium'
        };
      case 'button':
        return {
          text: 'Button Text',
          action: 'link',
          link: '#',
          popupFormType: 'contact',
          popupSize: 'medium',
          phone: '',
          email: '',
          style: 'primary',
          size: 'medium',
          alignment: 'center'
        };
      case 'image':
        return {
          src: '',
          alt: 'Bildbeschreibung',
          caption: '',
          alignment: 'center'
        };
      case 'single_image':
        return {
          src: '',
          alt: 'Bildbeschreibung',
          caption: '',
          alignment: 'center',
          link: '',
          width: 'auto',
          height: 'auto'
        };
      case 'testimonial':
        return {
          testimonial_id: ''
        };
      case 'spacer':
        return {
          height: '40px'
        };
      case 'price_table':
        return {
          contractTypes: [],
          columns: 3,
          highlight: 1
        };
      case 'flexbox':
        return {
          direction: 'row',
          justify: 'center',
          align: 'center',
          gap: '1rem',
          backgroundColor: '#f8fafc',
          wrap: false
        };
      case 'faq':
        return {
          title: 'Häufige Fragen',
          items: [
            { question: 'Beispiel Frage 1?', answer: 'Hier steht die Antwort auf die erste Frage.' },
            { question: 'Beispiel Frage 2?', answer: 'Hier steht die Antwort auf die zweite Frage.' }
          ]
        };
      case 'services':
        return {
          title: 'Unsere Dienstleistungen',
          columns: 3,
          services: [
            { title: 'Service 1', description: 'Beschreibung des ersten Services', icon: '⚡', buttonText: 'Mehr erfahren' },
            { title: 'Service 2', description: 'Beschreibung des zweiten Services', icon: '💪', buttonText: 'Mehr erfahren' },
            { title: 'Service 3', description: 'Beschreibung des dritten Services', icon: '🎯', buttonText: 'Mehr erfahren' }
          ]
        };
      case 'timer':
        return {
          preText: 'Angebot läuft ab in:',
          postText: 'Verpassen Sie nicht unser limitiertes Angebot!',
          targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
        };
      case 'schedule':
        return {
          title: 'Kursplan',
          iframeUrl: '',
          height: '500px'
        };
      case 'gallery':
        return {
          title: 'Galerie',
          images: [
            { src: 'https://via.placeholder.com/400x300?text=Bild+1', alt: 'Bild 1' },
            { src: 'https://via.placeholder.com/400x300?text=Bild+2', alt: 'Bild 2' },
            { src: 'https://via.placeholder.com/400x300?text=Bild+3', alt: 'Bild 3' }
          ],
          itemsVisible: 3,
          autoplay: false
        };
      case 'contact':
        return {
          title: 'Kontakt & Standort',
          address: 'Ihre Adresse hier\n12345 Stadt',
          phone: '+49 123 456789',
          email: 'info@beispiel.de',
          openingHours: true,
          showMap: true
        };
      default:
        return {};
    }
  };

  const updateBlock = (index: number, newContent: any) => {
    const updatedBlocks = [...blocks];
    updatedBlocks[index] = {
      ...updatedBlocks[index],
      content_json: newContent
    };
    setBlocks(updatedBlocks);
  };

  const deleteBlock = (index: number) => {
    const updatedBlocks = blocks.filter((_, i) => i !== index);
    setBlocks(updatedBlocks);
    setSelectedBlockIndex(null);
  };

  const duplicateBlock = (index: number) => {
    const blockToDuplicate = blocks[index];
    const newBlock: LandingPageBlock = {
      ...blockToDuplicate,
      id: `temp-${Date.now()}`,
      position: blocks.length
    };
    setBlocks([...blocks, newBlock]);
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const updatedBlocks = [...blocks];
    const [movedBlock] = updatedBlocks.splice(fromIndex, 1);
    updatedBlocks.splice(toIndex, 0, movedBlock);
    setBlocks(updatedBlocks);
  };

  const renderBlock = (block: LandingPageBlock, index: number) => {
    const isSelected = selectedBlockIndex === index;
    const commonProps = {
      content: block.content_json,
      onUpdate: (newContent: any) => updateBlock(index, newContent),
      isSelected,
      template: selectedTemplate
    };

    let BlockComponent = null;
    switch (block.block_type) {
      case 'hero':
        BlockComponent = HeroBlock;
        break;
      case 'text':
        BlockComponent = TextBlock;
        break;
      case 'image':
        BlockComponent = ImageBlock;
        break;
      case 'button':
        BlockComponent = ButtonBlock;
        break;
      case 'testimonial':
        BlockComponent = TestimonialBlock;
        break;
      case 'price_table':
        BlockComponent = PriceTableBlock;
        break;
      case 'flexbox':
        BlockComponent = FlexboxBlock;
        break;
      case 'spacer':
        return (
          <div 
            key={block.id} 
            style={{ height: block.content_json.height || '50px' }}
            className={`border-2 border-dashed rounded flex items-center justify-center text-gray-400 text-sm cursor-pointer transition-colors ${
              isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'
            }`}
            onClick={() => setSelectedBlockIndex(index)}
          >
            Abstand: {block.content_json.height || '50px'}
          </div>
        );
      case 'faq':
        BlockComponent = FAQBlock;
        break;
      case 'services':
        BlockComponent = ServicesBlock;
        break;
      case 'timer':
        BlockComponent = TimerBlock;
        break;
      case 'schedule':
        BlockComponent = ScheduleBlock;
        break;
      case 'gallery':
        BlockComponent = GalleryBlock;
        break;
      case 'contact':
        BlockComponent = ContactBlock;
        break;
      case 'single_image':
        BlockComponent = SingleImageBlock;
        break;
      default:
        return (
          <div key={block.id} className="p-4 border border-red-200 bg-red-50 rounded">
            <p className="text-red-600">Unbekannter Block-Typ: {block.block_type}</p>
          </div>
        );
    }

    if (BlockComponent) {
      return (
        <div
          key={block.id}
          className={`border-2 rounded transition-colors cursor-pointer ${
            isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-gray-300'
          }`}
          onClick={() => setSelectedBlockIndex(index)}
        >
          <BlockComponent {...commonProps} />
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Landingpage...</p>
        </div>
      </div>
    );
  }

  if (!landingPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Landingpage nicht gefunden</p>
          <button
            onClick={() => router.push('/landingpages')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Zurück zur Übersicht
          </button>
        </div>
      </div>
    );
  }

  const selectedBlock = selectedBlockIndex !== null ? blocks[selectedBlockIndex] : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/landingpages')}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {landingPage.title}
              </h1>
              <p className="text-sm text-gray-500">
                {landingPageId === 'new' ? 'Neue Landingpage' : `/${landingPage.slug}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* UI Template Selector */}
            <button
              onClick={() => setShowUITemplates(!showUITemplates)}
              className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="UI-Templates"
            >
              <Palette size={20} />
              {showUITemplates && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-3">UI-Templates</h3>
                    <div className="space-y-2">
                      {UI_TEMPLATES.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => {
                            setSelectedTemplate(template);
                            if (landingPage) {
                              setLandingPage(prev => prev ? {
                                ...prev,
                                design_template: template.id
                              } : null);
                            }
                            setShowUITemplates(false);
                          }}
                          className={`w-full p-3 text-left rounded-lg border transition-colors ${
                            selectedTemplate.id === template.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-medium text-sm">{template.name}</div>
                          <div className="text-xs text-gray-500 mb-2">{template.description}</div>
                          <div className="flex gap-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: template.colors.primary }}
                            ></div>
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: template.colors.secondary }}
                            ></div>
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: template.colors.accent }}
                            ></div>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    <hr className="my-4" />
                    
                    <h3 className="font-medium text-gray-900 mb-3">Typography Sets</h3>
                    <div className="space-y-2">
                      {TYPOGRAPHY_SETS.map((typographySet) => (
                        <button
                          key={typographySet.id}
                          onClick={() => {
                            if (landingPage) {
                              setLandingPage(prev => prev ? {
                                ...prev,
                                typography_set: typographySet.id
                              } : null);
                            }
                            setShowUITemplates(false);
                          }}
                          className={`w-full p-3 text-left rounded-lg border transition-colors ${
                            landingPage?.typography_set === typographySet.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-medium text-sm">{typographySet.name}</div>
                          <div className="text-xs text-gray-500">{typographySet.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </button>

            {/* Preview Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-2 rounded-md ${
                  previewMode === 'desktop' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600'
                }`}
              >
                <Monitor size={16} />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-2 rounded-md ${
                  previewMode === 'mobile' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600'
                }`}
              >
                <Smartphone size={16} />
              </button>
            </div>

            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <Settings size={20} />
            </button>

            <button
              onClick={saveLandingPage}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Speichert...' : 'Speichern'}
            </button>

            {landingPage.is_active && (
              <button
                onClick={() => window.open(`/${landingPage.slug}`, '_blank')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Eye size={16} />
                Vorschau
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Modules */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Module hinzufügen</h3>
            
            {/* Group by category */}
            {['core', 'extended', 'layout', 'forms'].map((category) => {
              const categoryBlocks = BLOCK_TYPES.filter(block => block.category === category);
              if (categoryBlocks.length === 0) return null;

              const categoryNames: Record<string, string> = {
                core: 'Core Module',
                extended: 'Erweiterte Module',
                layout: 'Layout',
                forms: 'Formulare'
              };

              return (
                <div key={category} className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">
                    {categoryNames[category]}
                  </h4>
                  <div className="space-y-2">
                    {categoryBlocks.map((blockType) => (
                      <button
                        key={blockType.type}
                        onClick={() => addBlock(blockType.type)}
                        className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg group-hover:scale-110 transition-transform">
                            {blockType.icon}
                          </span>
                          <div>
                            <div className="font-medium text-gray-900">{blockType.label}</div>
                            <div className="text-sm text-gray-500">{blockType.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center - Preview */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className={`mx-auto bg-white rounded-lg shadow-sm border border-gray-200 min-h-screen ${
            previewMode === 'mobile' ? 'max-w-sm' : 'max-w-4xl'
          }`}>
            <div className="p-6">
              {blocks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Edit3 size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Landingpage ist leer
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Fügen Sie Module aus der Seitenleiste hinzu, um Ihre Landingpage zu erstellen.
                  </p>
                  <button
                    onClick={() => addBlock('hero')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={16} />
                    Hero Section hinzufügen
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {blocks.map((block, index) => (
                    <div key={block.id} className="relative group">
                      {/* Block Controls */}
                      <div className="absolute -left-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 z-10">
                        <button
                          onClick={() => duplicateBlock(index)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded bg-white shadow-sm"
                          title="Duplizieren"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => deleteBlock(index)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded bg-white shadow-sm"
                          title="Löschen"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div
                          className="p-1 text-gray-400 hover:text-gray-600 rounded cursor-grab bg-white shadow-sm"
                          title="Verschieben"
                        >
                          <GripVertical size={14} />
                        </div>
                      </div>

                      {/* Block Content */}
                      {renderBlock(block, index)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Settings */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-6">
            {selectedBlock ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">
                    {BLOCK_TYPES.find(t => t.type === selectedBlock.block_type)?.icon}
                  </span>
                  <h3 className="text-lg font-medium text-gray-900">
                    {BLOCK_TYPES.find(t => t.type === selectedBlock.block_type)?.label} Einstellungen
                  </h3>
                </div>
                
                {/* Block-specific settings */}
                <div className="space-y-4">
                  {/* Text Block Settings */}
                  {selectedBlock.block_type === 'text' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Text Inhalt
                        </label>
                        <textarea
                          value={selectedBlock.content_json.content || ''}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            content: e.target.value
                          })}
                          placeholder="Geben Sie Ihren Text hier ein..."
                          className="w-full min-h-[100px] border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Schriftgröße
                          </label>
                          <select
                            value={selectedBlock.content_json.fontSize || 'medium'}
                            onChange={(e) => updateBlock(selectedBlockIndex!, {
                              ...selectedBlock.content_json,
                              fontSize: e.target.value
                            })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="small">Klein</option>
                            <option value="medium">Mittel</option>
                            <option value="large">Groß</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ausrichtung
                          </label>
                          <select
                            value={selectedBlock.content_json.textAlign || 'left'}
                            onChange={(e) => updateBlock(selectedBlockIndex!, {
                              ...selectedBlock.content_json,
                              textAlign: e.target.value
                            })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="left">Links</option>
                            <option value="center">Mitte</option>
                            <option value="right">Rechts</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Hero Block Settings */}
                  {selectedBlock.block_type === 'hero' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hauptüberschrift
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.content_json.headline || ''}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            headline: e.target.value
                          })}
                          placeholder="Ihre Überschrift hier"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Unterzeile
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.content_json.subheadline || ''}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            subheadline: e.target.value
                          })}
                          placeholder="Eine überzeugende Unterzeile"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.content_json.buttonText || ''}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            buttonText: e.target.value
                          })}
                          placeholder="Jetzt starten"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Button Link
                        </label>
                        <input
                          type="url"
                          value={selectedBlock.content_json.buttonLink || ''}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            buttonLink: e.target.value
                          })}
                          placeholder="#kontakt oder https://..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ausrichtung
                          </label>
                          <select
                            value={selectedBlock.content_json.textAlign || 'center'}
                            onChange={(e) => updateBlock(selectedBlockIndex!, {
                              ...selectedBlock.content_json,
                              textAlign: e.target.value
                            })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="left">Links</option>
                            <option value="center">Mitte</option>
                            <option value="right">Rechts</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hintergrundfarbe
                          </label>
                          <input
                            type="color"
                            value={selectedBlock.content_json.backgroundColor || '#f8fafc'}
                            onChange={(e) => updateBlock(selectedBlockIndex!, {
                              ...selectedBlock.content_json,
                              backgroundColor: e.target.value
                            })}
                            className="w-full h-10 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hintergrundbild URL
                        </label>
                        <input
                          type="url"
                          value={selectedBlock.content_json.backgroundImage || ''}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            backgroundImage: e.target.value
                          })}
                          placeholder="https://beispiel.com/bild.jpg"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </>
                  )}

                  {/* Button Block Settings */}
                  {selectedBlock.block_type === 'button' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.content_json.text || ''}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            text: e.target.value
                          })}
                          placeholder="Button Text"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Aktion
                        </label>
                        <select
                          value={selectedBlock.content_json.action || 'link'}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            action: e.target.value
                          })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="link">Link öffnen</option>
                          <option value="popup">Popup-Formular</option>
                          <option value="phone">Telefon anrufen</option>
                          <option value="email">E-Mail senden</option>
                        </select>
                      </div>

                      {selectedBlock.content_json.action === 'link' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Link/URL
                          </label>
                          <input
                            type="text"
                            value={selectedBlock.content_json.link || ''}
                            onChange={(e) => updateBlock(selectedBlockIndex!, {
                              ...selectedBlock.content_json,
                              link: e.target.value
                            })}
                            placeholder="#kontakt oder https://..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      )}

                      {selectedBlock.content_json.action === 'popup' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Formular-Typ
                            </label>
                            <select
                              value={selectedBlock.content_json.popupFormType || 'contact'}
                              onChange={(e) => updateBlock(selectedBlockIndex!, {
                                ...selectedBlock.content_json,
                                popupFormType: e.target.value
                              })}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              {PRESET_FORMS.map(form => (
                                <option key={form.id} value={form.id}>
                                  {form.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Popup-Größe
                            </label>
                            <select
                              value={selectedBlock.content_json.popupSize || 'medium'}
                              onChange={(e) => updateBlock(selectedBlockIndex!, {
                                ...selectedBlock.content_json,
                                popupSize: e.target.value
                              })}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="small">Klein</option>
                              <option value="medium">Mittel</option>
                              <option value="large">Groß</option>
                            </select>
                          </div>
                        </>
                      )}

                      {selectedBlock.content_json.action === 'phone' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Telefonnummer
                          </label>
                          <input
                            type="tel"
                            value={selectedBlock.content_json.phone || ''}
                            onChange={(e) => updateBlock(selectedBlockIndex!, {
                              ...selectedBlock.content_json,
                              phone: e.target.value
                            })}
                            placeholder="+49 123 456789"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      )}

                      {selectedBlock.content_json.action === 'email' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            E-Mail Adresse
                          </label>
                          <input
                            type="email"
                            value={selectedBlock.content_json.email || ''}
                            onChange={(e) => updateBlock(selectedBlockIndex!, {
                              ...selectedBlock.content_json,
                              email: e.target.value
                            })}
                            placeholder="info@beispiel.de"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stil
                          </label>
                          <select
                            value={selectedBlock.content_json.style || 'primary'}
                            onChange={(e) => updateBlock(selectedBlockIndex!, {
                              ...selectedBlock.content_json,
                              style: e.target.value
                            })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="primary">Primär</option>
                            <option value="secondary">Sekundär</option>
                            <option value="outline">Umrandung</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Größe
                          </label>
                          <select
                            value={selectedBlock.content_json.size || 'medium'}
                            onChange={(e) => updateBlock(selectedBlockIndex!, {
                              ...selectedBlock.content_json,
                              size: e.target.value
                            })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="small">Klein</option>
                            <option value="medium">Mittel</option>
                            <option value="large">Groß</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ausrichtung
                          </label>
                          <select
                            value={selectedBlock.content_json.alignment || 'center'}
                            onChange={(e) => updateBlock(selectedBlockIndex!, {
                              ...selectedBlock.content_json,
                              alignment: e.target.value
                            })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="left">Links</option>
                            <option value="center">Mitte</option>
                            <option value="right">Rechts</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Image Block Settings */}
                  {selectedBlock.block_type === 'image' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bild URL
                        </label>
                        <input
                          type="url"
                          value={selectedBlock.content_json.src || ''}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            src: e.target.value
                          })}
                          placeholder="https://beispiel.com/bild.jpg"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Alt Text (für SEO)
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.content_json.alt || ''}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            alt: e.target.value
                          })}
                          placeholder="Beschreibung des Bildes"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bildunterschrift (optional)
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.content_json.caption || ''}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            caption: e.target.value
                          })}
                          placeholder="Bildunterschrift..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ausrichtung
                          </label>
                          <select
                            value={selectedBlock.content_json.alignment || 'center'}
                            onChange={(e) => updateBlock(selectedBlockIndex!, {
                              ...selectedBlock.content_json,
                              alignment: e.target.value
                            })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="left">Links</option>
                            <option value="center">Mitte</option>
                            <option value="right">Rechts</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Breite
                          </label>
                          <select
                            value={selectedBlock.content_json.width || 'auto'}
                            onChange={(e) => updateBlock(selectedBlockIndex!, {
                              ...selectedBlock.content_json,
                              width: e.target.value
                            })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="auto">Auto</option>
                            <option value="25%">25%</option>
                            <option value="50%">50%</option>
                            <option value="75%">75%</option>
                            <option value="100%">100%</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Höhe
                          </label>
                          <select
                            value={selectedBlock.content_json.height || 'auto'}
                            onChange={(e) => updateBlock(selectedBlockIndex!, {
                              ...selectedBlock.content_json,
                              height: e.target.value
                            })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="auto">Auto</option>
                            <option value="200px">200px</option>
                            <option value="300px">300px</option>
                            <option value="400px">400px</option>
                            <option value="500px">500px</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Spacer Block Settings */}
                  {selectedBlock.block_type === 'spacer' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Höhe
                      </label>
                      <select
                        value={selectedBlock.content_json.height || '50px'}
                        onChange={(e) => updateBlock(selectedBlockIndex!, {
                          ...selectedBlock.content_json,
                          height: e.target.value
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="20px">Klein (20px)</option>
                        <option value="50px">Mittel (50px)</option>
                        <option value="100px">Groß (100px)</option>
                        <option value="150px">Sehr Groß (150px)</option>
                        <option value="200px">Extra Groß (200px)</option>
                      </select>
                    </div>
                  )}

                  {/* Testimonial Block Settings */}
                  {selectedBlock.block_type === 'testimonial' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Testimonial auswählen
                        </label>
                        <TestimonialSelector
                          selectedId={selectedBlock.content_json.testimonial_id}
                          onSelect={(testimonialId) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            testimonial_id: testimonialId
                          })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Layout
                        </label>
                        <select
                          value={selectedBlock.content_json.layout || 'card'}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            layout: e.target.value
                          })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="card">Karte</option>
                          <option value="inline">Inline</option>
                          <option value="quote">Zitat</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="showImage"
                            checked={selectedBlock.content_json.showImage !== false}
                            onChange={(e) => updateBlock(selectedBlockIndex!, {
                              ...selectedBlock.content_json,
                              showImage: e.target.checked
                            })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="showImage" className="ml-2 text-sm text-gray-700">
                            Bild anzeigen
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="showRating"
                            checked={selectedBlock.content_json.showRating !== false}
                            onChange={(e) => updateBlock(selectedBlockIndex!, {
                              ...selectedBlock.content_json,
                              showRating: e.target.checked
                            })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="showRating" className="ml-2 text-sm text-gray-700">
                            Bewertung anzeigen
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="showLocation"
                            checked={selectedBlock.content_json.showLocation !== false}
                            onChange={(e) => updateBlock(selectedBlockIndex!, {
                              ...selectedBlock.content_json,
                              showLocation: e.target.checked
                            })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="showLocation" className="ml-2 text-sm text-gray-700">
                            Ort anzeigen
                          </label>
                        </div>
                      </div>
                    </>
                  )}

                  {/* PriceTable Block Settings */}
                  {selectedBlock.block_type === 'price_table' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vertragsart auswählen
                        </label>
                        <ContractTypeSelector
                          selectedId={selectedBlock.content_json.contract_type_id}
                          onSelect={(contractTypeId) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            contract_type_id: contractTypeId
                          })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Layout
                          </label>
                          <select
                            value={selectedBlock.content_json.layout || 'cards'}
                            onChange={(e) => updateBlock(selectedBlockIndex!, {
                              ...selectedBlock.content_json,
                              layout: e.target.value
                            })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="cards">Karten</option>
                            <option value="table">Tabelle</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Farbschema
                          </label>
                          <select
                            value={selectedBlock.content_json.color_scheme || 'blue'}
                            onChange={(e) => updateBlock(selectedBlockIndex!, {
                              ...selectedBlock.content_json,
                              color_scheme: e.target.value
                            })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="blue">Blau</option>
                            <option value="green">Grün</option>
                            <option value="purple">Lila</option>
                            <option value="orange">Orange</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.content_json.button_text || 'Jetzt buchen'}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            button_text: e.target.value
                          })}
                          placeholder="Jetzt buchen"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="showFeatures"
                            checked={selectedBlock.content_json.show_features !== false}
                            onChange={(e) => updateBlock(selectedBlockIndex!, {
                              ...selectedBlock.content_json,
                              show_features: e.target.checked
                            })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="showFeatures" className="ml-2 text-sm text-gray-700">
                            Features anzeigen
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="showPopularBadge"
                            checked={selectedBlock.content_json.show_popular_badge || false}
                            onChange={(e) => updateBlock(selectedBlockIndex!, {
                              ...selectedBlock.content_json,
                              show_popular_badge: e.target.checked
                            })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="showPopularBadge" className="ml-2 text-sm text-gray-700">
                            Beliebt-Badge anzeigen
                          </label>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Flexbox Block Settings */}
                  {selectedBlock.block_type === 'flexbox' && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Richtung
                          </label>
                          <select
                            value={selectedBlock.content_json.direction || 'row'}
                            onChange={(e) => updateBlock(selectedBlockIndex!, {
                              ...selectedBlock.content_json,
                              direction: e.target.value
                            })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="row">Horizontal</option>
                            <option value="column">Vertikal</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Verteilung
                          </label>
                          <select
                            value={selectedBlock.content_json.justify || 'flex-start'}
                            onChange={(e) => updateBlock(selectedBlockIndex!, {
                              ...selectedBlock.content_json,
                              justify: e.target.value
                            })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="flex-start">Start</option>
                            <option value="center">Mitte</option>
                            <option value="flex-end">Ende</option>
                            <option value="space-between">Zwischen</option>
                            <option value="space-around">Umrahmt</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ausrichtung
                          </label>
                          <select
                            value={selectedBlock.content_json.align || 'flex-start'}
                            onChange={(e) => updateBlock(selectedBlockIndex!, {
                              ...selectedBlock.content_json,
                              align: e.target.value
                            })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="flex-start">Start</option>
                            <option value="center">Mitte</option>
                            <option value="flex-end">Ende</option>
                            <option value="stretch">Strecken</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Abstand
                          </label>
                          <select
                            value={selectedBlock.content_json.gap || '1rem'}
                            onChange={(e) => updateBlock(selectedBlockIndex!, {
                              ...selectedBlock.content_json,
                              gap: e.target.value
                            })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="0">Kein</option>
                            <option value="0.5rem">Klein</option>
                            <option value="1rem">Mittel</option>
                            <option value="1.5rem">Groß</option>
                            <option value="2rem">Extra Groß</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hintergrundfarbe
                        </label>
                        <input
                          type="color"
                          value={selectedBlock.content_json.backgroundColor || '#f8fafc'}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            backgroundColor: e.target.value
                          })}
                          className="w-full h-10 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="wrap"
                          checked={selectedBlock.content_json.wrap || false}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            wrap: e.target.checked
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="wrap" className="ml-2 text-sm text-gray-700">
                          Umbruch erlauben
                        </label>
                      </div>
                    </>
                  )}

                  {/* FAQ Block Settings */}
                  {selectedBlock.block_type === 'faq' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Titel
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.content_json.title || ''}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            title: e.target.value
                          })}
                          placeholder="Häufige Fragen"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          FAQ Items
                        </label>
                        <textarea
                          value={JSON.stringify(selectedBlock.content_json.items || [])}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            items: JSON.parse(e.target.value)
                          })}
                          placeholder="JSON Format: [{ question: 'Frage?', answer: 'Antwort' }]"
                          className="w-full min-h-[100px] border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                      </div>
                    </>
                  )}

                  {/* Services Block Settings */}
                  {selectedBlock.block_type === 'services' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Titel
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.content_json.title || ''}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            title: e.target.value
                          })}
                          placeholder="Unsere Dienstleistungen"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Services
                        </label>
                        <textarea
                          value={JSON.stringify(selectedBlock.content_json.services || [])}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            services: JSON.parse(e.target.value)
                          })}
                          placeholder="JSON Format: [{ title: 'Service', description: 'Beschreibung', icon: '⚡' }]"
                          className="w-full min-h-[100px] border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Spalten
                        </label>
                        <select
                          value={selectedBlock.content_json.columns || '3'}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            columns: parseInt(e.target.value)
                          })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="2">2 Spalten</option>
                          <option value="3">3 Spalten</option>
                          <option value="4">4 Spalten</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Timer Block Settings */}
                  {selectedBlock.block_type === 'timer' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vortext
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.content_json.preText || ''}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            preText: e.target.value
                          })}
                          placeholder="Angebot läuft ab in:"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Posttext
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.content_json.postText || ''}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            postText: e.target.value
                          })}
                          placeholder="Verpassen Sie nicht unser limitiertes Angebot!"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Zieldatum
                        </label>
                        <input
                          type="datetime-local"
                          value={selectedBlock.content_json.targetDate || ''}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            targetDate: e.target.value
                          })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </>
                  )}

                  {/* Schedule Block Settings */}
                  {selectedBlock.block_type === 'schedule' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Titel
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.content_json.title || ''}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            title: e.target.value
                          })}
                          placeholder="Kursplan"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Iframe URL
                        </label>
                        <input
                          type="url"
                          value={selectedBlock.content_json.iframeUrl || ''}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            iframeUrl: e.target.value
                          })}
                          placeholder="https://beispiel.com/kursplan.html"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Höhe
                        </label>
                        <select
                          value={selectedBlock.content_json.height || '500px'}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            height: e.target.value
                          })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="200px">200px</option>
                          <option value="300px">300px</option>
                          <option value="400px">400px</option>
                          <option value="500px">500px</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Gallery Block Settings */}
                  {selectedBlock.block_type === 'gallery' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Titel
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.content_json.title || ''}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            title: e.target.value
                          })}
                          placeholder="Galerie"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bilder
                        </label>
                        <textarea
                          value={JSON.stringify(selectedBlock.content_json.images || [])}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            images: JSON.parse(e.target.value)
                          })}
                          placeholder="JSON Format: [{ src: 'https://beispiel.com/bild1.jpg', alt: 'Bild 1' }, { src: 'https://beispiel.com/bild2.jpg', alt: 'Bild 2' }]"
                          className="w-full min-h-[100px] border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Anzahl der sichtbaren Bilder
                        </label>
                        <select
                          value={selectedBlock.content_json.itemsVisible || '3'}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            itemsVisible: parseInt(e.target.value)
                          })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="1">1 Bild</option>
                          <option value="2">2 Bilder</option>
                          <option value="3">3 Bilder</option>
                          <option value="4">4 Bilder</option>
                          <option value="5">5 Bilder</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Automatische Rotation
                        </label>
                        <select
                          value={selectedBlock.content_json.autoplay || 'false'}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            autoplay: e.target.value === 'true'
                          })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="false">Nein</option>
                          <option value="true">Ja</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Contact Block Settings */}
                  {selectedBlock.block_type === 'contact' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Titel
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.content_json.title || ''}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            title: e.target.value
                          })}
                          placeholder="Kontakt & Standort"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Adresse
                        </label>
                        <textarea
                          value={selectedBlock.content_json.address || ''}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            address: e.target.value
                          })}
                          placeholder="Ihre Adresse hier"
                          className="w-full min-h-[100px] border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Telefon
                        </label>
                        <input
                          type="tel"
                          value={selectedBlock.content_json.phone || ''}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            phone: e.target.value
                          })}
                          placeholder="+49 123 456789"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          E-Mail
                        </label>
                        <input
                          type="email"
                          value={selectedBlock.content_json.email || ''}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            email: e.target.value
                          })}
                          placeholder="info@beispiel.de"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="showMap"
                          checked={selectedBlock.content_json.showMap || false}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            showMap: e.target.checked
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="showMap" className="ml-2 text-sm text-gray-700">
                          Google Maps Integration
                        </label>
                      </div>
                    </>
                  )}

                  {/* Single Image Block Settings */}
                  {selectedBlock.block_type === 'single_image' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bild URL
                        </label>
                        <input
                          type="url"
                          value={selectedBlock.content_json.src || ''}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            src: e.target.value
                          })}
                          placeholder="https://beispiel.com/bild.jpg"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Alt Text (für SEO)
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.content_json.alt || ''}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            alt: e.target.value
                          })}
                          placeholder="Beschreibung des Bildes"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bildunterschrift (optional)
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.content_json.caption || ''}
                          onChange={(e) => updateBlock(selectedBlockIndex!, {
                            ...selectedBlock.content_json,
                            caption: e.target.value
                          })}
                          placeholder="Bildunterschrift..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ausrichtung
                          </label>
                          <select
                            value={selectedBlock.content_json.alignment || 'center'}
                            onChange={(e) => updateBlock(selectedBlockIndex!, {
                              ...selectedBlock.content_json,
                              alignment: e.target.value
                            })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="left">Links</option>
                            <option value="center">Mitte</option>
                            <option value="right">Rechts</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Breite
                          </label>
                          <select
                            value={selectedBlock.content_json.width || 'auto'}
                            onChange={(e) => updateBlock(selectedBlockIndex!, {
                              ...selectedBlock.content_json,
                              width: e.target.value
                            })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="auto">Auto</option>
                            <option value="25%">25%</option>
                            <option value="50%">50%</option>
                            <option value="75%">75%</option>
                            <option value="100%">100%</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Höhe
                          </label>
                          <select
                            value={selectedBlock.content_json.height || 'auto'}
                            onChange={(e) => updateBlock(selectedBlockIndex!, {
                              ...selectedBlock.content_json,
                              height: e.target.value
                            })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="auto">Auto</option>
                            <option value="200px">200px</option>
                            <option value="300px">300px</option>
                            <option value="400px">400px</option>
                            <option value="500px">500px</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Default message for unsupported blocks */}
                  {!['text', 'hero', 'button', 'image', 'spacer', 'testimonial', 'pricetable', 'flexbox', 'faq', 'services', 'timer', 'schedule', 'gallery', 'contact', 'single_image'].includes(selectedBlock.block_type) && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Einstellungen für {BLOCK_TYPES.find(t => t.type === selectedBlock.block_type)?.label || 'diesen Block'} sind noch in Entwicklung.
                      </p>
                    </div>
                  )}
                  
                  {/* Common block actions */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <button
                        onClick={() => duplicateBlock(selectedBlockIndex!)}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Duplizieren
                      </button>
                      <button
                        onClick={() => deleteBlock(selectedBlockIndex!)}
                        className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <Settings size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Wählen Sie einen Block
                </h3>
                <p className="text-gray-600">
                  Klicken Sie auf einen Block in der Vorschau, um dessen Einstellungen zu bearbeiten.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && landingPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-6">Landingpage Einstellungen</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titel
                  </label>
                  <input
                    type="text"
                    value={landingPage.title}
                    onChange={(e) => setLandingPage(prev => prev ? {...prev, title: e.target.value} : null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={landingPage.slug}
                    onChange={(e) => setLandingPage(prev => prev ? {...prev, slug: e.target.value} : null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="z.B. mein-angebot"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title (SEO)
                  </label>
                  <input
                    type="text"
                    value={landingPage.meta_title || ''}
                    onChange={(e) => setLandingPage(prev => prev ? {...prev, meta_title: e.target.value} : null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description (SEO)
                  </label>
                  <textarea
                    value={landingPage.meta_description || ''}
                    onChange={(e) => setLandingPage(prev => prev ? {...prev, meta_description: e.target.value} : null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={landingPage.is_active}
                    onChange={(e) => setLandingPage(prev => prev ? {...prev, is_active: e.target.checked} : null)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                    Landingpage ist live
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 