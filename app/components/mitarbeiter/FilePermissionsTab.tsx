'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Upload, 
  Eye, 
  EyeOff, 
  Settings, 
  Users,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import {
  getStaffFilePermissions,
  updateStaffFilePermissions,
  getCurrentUserRole
} from '../../lib/api/file-asset';
import {
  StaffFilePermissions,
  UploadPermission,
  UPLOAD_PERMISSIONS
} from '../../lib/types/file-asset';

interface Staff {
  id: string;
  rolle: 'admin' | 'studioleiter' | 'mitarbeiter';
  email?: string;
  first_name?: string;
  last_name?: string;
}

interface FilePermissionsTabProps {
  staffList: Staff[];
  onRefresh?: () => void;
}

export default function FilePermissionsTab({ staffList, onRefresh }: FilePermissionsTabProps) {
  const [permissions, setPermissions] = useState<StaffFilePermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [permissionsData, role] = await Promise.all([
        getStaffFilePermissions(),
        getCurrentUserRole()
      ]);
      setPermissions(permissionsData);
      setCurrentUserRole(role);
    } catch (error) {
      console.error('Fehler beim Laden der Berechtigungen:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePermission = async (
    staffId: string, 
    field: keyof StaffFilePermissions, 
    value: any
  ) => {
    try {
      setUpdating(staffId);
      await updateStaffFilePermissions(staffId, { [field]: value });
      await loadData(); // Reload to get updated data
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Berechtigung:', error);
      alert('Fehler beim Speichern der Berechtigung');
    } finally {
      setUpdating(null);
    }
  };

  const getStaffPermission = (staffId: string): StaffFilePermissions | null => {
    return permissions.find(p => p.staff_id === staffId) || null;
  };

  const getPermissionIcon = (permission: UploadPermission) => {
    switch (permission) {
      case 'none': return <X className="w-4 h-4 text-red-500" />;
      case 'own_files': return <Upload className="w-4 h-4 text-blue-500" />;
      case 'all_files': return <Shield className="w-4 h-4 text-green-500" />;
      default: return <X className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPermissionColor = (permission: UploadPermission) => {
    switch (permission) {
      case 'none': return 'bg-red-50 text-red-700 border-red-200';
      case 'own_files': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'all_files': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Shield className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="font-medium text-blue-900">Dateimanager-Berechtigungen</h3>
        </div>
        <p className="text-sm text-blue-700 mt-1">
          Verwalte die Upload- und Sichtbarkeitsberechtigungen für den Dateimanager.
        </p>
      </div>

      {/* Berechtigungsmatrix */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-medium text-gray-900">Upload-Berechtigungen</h4>
          <p className="text-sm text-gray-500">
            Bestimme, wer Dateien hochladen und verwalten darf.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mitarbeiter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rolle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upload-Berechtigung
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin-Dateien sehen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staffList.map((staff) => {
                const permission = getStaffPermission(staff.id);
                const uploadPermission = permission?.upload_permission || 'none';
                const canSeeAdminFiles = permission?.can_see_admin_files || false;
                const isUpdating = updating === staff.id;

                return (
                  <tr key={staff.id} className={isUpdating ? 'opacity-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {staff.first_name || staff.last_name 
                            ? `${staff.first_name || ''} ${staff.last_name || ''}`.trim()
                            : 'Unbekannt'
                          }
                        </div>
                        <div className="text-sm text-gray-500">{staff.email}</div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        staff.rolle === 'admin' 
                          ? 'bg-purple-100 text-purple-800'
                          : staff.rolle === 'studioleiter'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {staff.rolle}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {staff.rolle === 'admin' || staff.rolle === 'studioleiter' ? (
                        <div className="flex items-center">
                          {getPermissionIcon('all_files')}
                          <span className="ml-2 text-sm text-gray-900">Automatisch (Vollzugriff)</span>
                        </div>
                      ) : (
                        <select
                          value={uploadPermission}
                          onChange={(e) => updatePermission(
                            staff.id, 
                            'upload_permission', 
                            e.target.value as UploadPermission
                          )}
                          disabled={isUpdating}
                          className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {UPLOAD_PERMISSIONS.map(perm => (
                            <option key={perm.value} value={perm.value}>
                              {perm.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {staff.rolle === 'admin' || staff.rolle === 'studioleiter' ? (
                        <div className="flex items-center">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="ml-2 text-sm text-gray-900">Automatisch</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => updatePermission(
                            staff.id, 
                            'can_see_admin_files', 
                            !canSeeAdminFiles
                          )}
                          disabled={isUpdating}
                          className={`flex items-center px-3 py-1 rounded-md text-sm transition-colors ${
                            canSeeAdminFiles
                              ? 'bg-green-100 text-green-800 border border-green-300'
                              : 'bg-gray-100 text-gray-600 border border-gray-300'
                          }`}
                        >
                          {canSeeAdminFiles ? (
                            <>
                              <Eye className="w-4 h-4 mr-1" />
                              Ja
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4 mr-1" />
                              Nein
                            </>
                          )}
                        </button>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        getPermissionColor(uploadPermission)
                      }`}>
                        {getPermissionIcon(uploadPermission)}
                        <span className="ml-1">
                          {UPLOAD_PERMISSIONS.find(p => p.value === uploadPermission)?.label || 'Unbekannt'}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legende */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Berechtigungsebenen:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {UPLOAD_PERMISSIONS.map(perm => (
            <div key={perm.value} className="flex items-center">
              {getPermissionIcon(perm.value)}
              <div className="ml-2">
                <div className="text-sm font-medium text-gray-900">{perm.label}</div>
                <div className="text-xs text-gray-500">{perm.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warnung für Mitarbeiter */}
      {currentUserRole === 'mitarbeiter' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-sm font-medium text-yellow-800">
              Hinweis: Als Mitarbeiter können Sie nur Ihre eigenen Berechtigungen einsehen.
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 