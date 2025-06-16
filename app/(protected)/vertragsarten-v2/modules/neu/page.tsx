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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Save, 
  ArrowLeft,
  Package,
  Settings,
  Users,
  AlertTriangle,
  Upload,
  Search,
  Dumbbell,
  Waves,
  Heart,
  Crown,
  Baby,
  Smartphone,
  Building,
  Apple,
  Target,
  Calendar,
  Star,
  Shield,
  Zap,
  Coffee,
  Home,
  CheckCircle
} from 'lucide-react';
import ContractsV2API from '@/lib/api/contracts-v2';
import type { 
  ModuleFormData, 
  ModuleCategory,
  Contract,
  ModuleAssignment,
  ValidationResult 
} from '@/lib/types/contracts-v2';

// Icon mapping for module categories
const LUCIDE_ICONS = [
  { name: 'Dumbbell', icon: Dumbbell, category: 'Training & Kurse' },
  { name: 'Waves', icon: Waves, category: 'Wellness & Regeneration' },
  { name: 'Heart', icon: Heart, category: 'Gesundheit & Diagnostik' },
  { name: 'Crown', icon: Crown, category: 'Premium & Komfort' },
  { name: 'Baby', icon: Baby, category: 'Familie & Kinder' },
  { name: 'Smartphone', icon: Smartphone, category: 'Digital & App-Funktionen' },
  { name: 'Users', icon: Users, category: 'Community & Events' },
  { name: 'Building', icon: Building, category: 'Zugang & Infrastruktur' },
  { name: 'Apple', icon: Apple, category: 'Ernährung & Coaching' },
  { name: 'Target', icon: Target, category: 'Training & Kurse' },
  { name: 'Calendar', icon: Calendar, category: 'Community & Events' },
  { name: 'Star', icon: Star, category: 'Premium & Komfort' },
  { name: 'Shield', icon: Shield, category: 'Premium & Komfort' },
  { name: 'Zap', icon: Zap, category: 'Digital & App-Funktionen' },
  { name: 'Coffee', icon: Coffee, category: 'Wellness & Regeneration' },
  { name: 'Home', icon: Home, category: 'Zugang & Infrastruktur' },
  { name: 'Package', icon: Package, category: 'default' }
];

