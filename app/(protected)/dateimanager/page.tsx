'use client';

import React, { useState } from 'react';
import { Plus, Upload as UploadIcon, FolderOpen, X, Save } from 'lucide-react';
import FileUpload from '../../components/dateimanager/FileUpload';
import FileGrid from '../../components/dateimanager/FileGrid';
import VersionModal from '../../components/dateimanager/VersionModal';
import { FileAsset, WORK_AREAS, FILE_CATEGORIES } from '../../lib/types/file-asset';
import { updateFileAsset } from '../../lib/api/file-asset';

export default function DateimanagerPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedFile, setSelectedFile] = useState<FileAsset | null>(null);
  const [editingFile, setEditingFile] = useState<FileAsset | null>(null);
  const [versioningFile, setVersioningFile] = useState<FileAsset | null>(null);
  const [editForm, setEditForm] = useState({
    filename: '',
    description: '',
    tags: [] as string[],
    work_area: '',
    is_print_ready: false,
    visibility: 'staff_only' as 'staff_only' | 'admin_only',
    is_hidden_from_staff: false,
    module_reference: 'system' as 'system' | 'campaign' | 'landingpage' | 'task' | 'contentplaner'
  });
  const [saving, setSaving] = useState(false);

  const handleUploadComplete = (fileAsset: FileAsset) => {
    setShowUpload(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFileSelect = (file: FileAsset) => {
    setSelectedFile(file);
  };

  const handleFileEdit = (file: FileAsset) => {
    setEditingFile(file);
    setEditForm({
      filename: file.filename,
      description: file.description || '',
      tags: file.tags ? [...file.tags] : [],
      work_area: file.work_area || '',
      is_print_ready: file.is_print_ready || false,
      visibility: (file.visibility || 'staff_only') as 'staff_only' | 'admin_only',
      is_hidden_from_staff: file.is_hidden_from_staff || false,
      module_reference: file.module_reference || 'system'
    });
  };

  const handleVersionManagement = (file: FileAsset) => {
    setVersioningFile(file);
  };

  const handleSaveEdit = async () => {
    if (!editingFile) return;

    setSaving(true);
    try {
      const updateData = {
        description: editForm.description || null,
        tags: editForm.tags,
        work_area: editForm.work_area || null,
        is_print_ready: editForm.is_print_ready,
        visibility: editForm.visibility,
        is_hidden_from_staff: editForm.is_hidden_from_staff,
        module_reference: editForm.module_reference
      } as any;

      console.log('📝 Bereinigte Update-Daten:', updateData);

      await updateFileAsset(editingFile.id, updateData);
      
      setEditingFile(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Fehler beim Speichern der Änderungen');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = (file: FileAsset) => {
    window.open(file.file_url, '_blank');
    
    const link = document.createElement('a');
    link.href = file.file_url;
    link.download = file.filename;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dateimanager</h1>
              <p className="mt-1 text-sm text-gray-500">
                Zentrale Verwaltung aller Dateien und Medien
              </p>
            </div>
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Datei hochladen
            </button>
          </div>
        </div>
      </div>

      {/* Hauptinhalt */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showUpload ? (
          <div className="mb-8">
            <FileUpload
              onUploadComplete={handleUploadComplete}
              onCancel={() => setShowUpload(false)}
            />
          </div>
        ) : (
          <FileGrid
            refreshTrigger={refreshTrigger}
            onFileSelect={handleFileSelect}
            onFileEdit={handleFileEdit}
            onVersionManagement={handleVersionManagement}
            onVersionUpdated={(fileId) => {
              // Zusätzliche Version-Update-Logik falls nötig
              console.log('Version aktualisiert für Datei:', fileId);
            }}
          />
        )}

        {/* Virtuelle Ordnerstruktur Info */}
        {!showUpload && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              <FolderOpen className="w-5 h-5 inline mr-2" />
              Virtuelle Ordnerstruktur
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                Dateien werden automatisch in einer intelligenten Ordnerstruktur organisiert:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><span className="font-medium">Kampagnen</span> → Kampagnenname → Kategorie</li>
                <li><span className="font-medium">System</span> → Kategorie → Arbeitsbereich</li>
                <li><span className="font-medium">Module</span> → Modulbezug → Kategorie</li>
              </ul>
              <p className="mt-3 text-xs">
                Nutze Filter und Tags, um spezifische Dateien schnell zu finden.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bearbeitungsmodal */}
      {editingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Datei bearbeiten</h2>
              <button
                onClick={() => setEditingFile(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dateiname
                </label>
                <input
                  type="text"
                  value={editForm.filename}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Dateiname kann nicht geändert werden</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beschreibung
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Beschreibung der Datei..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arbeitsbereich
                </label>
                <select
                  value={editForm.work_area}
                  onChange={(e) => setEditForm(prev => ({ ...prev, work_area: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Kein Arbeitsbereich --</option>
                  {WORK_AREAS.map(area => (
                    <option key={area.value} value={area.value}>
                      {area.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="space-y-2">
                  {/* Aktuelle Tags anzeigen */}
                  {editForm.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {editForm.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => setEditForm(prev => ({
                              ...prev,
                              tags: prev.tags.filter((_, i) => i !== index)
                            }))}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Neuen Tag hinzufügen */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Neuen Tag hinzufügen..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const newTag = e.currentTarget.value.trim();
                          if (newTag && !editForm.tags.includes(newTag)) {
                            setEditForm(prev => ({
                              ...prev,
                              tags: [...prev.tags, newTag]
                            }));
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        const newTag = input.value.trim();
                        if (newTag && !editForm.tags.includes(newTag)) {
                          setEditForm(prev => ({
                            ...prev,
                            tags: [...prev.tags, newTag]
                          }));
                          input.value = '';
                        }
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Drücke Enter oder klicke +, um einen Tag hinzuzufügen</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sichtbarkeit
                </label>
                <select
                  value={editForm.visibility}
                  onChange={(e) => setEditForm(prev => ({ ...prev, visibility: e.target.value as 'staff_only' | 'admin_only' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="staff_only">👥 Team - Alle Mitarbeiter können zugreifen</option>
                  <option value="admin_only">🔒 Admin/Studioleiter - Nur für höhere Rollen</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modulbezug
                </label>
                <select
                  value={editForm.module_reference}
                  onChange={(e) => setEditForm(prev => ({ ...prev, module_reference: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="system">🔧 System</option>
                  <option value="campaign">📢 Kampagne</option>
                  <option value="landingpage">🌐 Landingpage</option>
                  <option value="task">✅ Aufgabe</option>
                  <option value="contentplaner">📅 Contentplaner</option>
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_print_ready"
                    checked={editForm.is_print_ready}
                    onChange={(e) => setEditForm(prev => ({ ...prev, is_print_ready: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_print_ready" className="ml-2 text-sm text-gray-700">
                    🖨️ Druckfertig
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_hidden_from_staff"
                    checked={editForm.is_hidden_from_staff}
                    onChange={(e) => setEditForm(prev => ({ ...prev, is_hidden_from_staff: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_hidden_from_staff" className="ml-2 text-sm text-gray-700">
                    👁️ Vor Mitarbeitern verbergen
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setEditingFile(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={saving}
              >
                Abbrechen
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Speichern...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Speichern
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Datei-Vorschau Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl max-h-[80vh] overflow-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{selectedFile.filename}</h2>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Kategorie</label>
                <p className="text-sm text-gray-900">{selectedFile.category}</p>
              </div>
              
              {selectedFile.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Beschreibung</label>
                  <p className="text-sm text-gray-900">{selectedFile.description}</p>
                </div>
              )}
              
              {selectedFile.tags && selectedFile.tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedFile.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleDownload(selectedFile)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Öffnen & Herunterladen
                </button>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    handleFileEdit(selectedFile);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Bearbeiten
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Versionierungs-Modal */}
      {versioningFile && (
        <VersionModal
          file={versioningFile}
          onClose={() => setVersioningFile(null)}
          onVersionUploaded={() => {
            setRefreshTrigger(prev => prev + 1);
          }}
          onVersionUpdated={(fileId) => {
            // Version wurde aktualisiert - trigger refresh der FileGrid
            setRefreshTrigger(prev => prev + 1);
          }}
        />
      )}
    </div>
  );
} 