'use client'

import { 
  Type, 
  Mail, 
  Phone, 
  Hash, 
  FileText, 
  ChevronDown, 
  Calendar, 
  Clock, 
  Upload, 
  Heading1, 
  AlignLeft, 
  Minus, 
  CheckSquare, 
  Star, 
  Sliders, 
  PenTool, 
  MapPin,
  Target,
  CreditCard,
  Euro,
  Shield,
  Users
} from 'lucide-react'

export interface FieldDefinition {
  id: string
  type: string
  label: string
  icon: any
  category: 'basic' | 'layout' | 'advanced' | 'dynamic'
  description: string
  defaultConfig: any
}

const FIELD_DEFINITIONS: FieldDefinition[] = [
  // Basic Fields
  {
    id: 'text',
    type: 'text',
    label: 'Text',
    icon: Type,
    category: 'basic',
    description: 'Einfaches Textfeld',
    defaultConfig: {
      label: 'Textfeld',
      placeholder: 'Text eingeben...',
      is_required: false,
      field_width: 'full'
    }
  },
  {
    id: 'email',
    type: 'email',
    label: 'E-Mail',
    icon: Mail,
    category: 'basic',
    description: 'E-Mail-Adresse mit Validierung',
    defaultConfig: {
      label: 'E-Mail-Adresse',
      placeholder: 'ihre@email.com',
      is_required: true,
      field_width: 'full'
    }
  },
  {
    id: 'phone',
    type: 'phone',
    label: 'Telefon',
    icon: Phone,
    category: 'basic',
    description: 'Telefonnummer',
    defaultConfig: {
      label: 'Telefonnummer',
      placeholder: '+49 123 456789',
      is_required: false,
      field_width: 'half'
    }
  },
  {
    id: 'number',
    type: 'number',
    label: 'Zahl',
    icon: Hash,
    category: 'basic',
    description: 'Numerische Eingabe',
    defaultConfig: {
      label: 'Zahl',
      placeholder: '0',
      is_required: false,
      field_width: 'third'
    }
  },
  {
    id: 'textarea',
    type: 'textarea',
    label: 'Textbereich',
    icon: FileText,
    category: 'basic',
    description: 'Mehrzeiliger Text',
    defaultConfig: {
      label: 'Nachricht',
      placeholder: 'Ihre Nachricht...',
      is_required: false,
      field_width: 'full'
    }
  },
  {
    id: 'select',
    type: 'select',
    label: 'Dropdown',
    icon: ChevronDown,
    category: 'basic',
    description: 'Auswahlfeld',
    defaultConfig: {
      label: 'Auswahl',
      placeholder: 'Bitte wählen...',
      is_required: false,
      field_width: 'half',
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' }
      ]
    }
  },
  {
    id: 'radio',
    type: 'radio',
    label: 'Radio Buttons',
    icon: CheckSquare,
    category: 'basic',
    description: 'Einzelauswahl',
    defaultConfig: {
      label: 'Wählen Sie eine Option',
      is_required: false,
      field_width: 'full',
      options: [
        { value: 'ja', label: 'Ja' },
        { value: 'nein', label: 'Nein' }
      ]
    }
  },
  {
    id: 'checkbox',
    type: 'checkbox',
    label: 'Checkbox',
    icon: CheckSquare,
    category: 'basic',
    description: 'Ja/Nein Auswahl',
    defaultConfig: {
      label: 'Zustimmen',
      is_required: false,
      field_width: 'full'
    }
  },
  {
    id: 'checkbox_group',
    type: 'checkbox_group',
    label: 'Checkbox Gruppe',
    icon: Users,
    category: 'basic',
    description: 'Mehrfachauswahl',
    defaultConfig: {
      label: 'Mehrere Optionen wählen',
      is_required: false,
      field_width: 'full',
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' }
      ]
    }
  },
  {
    id: 'consent',
    type: 'consent',
    label: 'Einverständnis',
    icon: Shield,
    category: 'basic',
    description: 'DSGVO-konforme Zustimmung',
    defaultConfig: {
      label: 'Ich stimme der Datenschutzerklärung zu',
      is_required: true,
      field_width: 'full',
      privacy_url: '/datenschutz',
      consent_text: 'Mit dem Absenden stimme ich der Verarbeitung meiner Daten gemäß der Datenschutzerklärung zu.'
    }
  },
  {
    id: 'date',
    type: 'date',
    label: 'Datum',
    icon: Calendar,
    category: 'basic',
    description: 'Datumsauswahl',
    defaultConfig: {
      label: 'Datum',
      is_required: false,
      field_width: 'half'
    }
  },
  {
    id: 'time',
    type: 'time',
    label: 'Uhrzeit',
    icon: Clock,
    category: 'basic',
    description: 'Zeitauswahl',
    defaultConfig: {
      label: 'Uhrzeit',
      is_required: false,
      field_width: 'third'
    }
  },

  // Layout Elements
  {
    id: 'heading',
    type: 'heading',
    label: 'Überschrift',
    icon: Heading1,
    category: 'layout',
    description: 'Überschrift H1-H6',
    defaultConfig: {
      label: 'Überschrift',
      field_width: 'full',
      heading_level: 'h2'
    }
  },
  {
    id: 'paragraph',
    type: 'paragraph',
    label: 'Absatz',
    icon: AlignLeft,
    category: 'layout',
    description: 'Formatierter Text',
    defaultConfig: {
      label: 'Beschreibung',
      field_width: 'full',
      content: 'Dies ist ein Absatz mit erklärendem Text.'
    }
  },
  {
    id: 'divider',
    type: 'divider',
    label: 'Trennlinie',
    icon: Minus,
    category: 'layout',
    description: 'Horizontale Linie',
    defaultConfig: {
      field_width: 'full',
      style: 'solid'
    }
  },

  // Advanced Fields
  {
    id: 'file_upload',
    type: 'file_upload',
    label: 'Datei Upload',
    icon: Upload,
    category: 'advanced',
    description: 'Datei hochladen',
    defaultConfig: {
      label: 'Datei auswählen',
      is_required: false,
      field_width: 'full',
      accepted_types: 'image/*,application/pdf'
    }
  },
  {
    id: 'rating',
    type: 'rating',
    label: 'Bewertung',
    icon: Star,
    category: 'advanced',
    description: 'Sterne-Rating',
    defaultConfig: {
      label: 'Bewertung',
      is_required: false,
      field_width: 'half',
      max_rating: 5
    }
  },
  {
    id: 'slider',
    type: 'slider',
    label: 'Schieberegler',
    icon: Sliders,
    category: 'advanced',
    description: 'Wertebereich',
    defaultConfig: {
      label: 'Wert auswählen',
      is_required: false,
      field_width: 'full',
      min_value: 0,
      max_value: 100
    }
  },
  {
    id: 'signature',
    type: 'signature',
    label: 'Unterschrift',
    icon: PenTool,
    category: 'advanced',
    description: 'Digitale Signatur',
    defaultConfig: {
      label: 'Unterschrift',
      is_required: false,
      field_width: 'full'
    }
  },
  {
    id: 'address',
    type: 'address',
    label: 'Adresse',
    icon: MapPin,
    category: 'advanced',
    description: 'Vollständige Adresse',
    defaultConfig: {
      label: 'Adresse',
      is_required: false,
      field_width: 'full',
      include_country: true
    }
  },

  // Dynamic Fields - NEU!
  {
    id: 'campaign_offers',
    type: 'campaign_offers',
    label: 'Kampagnen-Angebote',
    icon: Target,
    category: 'dynamic',
    description: 'Zeigt aktuelle Kampagnen-Angebote',
    defaultConfig: {
      label: 'Verfügbare Angebote',
      is_required: false,
      field_width: 'full',
      display_mode: 'cards', // 'cards', 'list', 'radio'
      show_prices: true,
      show_duration: true,
      auto_select_campaign: true // Automatisch mit Formular-Kampagne verknüpfen
    }
  },
  {
    id: 'contract_types',
    type: 'contract_types',
    label: 'Vertragsarten',
    icon: CreditCard,
    category: 'dynamic',
    description: 'Auswahl der verfügbaren Verträge',
    defaultConfig: {
      label: 'Vertragsart wählen',
      is_required: true,
      field_width: 'full',
      display_mode: 'cards', // 'cards', 'radio', 'select'
      show_prices: true,
      show_features: true,
      filter_active_only: true
    }
  },
  {
    id: 'pricing_calculator',
    type: 'pricing_calculator',
    label: 'Preis-Rechner',
    icon: Euro,
    category: 'dynamic',
    description: 'Interaktiver Preisrechner',
    defaultConfig: {
      label: 'Ihr Preis',
      field_width: 'full',
      base_contract_field: null, // Verknüpfung zu Vertragsart-Feld
      show_breakdown: true,
      include_modules: true,
      include_discounts: true
    }
  }
]

