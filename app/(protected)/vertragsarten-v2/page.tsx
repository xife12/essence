'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  FileText, 
  Package, 
  Building2,
  Settings,
  Eye,
  Edit,
  Copy,
  History,
  Filter,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ContractsV2API from '@/lib/api/contracts-v2';
import type { Contract, ContractModule, ContractDocument, ModuleCategory } from '@/lib/types/contracts-v2';

export default function VertragsartenV2Page() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('contracts');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Daten-States
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [modules, setModules] = useState<ContractModule[]>([]);
  const [documents, setDocuments] = useState<ContractDocument[]>([]);
  const [categories, setCategories] = useState<ModuleCategory[]>([]);

  // Filter-States
  const [contractFilters, setContractFilters] = useState({
    showCampaigns: false,
    showInactive: false
  });
  const [moduleFilters, setModuleFilters] = useState({
    categoryId: '',
    showInactive: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [contractsData, modulesData, documentsData, categoriesData] = await Promise.all([
        ContractsV2API.contracts.getAll({
          is_campaign_version: contractFilters.showCampaigns ? undefined : false,
          search: searchTerm || undefined
        }),
        ContractsV2API.modules.getAll({
          is_active: moduleFilters.showInactive ? undefined : true,
          category_id: moduleFilters.categoryId || undefined,
          search: searchTerm || undefined
        }),
        ContractsV2API.documents.getAll(),
        ContractsV2API.categories.getAll()
      ]);
      
      setContracts(contractsData);
      setModules(modulesData);
      setDocuments(documentsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Debounced search würde hier implementiert werden
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const getVersionBadge = (contract: Contract) => {
    if (contract.is_campaign_version) {
      return <Badge variant="secondary" className="ml-2">Kampagne</Badge>;
    }
    return <Badge variant="outline" className="ml-2">v{contract.version_number}</Badge>;
  };

  const getModuleCategoryIcon = (categoryName: string) => {
    const icons: Record<string, any> = {
      'Training & Kurse': Package,
      'Wellness & Regeneration': Building2,
      'Digital & App-Funktionen': Settings,
      default: Package
    };
    return icons[categoryName] || icons.default;
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Vertragsarten V2</h1>
          <p className="text-muted-foreground mt-1">
            Moderne Vertragsverwaltung mit Modulen, Versionierung und Dokumenten
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => router.push('/vertragsarten-v2/contracts/neu')}>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Vertrag
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/vertragsarten-v2/modules/neu')}
          >
            <Package className="h-4 w-4 mr-2" />
            Neues Modul
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/vertragsarten-v2/documents/neu')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Neues Dokument
          </Button>
        </div>
      </div>

      {/* Suchleiste */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Verträge, Module oder Dokumente durchsuchen..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contracts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Verträge ({contracts.length})
          </TabsTrigger>
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Module ({modules.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Dokumente ({documents.length})
          </TabsTrigger>
        </TabsList>

        {/* CONTRACTS TAB */}
        <TabsContent value="contracts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Verträge</h2>
            <div className="flex gap-2">
              <Button 
                variant={contractFilters.showCampaigns ? "default" : "outline"}
                size="sm"
                onClick={() => setContractFilters(prev => ({ 
                  ...prev, 
                  showCampaigns: !prev.showCampaigns 
                }))}
              >
                Kampagnen zeigen
              </Button>
              <Button 
                variant={contractFilters.showInactive ? "default" : "outline"}
                size="sm"
                onClick={() => setContractFilters(prev => ({ 
                  ...prev, 
                  showInactive: !prev.showInactive 
                }))}
              >
                Inaktive zeigen
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contracts.map((contract) => (
              <Card key={contract.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex items-center">
                      {contract.name}
                      {getVersionBadge(contract)}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => router.push(`/vertragsarten-v2/contracts/${contract.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => router.push(`/vertragsarten-v2/contracts/${contract.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {contract.description && (
                    <p className="text-sm text-muted-foreground">
                      {contract.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Terms Preview */}
                  {contract.terms && contract.terms.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-1">Laufzeiten</div>
                      <div className="flex flex-wrap gap-1">
                        {contract.terms.slice(0, 3).map((term) => (
                          <Badge key={term.id} variant="outline" className="text-xs">
                            {term.duration_months}M - {formatPrice(term.base_price)}
                          </Badge>
                        ))}
                        {contract.terms.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{contract.terms.length - 3} weitere
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Module Count */}
                  {contract.modules && contract.modules.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Module:</span>
                      <span>{contract.modules.length} zugeordnet</span>
                    </div>
                  )}

                  {/* Status & Campaign Info */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={contract.is_active ? "default" : "secondary"}>
                      {contract.is_active ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </div>

                  {contract.campaign && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Kampagne:</span>
                      <span className="font-medium">{contract.campaign.name}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {contracts.length === 0 && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Noch keine Verträge vorhanden</p>
                  <Button 
                    className="mt-4"
                    onClick={() => router.push('/vertragsarten-v2/contracts/neu')}
                  >
                    Ersten Vertrag erstellen
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* MODULES TAB */}
        <TabsContent value="modules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Module</h2>
            <div className="flex gap-2">
              <select 
                className="px-3 py-1 border rounded-md text-sm"
                value={moduleFilters.categoryId}
                onChange={(e) => setModuleFilters(prev => ({ 
                  ...prev, 
                  categoryId: e.target.value 
                }))}
              >
                <option value="">Alle Kategorien</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <Button 
                variant={moduleFilters.showInactive ? "default" : "outline"}
                size="sm"
                onClick={() => setModuleFilters(prev => ({ 
                  ...prev, 
                  showInactive: !prev.showInactive 
                }))}
              >
                Inaktive zeigen
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => {
              const IconComponent = getModuleCategoryIcon(module.category?.name || '');
              
              return (
                <Card key={module.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <IconComponent className="h-5 w-5" />
                        {module.name}
                      </CardTitle>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => router.push(`/vertragsarten-v2/modules/${module.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => router.push(`/vertragsarten-v2/modules/${module.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {module.description && (
                      <p className="text-sm text-muted-foreground">
                        {module.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Preis/Monat:</span>
                      <span className="font-semibold">{formatPrice(module.price_per_month)}</span>
                    </div>

                    {module.category && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Kategorie:</span>
                        <Badge variant="outline">{module.category.name}</Badge>
                      </div>
                    )}

                    {module.assignment_stats && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Zuordnungen:</span>
                          <span>{module.assignment_stats.total_contracts} Verträge</span>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <Badge variant="default" className="text-xs">
                            {module.assignment_stats.included} inkludiert
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {module.assignment_stats.optional} optional
                          </Badge>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={module.is_active ? "default" : "secondary"}>
                        {module.is_active ? "Aktiv" : "Inaktiv"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {modules.length === 0 && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Noch keine Module vorhanden</p>
                  <Button 
                    className="mt-4"
                    onClick={() => router.push('/vertragsarten-v2/modules/neu')}
                  >
                    Erstes Modul erstellen
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* DOCUMENTS TAB */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Vertragsdokumente</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{document.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => router.push(`/vertragsarten-v2/documents/${document.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => router.push(`/vertragsarten-v2/documents/${document.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {document.description && (
                    <p className="text-sm text-muted-foreground">
                      {document.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Version:</span>
                    <Badge variant="outline">v{document.version_number}</Badge>
                  </div>

                  {document.sections && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Abschnitte:</span>
                      <span>{document.sections.length}</span>
                    </div>
                  )}

                  {document.contract_assignments && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Verträge:</span>
                      <span>{document.contract_assignments.length} zugeordnet</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={document.is_active ? "default" : "secondary"}>
                      {document.is_active ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {documents.length === 0 && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Noch keine Dokumente vorhanden</p>
                  <Button 
                    className="mt-4"
                    onClick={() => router.push('/vertragsarten-v2/documents/neu')}
                  >
                    Erstes Dokument erstellen
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}