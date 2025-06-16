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
  Package,
  Euro,
  Calendar,
  Settings,
  Users,
  AlertTriangle
} from 'lucide-react';
import ContractsV2API from '@/lib/api/contracts-v2';
import type { 
  ContractFormData, 
  ContractModule, 
  ModuleCategory,
  ValidationResult 
} from '@/lib/types/contracts-v2';

export default function NewContractPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Available data
  const [modules, setModules] = useState<ContractModule[]>([]);
  const [categories, setCategories] = useState<ModuleCategory[]>([]);
  
  // Validation
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Form data
  const [formData, setFormData] = useState<ContractFormData>({
    name: '',
    description: '',
    terms: [{ duration_months: 12, base_price: 0 }],
    auto_renew: false,
    renewal_term_months: 12,
    cancellation_period: 30,
    cancellation_unit: 'days',
    group_discount_enabled: false,
    group_discount_type: 'percent',
    group_discount_value: 0,
    payment_runs: '',
    payment_methods: ['lastschrift'],
    modules_included: [],
    modules_optional: [],
    pricing_rules: [],
    starter_packages: [],
    flat_rates: []
  });

  useEffect(() => {
    loadAvailableData();
  }, []);

  const loadAvailableData = async () => {
    setIsLoading(true);
    try {
      const [modulesData, categoriesData] = await Promise.all([
        ContractsV2API.modules.getAll({ is_active: true }),
        ContractsV2API.categories.getAll()
      ]);
      setModules(modulesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ContractFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleTermChange = (index: number, field: 'duration_months' | 'base_price', value: number) => {
    const newTerms = [...formData.terms];
    newTerms[index] = { ...newTerms[index], [field]: value };
    setFormData(prev => ({ ...prev, terms: newTerms }));
  };

  const addTerm = () => {
    setFormData(prev => ({
      ...prev,
      terms: [...prev.terms, { duration_months: 12, base_price: 0 }]
    }));
  };

  const removeTerm = (index: number) => {
    if (formData.terms.length > 1) {
      const newTerms = formData.terms.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, terms: newTerms }));
    }
  };

  const handleModuleToggle = (moduleId: string, type: 'included' | 'optional') => {
    const currentIncluded = formData.modules_included;
    const currentOptional = formData.modules_optional;
    
    // Remove from both arrays first
    const newIncluded = currentIncluded.filter(id => id !== moduleId);
    const newOptional = currentOptional.filter(id => id !== moduleId);
    
    // Add to the selected type if not already there
    if (type === 'included' && !currentIncluded.includes(moduleId)) {
      newIncluded.push(moduleId);
    } else if (type === 'optional' && !currentOptional.includes(moduleId)) {
      newOptional.push(moduleId);
    }
    
    setFormData(prev => ({
      ...prev,
      modules_included: newIncluded,
      modules_optional: newOptional
    }));
  };

  const getModuleStatus = (moduleId: string): 'none' | 'included' | 'optional' => {
    if (formData.modules_included.includes(moduleId)) return 'included';
    if (formData.modules_optional.includes(moduleId)) return 'optional';
    return 'none';
  };

  const addStarterPackage = () => {
    setFormData(prev => ({
      ...prev,
      starter_packages: [
        ...(prev.starter_packages || []),
        {
          name: '',
          description: '',
          price: 0,
          is_mandatory: false,
          sort_order: (prev.starter_packages?.length || 0)
        }
      ]
    }));
  };

  const removeStarterPackage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      starter_packages: prev.starter_packages?.filter((_, i) => i !== index) || []
    }));
  };

  const updateStarterPackage = (index: number, field: string, value: any) => {
    const newPackages = [...(formData.starter_packages || [])];
    newPackages[index] = { ...newPackages[index], [field]: value };
    setFormData(prev => ({ ...prev, starter_packages: newPackages }));
  };

  const addFlatRate = () => {
    setFormData(prev => ({
      ...prev,
      flat_rates: [
        ...(prev.flat_rates || []),
        {
          name: '',
          description: '',
          price: 0,
          billing_type: 'monthly',
          is_mandatory: false,
          sort_order: (prev.flat_rates?.length || 0)
        }
      ]
    }));
  };

  const removeFlatRate = (index: number) => {
    setFormData(prev => ({
      ...prev,
      flat_rates: prev.flat_rates?.filter((_, i) => i !== index) || []
    }));
  };

  const updateFlatRate = (index: number, field: string, value: any) => {
    const newRates = [...(formData.flat_rates || [])];
    newRates[index] = { ...newRates[index], [field]: value };
    setFormData(prev => ({ ...prev, flat_rates: newRates }));
  };

  const validateForm = (): boolean => {
    const validation = ContractsV2API.contracts.validate(formData);
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
      const contract = await ContractsV2API.contracts.create(formData);
      router.push(`/vertragsarten-v2/contracts/${contract.id}`);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      setValidationErrors(['Fehler beim Speichern des Vertrags']);
    } finally {
      setIsSaving(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
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
            <h1 className="text-3xl font-bold">Neuer Vertrag</h1>
            <p className="text-muted-foreground">
              Erstellen Sie einen neuen Vertragstyp mit Laufzeiten und Modulen
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
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

      {/* Form Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Grunddaten</TabsTrigger>
          <TabsTrigger value="terms">Laufzeiten</TabsTrigger>
          <TabsTrigger value="modules">Module</TabsTrigger>
          <TabsTrigger value="packages">Pakete</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
        </TabsList>

        {/* BASIC INFO TAB */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Grunddaten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Vertragsname *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="z.B. Premium Mitgliedschaft"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Zahlungsläufe</Label>
                  <select 
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.payment_runs || ''}
                    onChange={(e) => handleInputChange('payment_runs', e.target.value)}
                  >
                    <option value="">Auswählen...</option>
                    <option value="monthly_1">1. des Monats</option>
                    <option value="monthly_15">15. des Monats</option>
                    <option value="quarterly">Quartalsweise</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Optionale Beschreibung des Vertrags..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Zahlungsmethoden</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      checked={formData.payment_methods?.includes('lastschrift')}
                      onChange={(e) => {
                        const methods = formData.payment_methods || [];
                        if (e.target.checked) {
                          handleInputChange('payment_methods', [...methods, 'lastschrift']);
                        } else {
                          handleInputChange('payment_methods', methods.filter(m => m !== 'lastschrift'));
                        }
                      }}
                    />
                    Lastschrift
                  </label>
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      checked={formData.payment_methods?.includes('überweisung')}
                      onChange={(e) => {
                        const methods = formData.payment_methods || [];
                        if (e.target.checked) {
                          handleInputChange('payment_methods', [...methods, 'überweisung']);
                        } else {
                          handleInputChange('payment_methods', methods.filter(m => m !== 'überweisung'));
                        }
                      }}
                    />
                    Überweisung
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TERMS TAB */}
        <TabsContent value="terms" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Laufzeiten & Preise
                </CardTitle>
                <Button onClick={addTerm} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Laufzeit hinzufügen
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.terms.map((term, index) => (
                <div key={index} className="flex items-end gap-4 p-4 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Label>Laufzeit (Monate)</Label>
                    <Input
                      type="number"
                      value={term.duration_months}
                      onChange={(e) => handleTermChange(index, 'duration_months', parseInt(e.target.value) || 0)}
                      min="1"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Grundpreis/Monat (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={term.base_price}
                      onChange={(e) => handleTermChange(index, 'base_price', parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Gesamtpreis</Label>
                    <div className="p-2 bg-muted rounded">
                      {formatPrice(term.base_price * term.duration_months)}
                    </div>
                  </div>
                  {formData.terms.length > 1 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeTerm(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* MODULES TAB */}
        <TabsContent value="modules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Modul-Zuordnungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {categories.map(category => {
                  const categoryModules = modules.filter(m => m.category_id === category.id);
                  if (categoryModules.length === 0) return null;

                  return (
                    <div key={category.id} className="space-y-3">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        {category.name}
                      </h3>
                      <div className="grid gap-3">
                        {categoryModules.map(module => {
                          const status = getModuleStatus(module.id);
                          return (
                            <div key={module.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <h4 className="font-medium">{module.name}</h4>
                                {module.description && (
                                  <p className="text-sm text-muted-foreground">{module.description}</p>
                                )}
                                <p className="text-sm font-semibold">{formatPrice(module.price_per_month)}/Monat</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant={status === 'included' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => handleModuleToggle(module.id, 'included')}
                                >
                                  Inkludiert
                                </Button>
                                <Button
                                  variant={status === 'optional' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => handleModuleToggle(module.id, 'optional')}
                                >
                                  Optional
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PACKAGES TAB */}
        <TabsContent value="packages" className="space-y-6">
          {/* Starter Packages */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Startpakete</CardTitle>
                <Button onClick={addStarterPackage} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Startpaket hinzufügen
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.starter_packages?.map((pkg, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Startpaket {index + 1}</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeStarterPackage(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={pkg.name}
                        onChange={(e) => updateStarterPackage(index, 'name', e.target.value)}
                        placeholder="z.B. Willkommenspaket"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Preis (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={pkg.price}
                        onChange={(e) => updateStarterPackage(index, 'price', parseFloat(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Einstellungen</Label>
                      <label className="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          checked={pkg.is_mandatory}
                          onChange={(e) => updateStarterPackage(index, 'is_mandatory', e.target.checked)}
                        />
                        Pflichtpaket
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Beschreibung</Label>
                    <Textarea
                      value={pkg.description || ''}
                      onChange={(e) => updateStarterPackage(index, 'description', e.target.value)}
                      placeholder="Beschreibung des Startpakets..."
                      rows={2}
                    />
                  </div>
                </div>
              ))}
              
              {!formData.starter_packages?.length && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Noch keine Startpakete definiert</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Flat Rates */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Pauschalen</CardTitle>
                <Button onClick={addFlatRate} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Pauschale hinzufügen
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.flat_rates?.map((rate, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Pauschale {index + 1}</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeFlatRate(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={rate.name}
                        onChange={(e) => updateFlatRate(index, 'name', e.target.value)}
                        placeholder="z.B. Wartungsgebühr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Preis (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={rate.price}
                        onChange={(e) => updateFlatRate(index, 'price', parseFloat(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Abrechnung</Label>
                      <select 
                        className="w-full px-3 py-2 border rounded-md"
                        value={rate.billing_type}
                        onChange={(e) => updateFlatRate(index, 'billing_type', e.target.value)}
                      >
                        <option value="monthly">Monatlich</option>
                        <option value="yearly">Jährlich</option>
                        <option value="once">Einmalig</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Einstellungen</Label>
                      <label className="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          checked={rate.is_mandatory}
                          onChange={(e) => updateFlatRate(index, 'is_mandatory', e.target.checked)}
                        />
                        Pflichtgebühr
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Beschreibung</Label>
                    <Textarea
                      value={rate.description || ''}
                      onChange={(e) => updateFlatRate(index, 'description', e.target.value)}
                      placeholder="Beschreibung der Pauschale..."
                      rows={2}
                    />
                  </div>
                </div>
              ))}
              
              {!formData.flat_rates?.length && (
                <div className="text-center py-8 text-muted-foreground">
                  <Euro className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Noch keine Pauschalen definiert</p>
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
                Vertragseinstellungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto Renewal */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Automatische Verlängerung</Label>
                    <p className="text-sm text-muted-foreground">
                      Vertrag verlängert sich automatisch um die angegebene Laufzeit
                    </p>
                  </div>
                  <Switch
                    checked={formData.auto_renew}
                    onCheckedChange={(checked) => handleInputChange('auto_renew', checked)}
                  />
                </div>
                
                {formData.auto_renew && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label>Verlängerungs-Laufzeit (Monate)</Label>
                      <Input
                        type="number"
                        value={formData.renewal_term_months || 12}
                        onChange={(e) => handleInputChange('renewal_term_months', parseInt(e.target.value) || 12)}
                        min="1"
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Cancellation */}
              <div className="space-y-4">
                <Label className="text-base">Kündigungsfristen</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kündigungsfrist</Label>
                    <Input
                      type="number"
                      value={formData.cancellation_period}
                      onChange={(e) => handleInputChange('cancellation_period', parseInt(e.target.value) || 30)}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Einheit</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md"
                      value={formData.cancellation_unit}
                      onChange={(e) => handleInputChange('cancellation_unit', e.target.value)}
                    >
                      <option value="days">Tage</option>
                      <option value="months">Monate</option>
                    </select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Group Discount */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Gruppenrabatt aktivieren</Label>
                    <p className="text-sm text-muted-foreground">
                      Rabatt für Familien oder Gruppenanmeldungen
                    </p>
                  </div>
                  <Switch
                    checked={formData.group_discount_enabled}
                    onCheckedChange={(checked) => handleInputChange('group_discount_enabled', checked)}
                  />
                </div>
                
                {formData.group_discount_enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label>Rabatt-Typ</Label>
                      <select 
                        className="w-full px-3 py-2 border rounded-md"
                        value={formData.group_discount_type}
                        onChange={(e) => handleInputChange('group_discount_type', e.target.value)}
                      >
                        <option value="percent">Prozent</option>
                        <option value="fixed">Fester Betrag</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Rabatt-Wert</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.group_discount_value || 0}
                        onChange={(e) => handleInputChange('group_discount_value', parseFloat(e.target.value) || 0)}
                        min="0"
                        placeholder={formData.group_discount_type === 'percent' ? '10' : '5.00'}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}