export default function NewModulePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Available data
  const [categories, setCategories] = useState<ModuleCategory[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  
  // Validation
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Icon selection
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconSearch, setIconSearch] = useState('');

  // Bulk assignment for contracts
  const [moduleAssignments, setModuleAssignments] = useState<ModuleAssignment[]>([]);
  const [assignmentSearch, setAssignmentSearch] = useState('');

  // Form data
  const [formData, setFormData] = useState<ModuleFormData>({
    name: '',
    description: '',
    price_per_month: 0,
    category_id: '',
    icon_name: 'Package',
    icon_file_asset_id: '',
    is_active: true
  });

  useEffect(() => {
    loadAvailableData();
  }, []);

  const loadAvailableData = async () => {
    setIsLoading(true);
    try {
      const [categoriesData, contractsData] = await Promise.all([
        ContractsV2API.categories.getAll(),
        ContractsV2API.contracts.getActive()
      ]);
      setCategories(categoriesData);
      setContracts(contractsData);
      
      // Initialize assignments
      const assignments: ModuleAssignment[] = contractsData.map(contract => ({
        contractId: contract.id,
        contractName: contract.name,
        currentType: 'none',
        newType: 'none',
        customPrice: undefined,
        standardPrice: formData.price_per_month
      }));
      setModuleAssignments(assignments);
      
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ModuleFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Update standard price in assignments when price changes
    if (field === 'price_per_month') {
      setModuleAssignments(prev => prev.map(assignment => ({
        ...assignment,
        standardPrice: value
      })));
    }
    
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleIconSelect = (iconName: string) => {
    handleInputChange('icon_name', iconName);
    setShowIconPicker(false);
  };

  const handleAssignmentChange = (contractId: string, type: 'none' | 'included' | 'optional', customPrice?: number) => {
    setModuleAssignments(prev => prev.map(assignment => 
      assignment.contractId === contractId 
        ? { ...assignment, newType: type, customPrice }
        : assignment
    ));
  };

  const validateForm = (): boolean => {
    const validation = ContractsV2API.modules.validate(formData);
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
      // Create module first
      const module = await ContractsV2API.modules.create(formData);
      
      // Then handle bulk assignments if any
      const assignmentsToCreate = moduleAssignments.filter(a => a.newType !== 'none');
      if (assignmentsToCreate.length > 0) {
        await ContractsV2API.modules.updateBulkAssignments(module.id, assignmentsToCreate);
      }
      
      router.push(`/vertragsarten-v2/modules/${module.id}`);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      setValidationErrors(['Fehler beim Speichern des Moduls']);
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

  const getSelectedIcon = () => {
    const selectedIcon = LUCIDE_ICONS.find(icon => icon.name === formData.icon_name);
    return selectedIcon ? selectedIcon.icon : Package;
  };

  const getFilteredIcons = () => {
    if (!iconSearch) return LUCIDE_ICONS;
    return LUCIDE_ICONS.filter(icon => 
      icon.name.toLowerCase().includes(iconSearch.toLowerCase()) ||
      icon.category.toLowerCase().includes(iconSearch.toLowerCase())
    );
  };

  const getFilteredAssignments = () => {
    if (!assignmentSearch) return moduleAssignments;
    return moduleAssignments.filter(assignment =>
      assignment.contractName.toLowerCase().includes(assignmentSearch.toLowerCase())
    );
  };

  const getAssignmentCounts = () => {
    const included = moduleAssignments.filter(a => a.newType === 'included').length;
    const optional = moduleAssignments.filter(a => a.newType === 'optional').length;
    return { included, optional, total: included + optional };
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

  const SelectedIcon = getSelectedIcon();
  const counts = getAssignmentCounts();

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
            <h1 className="text-3xl font-bold">Neues Modul</h1>
            <p className="text-muted-foreground">
              Erstellen Sie ein neues Modul für Vertragsarten
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Grunddaten</TabsTrigger>
          <TabsTrigger value="assignments">
            Vertrags-Zuordnungen
            {counts.total > 0 && (
              <Badge variant="secondary" className="ml-2">{counts.total}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
        </TabsList>

        {/* BASIC INFO TAB */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SelectedIcon className="h-5 w-5" />
                Modul-Grunddaten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Modulname *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="z.B. Gruppenkurse, Sauna-Zugang"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Preis pro Monat (€) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price_per_month}
                    onChange={(e) => handleInputChange('price_per_month', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Beschreibung des Moduls und der enthaltenen Leistungen..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Kategorie</Label>
                  <select 
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.category_id || ''}
                    onChange={(e) => handleInputChange('category_id', e.target.value)}
                  >
                    <option value="">Kategorie auswählen...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Icon</Label>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowIconPicker(true)}
                      className="flex items-center gap-2"
                    >
                      <SelectedIcon className="h-4 w-4" />
                      {formData.icon_name}
                    </Button>
                    <Button variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <h3 className="font-medium mb-2">Vorschau</h3>
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                    <div className="flex items-center gap-3">
                      <SelectedIcon className="h-6 w-6 text-primary" />
                      <div>
                        <h4 className="font-medium">{formData.name || 'Modulname'}</h4>
                        {formData.description && (
                          <p className="text-sm text-muted-foreground">
                            {formData.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatPrice(formData.price_per_month)}</div>
                      <div className="text-sm text-muted-foreground">pro Monat</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Icon Picker Dialog */}
          <Dialog open={showIconPicker} onOpenChange={setShowIconPicker}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Icon auswählen</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Icons durchsuchen..."
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="grid grid-cols-6 gap-2">
                  {getFilteredIcons().map(({ name, icon: IconComponent, category }) => (
                    <Button
                      key={name}
                      variant={formData.icon_name === name ? "default" : "outline"}
                      className="h-16 flex-col gap-1"
                      onClick={() => handleIconSelect(name)}
                    >
                      <IconComponent className="h-6 w-6" />
                      <span className="text-xs">{name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ASSIGNMENTS TAB */}
        <TabsContent value="assignments" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Vertrags-Zuordnungen
                </CardTitle>
                <div className="flex gap-2 text-sm">
                  <Badge variant="default">{counts.included} inkludiert</Badge>
                  <Badge variant="secondary">{counts.optional} optional</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Verträge durchsuchen..."
                  value={assignmentSearch}
                  onChange={(e) => setAssignmentSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-3">
                {getFilteredAssignments().map(assignment => (
                  <div key={assignment.contractId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{assignment.contractName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          Standardpreis: {formatPrice(assignment.standardPrice)}
                        </span>
                        {assignment.customPrice && assignment.customPrice !== assignment.standardPrice && (
                          <span className="text-sm font-medium text-primary">
                            → {formatPrice(assignment.customPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant={assignment.newType === 'included' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleAssignmentChange(assignment.contractId, 'included')}
                      >
                        Inkludiert
                      </Button>
                      <Button
                        variant={assignment.newType === 'optional' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleAssignmentChange(assignment.contractId, 'optional')}
                      >
                        Optional
                      </Button>
                      <Button
                        variant={assignment.newType === 'none' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleAssignmentChange(assignment.contractId, 'none')}
                      >
                        Nicht zugeordnet
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {moduleAssignments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
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
                Modul-Einstellungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Modul aktivieren</Label>
                  <p className="text-sm text-muted-foreground">
                    Aktive Module können neuen Verträgen zugeordnet werden
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
              </div>

              {/* Advanced Settings Preview */}
              <div className="border rounded-lg p-4 bg-muted/50">
                <h3 className="font-medium mb-2">Erweiterte Einstellungen</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Nach dem Erstellen verfügbar:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Preisanpassungen pro Vertrag</li>
                  <li>• Zeitgesteuerte Verfügbarkeit</li>
                  <li>• Verknüpfung mit Kampagnen</li>
                  <li>• Rabattregeln definieren</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}