interface FieldLibraryProps {
  onFieldDrag: (field: FieldDefinition) => void
}

export default function FieldLibrary({ onFieldDrag }: FieldLibraryProps) {
  const handleDragStart = (e: React.DragEvent, field: FieldDefinition) => {
    console.log('🎯 Dragging field:', field.type)
    e.dataTransfer.setData('application/json', JSON.stringify(field))
    e.dataTransfer.effectAllowed = 'copy'
    onFieldDrag(field)
  }

  const categories = [
    { id: 'basic', label: '📝 Grundfelder', color: 'text-blue-600' },
    { id: 'layout', label: '🎨 Layout', color: 'text-purple-600' },
    { id: 'advanced', label: '⚡ Erweitert', color: 'text-green-600' },
    { id: 'dynamic', label: '🔄 Dynamisch', color: 'text-orange-600' }
  ]

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-semibold text-gray-900">📚 Feld-Bibliothek</h2>
        <p className="text-xs text-gray-600 mt-1">Ziehen Sie Felder ins Formular</p>
      </div>

      {/* Field Categories */}
      <div className="flex-1 overflow-y-auto">
        {categories.map(category => {
          const categoryFields = FIELD_DEFINITIONS.filter(field => field.category === category.id)
          
          return (
            <div key={category.id} className="mb-4">
              <h3 className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${category.color} bg-white border-b border-gray-200`}>
                {category.label}
              </h3>
              <div className="p-2 space-y-1">
                {categoryFields.map(field => {
                  const IconComponent = field.icon
                  
                  return (
                    <div
                      key={field.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, field)}
                      className="flex items-center gap-2 p-2 rounded-lg cursor-grab hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all group"
                      title={field.description}
                    >
                      <div className="flex-shrink-0">
                        <IconComponent className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-900 truncate">
                          {field.label}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {field.description}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Export the field definitions for use in other components
export { FIELD_DEFINITIONS } 