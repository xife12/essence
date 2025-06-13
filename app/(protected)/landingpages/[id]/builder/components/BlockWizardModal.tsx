import React, { useState, useEffect } from 'react';
import { BLOCK_PRESETS } from './presets';
import { Plus } from 'lucide-react';
import supabase from '../../../../../lib/supabaseClient';
import { CITemplate } from '../../../../../lib/api/ci-templates';

interface Testimonial {
  id: string;
  name: string;
  firstname?: string;
  lastname?: string;
  gender?: 'Männlich' | 'Weiblich' | 'Divers';
  age?: number;
  location?: string;
  rating: number;
  text_content: string;
  file_asset?: {
    id: string;
    filename: string;
    file_url: string;
  };
  tags: string[];
  training_goals: string[];
  member_since?: string;
  is_active: boolean;
  created_at: string;
}

interface TestimonialWizardData {
  headline?: string;
  text?: string;
  count: number;
  ageFrom?: number;
  ageTo?: number;
  gender?: string;
  tags?: string;
  goals?: string | string[];
  showImage: boolean;
  showFirstname: boolean;
  showLastname: boolean;
  showLastnameShort: boolean;
  showMemberSince: boolean;
  showTags: boolean;
  showExcerpt: boolean;
  showStars: boolean;
  showGoals: boolean;
  showGender: boolean;
  preset?: string;
  animation?: string;
  animationDuration?: number;
  animationDelay?: number;
  _goalInput?: string;
  selectedTestimonials?: string[];
}

interface BlockWizardModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: TestimonialWizardData) => void;
  initialData?: Partial<TestimonialWizardData>;
  ciTemplate?: CITemplate | null;
}

// Dummy-Daten (außerhalb der Komponente, damit mehrfach nutzbar)
const DUMMY_TESTIMONIALS = [
  { name: 'Max Mustermann', rating: 5, text: 'Super Beratung und tolles Team!', image: '', age: 32, gender: 'm', goals: 'Abnehmen' },
  { name: 'Anna Schmidt', rating: 4, text: 'Sehr zufrieden, komme gerne wieder.', image: '', age: 28, gender: 'w', goals: 'Muskelaufbau' },
  { name: 'T. Müller', rating: 5, text: 'Top Studio!', image: '', age: 45, gender: 'd', goals: 'Fitness' }
];

// Hilfsfunktion: Alle Ziele extrahieren
function getAllGoals() {
  const all = DUMMY_TESTIMONIALS.map(t => t.goals).filter(Boolean);
  return Array.from(new Set(all));
}

