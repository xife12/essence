'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Plus, 
  Trash2, 
  Settings, 
  FileText, 
  ChevronDown,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import contractsAPIInstance, { DocumentFormData } from '@/app/lib/api/contracts-v2';

interface Contract {
  id: string;
  name: string;
  contract_number: string;
}

interface CustomSection {
  id: string;
  title: string;
  content: string;
  sort_order: number;
  is_mandatory: boolean;
  requires_signature: boolean;
  display_as_checkbox: boolean;
  signature_label?: string;
  checkbox_label?: string;
}

export default function DocumentEditorPage() {
  // URL-Parameter für Edit-Modus
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Haupt-Zustand
  const [formData, setFormData] = useState<DocumentFormData>({
    name: '',
    description: '',
    show_payment_calendar: true,
    show_service_content: true,
    show_member_data: true,
    header_template: '',
    footer_template: '',
    css_styles: '',
    assigned_contracts: [],
    required_modules: {
      contract_info: {
        enabled: true,
        include_terms: true,
        include_cancellation: true,
        include_renewal: true,
        include_dynamics: true,
        include_sepa: true,
        include_parties: true
      },
      privacy_policy: {
        enabled: true,
        content: `<h3>Datenschutzerklärung</h3>
<p>Mit der Anmeldung zur Mitgliedschaft erklären Sie sich damit einverstanden, dass Ihre personenbezogenen Daten zur Vertragsabwicklung und Mitgliederverwaltung verwendet werden.</p>
<p><strong>Erhebung und Verarbeitung von Daten:</strong></p>
<ul>
<li>Vor- und Nachname, Adresse für die Mitgliederverwaltung</li>
<li>Kontaktdaten für wichtige Mitteilungen</li>
<li>Bankdaten für den Beitragseinzug</li>
</ul>
<p><strong>Ihre Rechte:</strong></p>
<ul>
<li>Auskunft über gespeicherte Daten</li>
<li>Berichtigung unrichtiger Daten</li>
<li>Löschung bei Vertragsende</li>
</ul>
<p>Weitere Details finden Sie in unserer vollständigen Datenschutzerklärung.</p>`,
        requires_signature: true
      },
      terms_conditions: {
        enabled: true,
        content: `<h3>Allgemeine Geschäftsbedingungen</h3>
<p><strong>§ 1 Vertragspartner und Geltungsbereich</strong></p>
<p>Diese AGB gelten für alle Verträge zwischen dem Essence Sports- & Wellnessclub und seinen Mitgliedern.</p>

<p><strong>§ 2 Leistungen des Studios</strong></p>
<ul>
<li>Nutzung der Trainingsflächen während der Öffnungszeiten</li>
<li>Teilnahme an Kursen (soweit im Tarif enthalten)</li>
<li>Beratung durch qualifiziertes Personal</li>
</ul>

<p><strong>§ 3 Pflichten des Mitglieds</strong></p>
<ul>
<li>Pünktliche Zahlung der Mitgliedsbeiträge</li>
<li>Beachtung der Hausordnung</li>
<li>Pfleglicher Umgang mit den Geräten</li>
</ul>

<p><strong>§ 4 Kündigung</strong></p>
<p>Die Kündigung muss schriftlich erfolgen und die vertraglich vereinbarten Fristen einhalten.</p>`,
        requires_signature: true
      }
    },
    optional_modules: {
      payment_calendar: {
        enabled: true,
        show_due_dates: true,
        show_amounts: true
      },
      service_overview: {
        enabled: true,
        include_modules: true,
        include_benefits: true
      }
    },
    custom_sections: [
      {
        id: '1',
        title: 'Gesundheitserklärung',
        content: `<p><strong>Gesundheitszustand und Trainingsfreigabe</strong></p>
<p>Hiermit bestätige ich, dass ich mich in einem gesundheitlichen Zustand befinde, der die Ausübung von Sport und körperlicher Betätigung erlaubt.</p>
<p>Bei gesundheitlichen Einschränkungen oder chronischen Erkrankungen werde ich vor Trainingsbeginn einen Arzt konsultieren.</p>
<p>Das Studio übernimmt keine Haftung für gesundheitliche Schäden, die durch das Training entstehen können.</p>`,
        sort_order: 1,
        is_mandatory: true,
        requires_signature: true,
        display_as_checkbox: false,
        signature_label: 'Unterschrift Mitglied'
      },
      {
        id: '2',
        title: 'Hausordnung',
        content: `<p><strong>Wichtige Regeln für ein harmonisches Miteinander</strong></p>
<ul>
<li>Saubere Sportkleidung und Hallenschuhe sind Pflicht</li>
<li>Handtücher sind für alle Geräte zu verwenden</li>
<li>Geräte nach Benutzung desinfizieren</li>
<li>Rücksichtnahme auf andere Mitglieder</li>
<li>Handy-Nutzung nur im Ruhebereich</li>
</ul>`,
        sort_order: 2,
        is_mandatory: true,
        requires_signature: false,
        display_as_checkbox: true,
        checkbox_label: 'Ich habe die Hausordnung gelesen und akzeptiere diese'
      },
      {
        id: '3',
        title: 'Zusatzleistungen',
        content: `<p><strong>Optionale Services und Buchungen</strong></p>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
  <div>
    <p><strong>Personal Training</strong></p>
    <p>60 Min: 65,00 €<br>30 Min: 35,00 €</p>
  </div>
  <div>
    <p><strong>Ernährungsberatung</strong></p>
    <p>Erstberatung: 45,00 €<br>Folgetermin: 25,00 €</p>
  </div>
  <div>
    <p><strong>Massage</strong></p>
    <p>30 Min: 40,00 €<br>60 Min: 70,00 €</p>
  </div>
  <div>
    <p><strong>Getränke-Flatrate</strong></p>
    <p>Monatlich: 15,00 €</p>
  </div>
</div>
<p>Alle Zusatzleistungen können separat gebucht werden.</p>`,
        sort_order: 3,
        is_mandatory: false,
        requires_signature: false,
        display_as_checkbox: false
      }
    ]
  });

  // UI-Zustand
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [previewHtml, setPreviewHtml] = useState('');
  const [selectedContract, setSelectedContract] = useState<string>('');
  
  // Daten
  const [contracts, setContracts] = useState<Contract[]>([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editParam = urlParams.get('edit');
    if (editParam) {
      setIsEdit(true);
      setEditId(editParam);
      loadDocumentForEdit(editParam);
    }

    loadContracts();
    
    // Generiere initial eine Vorschau
    setTimeout(() => generatePreview(), 100);
  }, []);

  useEffect(() => {
    generatePreview();
  }, [formData, selectedContract]);

  const loadContracts = async () => {
    try {
      const response = await contractsAPIInstance.getAllContracts();
      if (response.data) {
        setContracts(response.data);
        
        // Setze ersten Vertrag als Standard falls noch keiner gewählt
        if (!selectedContract && response.data.length > 0) {
          setSelectedContract(response.data[0].id);
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der Verträge:', error);
    }
  };

  const loadDocumentForEdit = async (documentId: string) => {
    try {
      setLoading(true);
      const response = await contractsAPIInstance.getDocument(documentId);
      
      if (response.error) {
        setErrors([response.error]);
        return;
      }

      if (response.data) {
        const doc = response.data;
        setFormData({
          name: doc.name,
          description: doc.description || '',
          show_payment_calendar: doc.show_payment_calendar,
          show_service_content: doc.show_service_content,
          show_member_data: doc.show_member_data,
          header_template: doc.header_template || '',
          footer_template: doc.footer_template || '',
          css_styles: doc.css_styles || '',
          assigned_contracts: doc.assigned_contracts || [],
          required_modules: doc.required_modules || formData.required_modules,
          optional_modules: doc.optional_modules || formData.optional_modules,
          custom_sections: doc.custom_sections || []
        });

        // Setze ersten zugewiesenen Vertrag als aktiv
        if (doc.assigned_contracts?.length > 0) {
          setSelectedContract(doc.assigned_contracts[0]);
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden des Dokuments:', error);
      setErrors(['Fehler beim Laden des Dokuments']);
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = async () => {
    try {
      if (isEdit && editId) {
        // Für bestehende Dokumente: Verwende API mit Document ID
        const response = await contractsAPIInstance.generateDocumentPreview(editId, selectedContract);
        if (response.data) {
          setPreviewHtml(response.data);
          return;
        }
      }

      // Für neue Dokumente oder bei Fehlern: Verwende aktuelle Formulardaten
      const tempDocument = {
        id: 'preview',
        name: formData.name || 'Dokument Vorschau',
        description: formData.description,
        required_modules: formData.required_modules,
        optional_modules: formData.optional_modules,
        custom_sections: formData.custom_sections,
        header_template: formData.header_template,
        footer_template: formData.footer_template
      };

      // Verwende die neue API-Funktion für die Vorschau-Generierung mit temporären Daten
      const response = await contractsAPIInstance.generateDocumentPreviewFromData(tempDocument, selectedContract);
      
      if (response.data) {
        setPreviewHtml(response.data);
      } else {
        // Fallback auf lokale Vorschau bei Fehler
        setPreviewHtml(generateLocalPreview());
      }
    } catch (error) {
      console.error('Fehler bei der Vorschau-Generierung:', error);
      // Fallback auf lokale Vorschau
      setPreviewHtml(generateLocalPreview());
    }
  };

  const generateLocalPreview = (): string => {
    const contract = contracts.find(c => c.id === selectedContract);
    
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.5; margin: 20px; }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .section { margin-bottom: 30px; }
            .signature-field { border-bottom: 1px solid #000; height: 40px; width: 300px; margin: 20px 0; }
            .checkbox { width: 15px; height: 15px; border: 1px solid #000; display: inline-block; margin-right: 10px; }
            .contract-info { background: #f5f5f5; padding: 15px; border-radius: 5px; }
          </style>
        </head>
        <body>
          ${formData.header_template ? `<div class="header">${formData.header_template}</div>` : ''}
          <h1>${formData.name || 'Neues Dokument'}</h1>
          ${formData.description ? `<p><em>${formData.description}</em></p>` : ''}
          
          ${formData.required_modules.contract_info.enabled ? `
            <div class="section contract-info">
              <h2>Vertragsinformationen</h2>
              <p>Vertragspartner: ${contract?.name || '[Vertrag auswählen]'}</p>
              ${formData.required_modules.contract_info.include_sepa ? `
                <h3>SEPA-Lastschriftmandat</h3>
                <p>IBAN: _________________________</p>
              ` : ''}
            </div>
          ` : ''}
          
          ${formData.required_modules.privacy_policy.enabled ? `
            <div class="section">
              <h2>Datenschutzvereinbarung</h2>
              <div>${formData.required_modules.privacy_policy.content}</div>
              ${formData.required_modules.privacy_policy.requires_signature ? 
                '<p>Unterschrift:</p><div class="signature-field"></div>' : ''}
            </div>
          ` : ''}
          
          ${formData.required_modules.terms_conditions.enabled ? `
            <div class="section">
              <h2>Allgemeine Geschäftsbedingungen</h2>
              <div>${formData.required_modules.terms_conditions.content}</div>
              ${formData.required_modules.terms_conditions.requires_signature ? 
                '<p>Unterschrift:</p><div class="signature-field"></div>' : ''}
            </div>
          ` : ''}
          
          ${formData.custom_sections.map(section => `
            <div class="section">
              <h2>${section.title}</h2>
              <div>${section.content}</div>
              ${section.requires_signature ? 
                `<p>${section.signature_label || 'Unterschrift'}:</p><div class="signature-field"></div>` : ''}
              ${section.display_as_checkbox ? 
                `<p><span class="checkbox"></span> ${section.checkbox_label || 'Ich stimme zu'}</p>` : ''}
            </div>
          `).join('')}
          
          ${formData.footer_template ? `<div class="footer">${formData.footer_template}</div>` : ''}
        </body>
      </html>
    `;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors([]);

    try {
      let response;
      
      if (isEdit && editId) {
        response = await contractsAPIInstance.updateDocument(editId, formData);
      } else {
        response = await contractsAPIInstance.createDocument(formData);
      }

      if (response.error) {
        setErrors([response.error]);
      } else {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/vertragsarten-v2?tab=documents';
        }, 1500);
      }
    } catch (error) {
      setErrors(['Ein unerwarteter Fehler ist aufgetreten']);
    } finally {
      setSaving(false);
    }
  };

  const addCustomSection = () => {
    const newSection: CustomSection = {
      id: Date.now().toString(),
      title: 'Neuer Abschnitt',
      content: '',
      sort_order: formData.custom_sections.length,
      is_mandatory: false,
      requires_signature: false,
      display_as_checkbox: false
    };

    setFormData(prev => ({
      ...prev,
      custom_sections: [...prev.custom_sections, newSection]
    }));
  };

  const updateCustomSection = (id: string, updates: Partial<CustomSection>) => {
    setFormData(prev => ({
      ...prev,
      custom_sections: prev.custom_sections.map(section =>
        section.id === id ? { ...section, ...updates } : section
      )
    }));
  };

  const removeCustomSection = (id: string) => {
    setFormData(prev => ({
      ...prev,
      custom_sections: prev.custom_sections.filter(section => section.id !== id)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Dokument wird geladen...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isEdit ? 'Dokument aktualisiert!' : 'Dokument erstellt!'}
          </h2>
          <p className="text-gray-600">Sie werden automatisch weitergeleitet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/vertragsarten-v2?tab=documents"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Dokument bearbeiten' : 'Neues Dokument'}
              </h1>
              <p className="text-sm text-gray-600">
                Split-Screen-Editor mit Live-Vorschau
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Contract Selector */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Vorschau mit:</label>
              <select
                value={selectedContract}
                onChange={(e) => setSelectedContract(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
              >
                {contracts.map(contract => (
                  <option key={contract.id} value={contract.id}>
                    {contract.name} ({contract.contract_number})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <Save size={16} />
              <span>{saving ? 'Speichert...' : (isEdit ? 'Aktualisieren' : 'Erstellen')}</span>
            </button>
          </div>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Fehler beim Speichern</h3>
                <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Split Screen Layout */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Left Panel - Editor */}
        <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {[
                  { id: 'basic', label: 'Grundeinstellungen', icon: Settings },
                  { id: 'required', label: 'Pflichtmodule', icon: FileText },
                  { id: 'optional', label: 'Optionale Module', icon: Plus },
                  { id: 'custom', label: 'Individuelle Blöcke', icon: Plus }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {activeTab === 'basic' && (
                <BasicSettingsTab 
                  formData={formData} 
                  setFormData={setFormData}
                  contracts={contracts}
                />
              )}

              {activeTab === 'required' && (
                <RequiredModulesTab 
                  formData={formData} 
                  setFormData={setFormData}
                />
              )}

              {activeTab === 'optional' && (
                <OptionalModulesTab 
                  formData={formData} 
                  setFormData={setFormData}
                />
              )}

              {activeTab === 'custom' && (
                <CustomSectionsTab 
                  formData={formData} 
                  setFormData={setFormData}
                  addCustomSection={addCustomSection}
                  updateCustomSection={updateCustomSection}
                  removeCustomSection={removeCustomSection}
                />
              )}
            </form>
          </div>
        </div>

        {/* Right Panel - PDF Preview */}
        <div className="w-1/2 bg-gray-50">
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Eye size={20} className="text-gray-500" />
              <h3 className="font-medium text-gray-900">Live-Vorschau</h3>
              <span className="text-sm text-gray-500">
                ({contracts.find(c => c.id === selectedContract)?.name || 'Kein Vertrag'})
              </span>
            </div>
          </div>
          
          <div className="h-full overflow-y-auto p-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[800px]">
              <iframe
                srcDoc={previewHtml}
                className="w-full h-full min-h-[800px] border-0 rounded-lg"
                title="Dokument-Vorschau"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tab Components
function BasicSettingsTab({ formData, setFormData, contracts }: any) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dokumentname *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
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
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Zugeordnete Verträge
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Wählen Sie Verträge aus, mit denen dieses Dokument verwendet werden kann.
        </p>
        <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
          {contracts.map((contract: any) => (
            <label key={contract.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.assigned_contracts.includes(contract.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData(prev => ({
                      ...prev,
                      assigned_contracts: [...prev.assigned_contracts, contract.id]
                    }));
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      assigned_contracts: prev.assigned_contracts.filter(id => id !== contract.id)
                    }));
                  }
                }}
                className="rounded"
              />
              <span className="text-sm">{contract.name} ({contract.contract_number})</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kopfzeile-Template
        </label>
        <textarea
          value={formData.header_template}
          onChange={(e) => setFormData(prev => ({ ...prev, header_template: e.target.value }))}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          placeholder="HTML für Kopfzeile..."
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
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          placeholder="HTML für Fußzeile..."
        />
      </div>
    </div>
  );
}

function RequiredModulesTab({ formData, setFormData }: any) {
  return (
    <div className="space-y-6">
      {/* Vertragsinformationen */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Vertragsinformationen</h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.required_modules.contract_info.enabled}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                required_modules: {
                  ...prev.required_modules,
                  contract_info: {
                    ...prev.required_modules.contract_info,
                    enabled: e.target.checked
                  }
                }
              }))}
              className="rounded"
            />
            <span className="ml-2 text-sm">Aktiviert</span>
          </label>
        </div>

        {formData.required_modules.contract_info.enabled && (
          <div className="space-y-3">
            {[
              { key: 'include_terms', label: 'Vertragslaufzeiten' },
              { key: 'include_cancellation', label: 'Kündigungsfristen' },
              { key: 'include_renewal', label: 'Vertragsverlängerungen' },
              { key: 'include_dynamics', label: 'Dynamiken' },
              { key: 'include_sepa', label: 'SEPA-Lastschriftmandat' },
              { key: 'include_parties', label: 'Vertragsinhaber/Vertragsgeber' }
            ].map(item => (
              <label key={item.key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.required_modules.contract_info[item.key]}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    required_modules: {
                      ...prev.required_modules,
                      contract_info: {
                        ...prev.required_modules.contract_info,
                        [item.key]: e.target.checked
                      }
                    }
                  }))}
                  className="rounded"
                />
                <span className="ml-2 text-sm">{item.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Datenschutzvereinbarung */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Datenschutzvereinbarung</h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.required_modules.privacy_policy.enabled}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                required_modules: {
                  ...prev.required_modules,
                  privacy_policy: {
                    ...prev.required_modules.privacy_policy,
                    enabled: e.target.checked
                  }
                }
              }))}
              className="rounded"
            />
            <span className="ml-2 text-sm">Aktiviert</span>
          </label>
        </div>

        {formData.required_modules.privacy_policy.enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Datenschutztext
              </label>
              <textarea
                value={formData.required_modules.privacy_policy.content}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  required_modules: {
                    ...prev.required_modules,
                    privacy_policy: {
                      ...prev.required_modules.privacy_policy,
                      content: e.target.value
                    }
                  }
                }))}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.required_modules.privacy_policy.requires_signature}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  required_modules: {
                    ...prev.required_modules,
                    privacy_policy: {
                      ...prev.required_modules.privacy_policy,
                      requires_signature: e.target.checked
                    }
                  }
                }))}
                className="rounded"
              />
              <span className="ml-2 text-sm">Unterschrift erforderlich</span>
            </label>
          </div>
        )}
      </div>

      {/* AGBs */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Allgemeine Geschäftsbedingungen</h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.required_modules.terms_conditions.enabled}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                required_modules: {
                  ...prev.required_modules,
                  terms_conditions: {
                    ...prev.required_modules.terms_conditions,
                    enabled: e.target.checked
                  }
                }
              }))}
              className="rounded"
            />
            <span className="ml-2 text-sm">Aktiviert</span>
          </label>
        </div>

        {formData.required_modules.terms_conditions.enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AGB-Text
              </label>
              <textarea
                value={formData.required_modules.terms_conditions.content}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  required_modules: {
                    ...prev.required_modules,
                    terms_conditions: {
                      ...prev.required_modules.terms_conditions,
                      content: e.target.value
                    }
                  }
                }))}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.required_modules.terms_conditions.requires_signature}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  required_modules: {
                    ...prev.required_modules,
                    terms_conditions: {
                      ...prev.required_modules.terms_conditions,
                      requires_signature: e.target.checked
                    }
                  }
                }))}
                className="rounded"
              />
              <span className="ml-2 text-sm">Unterschrift erforderlich</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

function OptionalModulesTab({ formData, setFormData }: any) {
  return (
    <div className="space-y-6">
      {/* Beitragskalender */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Beitragskalender mit Fälligkeiten</h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.optional_modules.payment_calendar.enabled}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                optional_modules: {
                  ...prev.optional_modules,
                  payment_calendar: {
                    ...prev.optional_modules.payment_calendar,
                    enabled: e.target.checked
                  }
                }
              }))}
              className="rounded"
            />
            <span className="ml-2 text-sm">Aktiviert</span>
          </label>
        </div>

        {formData.optional_modules.payment_calendar.enabled && (
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.optional_modules.payment_calendar.show_due_dates}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  optional_modules: {
                    ...prev.optional_modules,
                    payment_calendar: {
                      ...prev.optional_modules.payment_calendar,
                      show_due_dates: e.target.checked
                    }
                  }
                }))}
                className="rounded"
              />
              <span className="ml-2 text-sm">Fälligkeitsdaten anzeigen</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.optional_modules.payment_calendar.show_amounts}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  optional_modules: {
                    ...prev.optional_modules,
                    payment_calendar: {
                      ...prev.optional_modules.payment_calendar,
                      show_amounts: e.target.checked
                    }
                  }
                }))}
                className="rounded"
              />
              <span className="ml-2 text-sm">Beitragsbeträge anzeigen</span>
            </label>
          </div>
        )}
      </div>

      {/* Leistungsübersicht */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Leistungsübersicht</h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.optional_modules.service_overview.enabled}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                optional_modules: {
                  ...prev.optional_modules,
                  service_overview: {
                    ...prev.optional_modules.service_overview,
                    enabled: e.target.checked
                  }
                }
              }))}
              className="rounded"
            />
            <span className="ml-2 text-sm">Aktiviert</span>
          </label>
        </div>

        {formData.optional_modules.service_overview.enabled && (
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.optional_modules.service_overview.include_modules}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  optional_modules: {
                    ...prev.optional_modules,
                    service_overview: {
                      ...prev.optional_modules.service_overview,
                      include_modules: e.target.checked
                    }
                  }
                }))}
                className="rounded"
              />
              <span className="ml-2 text-sm">Module/Leistungen auflisten</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.optional_modules.service_overview.include_benefits}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  optional_modules: {
                    ...prev.optional_modules,
                    service_overview: {
                      ...prev.optional_modules.service_overview,
                      include_benefits: e.target.checked
                    }
                  }
                }))}
                className="rounded"
              />
              <span className="ml-2 text-sm">Zusätzliche Vorteile auflisten</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

function CustomSectionsTab({ formData, setFormData, addCustomSection, updateCustomSection, removeCustomSection }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Individuelle Blöcke</h3>
        <button
          type="button"
          onClick={addCustomSection}
          className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 flex items-center space-x-1"
        >
          <Plus size={16} />
          <span>Block hinzufügen</span>
        </button>
      </div>

      {formData.custom_sections.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Noch keine individuellen Blöcke erstellt.</p>
          <p className="text-sm">Klicken Sie auf "Block hinzufügen" um zu beginnen.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {formData.custom_sections.map((section: CustomSection, index: number) => (
            <div key={section.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">Block #{index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeCustomSection(section.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Überschrift
                  </label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateCustomSection(section.id, { title: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inhalt
                  </label>
                  <textarea
                    value={section.content}
                    onChange={(e) => updateCustomSection(section.id, { content: e.target.value })}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={section.requires_signature}
                      onChange={(e) => updateCustomSection(section.id, { requires_signature: e.target.checked })}
                      className="rounded"
                    />
                    <span className="ml-2 text-sm">Unterschrift erforderlich</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={section.display_as_checkbox}
                      onChange={(e) => updateCustomSection(section.id, { display_as_checkbox: e.target.checked })}
                      className="rounded"
                    />
                    <span className="ml-2 text-sm">Als Checkbox anzeigen</span>
                  </label>
                </div>

                {section.requires_signature && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unterschrift-Label
                    </label>
                    <input
                      type="text"
                      value={section.signature_label || ''}
                      onChange={(e) => updateCustomSection(section.id, { signature_label: e.target.value })}
                      placeholder="z.B. Unterschrift Kunde"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                )}

                {section.display_as_checkbox && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Checkbox-Label
                    </label>
                    <input
                      type="text"
                      value={section.checkbox_label || ''}
                      onChange={(e) => updateCustomSection(section.id, { checkbox_label: e.target.value })}
                      placeholder="z.B. Ich stimme den Bedingungen zu"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}