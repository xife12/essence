'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileAsset, 
  FileFilterOptions,
  FILE_CATEGORIES,
  WORK_AREAS,
  MODULE_REFERENCES,
  getFileIcon,
  isImageFile,
  isVideoFile
} from '../../lib/types/file-asset';
import { getFileAssets, deleteFileAsset, getCampaigns, getFileVersions } from '../../lib/api/file-asset';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Download, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  User,
  Tag,
  FolderOpen,
  MoreVertical,
  Folder,
  ChevronRight,
  Home,
  GitBranch
} from 'lucide-react';
import Image from 'next/image';

interface FileGridProps {
  refreshTrigger?: number;
  onFileSelect?: (file: FileAsset) => void;
  onFileEdit?: (file: FileAsset) => void;
  onVersionManagement?: (file: FileAsset) => void;
  onVersionUpdated?: (fileId: string) => void;
  showUploadButton?: boolean;
  defaultFilters?: FileFilterOptions;
}

// Virtuelle Ordnerstruktur
interface VirtualFolder {
  id: string;
  name: string;
  path: string[];
  files: FileAsset[];
  subfolders: VirtualFolder[];
}

export default function FileGrid({ 
  refreshTrigger, 
  onFileSelect, 
  onFileEdit,
  onVersionManagement,
  onVersionUpdated,
  showUploadButton = true,
  defaultFilters = {}
}: FileGridProps) {
  const [files, setFiles] = useState<FileAsset[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [filters, setFilters] = useState<FileFilterOptions>(defaultFilters);
  const [campaigns, setCampaigns] = useState<Array<{ id: string; name: string }>>([]);
  
  // Navigation für virtuelle Ordnerstruktur
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [folderStructure, setFolderStructure] = useState<VirtualFolder | null>(null);
  const [showFolders, setShowFolders] = useState(true);

  // State für Versionsinformationen
  const [fileVersions, setFileVersions] = useState<Map<string, number>>(new Map());

  // Funktion zur Ermittlung der aktuellen Versionsnummer
  const getCurrentVersionNumber = async (fileId: string): Promise<number> => {
    try {
      if (fileVersions.has(fileId)) {
        return fileVersions.get(fileId)!;
      }

      const versions = await getFileVersions(fileId);
      const maxVersion = versions.length > 0 ? Math.max(...versions.map(v => v.version_number)) : 1;
      
      setFileVersions(prev => new Map(prev).set(fileId, maxVersion));
      return maxVersion;
    } catch (error) {
      console.error('Fehler beim Laden der Versionsnummer:', error);
      return 1;
    }
  };

  // Funktion zur Aktualisierung der Versionsnummern für alle Dateien
  const loadVersionNumbers = async (fileList: FileAsset[]) => {
    const versionMap = new Map<string, number>();
    
    for (const file of fileList) {
      try {
        const versions = await getFileVersions(file.id);
        const maxVersion = versions.length > 0 ? Math.max(...versions.map(v => v.version_number)) : 1;
        versionMap.set(file.id, maxVersion);
      } catch (error) {
        console.error(`Fehler beim Laden der Versionen für ${file.filename}:`, error);
        versionMap.set(file.id, 1);
      }
    }
    
    setFileVersions(versionMap);
  };

  // Funktion zur Aktualisierung der Versionsnummer für eine einzelne Datei
  const updateSingleFileVersion = async (fileId: string) => {
    try {
      const versions = await getFileVersions(fileId);
      const maxVersion = versions.length > 0 ? Math.max(...versions.map(v => v.version_number)) : 1;
      setFileVersions(prev => new Map(prev).set(fileId, maxVersion));
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Versionsnummer:', error);
    }
  };

  // Handler für Version-Updates
  const handleVersionUpdate = async (fileId: string) => {
    await updateSingleFileVersion(fileId);
    if (onVersionUpdated) {
      onVersionUpdated(fileId);
    }
  };

  // Kampagnen laden
  const loadCampaigns = async () => {
    try {
      const data = await getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error('Fehler beim Laden der Kampagnen:', error);
    }
  };

  // Dateien laden
  const loadFiles = async () => {
    try {
      setLoading(true);
      const data = await getFileAssets(filters);
      setFiles(data);
      setFilteredFiles(data);
      buildFolderStructure(data);
      
      // Lade auch die Versionsnummern
      await loadVersionNumbers(data);
    } catch (error) {
      console.error('Fehler beim Laden der Dateien:', error);
    } finally {
      setLoading(false);
    }
  };

  // Virtuelle Ordnerstruktur aufbauen
  const buildFolderStructure = (fileList: FileAsset[]) => {
    console.log('🗂️ Baue Ordnerstruktur auf für', fileList.length, 'Dateien');
    
    const rootFolder: VirtualFolder = {
      id: 'root',
      name: 'Dateimanager',
      path: [],
      files: [],
      subfolders: []
    };

    const folderMap = new Map<string, VirtualFolder>();
    folderMap.set('root', rootFolder);

    fileList.forEach(file => {
      const virtualPath = getVirtualPath(file);
      console.log(`📁 Datei "${file.filename}" → Pfad: "${virtualPath}"`);
      
      const pathSegments = virtualPath.split(' > ');
      
      let currentFolder = rootFolder;
      let currentPath: string[] = [];

      pathSegments.forEach((segment, index) => {
        currentPath = [...currentPath, segment];
        const folderKey = currentPath.join('/');

        if (!folderMap.has(folderKey)) {
          const newFolder: VirtualFolder = {
            id: folderKey,
            name: segment,
            path: [...currentPath],
            files: [],
            subfolders: []
          };
          folderMap.set(folderKey, newFolder);
          currentFolder.subfolders.push(newFolder);
          console.log(`📂 Neuer Ordner erstellt: "${segment}" (Pfad: ${folderKey})`);
        }

        currentFolder = folderMap.get(folderKey)!;
      });

      // Datei dem finalen Ordner hinzufügen
      currentFolder.files.push(file);
    });

    console.log('🏗️ Ordnerstruktur aufgebaut:', rootFolder);
    setFolderStructure(rootFolder);
  };

  // Aktueller Ordner basierend auf currentPath
  const getCurrentFolder = (): VirtualFolder | null => {
    if (!folderStructure) return null;
    
    let currentFolder = folderStructure;
    for (const pathSegment of currentPath) {
      const subfolder = currentFolder.subfolders.find(f => f.name === pathSegment);
      if (!subfolder) return null;
      currentFolder = subfolder;
    }
    
    return currentFolder;
  };

  // Ordner-Navigation
  const navigateToFolder = (folderPath: string[]) => {
    setCurrentPath(folderPath);
  };

  // Zurück zum Parent-Ordner
  const navigateUp = () => {
    if (currentPath.length > 0) {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  // Initial laden und bei Filter-Änderungen
  useEffect(() => {
    loadFiles();
    loadCampaigns();
  }, [filters, refreshTrigger]);

  // Suche anwenden
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredFiles(files);
      return;
    }

    const filtered = files.filter(file => 
      file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (file.tags && file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );
    setFilteredFiles(filtered);
    
    // Bei Suche: Ordnerstruktur ausblenden, alle Ergebnisse zeigen
    setShowFolders(false);
  }, [searchTerm, files]);

  // Ordnerstruktur wieder aktivieren wenn Suche leer
  useEffect(() => {
    if (!searchTerm.trim()) {
      setShowFolders(true);
    }
  }, [searchTerm]);

  // Datei löschen
  const handleDelete = async (fileId: string) => {
    if (!confirm('Datei wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }

    try {
      await deleteFileAsset(fileId);
      await loadFiles(); // Neuladen nach Löschung
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      alert('Fehler beim Löschen der Datei');
    }
  };

  // Download
  const handleDownload = (file: FileAsset) => {
    const link = document.createElement('a');
    link.href = file.file_url;
    link.download = file.filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Datei-Vorschau
  const FilePreview = ({ file }: { file: FileAsset }) => {
    if (isImageFile(file.filename)) {
      return (
        <div className="relative w-full h-32 bg-gray-100 rounded-md overflow-hidden">
          <Image
            src={file.file_url}
            alt={file.filename}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      );
    }

    return (
      <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center">
        <span className="text-4xl">
          {getFileIcon(file.category)}
        </span>
      </div>
    );
  };

  // Ordnerstruktur generieren (virtuelle Ordner)
  const getVirtualPath = (file: FileAsset) => {
    const parts = [];
    
    // Modulbezug bestimmt den Hauptordner
    const moduleRef = MODULE_REFERENCES.find(m => m.value === file.module_reference);
    
    if (file.module_reference === 'campaign') {
      parts.push('Kampagnen');
      
      // Spezifische Kampagne (falls campaign_id vorhanden)
      if (file.campaign_id) {
        const campaign = campaigns.find(c => c.id === file.campaign_id);
        parts.push(campaign?.name || 'Unbekannte Kampagne');
      } else {
        parts.push('Allgemein');
      }
    } else if (file.module_reference === 'landingpage') {
      parts.push('Landingpages');
    } else if (file.module_reference === 'task') {
      parts.push('Aufgaben');
    } else if (file.module_reference === 'contentplaner') {
      parts.push('Contentplaner');
    } else {
      // System oder unbekannt
      parts.push('System');
    }
    
    // Kategorie hinzufügen
    const category = FILE_CATEGORIES.find(c => c.value === file.category);
    parts.push(category?.label || file.category);
    
    // Typ-spezifische Unterordner für bestimmte Kategorien
    if (file.type) {
      if (file.category === 'image') {
        if (file.type === 'portrait') {
          parts.push('Portrait');
          // Spezielle Behandlung für Testimonials
          if (file.tags && file.tags.includes('testimonials')) {
            parts.push('Testimonials');
          }
        } else if (file.type === 'hero-banner') {
          parts.push('Hero-Banner');
        } else if (file.type === 'logo') {
          parts.push('Logos');
        } else if (file.type === 'gallery') {
          parts.push('Galerie');
        }
      } else if (file.category === 'print') {
        if (file.type === 'flyer') {
          parts.push('Flyer');
        } else if (file.type === 'poster') {
          parts.push('Poster');
        } else if (file.type === 'broschure') {
          parts.push('Broschüren');
        } else if (file.type === 'visitenkarte') {
          parts.push('Visitenkarten');
        }
      } else if (file.category === 'document') {
        if (file.type === 'checkliste') {
          parts.push('Checklisten');
        } else if (file.type === 'anleitung') {
          parts.push('Anleitungen');
        } else if (file.type === 'formular') {
          parts.push('Formulare');
        } else if (file.type === 'vertrag') {
          parts.push('Verträge');
        }
      }
    }
    
    // Arbeitsbereich (nur bei System-Dateien relevant)
    if (file.module_reference === 'system' && file.work_area) {
      const workArea = WORK_AREAS.find(w => w.value === file.work_area);
      parts.push(workArea?.label || file.work_area);
    }
    
    return parts.join(' > ');
  };

  // Breadcrumb-Navigation
  const Breadcrumb = () => (
    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
      <button
        onClick={() => navigateToFolder([])}
        className="flex items-center gap-1 hover:text-blue-600"
      >
        <Home className="w-4 h-4" />
        Dateimanager
      </button>
      
      {currentPath.map((segment, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <button
            onClick={() => navigateToFolder(currentPath.slice(0, index + 1))}
            className="hover:text-blue-600"
          >
            {segment}
          </button>
        </React.Fragment>
      ))}
    </div>
  );

  const currentFolder = getCurrentFolder();

  // Hilfsfunktion: Gesamtanzahl der Dateien in einem Ordner (inklusive Unterordner)
  const getTotalFileCount = (folder: VirtualFolder): number => {
    let count = folder.files.length;
    folder.subfolders.forEach(subfolder => {
      count += getTotalFileCount(subfolder);
    });
    return count;
  };

  // Badge-Komponenten für verschiedene Status
  const StatusBadge = ({ type, value }: { type: 'visibility' | 'work_area' | 'print_ready' | 'campaign' | 'version'; value: string | boolean | number }) => {
    const getBadgeStyle = () => {
      switch (type) {
        case 'visibility':
          switch (value) {
            case 'public': return 'bg-green-100 text-green-800';
            case 'staff_only': return 'bg-blue-100 text-blue-800';
            case 'admin_only': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
          }
        case 'work_area':
          return 'bg-purple-100 text-purple-800';
        case 'print_ready':
          return value ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800';
        case 'campaign':
          return 'bg-indigo-100 text-indigo-800';
        case 'version':
          return 'bg-cyan-100 text-cyan-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    const getBadgeText = () => {
      switch (type) {
        case 'visibility':
          switch (value) {
            case 'public': return '🌐 Öffentlich';
            case 'staff_only': return '👥 Team';
            case 'admin_only': return '🔒 Admin';
            default: return '❓ Unbekannt';
          }
        case 'work_area':
          const workArea = WORK_AREAS.find(w => w.value === value);
          return `📍 ${workArea?.label || value}`;
        case 'print_ready':
          return value ? '🖨️ Druckfertig' : '📝 Entwurf';
        case 'campaign':
          return `🎯 ${value}`;
        case 'version':
          return `📋 v${value}`;
        default:
          return String(value);
      }
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBadgeStyle()}`}>
        {getBadgeText()}
      </span>
    );
  };

  // Beschreibung kürzen
  const truncateDescription = (description: string | null, maxLength: number = 80) => {
    if (!description) return null;
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  // Dateigröße formatieren (falls verfügbar)
  const formatFileSize = (bytes: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Datum formatieren
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header mit Suche und Filtern */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          {/* Suche */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Dateien durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Aktionen */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 border border-gray-300 rounded-md flex items-center gap-2 hover:bg-gray-50 ${
                showFilters ? 'bg-blue-50 border-blue-300' : ''
              }`}
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>

            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-50'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-50'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter-Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Kategorie Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategorie
                </label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    category: e.target.value ? e.target.value as any : undefined 
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Alle</option>
                  {FILE_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Arbeitsbereich Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arbeitsbereich
                </label>
                <select
                  value={filters.work_area || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    work_area: e.target.value ? e.target.value as any : undefined 
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Alle</option>
                  {WORK_AREAS.map(area => (
                    <option key={area.value} value={area.value}>
                      {area.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Modul Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modul
                </label>
                <select
                  value={filters.module_reference || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    module_reference: e.target.value ? e.target.value as any : undefined 
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Alle</option>
                  {MODULE_REFERENCES.map(mod => (
                    <option key={mod.value} value={mod.value}>
                      {mod.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Druckfertig Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Druckfertig
                </label>
                <select
                  value={filters.is_print_ready === undefined ? '' : filters.is_print_ready.toString()}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    is_print_ready: e.target.value === '' ? undefined : e.target.value === 'true'
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Alle</option>
                  <option value="true">Druckfertig</option>
                  <option value="false">Nicht druckfertig</option>
                </select>
              </div>

              {/* Filter zurücksetzen */}
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({})}
                  className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                >
                  Zurücksetzen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inhalt */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Breadcrumb Navigation */}
            {showFolders && <Breadcrumb />}

            {/* Ordnerstruktur oder Suchergebnisse */}
            {showFolders && currentFolder ? (
              <>
                {/* Ordner anzeigen */}
                {currentFolder.subfolders.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Ordner</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {currentFolder.subfolders.map((folder) => (
                        <button
                          key={folder.id}
                          onClick={() => navigateToFolder(folder.path)}
                          className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Folder className="w-8 h-8 text-blue-500 mb-2" />
                          <span className="text-xs text-center text-gray-700 line-clamp-2">
                            {folder.name}
                          </span>
                          <span className="text-xs text-gray-400 mt-1">
                            {getTotalFileCount(folder)} Datei{getTotalFileCount(folder) !== 1 ? 'en' : ''}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dateien im aktuellen Ordner */}
                {currentFolder.files.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Dateien ({currentFolder.files.length})
                    </h3>
                    {/* Grid-Ansicht */}
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {currentFolder.files.map((file) => (
                          <div
                            key={file.id}
                            className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer group"
                            onClick={() => onFileSelect?.(file)}
                          >
                            <FilePreview file={file} />
                            
                            <div className="mt-2">
                              <h3 className="text-sm font-medium text-gray-900 truncate" title={file.filename}>
                                {file.filename}
                              </h3>

                              {/* Beschreibung (gekürzt) */}
                              {file.description && (
                                <p className="text-xs text-gray-500 mt-1 overflow-hidden" style={{ 
                                  display: '-webkit-box', 
                                  WebkitLineClamp: 2, 
                                  WebkitBoxOrient: 'vertical' as any 
                                }}>
                                  {truncateDescription(file.description, 60)}
                                </p>
                              )}

                              {/* Status-Badges */}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {/* Versions-Badge */}
                                <StatusBadge type="version" value={fileVersions.get(file.id) || 1} />
                                
                                {/* Sichtbarkeits-Badge */}
                                <StatusBadge type="visibility" value={file.visibility} />
                                
                                {/* Arbeitsbereich-Badge */}
                                {file.work_area && (
                                  <StatusBadge type="work_area" value={file.work_area} />
                                )}
                                
                                {/* Druckfertig-Badge */}
                                {file.is_print_ready && (
                                  <StatusBadge type="print_ready" value={file.is_print_ready} />
                                )}

                                {/* Kampagnen-Badge */}
                                {file.campaign_id && (
                                  <StatusBadge 
                                    type="campaign" 
                                    value={campaigns.find(c => c.id === file.campaign_id)?.name || 'Kampagne'} 
                                  />
                                )}
                              </div>

                              {/* Tags */}
                              {file.tags && file.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {file.tags.slice(0, 2).map(tag => (
                                    <span
                                      key={tag}
                                      className="inline-block px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                  {file.tags && file.tags.length > 2 && (
                                    <span className="text-xs text-gray-400">+{file.tags.length - 2}</span>
                                  )}
                                </div>
                              )}

                              {/* Metadaten */}
                              <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                                <span>{formatDate(file.created_at)}</span>
                                {/* Dateigröße würde hier stehen, falls verfügbar */}
                              </div>

                              {/* Aktions-Buttons */}
                              <div className="flex justify-between items-center mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownload(file);
                                    }}
                                    className="p-1 text-gray-400 hover:text-blue-600"
                                    title="Herunterladen"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                  {onFileEdit && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onFileEdit(file);
                                      }}
                                      className="p-1 text-gray-400 hover:text-blue-600"
                                      title="Bearbeiten"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                  )}
                                  {onVersionManagement && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onVersionManagement(file);
                                      }}
                                      className="p-1 text-gray-400 hover:text-purple-600"
                                      title="Versionen verwalten"
                                    >
                                      <GitBranch className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(file.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-600"
                                  title="Löschen"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Listen-Ansicht */
                      <div className="space-y-2">
                        {currentFolder.files.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer group"
                            onClick={() => onFileSelect?.(file)}
                          >
                            <div className="flex-shrink-0 w-12 h-12 mr-3">
                              {isImageFile(file.filename) ? (
                                <div className="relative w-12 h-12 rounded overflow-hidden">
                                  <Image
                                    src={file.file_url}
                                    alt={file.filename}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                  <span className="text-xl">
                                    {getFileIcon(file.category)}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {file.filename}
                              </h3>
                              
                              {/* Beschreibung */}
                              {file.description && (
                                <p className="text-xs text-gray-400 truncate mt-1">
                                  {truncateDescription(file.description, 100)}
                                </p>
                              )}
                              
                              {/* Badges in Listen-Ansicht */}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {/* Versions-Badge */}
                                <StatusBadge type="version" value={fileVersions.get(file.id) || 1} />
                                
                                <StatusBadge type="visibility" value={file.visibility} />
                                {file.work_area && (
                                  <StatusBadge type="work_area" value={file.work_area} />
                                )}
                                {file.is_print_ready && (
                                  <StatusBadge type="print_ready" value={file.is_print_ready} />
                                )}
                                {file.campaign_id && (
                                  <StatusBadge 
                                    type="campaign" 
                                    value={campaigns.find(c => c.id === file.campaign_id)?.name || 'Kampagne'} 
                                  />
                                )}
                              </div>
                              
                              {/* Tags in Listen-Ansicht */}
                              {file.tags && file.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {file.tags.slice(0, 4).map(tag => (
                                    <span
                                      key={tag}
                                      className="inline-block px-1 py-0.5 bg-gray-100 text-xs text-gray-600 rounded"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                  {file.tags && file.tags.length > 4 && (
                                    <span className="text-xs text-gray-400">+{file.tags.length - 4}</span>
                                  )}
                                </div>
                              )}

                              {/* Metadaten rechts */}
                              <div className="flex-shrink-0 text-xs text-gray-400 text-right mr-4">
                                <div>{formatDate(file.created_at)}</div>
                                <div className="mt-1">{getVirtualPath(file)}</div>
                              </div>

                              {/* Aktions-Buttons */}
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(file);
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-600"
                                  title="Herunterladen"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                {onFileEdit && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onFileEdit(file);
                                    }}
                                    className="p-1 text-gray-400 hover:text-blue-600"
                                    title="Bearbeiten"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                )}
                                {onVersionManagement && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onVersionManagement(file);
                                    }}
                                    className="p-1 text-gray-400 hover:text-purple-600"
                                    title="Versionen verwalten"
                                  >
                                    <GitBranch className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(file.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-600"
                                  title="Löschen"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Leerer Ordner */}
                {currentFolder.subfolders.length === 0 && currentFolder.files.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Dieser Ordner ist leer</p>
                  </div>
                )}
              </>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Keine Dateien gefunden</p>
                {searchTerm && (
                  <p className="text-sm">Versuche einen anderen Suchbegriff</p>
                )}
              </div>
            ) : (
              /* Suchergebnisse (flache Ansicht) */
              <>
                <div className="mb-4 text-sm text-gray-600">
                  {filteredFiles.length} Datei{filteredFiles.length !== 1 ? 'en' : ''} gefunden
                </div>

                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredFiles.map((file) => (
                      <div
                        key={file.id}
                        className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer group"
                        onClick={() => onFileSelect?.(file)}
                      >
                        <FilePreview file={file} />
                        
                        <div className="mt-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate" title={file.filename}>
                            {file.filename}
                          </h3>
                          
                          <p className="text-xs text-gray-500 mt-1">
                            {getVirtualPath(file)}
                          </p>

                          {/* Beschreibung in Suchergebnissen */}
                          {file.description && (
                            <p className="text-xs text-gray-400 mt-1 overflow-hidden" style={{ 
                              display: '-webkit-box', 
                              WebkitLineClamp: 2, 
                              WebkitBoxOrient: 'vertical' as any 
                            }}>
                              {truncateDescription(file.description, 60)}
                            </p>
                          )}

                          {/* Status-Badges in Suchergebnissen */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {/* Versions-Badge */}
                            <StatusBadge type="version" value={fileVersions.get(file.id) || 1} />
                            
                            <StatusBadge type="visibility" value={file.visibility} />
                            {file.work_area && (
                              <StatusBadge type="work_area" value={file.work_area} />
                            )}
                            {file.is_print_ready && (
                              <StatusBadge type="print_ready" value={file.is_print_ready} />
                            )}
                            {file.campaign_id && (
                              <StatusBadge 
                                type="campaign" 
                                value={campaigns.find(c => c.id === file.campaign_id)?.name || 'Kampagne'} 
                              />
                            )}
                          </div>

                          {/* Tags in Suchergebnissen */}
                          {file.tags && file.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {file.tags.slice(0, 4).map(tag => (
                                <span
                                  key={tag}
                                  className="inline-block px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded"
                                >
                                  #{tag}
                                </span>
                              ))}
                              {file.tags && file.tags.length > 4 && (
                                <span className="text-xs text-gray-400">+{file.tags.length - 4}</span>
                              )}
                            </div>
                          )}

                          {/* Metadaten in Suchergebnissen */}
                          <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                            <span>{formatDate(file.created_at)}</span>
                          </div>

                          {/* Aktions-Buttons */}
                          <div className="flex justify-between items-center mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(file);
                                }}
                                className="p-1 text-gray-400 hover:text-blue-600"
                                title="Herunterladen"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              {onFileEdit && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onFileEdit(file);
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-600"
                                  title="Bearbeiten"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                              {onVersionManagement && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onVersionManagement(file);
                                  }}
                                  className="p-1 text-gray-400 hover:text-purple-600"
                                  title="Versionen verwalten"
                                >
                                  <GitBranch className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(file.id);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600"
                              title="Löschen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Listen-Ansicht für Suchergebnisse */
                  <div className="space-y-2">
                    {filteredFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer group"
                        onClick={() => onFileSelect?.(file)}
                      >
                        <div className="flex-shrink-0 w-12 h-12 mr-3">
                          {isImageFile(file.filename) ? (
                            <div className="relative w-12 h-12 rounded overflow-hidden">
                              <Image
                                src={file.file_url}
                                alt={file.filename}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                              <span className="text-xl">
                                {getFileIcon(file.category)}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {file.filename}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {getVirtualPath(file)}
                          </p>
                          {file.description && (
                            <p className="text-xs text-gray-400 truncate mt-1">
                              {truncateDescription(file.description)}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(file);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="Herunterladen"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {onFileEdit && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onFileEdit(file);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600"
                              title="Bearbeiten"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {onVersionManagement && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onVersionManagement(file);
                              }}
                              className="p-1 text-gray-400 hover:text-purple-600"
                              title="Versionen verwalten"
                            >
                              <GitBranch className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(file.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
} 