// Dummy-Preview-Komponente für Testimonials (vollständig überarbeitet)
function TestimonialPresetPreview({ 
  preset, 
  config, 
  animate, 
  realTestimonials = [],
  selectedTestimonialIds = [],
  ciTemplate
}: { 
  preset: string, 
  config: TestimonialWizardData, 
  animate?: boolean,
  realTestimonials?: Testimonial[],
  selectedTestimonialIds?: string[],
  ciTemplate?: CITemplate | null
}) {
  // Verwende CI-Template-Farben falls verfügbar, sonst Fallback
  const accent = ciTemplate?.primary_color || '#3B82F6';
  const secondary = ciTemplate?.secondary_color || '#1E40AF';
  const cardBg = ciTemplate?.background_color || '#fff';
  const textColor = ciTemplate?.text_color || '#222';
  const starColor = ciTemplate?.accent_color || '#fbbf24';
  
  // Verwende echte Testimonials wenn verfügbar und ausgewählt
  let testimonialData;
  if (realTestimonials.length > 0 && selectedTestimonialIds.length > 0) {
    const selectedTestimonials = realTestimonials.filter(t => selectedTestimonialIds.includes(t.id));
    testimonialData = selectedTestimonials.slice(0, config.count || 3).map(t => ({
      name: t.firstname && t.lastname ? `${t.firstname} ${t.lastname}` : t.name,
      rating: t.rating,
      text: t.text_content,
      image: t.file_asset?.file_url || '',
      age: t.age || 0,
      gender: t.gender === 'Männlich' ? 'm' : t.gender === 'Weiblich' ? 'w' : 'd',
      goals: t.training_goals || [],
      tags: t.tags || [],
      memberSince: t.member_since || '2 Months Ago',
      hasImage: !!t.file_asset?.file_url
    }));
  } else {
    // Fallback zu Dummy-Daten
    let filtered = DUMMY_TESTIMONIALS.filter(t =>
      (!config.ageFrom || t.age >= config.ageFrom) &&
      (!config.ageTo || t.age <= config.ageTo) &&
      (!config.gender || config.gender === '' || t.gender === config.gender) &&
      (!config.goals || (Array.isArray(config.goals) ? config.goals.length === 0 : !config.goals) || (Array.isArray(config.goals) ? config.goals.includes(t.goals) : config.goals.split(',').map(g => g.trim()).includes(t.goals)))
    );
    
    if (!config.ageFrom && !config.ageTo) {
      filtered = DUMMY_TESTIMONIALS.filter(t =>
        (!config.gender || config.gender === '' || t.gender === config.gender) &&
        (!config.goals || (Array.isArray(config.goals) ? config.goals.length === 0 : !config.goals) || (Array.isArray(config.goals) ? config.goals.includes(t.goals) : config.goals.split(',').map(g => g.trim()).includes(t.goals)))
      );
    }
    testimonialData = filtered.slice(0, config.count || 3).map(t => ({ 
      ...t, 
      hasImage: false,
      goals: [t.goals],
      tags: ['Fitness', 'Premium'],
      memberSince: '2 Months Ago'
    }));
  }

  // Anzeigeoptionen
  const showName = (config.showFirstname || config.showLastname) ?? true;
  const showStars = config.showStars ?? true;
  const showExcerpt = config.showExcerpt ?? true;
  const showImage = config.showImage ?? true;
  const showGoals = config.showGoals ?? false;
  const showGender = config.showGender ?? false;
  const showTags = config.showTags ?? false;
  const showMemberSince = config.showMemberSince ?? false;
  
  // Hilfsfunktionen
  const getName = (t: any) => {
    if (!config.showFirstname && !config.showLastname) return t.name;
    
    let displayName = '';
    if (config.showFirstname && t.name) {
      const firstname = t.name.split(' ')[0];
      displayName += firstname;
    }
    if (config.showLastname && t.name) {
      const lastname = t.name.split(' ')[1] || '';
      if (lastname) {
        if (config.showLastnameShort) {
          displayName += ` ${lastname[0]}.`;
        } else {
          displayName += ` ${lastname}`;
        }
      }
    }
    return displayName || t.name;
  };
  
  const getText = (t: any) => showExcerpt ? (t.text && t.text.length > 30 ? t.text.slice(0, 30) + '…' : (t.text || '')) : '';
  
  const renderStars = (count: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} style={{ color: star <= count ? starColor : '#E5E7EB' }} className="text-sm">★</span>
      ))}
    </div>
  );
  
  const renderGoalBadge = (goal: string) => (
    <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full mr-1 mt-1">{goal}</span>
  );
  
  const renderTagBadge = (tag: string) => (
    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full mr-1 mt-1">{tag}</span>
  );
  
  const renderGoalsAndTags = (t: any) => (
    <div className="mt-2">
      {showGoals && t.goals && t.goals.length > 0 && (
        <div className="flex flex-wrap">
          {t.goals.slice(0, 2).map((goal: string, idx: number) => (
            <span key={idx} className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full mr-1 mb-1">{goal}</span>
          ))}
        </div>
      )}
      {showTags && t.tags && t.tags.length > 0 && (
        <div className="flex flex-wrap">
          {t.tags.slice(0, 2).map((tag: string, idx: number) => (
            <span key={idx} className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full mr-1 mb-1">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
  
  // Bild-Komponente
  const renderImage = (t: any, size: 'small' | 'medium' | 'large', layout: 'minimal' | 'default' = 'default') => {
    if (!showImage) return null;
    
    const sizeClasses = {
      small: 'w-10 h-10',
      medium: 'w-14 h-14', 
      large: 'w-16 h-16'
    };
    
    // Für Minimal Layout keine Zentrierung, für andere Layouts zentriert
    const centerClass = layout === 'minimal' ? '' : 'mx-auto';
    
    const initials = t.name ? t.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
    
    if (t.hasImage && t.image) {
      return (
        <div className={`${sizeClasses[size]} rounded-full mb-2 overflow-hidden bg-gray-200 ${centerClass}`}>
          <img 
            src={t.image} 
            alt={t.name || 'Testimonial'}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-600 font-medium bg-gray-300"><span class="text-sm">${initials}</span></div>`;
              }
            }}
          />
        </div>
      );
    } else {
      return (
        <div className={`${sizeClasses[size]} rounded-full bg-gray-300 mb-2 flex items-center justify-center text-gray-600 font-medium ${centerClass}`}>
          <span className="text-sm">{initials}</span>
        </div>
      );
    }
  };

  // Header-Bereich (Überschrift + Text)
  const renderHeader = () => {
    if (!config.headline && !config.text) return null;
    
    return (
      <div className="text-center mb-12">
        {config.headline && (
          <h2 className="text-3xl font-bold mb-4" style={{ color: textColor }}>
            {config.headline}
          </h2>
        )}
        {config.text && (
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {config.text}
          </p>
        )}
      </div>
    );
  };
  
  // Animation Wrapper
  const animationClass = animate ? getAnimationClass(config.animation || '') : '';
  const style: React.CSSProperties = animate ? {
    animationDuration: (config.animationDuration || 500) + 'ms',
    animationDelay: (config.animationDelay || 0) + 'ms',
    animationFillMode: 'both',
  } : {};
  
  // Fallback wenn keine Testimonials vorhanden
  if (testimonialData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500 text-center">
        {renderHeader()}
        <div>
          <p className="text-sm font-medium">Keine Testimonials verfügbar</p>
          <p className="text-xs mt-1">Wählen Sie Testimonials aus oder passen Sie die Filter an</p>
        </div>
      </div>
    );
  }

  // Layout-Implementierungen
  switch (preset) {
    case 'classic':
      return (
        <div className={`${animationClass} max-w-6xl mx-auto px-4`} style={style}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text-Bereich links */}
            <div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: textColor }}>
                {config.headline || 'See What Our Customers Words'}
              </h3>
              {/* Kundenrezension anstatt Beschreibungstext */}
              <div className="mb-6">
                <p className="text-lg text-gray-700 italic mb-4 leading-relaxed">
                  "{testimonialData[0]?.text || 'Donec dictum tristique porta. Etiam convallis lorem lobortis nulla molestie, nec tincidunt ex ullamcorper. Quisque ultrices lobortis elit sed euismod. Duis in ultrices dolor, ac rhoncus odio. Suspendisse tempor sollicitudin dui sed lacinia.'}"
                </p>
                <div className="flex items-center gap-3">
                  {renderImage(testimonialData[0] || {}, 'medium')}
                  <div>
                    <div className="font-semibold text-sm" style={{ color: textColor }}>
                      {getName(testimonialData[0] || {})}
                    </div>
                    {showStars && (
                      <div className="mt-1">{renderStars(testimonialData[0]?.rating || 5)}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Testimonials rechts */}
            <div className="space-y-6">
              {testimonialData.slice(0, 3).map((t, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    {renderImage(t, 'medium')}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-sm" style={{ color: textColor }}>{getName(t)}</span>
                        {showMemberSince && (
                          <span className="text-xs text-gray-500">• {t.memberSince}</span>
                        )}
                      </div>
                      {showStars && (
                        <div className="mb-2">{renderStars(t.rating)}</div>
                      )}
                      <p className="text-sm text-gray-600">{getText(t)}</p>
                      {renderGoalsAndTags(t)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'grid':
      return (
        <div className={`${animationClass} max-w-6xl mx-auto px-4`} style={style}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonialData.slice(0, 6).map((t, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-center">
                  {renderImage(t, 'large')}
                  <h4 className="font-semibold mb-1" style={{ color: textColor }}>{getName(t)}</h4>
                  {showStars && (
                    <div className="mb-3 flex justify-center">{renderStars(t.rating)}</div>
                  )}
                  <p className="text-sm text-gray-600 mb-4">{getText(t)}</p>
                  {renderGoalsAndTags(t)}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'carousel':
      return (
        <div className={`${animationClass} max-w-4xl mx-auto px-4`} style={style}>
          {renderHeader()}
          <div className="relative">
            <div className="flex items-center justify-center gap-8">
              <button className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-400 hover:text-gray-600">
                <span className="text-xl">‹</span>
              </button>
              
              <div className="bg-white p-8 rounded-2xl shadow-lg max-w-2xl text-center">
                {renderImage(testimonialData[0] || {}, 'large')}
                <h4 className="font-bold text-lg mb-2" style={{ color: textColor }}>
                  {getName(testimonialData[0] || {})}
                </h4>
                {showStars && (
                  <div className="mb-4 flex justify-center">{renderStars(testimonialData[0]?.rating || 5)}</div>
                )}
                <p className="text-gray-600 italic mb-4">
                  "{testimonialData[0]?.text || 'Excellent service and great value for money. I couldn\'t be happier!'}"
                </p>
                {renderGoalsAndTags(testimonialData[0] || {})}
              </div>
              
              <button className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-400 hover:text-gray-600">
                <span className="text-xl">›</span>
              </button>
            </div>
            
            {/* Dots indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {[0, 1, 2].map(i => (
                <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-blue-500' : 'bg-gray-300'}`} />
              ))}
            </div>
          </div>
        </div>
      );

    case 'minimal':
      return (
        <div className={`${animationClass} max-w-5xl mx-auto px-4`} style={style}>
          {renderHeader()}
          <div className="space-y-8">
            {testimonialData.slice(0, 3).map((t, i) => (
              <div key={i} className="flex items-center gap-6 p-6 bg-gray-50 rounded-lg">
                {renderImage(t, 'large', 'minimal')}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {showStars && renderStars(t.rating)}
                    <span className="text-sm text-gray-500">• {t.memberSince}</span>
                  </div>
                  <p className="text-gray-700 mb-2">"{t.text}"</p>
                  <div className="font-semibold" style={{ color: textColor }}>{getName(t)}</div>
                  {renderGoalsAndTags(t)}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'cards':
      return (
        <div className={`${animationClass} max-w-6xl mx-auto px-4`} style={style}>
          {renderHeader()}
          <div className="flex gap-6 justify-center flex-wrap">
            {testimonialData.slice(0, 3).map((t, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-lg max-w-xs text-center border-t-4" style={{ borderTopColor: accent }}>
                {renderImage(t, 'large')}
                <h4 className="font-bold mb-2" style={{ color: textColor }}>{getName(t)}</h4>
                {showStars && (
                  <div className="mb-3 flex justify-center">{renderStars(t.rating)}</div>
                )}
                <p className="text-sm text-gray-600 mb-4">"{getText(t)}"</p>
                {renderGoalsAndTags(t)}
              </div>
            ))}
          </div>
        </div>
      );

    case 'centered':
      return (
        <div className={`${animationClass} max-w-4xl mx-auto px-4 text-center`} style={style}>
          {renderHeader()}
          <div className="bg-white p-12 rounded-2xl shadow-xl" style={{ borderLeft: `4px solid ${accent}` }}>
            {renderImage(testimonialData[0] || {}, 'large')}
            <h4 className="font-bold text-xl mb-2" style={{ color: textColor }}>
              {getName(testimonialData[0] || {})}
            </h4>
            {showStars && (
              <div className="mb-4 flex justify-center">{renderStars(testimonialData[0]?.rating || 5)}</div>
            )}
            <p className="text-lg text-gray-600 italic mb-4">
              "{testimonialData[0]?.text || 'A fantastic experience from start to finish. Highly recommended!'}"
            </p>
            {renderGoalsAndTags(testimonialData[0] || {})}
          </div>
        </div>
      );

    case 'compact':
      return (
        <div className={`${animationClass} max-w-6xl mx-auto px-4`} style={style}>
          {renderHeader()}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {testimonialData.slice(0, 4).map((t, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
                {renderImage(t, 'medium')}
                <div className="font-semibold text-sm mb-1" style={{ color: textColor }}>{getName(t)}</div>
                {showStars && (
                  <div className="mb-2 flex justify-center">{renderStars(t.rating)}</div>
                )}
                <p className="text-xs text-gray-600">{getText(t)}</p>
                {renderGoalsAndTags(t)}
              </div>
            ))}
          </div>
        </div>
      );

    case 'default':
    default:
      return (
        <div className={`${animationClass} max-w-5xl mx-auto px-4`} style={style}>
          {renderHeader()}
          <div className="flex gap-6 justify-center flex-wrap">
            {testimonialData.slice(0, 3).map((t, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-sm text-center">
                {renderImage(t, 'medium')}
                <h4 className="font-semibold mb-1" style={{ color: textColor }}>{getName(t)}</h4>
                {showStars && (
                  <div className="mb-3 flex justify-center">{renderStars(t.rating)}</div>
                )}
                <p className="text-sm text-gray-600 mb-3">"{getText(t)}"</p>
                {renderGoalsAndTags(t)}
              </div>
            ))}
          </div>
        </div>
      );
  }
}

// Hilfsfunktion: Animation-Klasse für Preview
function getAnimationClass(animation: string) {
  switch (animation) {
    case 'fade-in': return 'animate-fade-in';
    case 'slide-up': return 'animate-slide-up';
    case 'slide-down': return 'animate-slide-down';
    case 'slide-left': return 'animate-slide-left';
    case 'slide-right': return 'animate-slide-right';
    case 'zoom-in': return 'animate-zoom-in';
    case 'bounce': return 'animate-bounce-in';
    default: return '';
  }
}

export default function BlockWizardModal({ open, onClose, onSave, initialData, ciTemplate }: BlockWizardModalProps) {
  const [form, setForm] = useState<TestimonialWizardData>({
    headline: initialData?.headline || '',
    text: initialData?.text || '',
    count: initialData?.count || 3,
    ageFrom: initialData?.ageFrom || undefined,
    ageTo: initialData?.ageTo || undefined,
    gender: initialData?.gender || '',
    tags: initialData?.tags || '',
    goals: initialData?.goals || '',
    showImage: initialData?.showImage ?? true,
    showFirstname: initialData?.showFirstname ?? true,
    showLastname: initialData?.showLastname ?? true,
    showLastnameShort: initialData?.showLastnameShort ?? true,
    showMemberSince: initialData?.showMemberSince ?? true,
    showTags: initialData?.showTags ?? true,
    showExcerpt: initialData?.showExcerpt ?? true,
    showStars: initialData?.showStars ?? true,
    showGoals: initialData?.showGoals ?? false,
    showGender: initialData?.showGender ?? false,
    preset: initialData?.preset || 'default',
    animation: initialData?.animation || 'none',
    animationDuration: initialData?.animationDuration || 500,
    animationDelay: initialData?.animationDelay || 0,
    _goalInput: initialData?._goalInput || '',
    selectedTestimonials: initialData?.selectedTestimonials || [],
  });

  // State für echte Testimonials
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(false);

  // Testimonials aus Datenbank laden
  const fetchTestimonials = async () => {
    try {
      setLoadingTestimonials(true);
      
      const { data, error } = await supabase
        .from('testimonials')
        .select(`
          *,
          file_asset:file_asset_id (
            id,
            filename,
            file_url
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Testimonials:', error);
    } finally {
      setLoadingTestimonials(false);
    }
  };

  // Filter Testimonials basierend auf Kriterien
  const filterTestimonials = () => {
    let filtered = testimonials;

    // Altersfilter
    if (form.ageFrom || form.ageTo) {
      filtered = filtered.filter(t => {
        if (!t.age) return false;
        if (form.ageFrom && t.age < form.ageFrom) return false;
        if (form.ageTo && t.age > form.ageTo) return false;
        return true;
      });
    }

    // Geschlechtsfilter
    if (form.gender && form.gender !== '') {
      filtered = filtered.filter(t => t.gender === form.gender);
    }

    // Ziele-Filter
    if (form.goals && Array.isArray(form.goals) && form.goals.length > 0) {
      filtered = filtered.filter(t => 
        t.training_goals && t.training_goals.some(goal => 
          form.goals.includes(goal)
        )
      );
    }

    setFilteredTestimonials(filtered);
  };

  // Effects
  useEffect(() => {
    if (open) {
      fetchTestimonials();
    }
  }, [open]);

  useEffect(() => {
    filterTestimonials();
  }, [testimonials, form.ageFrom, form.ageTo, form.gender, form.goals]);

  // Handler für Testimonial-Auswahl
  const handleTestimonialToggle = (testimonialId: string) => {
    const currentSelection = form.selectedTestimonials || [];
    const isSelected = currentSelection.includes(testimonialId);
    
    if (isSelected) {
      setForm(prev => ({
        ...prev,
        selectedTestimonials: currentSelection.filter(id => id !== testimonialId)
      }));
    } else {
      setForm(prev => ({
        ...prev,
        selectedTestimonials: [...currentSelection, testimonialId]
      }));
    }
  };

  // Alle Testimonials auswählen/abwählen
  const handleSelectAll = () => {
    const currentSelection = form.selectedTestimonials || [];
    const filteredIds = filteredTestimonials.map(t => t.id);
    
    if (currentSelection.length === filteredIds.length) {
      // Alle abwählen
      setForm(prev => ({ ...prev, selectedTestimonials: [] }));
    } else {
      // Alle auswählen
      setForm(prev => ({ ...prev, selectedTestimonials: filteredIds }));
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-8xl max-h-[98vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-10 pt-8 pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Testimonial-Block konfigurieren</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl font-bold">×</button>
        </div>
        {/* Zweispaltiges Layout */}
        <div className="flex-1 overflow-y-auto p-12 flex gap-12">
          {/* Einstellungen (links) */}
          <div className="w-1/3 min-w-[320px] max-w-md space-y-6 border-r pr-8">
            <div>
              <label className="block text-sm font-medium mb-1">Überschrift (optional)</label>
              <input type="text" className="w-full border rounded px-3 py-2" value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Text (optional)</label>
              <textarea className="w-full border rounded px-3 py-2" rows={2} value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Anzahl der Testimonials</label>
              <input type="number" min={1} max={12} className="w-full border rounded px-3 py-2" value={form.count} onChange={e => setForm(f => ({ ...f, count: parseInt(e.target.value) || 1 }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Zielgruppe: Alter von/bis</label>
              <div className="flex gap-2">
                <input type="number" min={0} max={120} placeholder="von" className="w-1/2 border rounded px-3 py-2" value={form.ageFrom || ''} onChange={e => setForm(f => ({ ...f, ageFrom: e.target.value ? parseInt(e.target.value) : undefined }))} />
                <input type="number" min={0} max={120} placeholder="bis" className="w-1/2 border rounded px-3 py-2" value={form.ageTo || ''} onChange={e => setForm(f => ({ ...f, ageTo: e.target.value ? parseInt(e.target.value) : undefined }))} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Geschlecht</label>
              <select className="w-full border rounded px-3 py-2" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                <option value="">Alle</option>
                <option value="Männlich">Männlich</option>
                <option value="Weiblich">Weiblich</option>
                <option value="Divers">Divers</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tags (Komma-getrennt)</label>
              <input type="text" className="w-full border rounded px-3 py-2" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Trainingsziele</label>
              <div className="flex gap-2 relative">
                <input
                  type="text"
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="Neues Ziel eingeben..."
                  value={form._goalInput || ''}
                  onChange={e => setForm(f => ({ ...f, _goalInput: e.target.value }))}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && form._goalInput && form._goalInput.trim() !== '') {
                      const newGoal = form._goalInput.trim();
                      const goalsArr = Array.isArray(form.goals) ? form.goals : (form.goals ? [form.goals] : []);
                      if (!goalsArr.includes(newGoal)) {
                        setForm(f => ({ ...f, goals: [...goalsArr, newGoal], _goalInput: '' }));
                      } else {
                        setForm(f => ({ ...f, _goalInput: '' }));
                      }
                      e.preventDefault();
                    }
                  }}
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-2 flex items-center"
                  onClick={() => {
                    if (form._goalInput && form._goalInput.trim() !== '') {
                      const newGoal = form._goalInput.trim();
                      const goalsArr = Array.isArray(form.goals) ? form.goals : (form.goals ? [form.goals] : []);
                      if (!goalsArr.includes(newGoal)) {
                        setForm(f => ({ ...f, goals: [...goalsArr, newGoal], _goalInput: '' }));
                      } else {
                        setForm(f => ({ ...f, _goalInput: '' }));
                      }
                    }
                  }}
                  title="Ziel hinzufügen"
                >
                  <Plus size={18} />
                </button>
                {/* Autocomplete Vorschläge */}
                {form._goalInput && form._goalInput.trim().length > 0 && (
                  (() => {
                    const goalsArr = Array.isArray(form.goals) ? form.goals : (form.goals ? [form.goals] : []);
                    const allGoals = Array.from(new Set([...getAllGoals(), ...goalsArr]));
                    const filtered = allGoals.filter(goal =>
                      goal.toLowerCase().startsWith(form._goalInput!.toLowerCase()) && !goalsArr.includes(goal)
                    );
                    if (filtered.length === 0) return null;
                    return (
                      <div className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 rounded shadow z-10 max-h-40 overflow-auto">
                        {filtered.map(goal => (
                          <button
                            key={goal}
                            type="button"
                            className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm text-gray-800"
                            onClick={() => {
                              setForm(f => ({ ...f, goals: [...goalsArr, goal], _goalInput: '' }));
                            }}
                          >
                            {goal}
                          </button>
                        ))}
                      </div>
                    );
                  })()
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(Array.isArray(form.goals) ? form.goals : (form.goals ? [form.goals] : [])).map(goal => (
                  <span key={goal} className="inline-flex items-center bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {goal}
                    <button
                      type="button"
                      className="ml-1 text-green-700 hover:text-red-500"
                      onClick={() => {
                        const goalsArr = Array.isArray(form.goals) ? form.goals : (form.goals ? [form.goals] : []);
                        setForm(f => ({ ...f, goals: goalsArr.filter(g => g !== goal) }));
                      }}
                      title="Entfernen"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="text-xs text-gray-400 mt-1">Mit Enter, + oder Klick auf Vorschlag hinzufügen, Ziele können entfernt werden</div>
            </div>
            <div className="pt-2">
              <label className="block text-sm font-medium mb-2">Darstellungsoptionen</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.showImage} onChange={e => setForm(f => ({ ...f, showImage: e.target.checked }))} /> Bild anzeigen</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.showFirstname} onChange={e => setForm(f => ({ ...f, showFirstname: e.target.checked }))} /> Vorname</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.showLastname} onChange={e => setForm(f => ({ ...f, showLastname: e.target.checked }))} /> Nachname</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.showLastnameShort} onChange={e => setForm(f => ({ ...f, showLastnameShort: e.target.checked }))} /> Kurzer Nachname</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.showMemberSince} onChange={e => setForm(f => ({ ...f, showMemberSince: e.target.checked }))} /> Mitglied seit</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.showTags} onChange={e => setForm(f => ({ ...f, showTags: e.target.checked }))} /> Tags</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.showExcerpt} onChange={e => setForm(f => ({ ...f, showExcerpt: e.target.checked }))} /> Textauszug</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.showStars} onChange={e => setForm(f => ({ ...f, showStars: e.target.checked }))} /> Sternebewertung</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.showGoals} onChange={e => setForm(f => ({ ...f, showGoals: e.target.checked }))} /> Trainingsziele</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.showGender} onChange={e => setForm(f => ({ ...f, showGender: e.target.checked }))} /> Geschlecht</label>
              </div>
            </div>
          </div>
          
          {/* Live-Preset-Preview (Mitte) */}
          <div className="flex-1 flex flex-col items-center gap-8 px-8">
            <div className="w-full flex flex-row items-center justify-center gap-4 mb-6">
              {BLOCK_PRESETS.testimonial.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, preset: preset.value }))}
                  className={`px-5 py-2 rounded-full border text-base font-medium transition-all ${form.preset === preset.value ? 'border-blue-600 bg-blue-50 text-blue-700 shadow' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="w-full flex items-center justify-center">
              <div className="w-full max-w-3xl min-h-[280px] flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-200 shadow-inner p-8">
                <TestimonialPresetPreview
                  preset={form.preset || 'default'}
                  config={form}
                  animate={true}
                  realTestimonials={testimonials}
                  selectedTestimonialIds={form.selectedTestimonials}
                  ciTemplate={ciTemplate}
                />
              </div>
            </div>
            <div className="text-center text-gray-500 text-sm max-w-xl mx-auto">
              <span>Die Vorschau zeigt die aktuelle Konfiguration mit allen Einstellungen und Animationen live an.</span>
            </div>
          </div>

          {/* Testimonial-Auswahl (rechts) */}
          <div className="w-1/3 min-w-[320px] max-w-md space-y-6 border-l pl-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Testimonials auswählen</h3>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                {(form.selectedTestimonials || []).length === filteredTestimonials.length && filteredTestimonials.length > 0 
                  ? 'Alle abwählen' 
                  : 'Alle auswählen'
                }
              </button>
            </div>
            
            {loadingTestimonials ? (
              <div className="text-center py-4 text-gray-500">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full"></div>
                <p className="mt-2 text-sm">Lade Testimonials...</p>
              </div>
            ) : filteredTestimonials.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">Keine passenden Testimonials gefunden.</p>
                <p className="text-xs mt-1">Passen Sie die Filter an oder erstellen Sie neue Testimonials.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <div className="text-xs text-gray-500 mb-3">
                  {filteredTestimonials.length} passende Testimonials gefunden
                </div>
                {filteredTestimonials.map(testimonial => {
                  const isSelected = (form.selectedTestimonials || []).includes(testimonial.id);
                  const displayName = testimonial.firstname && testimonial.lastname 
                    ? `${testimonial.firstname} ${testimonial.lastname}`
                    : testimonial.name || 'Unbekannt';
                  
                  return (
                    <label
                      key={testimonial.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-blue-300 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleTestimonialToggle(testimonial.id)}
                        className="mt-1 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-gray-900">{displayName}</span>
                          {testimonial.age && (
                            <span className="text-xs text-gray-500">({testimonial.age})</span>
                          )}
                          {testimonial.gender && (
                            <span className="text-xs text-gray-500">
                              {testimonial.gender === 'Männlich' ? '♂' : testimonial.gender === 'Weiblich' ? '♀' : '⚧'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span 
                              key={star} 
                              className={`text-xs ${star <= testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                              ★
                            </span>
                          ))}
                          <span className="text-xs text-gray-500 ml-1">({testimonial.rating})</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {testimonial.text_content.length > 60 
                            ? testimonial.text_content.slice(0, 60) + '...' 
                            : testimonial.text_content
                          }
                        </p>
                        {testimonial.training_goals && testimonial.training_goals.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {testimonial.training_goals.slice(0, 2).map(goal => (
                              <span 
                                key={goal} 
                                className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full"
                              >
                                {goal}
                              </span>
                            ))}
                            {testimonial.training_goals.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{testimonial.training_goals.length - 2} weitere
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
            
            {(form.selectedTestimonials || []).length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                <strong>{(form.selectedTestimonials || []).length}</strong> Testimonial(s) ausgewählt
              </div>
            )}
          </div>
        </div>
        {/* Footer */}
        <div className="flex items-center justify-end px-10 py-5 border-t bg-gray-50">
          <button onClick={() => onSave(form)} className="px-8 py-3 rounded-lg bg-blue-600 text-white font-bold text-lg shadow hover:bg-blue-700 transition">Speichern</button>
        </div>
      </div>
    </div>
  );
}

