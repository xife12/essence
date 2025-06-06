'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  FileUploadData, 
  FileCategory,
  WorkAreaType,
  ModuleReferenceType,
  FILE_CATEGORIES,
  WORK_AREAS,
  MODULE_REFERENCES,
  TYPE_OPTIONS_BY_CATEGORY,
  getFileIcon
} from '../../lib/types/file-asset';
import { uploadFile, getCampaigns } from '../../lib/api/file-asset';
import { Upload, X, Check, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onUploadComplete?: (fileAsset: any) => void;
  onCancel?: () => void;
  defaultCategory?: FileCategory;
  defaultModuleReference?: ModuleReferenceType;
  defaultCampaignId?: string;
}

export default function FileUpload({ 
  onUploadComplete, 
  onCancel,
  defaultCategory = 'document',
  defaultModuleReference = 'system',
  defaultCampaignId
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadData, setUploadData] = useState<FileUploadData>({
    filename: '',
    category: defaultCategory,
    type: '',
    work_area: undefined,
    campaign_id: defaultCampaignId,
    module_reference: defaultModuleReference,
    is_print_ready: false,
    tags: [],
    description: '',
    visibility: 'staff_only',
    is_hidden_from_staff: false
  });
  const [campaigns, setCampaigns] = useState<Array<{ id: string; name: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  // **Punkt 2: Automatische Format-Erkennung**
  const detectCategoryFromFile = (filename: string): FileCategory => {
    const extension = filename.toLowerCase().split('.').pop();
    
    switch (extension) {
      // Bilder
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'webp':
      case 'svg':
        return 'image';
      
      // Videos
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
      case 'flv':
      case 'webm':
        return 'video';
      
      // PDF oder spezielle Drucksachen
      case 'pdf':
        return 'print';
      
      // Office-Dokumente
      case 'doc':
      case 'docx':
      case 'xls':
      case 'xlsx':
      case 'ppt':
      case 'pptx':
        return 'document';
      
      // Design-/Grafik-Dateien
      case 'ai':
      case 'psd':
      case 'sketch':
      case 'fig':
      case 'eps':
        return 'graphic';
      
      // Web-Assets
      case 'html':
      case 'css':
      case 'js':
        return 'web';
      
      // Standard: Dokument
      default:
        return 'document';
    }
  };

  // Drag & Drop Logik mit automatischer Erkennung
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(acceptedFiles);
    setUploadError(null);
    
    // **Automatische Kategorie-Erkennung bei erster Datei**
    if (acceptedFiles.length > 0) {
      const detectedCategory = detectCategoryFromFile(acceptedFiles[0].name);
      setUploadData(prev => ({
        ...prev,
        category: detectedCategory,
        type: '', // Reset type when category changes
        // PDF automatisch als druckfertig markieren
        is_print_ready: detectedCategory === 'print' || acceptedFiles[0].name.toLowerCase().includes('flyer')
      }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp', '.svg'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
      'text/*': ['.txt', '.csv']
    }
  });

  // Kampagnen laden
  React.useEffect(() => {
    async function loadCampaigns() {
      try {
        console.log('Lade Kampagnen in Upload-Komponente...');
        const campaignData = await getCampaigns();
        console.log('Kampagnen geladen:', campaignData);
        setCampaigns(campaignData);
      } catch (error) {
        console.error('Fehler beim Laden der Kampagnen:', error);
        setUploadError('Fehler beim Laden der Kampagnen');
      }
    }
    loadCampaigns();
  }, []);

  // Tag hinzufügen
  const addTag = () => {
    if (tagInput.trim() && !uploadData.tags.includes(tagInput.trim())) {
      setUploadData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // Tag entfernen
  const removeTag = (tag: string) => {
    setUploadData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Upload durchführen
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      console.log('Starte Upload für', selectedFiles.length, 'Dateien');
      console.log('Upload-Daten:', uploadData);
      console.log('🔍 FileUpload DEBUG module_reference:', uploadData.module_reference);
      
      for (const file of selectedFiles) {
        console.log('Lade Datei hoch:', file.name);
        const result = await uploadFile(file, uploadData);
        
        console.log('Upload-Ergebnis:', result);
        
        if (!result.success) {
          throw new Error(result.error || 'Upload fehlgeschlagen');
        }

        if (onUploadComplete && result.file_asset) {
          onUploadComplete(result.file_asset);
        }
      }

      // Reset nach erfolgreichem Upload
      setSelectedFiles([]);
      setUploadData({
        filename: '',
        category: defaultCategory,
        type: '',
        work_area: undefined,
        campaign_id: defaultCampaignId,
        module_reference: defaultModuleReference,
        is_print_ready: false,
        tags: [],
        description: '',
        visibility: 'staff_only',
        is_hidden_from_staff: false
      });
      
      console.log('Upload abgeschlossen');
    } catch (error) {
      console.error('Upload-Fehler:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload fehlgeschlagen');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Datei hochladen</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Drag & Drop Bereich */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        {isDragActive ? (
          <p className="text-blue-600">Dateien hier ablegen...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Dateien hierher ziehen oder klicken zum Auswählen
            </p>
            <p className="text-sm text-gray-400">
              Unterstützt: Bilder, Videos, PDFs, Office-Dokumente
            </p>
          </div>
        )}
      </div>

      {/* Ausgewählte Dateien */}
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium text-gray-900 mb-2">Ausgewählte Dateien:</h3>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                <span className="text-2xl mr-2">📄</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Konfigurationsformular */}
      {selectedFiles.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kategorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategorie *
              </label>
              <select
                value={uploadData.category}
                onChange={(e) => setUploadData(prev => ({
                  ...prev,
                  category: e.target.value as FileCategory,
                  type: '' // Reset type when category changes
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {FILE_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {getFileIcon(cat.value)} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Typ (abhängig von Kategorie) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Typ
              </label>
              <select
                value={uploadData.type || ''}
                onChange={(e) => setUploadData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Typ auswählen</option>
                {TYPE_OPTIONS_BY_CATEGORY[uploadData.category]?.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Arbeitsbereich */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Arbeitsbereich
              </label>
              <select
                value={uploadData.work_area || ''}
                onChange={(e) => setUploadData(prev => ({ 
                  ...prev, 
                  work_area: e.target.value as WorkAreaType || undefined 
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Arbeitsbereich auswählen</option>
                {WORK_AREAS.map(area => (
                  <option key={area.value} value={area.value}>{area.label}</option>
                ))}
              </select>
            </div>

            {/* Modulbezug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modulbezug
              </label>
              <select
                value={uploadData.module_reference}
                onChange={(e) => setUploadData(prev => ({ 
                  ...prev, 
                  module_reference: e.target.value as ModuleReferenceType 
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {MODULE_REFERENCES.map(mod => (
                  <option key={mod.value} value={mod.value}>{mod.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Kampagne */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kampagne zuordnen
            </label>
            {campaigns.length === 0 ? (
              <div className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500">
                Lade Kampagnen... {campaigns.length === 0 && <span>(oder keine verfügbar)</span>}
              </div>
            ) : (
              <select
                value={uploadData.campaign_id || ''}
                onChange={(e) => setUploadData(prev => ({ 
                  ...prev, 
                  campaign_id: e.target.value || undefined 
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Keine Kampagne</option>
                {campaigns.map(campaign => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            )}
            {campaigns.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {campaigns.length} Kampagne(n) verfügbar
              </p>
            )}
          </div>

          {/* Druckfertig Checkbox */}
          {uploadData.category === 'print' && (
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={uploadData.is_print_ready}
                  onChange={(e) => setUploadData(prev => ({ 
                    ...prev, 
                    is_print_ready: e.target.checked 
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Druckfertige Datei</span>
              </label>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {uploadData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Tag hinzufügen..."
                className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
              >
                +
              </button>
            </div>
          </div>

          {/* Beschreibung */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Beschreibung
            </label>
            <textarea
              value={uploadData.description || ''}
              onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Beschreibung oder Einsatzzweck..."
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* **Punkt 3: Sichtbarkeits-Controls** */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">🔒 Berechtigungen & Sichtbarkeit</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sichtbarkeit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sichtbarkeit
                </label>
                <select
                  value={uploadData.visibility || 'staff_only'}
                  onChange={(e) => setUploadData(prev => ({ 
                    ...prev, 
                    visibility: e.target.value as 'staff_only' | 'admin_only'
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="staff_only">👥 Team - Alle Mitarbeiter können zugreifen</option>
                  <option value="admin_only">🔒 Admin/Studioleiter - Nur für höhere Rollen</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Bestimmt, welche Rollen diese Datei sehen und herunterladen können.
                </p>
              </div>

              {/* Zusätzliche Optionen */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_hidden_from_staff"
                    checked={uploadData.is_hidden_from_staff || false}
                    onChange={(e) => setUploadData(prev => ({ 
                      ...prev, 
                      is_hidden_from_staff: e.target.checked 
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_hidden_from_staff" className="ml-2 text-sm text-gray-700">
                    👁️ Vor normalen Mitarbeitern verbergen
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="upload_is_print_ready"
                    checked={uploadData.is_print_ready}
                    onChange={(e) => setUploadData(prev => ({ 
                      ...prev, 
                      is_print_ready: e.target.checked 
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="upload_is_print_ready" className="ml-2 text-sm text-gray-700">
                    🖨️ Als druckfertig markieren
                  </label>
                </div>
              </div>
            </div>

            {/* Info-Box für Berechtigungen */}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
              <p className="text-blue-800">
                <strong>💡 Hinweis:</strong> Sichtbarkeit bestimmt, welche Rollen auf diese Datei zugreifen können:
              </p>
              <ul className="mt-2 text-blue-700 text-xs space-y-1 ml-4">
                <li>• <strong>Team:</strong> Alle Mitarbeiter, Studioleiter und Admins</li>
                <li>• <strong>Admin/Studioleiter:</strong> Nur Studioleiter und Admins</li>
                <li>• <strong>Verbergen-Option:</strong> Zusätzliche Einschränkung für normale Mitarbeiter</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Fehleranzeige */}
      {uploadError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{uploadError}</span>
        </div>
      )}

      {/* Aktionsbuttons */}
      {selectedFiles.length > 0 && (
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => setSelectedFiles([])}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isUploading}
          >
            Abbrechen
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Wird hochgeladen...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Hochladen
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
} 