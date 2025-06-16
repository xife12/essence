'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Minus,
  Save, 
  ArrowLeft,
  FileText,
  Settings,
  Eye,
  AlertTriangle,
  GripVertical,
  Code,
  Type,
  CheckSquare,
  PenTool,
  Calendar,
  Euro,
  User,
  Move,
  Trash2
} from 'lucide-react';
import ContractsV2API from '@/lib/api/contracts-v2';
import type { 
  DocumentFormData, 
  Contract,
  ValidationResult,
  ContractDocumentSection 
} from '@/lib/types/contracts-v2';

// Document Variables that can be used in content
const DOCUMENT_VARIABLES = [
  { key: '{{member.name}}', label: 'Mitgliedername', description: 'Vollständiger Name des Mitglieds' },
  { key: '{{member.firstname}}', label: 'Vorname', description: 'Vorname des Mitglieds' },
  { key: '{{member.lastname}}', label: 'Nachname', description: 'Nachname des Mitglieds' },
  { key: '{{member.address}}', label: 'Adresse', description: 'Vollständige Adresse' },
  { key: '{{member.email}}', label: 'E-Mail', description: 'E-Mail-Adresse' },
  { key: '{{member.phone}}', label: 'Telefon', description: 'Telefonnummer' },
  { key: '{{contract.name}}', label: 'Vertragsname', description: 'Name des Vertragstyps' },
  { key: '{{contract.price}}', label: 'Vertragspreis', description: 'Monatlicher Grundpreis' },
  { key: '{{contract.term}}', label: 'Laufzeit', description: 'Vertragslaufzeit in Monaten' },
  { key: '{{membership.start_date}}', label: 'Startdatum', description: 'Mitgliedschaftsbeginn' },
  { key: '{{membership.end_date}}', label: 'Enddatum', description: 'Mitgliedschaftsende' },
  { key: '{{today}}', label: 'Heutiges Datum', description: 'Aktuelles Datum' },
  { key: '{{studio.name}}', label: 'Studio-Name', description: 'Name des Fitnessstudios' },
  { key: '{{studio.address}}', label: 'Studio-Adresse', description: 'Adresse des Studios' }
];

type SectionType = 'text' | 'signature' | 'checkbox' | 'payment_calendar';