// Animierte Preview-Komponente
function AnimatedPreview({ preset, config, animation, duration, delay }: { preset: string, config: any, animation?: string, duration?: number, delay?: number }) {
  const [replayKey, setReplayKey] = React.useState(0);
  React.useEffect(() => { setReplayKey(k => k + 1); }, [preset, animation, duration, delay]);
  const style: React.CSSProperties = {
    animationDuration: (duration || 500) + 'ms',
    animationDelay: (delay || 0) + 'ms',
    animationFillMode: 'both',
  };
  return (
    <div key={replayKey} className={getAnimationClass(animation || '')} style={style}>
      <TestimonialPresetPreview preset={preset} config={config} animate={true} />
    </div>
  );
}

// Tailwind/CSS-Animationen (als Beispiel, ggf. in CSS-Datei auslagern)
// .animate-fade-in { animation: fadeIn 0.5s; }
// .animate-slide-up { animation: slideUp 0.5s; }
// .animate-slide-down { animation: slideDown 0.5s; }
// .animate-slide-left { animation: slideLeft 0.5s; }
// .animate-slide-right { animation: slideRight 0.5s; }
// .animate-zoom-in { animation: zoomIn 0.5s; }
// .animate-bounce-in { animation: bounceIn 0.5s; }
// @keyframes ... 