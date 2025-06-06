'use client';

import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  X, 
  Upload, 
  Clock, 
  Download, 
  Trash2, 
  FileText,
  ChevronRight,
  AlertCircle 
} from 'lucide-react';
import { 
  FileAsset, 
  FileVersion, 
  VersionUploadData 
} from '../../lib/types/file-asset';
import { 
  getFileVersions, 
  uploadNewVersion, 
  setCurrentVersion, 
  deleteFileVersion 
} from '../../lib/api/file-asset';

interface VersionModalProps {
  file: FileAsset;
  onClose: () => void;
  onVersionUploaded?: (version: FileVersion) => void;
  onVersionUpdated?: (fileId: string) => void;
}

export default function VersionModal({ file, onClose, onVersionUploaded, onVersionUpdated }: VersionModalProps) {
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState<VersionUploadData>({
    parent_file_id: file.id,
    version_description: '',
    changelog: ''
  });
  const [error, setError] = useState<string | null>(null);

  // Versionen laden
  useEffect(() => {
    loadVersions();
  }, [file.id]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const versionData = await getFileVersions(file.id);
      setVersions(versionData);
    } catch (error) {
      console.error('Fehler beim Laden der Versionen:', error);
      setError('Fehler beim Laden der Versionen');
    } finally {
      setLoading(false);
    }
  };

  // Drag & Drop für neue Version
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setError(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp', '.svg'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm']
    }
  });

  // Version als aktuell setzen
  const handleSetCurrentVersion = async (versionId: string) => {
    if (!confirm('Diese Version als aktuelle Version setzen? Die Hauptdatei wird dann diese Version anzeigen.')) {
      return;
    }

    try {
      await setCurrentVersion(versionId);
      await loadVersions(); // Neu laden um aktuelle Markierung zu aktualisieren
      
      if (onVersionUpdated) {
        onVersionUpdated(file.id);
      }
    } catch (error) {
      console.error('Fehler beim Setzen der aktuellen Version:', error);
      setError(error instanceof Error ? error.message : 'Fehler beim Setzen der aktuellen Version');
    }
  };

  // Neue Version hochladen
  const handleUploadVersion = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const result = await uploadNewVersion(selectedFile, uploadData);
      
      if (!result.success) {
        throw new Error(result.error || 'Upload fehlgeschlagen');
      }

      // Erfolgreich - frage ob als aktuelle Version setzen
      const setAsCurrent = confirm('Version erfolgreich hochgeladen! Soll diese Version als aktuelle Version gesetzt werden?');
      
      if (setAsCurrent && result.file_version) {
        await setCurrentVersion(result.file_version.id);
      }

      // Zurücksetzen und neu laden
      setSelectedFile(null);
      setUploadData({
        parent_file_id: file.id,
        version_description: '',
        changelog: ''
      });
      
      await loadVersions();
      
      if (onVersionUploaded && result.file_version) {
        onVersionUploaded(result.file_version);
      }

      if (onVersionUpdated) {
        onVersionUpdated(file.id);
      }
    } catch (error) {
      console.error('Upload-Fehler:', error);
      setError(error instanceof Error ? error.message : 'Upload fehlgeschlagen');
    } finally {
      setUploading(false);
    }
  };

  // Version löschen
  const handleDeleteVersion = async (versionId: string) => {
    if (!confirm('Version wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }

    try {
      await deleteFileVersion(versionId);
      await loadVersions();
    } catch (error) {
      console.error('Fehler beim Löschen der Version:', error);
      setError(error instanceof Error ? error.message : 'Fehler beim Löschen der Version');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Versionen verwalten</h2>
            <p className="text-sm text-gray-500 mt-1">{file.filename}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Linke Spalte: Neue Version hochladen */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">📤 Neue Version hochladen</h3>
                
                {/* Drag & Drop Bereich */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  {isDragActive ? (
                    <p className="text-blue-600">Datei hier ablegen...</p>
                  ) : (
                    <div>
                      <p className="text-gray-600 mb-1">
                        Datei hierher ziehen oder klicken
                      </p>
                      <p className="text-xs text-gray-400">
                        Gleicher Dateityp wie Original empfohlen
                      </p>
                    </div>
                  )}
                </div>

                {/* Ausgewählte Datei */}
                {selectedFile && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                      </div>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload-Formular */}
                {selectedFile && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Versionsbeschreibung
                      </label>
                      <input
                        type="text"
                        value={uploadData.version_description || ''}
                        onChange={(e) => setUploadData(prev => ({ 
                          ...prev, 
                          version_description: e.target.value 
                        }))}
                        placeholder="z.B. Korrigierte Schriftart"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Änderungsprotokoll
                      </label>
                      <textarea
                        value={uploadData.changelog || ''}
                        onChange={(e) => setUploadData(prev => ({ 
                          ...prev, 
                          changelog: e.target.value 
                        }))}
                        placeholder="Was wurde geändert?"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      onClick={handleUploadVersion}
                      disabled={uploading}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          Wird hochgeladen...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Version hochladen
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Rechte Spalte: Versionshistorie */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                📋 Versionshistorie 
                {versions.length > 0 && (
                  <span className="text-sm font-normal text-gray-500">({versions.length} Versionen)</span>
                )}
              </h3>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                  <span className="ml-2 text-gray-600">Lade Versionen...</span>
                </div>
              ) : versions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Noch keine Versionen vorhanden</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {versions.map((version) => (
                    <div
                      key={version.id}
                      className={`p-4 rounded-lg border ${
                        version.is_current_version 
                          ? 'border-blue-200 bg-blue-50' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-gray-900">
                              Version {version.version_number}
                            </span>
                            {version.is_current_version && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Aktuell
                              </span>
                            )}
                          </div>
                          
                          {version.version_description && (
                            <p className="text-sm text-gray-700 mb-1">{version.version_description}</p>
                          )}
                          
                          {version.changelog && (
                            <p className="text-xs text-gray-500 mb-2">{version.changelog}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(version.created_at)}
                            </span>
                            {version.file_size && (
                              <span>{formatFileSize(version.file_size)}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => window.open(version.file_url, '_blank')}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="Herunterladen"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          
                          {!version.is_current_version && (
                            <>
                              <button
                                onClick={() => handleSetCurrentVersion(version.id)}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                                title="Als aktuelle Version setzen"
                              >
                                <ChevronRight className="w-3 h-3 inline mr-1" />
                                Aktivieren
                              </button>
                              <button
                                onClick={() => handleDeleteVersion(version.id)}
                                className="p-1 text-gray-400 hover:text-red-600"
                                title="Version löschen"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fehleranzeige */}
        {error && (
          <div className="mx-6 mb-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            💡 <strong>Tipp:</strong> Alle Versionen teilen sich die Metadaten der Hauptdatei (Tags, Beschreibung, etc.)
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
} 