export default function NewDocumentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Available data
  const [contracts, setContracts] = useState<Contract[]>([]);
  
  // Validation
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Preview
  const [showPreview, setShowPreview] = useState(false);

  // Form data
  const [formData, setFormData] = useState<DocumentFormData>({
    name: '',
    description: '',
    show_payment_calendar: false,
    show_service_content: true,
    show_member_data: true,
    header_template: '',
    footer_template: '',
    css_styles: '',
    sections: [
      {
        title: 'Vertragsinhalt',
        content: '<p>Dies ist ein Musterabschnitt für den Vertragsinhalt.</p>',
        sort_order: 0,
        is_mandatory: true,
        requires_signature: false,
        display_as_checkbox: false
      }
    ]
  });

  // Selected contracts for assignment
  const [selectedContracts, setSelectedContracts] = useState<string[]>([]);

  useEffect(() => {
    loadAvailableData();
  }, []);

  const loadAvailableData = async () => {
    setIsLoading(true);
    try {
      const contractsData = await ContractsV2API.contracts.getActive();
      setContracts(contractsData);
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof DocumentFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const addSection = (type: SectionType = 'text') => {
    const newSection: Omit<ContractDocumentSection, 'id' | 'document_id' | 'created_at'> = {
      title: getSectionTitle(type),
      content: getSectionContent(type),
      sort_order: formData.sections.length,
      is_mandatory: false,
      requires_signature: type === 'signature',
      display_as_checkbox: type === 'checkbox'
    };

    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const getSectionTitle = (type: SectionType): string => {
    const titles = {
      text: 'Neuer Textabschnitt',
      signature: 'Unterschrift',
      checkbox: 'Zustimmung',
      payment_calendar: 'Zahlungskalender'
    };
    return titles[type];
  };

  const getSectionContent = (type: SectionType): string => {
    const contents = {
      text: '<p>Neuer Textabschnitt. Bearbeiten Sie diesen Inhalt...</p>',
      signature: '<p><strong>Unterschrift Mitglied:</strong></p><br><p>____________________<br>{{member.name}}</p>',
      checkbox: '<p>☐ Hiermit stimme ich den Vertragsbedingungen zu.</p>',
      payment_calendar: '<p>Hier wird der Zahlungskalender angezeigt.</p>'
    };
    return contents[type];
  };

  const removeSection = (index: number) => {
    if (formData.sections.length > 1) {
      const newSections = formData.sections.filter((_, i) => i !== index);
      // Update sort order
      const updatedSections = newSections.map((section, i) => ({
        ...section,
        sort_order: i
      }));
      setFormData(prev => ({ ...prev, sections: updatedSections }));
    }
  };

  const updateSection = (index: number, field: string, value: any) => {
    const newSections = [...formData.sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setFormData(prev => ({ ...prev, sections: newSections }));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...formData.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newSections.length) {
      // Swap sections
      [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
      
      // Update sort order
      newSections.forEach((section, i) => {
        section.sort_order = i;
      });
      
      setFormData(prev => ({ ...prev, sections: newSections }));
    }
  };

  const insertVariable = (sectionIndex: number, variable: string) => {
    const section = formData.sections[sectionIndex];
    const newContent = section.content + ' ' + variable + ' ';
    updateSection(sectionIndex, 'content', newContent);
  };

  const validateForm = (): boolean => {
    const validation = ContractsV2API.documents.validate(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors.map(e => e.message));
      return false;
    }
    setValidationErrors([]);
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setActiveTab('basic'); // Switch to first tab if validation fails
      return;
    }

    setIsSaving(true);
    try {
      // Create document first
      const document = await ContractsV2API.documents.create(formData);
      
      // Then assign to selected contracts if any
      if (selectedContracts.length > 0) {
        await ContractsV2API.documents.assignToContracts(document.id, selectedContracts);
      }
      
      router.push(`/vertragsarten-v2/documents/${document.id}`);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      setValidationErrors(['Fehler beim Speichern des Dokuments']);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleContractAssignment = (contractId: string) => {
    setSelectedContracts(prev => {
      if (prev.includes(contractId)) {
        return prev.filter(id => id !== contractId);
      } else {
        return [...prev, contractId];
      }
    });
  };

  const generatePreview = () => {
    // Simple preview generation (in real implementation would be more sophisticated)
    let preview = '';
    
    if (formData.header_template) {
      preview += `<header>${formData.header_template}</header>`;
    }
    
    formData.sections.forEach(section => {
      preview += `<section><h3>${section.title}</h3>${section.content}</section>`;
    });
    
    if (formData.footer_template) {
      preview += `<footer>${formData.footer_template}</footer>`;
    }
    
    return preview;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Laden...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Neues Vertragsdokument</h1>
            <p className="text-muted-foreground">
              Erstellen Sie ein neues WYSIWYG-Vertragsdokument
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Editor' : 'Vorschau'}
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>Speichern...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Speichern
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Validierungsfehler</h3>
                <ul className="mt-1 text-sm text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {showPreview ? (
        /* PREVIEW MODE */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Live-Vorschau</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: generatePreview() }}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Variablen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {DOCUMENT_VARIABLES.map(variable => (
                  <div key={variable.key} className="p-2 border rounded hover:bg-muted cursor-pointer">
                    <div className="font-mono text-sm">{variable.key}</div>
                    <div className="text-xs text-muted-foreground">{variable.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* EDITOR MODE */
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Grunddaten</TabsTrigger>
            <TabsTrigger value="sections">
              Abschnitte ({formData.sections.length})
            </TabsTrigger>
            <TabsTrigger value="assignments">
              Verträge ({selectedContracts.length})
            </TabsTrigger>
            <TabsTrigger value="settings">Einstellungen</TabsTrigger>
          </TabsList>

          {/* BASIC INFO TAB */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Dokument-Grunddaten
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Dokumentname *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="z.B. Standard-Mitgliedsvertrag"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Optionale Beschreibung des Dokuments..."
                    rows={3}
                  />
                </div>

                {/* Template Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kopfzeile (HTML)</Label>
                    <Textarea
                      value={formData.header_template || ''}
                      onChange={(e) => handleInputChange('header_template', e.target.value)}
                      placeholder="<div>Studio-Logo und Adresse...</div>"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Fußzeile (HTML)</Label>
                    <Textarea
                      value={formData.footer_template || ''}
                      onChange={(e) => handleInputChange('footer_template', e.target.value)}
                      placeholder="<div>Geschäftsführung, AGB-Verweis...</div>"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECTIONS TAB */}
          <TabsContent value="sections" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5" />
                    Dokument-Abschnitte
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={() => addSection('text')} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Text
                    </Button>
                    <Button onClick={() => addSection('signature')} variant="outline" size="sm">
                      <PenTool className="h-4 w-4 mr-2" />
                      Unterschrift
                    </Button>
                    <Button onClick={() => addSection('checkbox')} variant="outline" size="sm">
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Checkbox
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.sections.map((section, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-4">
                      {/* Section Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Abschnitt {index + 1}</span>
                          {section.is_mandatory && <Badge variant="destructive">Pflicht</Badge>}
                          {section.requires_signature && <Badge variant="outline">Unterschrift</Badge>}
                          {section.display_as_checkbox && <Badge variant="secondary">Checkbox</Badge>}
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => moveSection(index, 'up')}
                            disabled={index === 0}
                          >
                            ↑
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => moveSection(index, 'down')}
                            disabled={index === formData.sections.length - 1}
                          >
                            ↓
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeSection(index)}
                            disabled={formData.sections.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Section Title */}
                      <div className="space-y-2">
                        <Label>Abschnittstitel</Label>
                        <Input
                          value={section.title}
                          onChange={(e) => updateSection(index, 'title', e.target.value)}
                          placeholder="Titel des Abschnitts..."
                        />
                      </div>

                      {/* Section Content */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label>Inhalt</Label>
                          <div className="flex gap-1">
                            {DOCUMENT_VARIABLES.slice(0, 5).map(variable => (
                              <Button
                                key={variable.key}
                                variant="outline"
                                size="sm"
                                onClick={() => insertVariable(index, variable.key)}
                                className="text-xs"
                              >
                                {variable.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <Textarea
                          value={section.content}
                          onChange={(e) => updateSection(index, 'content', e.target.value)}
                          placeholder="HTML-Inhalt des Abschnitts..."
                          rows={6}
                          className="font-mono text-sm"
                        />
                      </div>

                      {/* Section Settings */}
                      <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                        <label className="flex items-center gap-2">
                          <input 
                            type="checkbox"
                            checked={section.is_mandatory}
                            onChange={(e) => updateSection(index, 'is_mandatory', e.target.checked)}
                          />
                          <span className="text-sm">Pflichtabschnitt</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input 
                            type="checkbox"
                            checked={section.requires_signature}
                            onChange={(e) => updateSection(index, 'requires_signature', e.target.checked)}
                          />
                          <span className="text-sm">Unterschrift erforderlich</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input 
                            type="checkbox"
                            checked={section.display_as_checkbox}
                            onChange={(e) => updateSection(index, 'display_as_checkbox', e.target.checked)}
                          />
                          <span className="text-sm">Als Checkbox anzeigen</span>
                        </label>
                      </div>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ASSIGNMENTS TAB */}
          <TabsContent value="assignments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Vertrags-Zuordnungen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Wählen Sie die Vertragsarten aus, für die dieses Dokument verwendet werden soll.
                </p>
                
                <div className="space-y-2">
                  {contracts.map(contract => (
                    <div key={contract.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{contract.name}</h4>
                        {contract.description && (
                          <p className="text-sm text-muted-foreground">{contract.description}</p>
                        )}
                      </div>
                      <label className="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          checked={selectedContracts.includes(contract.id)}
                          onChange={() => toggleContractAssignment(contract.id)}
                        />
                        <span className="text-sm">Zugeordnet</span>
                      </label>
                    </div>
                  ))}
                </div>

                {contracts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Keine aktiven Verträge vorhanden</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Dokument-Einstellungen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Display Options */}
                <div className="space-y-4">
                  <h3 className="font-medium">Anzeige-Optionen</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Mitgliederdaten anzeigen</Label>
                      <p className="text-sm text-muted-foreground">
                        Name, Adresse und Kontaktdaten des Mitglieds
                      </p>
                    </div>
                    <Switch
                      checked={formData.show_member_data}
                      onCheckedChange={(checked) => handleInputChange('show_member_data', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Leistungsinhalt anzeigen</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatische Liste der inkludierten Module
                      </p>
                    </div>
                    <Switch
                      checked={formData.show_service_content}
                      onCheckedChange={(checked) => handleInputChange('show_service_content', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Zahlungskalender anzeigen</Label>
                      <p className="text-sm text-muted-foreground">
                        Tabelle mit Zahlungsterminen und Beträgen
                      </p>
                    </div>
                    <Switch
                      checked={formData.show_payment_calendar}
                      onCheckedChange={(checked) => handleInputChange('show_payment_calendar', checked)}
                    />
                  </div>
                </div>

                <Separator />

                {/* CSS Styles */}
                <div className="space-y-2">
                  <Label>Custom CSS (für PDF-Export)</Label>
                  <Textarea
                    value={formData.css_styles || ''}
                    onChange={(e) => handleInputChange('css_styles', e.target.value)}
                    placeholder=".contract { font-family: Arial; margin: 20px; }"
                    rows={5}
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}