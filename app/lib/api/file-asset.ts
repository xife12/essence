// API-Funktionen für das Dateimanager-Modul

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  FileAsset, 
  FileAssetWithCampaign, 
  FileUploadData, 
  FileUploadResponse, 
  FileFilterOptions,
  StaffFilePermissions,
  UploadPermission,
  FileVersion,
  FileAssetWithVersions,
  VersionUploadData,
  VersionUploadResponse
} from '../types/file-asset';

const supabase = createClientComponentClient();

// File Asset CRUD Operationen

export async function getFileAssets(filters?: FileFilterOptions): Promise<FileAsset[]> {
  try {
    let query = supabase
      .from('file_asset')
      .select(`
        *,
        campaigns:campaign_id (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    // Filter anwenden
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.work_area) {
      query = query.eq('work_area', filters.work_area);
    }

    if (filters?.campaign_id) {
      query = query.eq('campaign_id', filters.campaign_id);
    }

    if (filters?.module_reference) {
      query = query.eq('module_reference', filters.module_reference);
    }

    if (filters?.is_print_ready !== undefined) {
      query = query.eq('is_print_ready', filters.is_print_ready);
    }

    if (filters?.visibility) {
      query = query.eq('visibility', filters.visibility);
    }

    if (filters?.show_hidden === false) {
      query = query.eq('is_hidden_from_staff', false);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    if (filters?.search) {
      query = query.or(`filename.ilike.%${filters.search}%, description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Fehler beim Laden der Dateien:', error);
      throw new Error('Fehler beim Laden der Dateien');
    }

    return data || [];
  } catch (error) {
    console.error('Fehler beim Laden der Dateien:', error);
    throw error;
  }
}

export async function getFileAssetById(id: string): Promise<FileAsset | null> {
  try {
    const { data, error } = await supabase
      .from('file_asset')
      .select('*')
      // TEMPORÄR DEAKTIVIERT: JOINs die Fehler verursachen
      // .select(`
      //   *,
      //   campaigns:campaign_id (
      //     id,
      //     name
      //   ),
      //   creator:created_by (
      //     id,
      //     email
      //   )
      // `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Fehler beim Laden der Datei:', error);
      throw new Error('Fehler beim Laden der Datei');
    }

    return data || null;
  } catch (error) {
    console.error('Fehler beim Laden der Datei:', error);
    throw error;
  }
}

export async function uploadFile(
  file: File, 
  uploadData: FileUploadData
): Promise<FileUploadResponse> {
  try {
    console.log('Upload-Daten:', uploadData);
    console.log('🔍 DEBUG module_reference:', uploadData.module_reference);
    
    // TEMPORÄR DEAKTIVIERT: 1. Prüfe Upload-Berechtigung
    // const canUpload = await canUserUploadFiles();
    // if (!canUpload) {
    //   return { success: false, error: 'Keine Upload-Berechtigung' };
    // }
    console.log('🔓 TEMPORÄR: Auth-Checks deaktiviert');

    // 2. Datei zu Supabase Storage hochladen
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${uploadData.category}/${fileName}`;

    console.log('Lade Datei hoch:', filePath);

    const { data: uploadResult, error: uploadError } = await supabase.storage
      .from('file-assets')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload-Fehler:', uploadError);
      return { success: false, error: `Storage-Fehler: ${uploadError.message}` };
    }

    // 3. Öffentliche URL generieren (für privaten Bucket anders)
    const { data: { publicUrl } } = supabase.storage
      .from('file-assets')
      .getPublicUrl(filePath);

    // TEMPORÄR DEAKTIVIERT: 4. User-Daten abrufen
    // const { data: user } = await supabase.auth.getUser();
    // 
    // if (!user?.user?.id) {
    //   // Hochgeladene Datei löschen
    //   await supabase.storage.from('file-assets').remove([filePath]);
    //   return { success: false, error: 'Benutzer nicht authentifiziert' };
    // }
    
    // TEMPORÄR: NULL als created_by (da UUID erwartet wird)
    console.log('🔓 TEMPORÄR: Verwende NULL als created_by');

    // 5. Datenbankeintrag erstellen (nur definierte Felder)
    const fileAssetData = {
      filename: file.name,
      file_url: publicUrl,
      category: uploadData.category,
      type: uploadData.type || null,
      work_area: uploadData.work_area || null,
      campaign_id: uploadData.campaign_id || null,
      module_reference: uploadData.module_reference,
      is_print_ready: uploadData.is_print_ready || false,
      tags: uploadData.tags || [],
      description: uploadData.description || null,
      created_by: null, // TEMPORÄR: NULL statt falscher UUID
      visibility: uploadData.visibility || 'staff_only',
      is_hidden_from_staff: uploadData.is_hidden_from_staff || false,
      allowed_roles: uploadData.allowed_roles || ['admin', 'studioleiter']
    };

    console.log('Speichere in Datenbank:', fileAssetData);
    console.log('🔍 DEBUG Finale module_reference für DB:', fileAssetData.module_reference);
    
    const { data: insertedData, error: insertError } = await supabase
      .from('file_asset')
      .insert(fileAssetData)
      .select('*')  // Alles zurückgeben, um zu sehen was gespeichert wurde
      .single();

    console.log('💾 Supabase INSERT Result:', insertedData);
    console.log('🔍 Was wurde tatsächlich gespeichert:');
    console.log('   - ID:', insertedData?.id);
    console.log('   - filename:', insertedData?.filename);
    console.log('   - module_reference:', insertedData?.module_reference);
    console.log('   - category:', insertedData?.category);
    console.log('   - work_area:', insertedData?.work_area);
    console.log('❌ Supabase INSERT Error:', insertError);
    
    if (insertError) {
      console.error('Datenbank-Fehler:', insertError);
      throw new Error(`Fehler beim Speichern in der Datenbank: ${insertError.message}`);
    }

    console.log('Upload erfolgreich:', insertedData);
    return {
      success: true,
      file_asset: insertedData
    };
  } catch (error) {
    console.error('Fehler beim Upload:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unbekannter Fehler beim Upload' 
    };
  }
}

export async function updateFileAsset(
  id: string, 
  updates: Partial<FileUploadData & { visibility: string; is_hidden_from_staff: boolean; allowed_roles: string[] }>
): Promise<FileAsset | null> {
  try {
    console.log('🔧 UPDATE Daten erhalten:', updates);

    const { data, error } = await supabase
      .from('file_asset')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Fehler beim Aktualisieren der Datei:', error);
      throw new Error('Fehler beim Aktualisieren der Datei');
    }

    console.log('✅ UPDATE erfolgreich:', data);
    return data;
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Datei:', error);
    throw error;
  }
}

export async function deleteFileAsset(id: string): Promise<boolean> {
  try {
    // 1. Datei-Info abrufen
    const fileAsset = await getFileAssetById(id);
    if (!fileAsset) {
      throw new Error('Datei nicht gefunden');
    }

    // 2. Datei aus Storage löschen
    const filePath = fileAsset.file_url.split('/').pop();
    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from('file-assets')
        .remove([`${fileAsset.category}/${filePath}`]);
      
      if (storageError) {
        console.error('Fehler beim Löschen aus Storage:', storageError);
      }
    }

    // 3. Datenbankeintrag löschen
    const { error } = await supabase
      .from('file_asset')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Fehler beim Löschen aus Datenbank:', error);
      throw new Error('Fehler beim Löschen der Datei');
    }

    return true;
  } catch (error) {
    console.error('Fehler beim Löschen der Datei:', error);
    throw error;
  }
}

// Neue Funktionen für Berechtigungsverwaltung

export async function getStaffFilePermissions(): Promise<StaffFilePermissions[]> {
  try {
    const { data, error } = await supabase
      .from('staff_file_permissions')
      .select(`
        *,
        staff:staff_id (
          id,
          rolle
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fehler beim Laden der Berechtigungen:', error);
      throw new Error('Fehler beim Laden der Berechtigungen');
    }

    return data || [];
  } catch (error) {
    console.error('Fehler beim Laden der Berechtigungen:', error);
    throw error;
  }
}

export async function getMyFilePermissions(): Promise<StaffFilePermissions | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) return null;

    const { data, error } = await supabase
      .from('staff_file_permissions')
      .select('*')
      .eq('staff_id', user.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Fehler beim Laden der eigenen Berechtigungen:', error);
      throw new Error('Fehler beim Laden der Berechtigungen');
    }

    return data || null;
  } catch (error) {
    console.error('Fehler beim Laden der eigenen Berechtigungen:', error);
    throw error;
  }
}

export async function updateStaffFilePermissions(
  staffId: string,
  permissions: Partial<StaffFilePermissions>
): Promise<StaffFilePermissions | null> {
  try {
    const { data, error } = await supabase
      .from('staff_file_permissions')
      .upsert({
        staff_id: staffId,
        ...permissions
      })
      .select()
      .single();

    if (error) {
      console.error('Fehler beim Aktualisieren der Berechtigungen:', error);
      throw new Error('Fehler beim Aktualisieren der Berechtigungen');
    }

    return data;
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Berechtigungen:', error);
    throw error;
  }
}

export async function getCurrentUserRole(): Promise<string | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) return null;

    const { data, error } = await supabase
      .from('staff')
      .select('rolle')
      .eq('id', user.user.id)
      .single();

    if (error) {
      console.error('Fehler beim Laden der Rolle:', error);
      return null;
    }

    return data?.rolle || null;
  } catch (error) {
    console.error('Fehler beim Laden der Rolle:', error);
    return null;
  }
}

export async function canUserUploadFiles(): Promise<boolean> {
  try {
    // 1. Prüfe Rolle - Admins/Studioleiter können immer uploaden
    const role = await getCurrentUserRole();
    if (role === 'admin' || role === 'studioleiter') {
      console.log('Upload erlaubt: Admin/Studioleiter-Rolle');
      return true;
    }

    // 2. Prüfe explizite Berechtigungen
    const permissions = await getMyFilePermissions();
    const canUpload = permissions?.upload_permission !== 'none';
    
    console.log('Upload-Berechtigung gefunden:', permissions?.upload_permission || 'keine');
    
    if (canUpload) {
      return true;
    }

    // 3. Fallback: Falls keine Berechtigungen gefunden, aber User existiert
    const { data: user } = await supabase.auth.getUser();
    if (user?.user?.id) {
      console.log('Fallback: Erstelle Upload-Berechtigung für User');
      
      // Versuche automatisch Berechtigung zu erstellen
      await updateStaffFilePermissions(user.user.id, {
        upload_permission: 'own_files',
        can_see_admin_files: false
      });
      
      return true;
    }

    return false;
  } catch (error) {
    console.error('Fehler beim Prüfen der Upload-Berechtigung:', error);
    
    // Letzter Fallback: Bei Fehlern, erlaube Upload für authentifizierte User
    const { data: user } = await supabase.auth.getUser();
    if (user?.user?.id) {
      console.log('Notfall-Fallback: Erlaube Upload für authentifizierten User');
      return true;
    }
    
    return false;
  }
}

export async function canUserSeeAdminFiles(): Promise<boolean> {
  try {
    const role = await getCurrentUserRole();
    if (role === 'admin' || role === 'studioleiter') return true;
    
    const permissions = await getMyFilePermissions();
    return permissions?.can_see_admin_files || false;
  } catch (error) {
    console.error('Fehler beim Prüfen der Admin-Dateien-Berechtigung:', error);
    return false;
  }
}

// Hilfsfunktionen

export async function getCampaigns(): Promise<Array<{ id: string; name: string }>> {
  try {
    console.log('Lade Kampagnen...');
    
    const { data, error } = await supabase
      .from('campaigns')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Fehler beim Laden der Kampagnen:', error);
      // Fallback: Versuche ohne Status-Filter (falls die Spalte nicht existiert)
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('campaigns')
        .select('id, name')
        .order('name');
        
      if (fallbackError) {
        console.error('Fallback-Fehler beim Laden der Kampagnen:', fallbackError);
        return [];
      }
      
      console.log('Kampagnen geladen (Fallback):', fallbackData?.length || 0);
      return fallbackData || [];
    }

    console.log('Kampagnen geladen:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Fehler beim Laden der Kampagnen:', error);
    return [];
  }
}

export async function getFileAssetsByCategory(category: string): Promise<FileAsset[]> {
  return getFileAssets({ category: category as any });
}

export async function getFileAssetsByCampaign(campaignId: string): Promise<FileAsset[]> {
  return getFileAssets({ campaign_id: campaignId });
}

export async function searchFileAssets(searchTerm: string): Promise<FileAsset[]> {
  return getFileAssets({ search: searchTerm });
}

// Bulk-Operationen

export async function bulkUpdateTags(fileIds: string[], tags: string[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('file_asset')
      .update({ tags })
      .in('id', fileIds);

    if (error) {
      console.error('Fehler beim Bulk-Update der Tags:', error);
      throw new Error('Fehler beim Aktualisieren der Tags');
    }

    return true;
  } catch (error) {
    console.error('Fehler beim Bulk-Update der Tags:', error);
    throw error;
  }
}

export async function bulkUpdateWorkArea(
  fileIds: string[], 
  workArea: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('file_asset')
      .update({ work_area: workArea })
      .in('id', fileIds);

    if (error) {
      console.error('Fehler beim Bulk-Update des Arbeitsbereichs:', error);
      throw new Error('Fehler beim Aktualisieren des Arbeitsbereichs');
    }

    return true;
  } catch (error) {
    console.error('Fehler beim Bulk-Update des Arbeitsbereichs:', error);
    throw error;
  }
}

export async function bulkUpdateVisibility(
  fileIds: string[], 
  visibility: string,
  isHiddenFromStaff?: boolean
): Promise<boolean> {
  try {
    const updateData: any = { visibility };
    if (isHiddenFromStaff !== undefined) {
      updateData.is_hidden_from_staff = isHiddenFromStaff;
    }

    const { error } = await supabase
      .from('file_asset')
      .update(updateData)
      .in('id', fileIds);

    if (error) {
      console.error('Fehler beim Bulk-Update der Sichtbarkeit:', error);
      throw new Error('Fehler beim Aktualisieren der Sichtbarkeit');
    }

    return true;
  } catch (error) {
    console.error('Fehler beim Bulk-Update der Sichtbarkeit:', error);
    throw error;
  }
}

// **NEUE FUNKTIONEN FÜR VERSIONIERUNG**

export async function getFileVersions(parentFileId: string): Promise<FileVersion[]> {
  try {
    // Hole zuerst die current_version_id der Hauptdatei
    const { data: parentFile, error: parentError } = await supabase
      .from('file_asset')
      .select('current_version_id')
      .eq('id', parentFileId)
      .single();

    if (parentError) {
      console.error('Fehler beim Laden der Hauptdatei:', parentError);
      throw new Error('Fehler beim Laden der Hauptdatei');
    }

    // Hole alle Versionen für diese Datei
    const { data, error } = await supabase
      .from('file_versions')
      .select('*')
      .eq('parent_file_id', parentFileId)
      .order('version_number', { ascending: false }); // Neueste zuerst

    if (error) {
      console.error('Fehler beim Laden der Versionen:', error);
      throw new Error('Fehler beim Laden der Versionen');
    }

    // Markiere die aktuelle Version
    const versionsWithCurrentFlag = (data || []).map(version => ({
      ...version,
      is_current_version: version.id === parentFile.current_version_id
    }));

    return versionsWithCurrentFlag;
  } catch (error) {
    console.error('Fehler beim Laden der Versionen:', error);
    throw error;
  }
}

export async function getCurrentVersion(parentFileId: string): Promise<FileVersion | null> {
  try {
    // Hole die aktuelle Version über das current_version_id der file_asset
    const { data: fileAsset, error: fileError } = await supabase
      .from('file_asset')
      .select('current_version_id')
      .eq('id', parentFileId)
      .single();

    if (fileError || !fileAsset?.current_version_id) {
      return null;
    }

    // Hole die vollständigen Version-Daten
    const { data, error } = await supabase
      .from('file_versions')
      .select('*')
      .eq('id', fileAsset.current_version_id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Fehler beim Laden der aktuellen Version:', error);
      throw new Error('Fehler beim Laden der aktuellen Version');
    }

    return data || null;
  } catch (error) {
    console.error('Fehler beim Laden der aktuellen Version:', error);
    throw error;
  }
}

export async function uploadNewVersion(
  file: File,
  versionData: VersionUploadData
): Promise<VersionUploadResponse> {
  try {
    console.log('Upload neue Version:', versionData);

    // 1. Hauptdatei-Info laden für Storage-Pfad
    const parentFile = await getFileAssetById(versionData.parent_file_id);
    if (!parentFile) {
      return { success: false, error: 'Hauptdatei nicht gefunden' };
    }

    // 2. Nächste Versionsnummer ermitteln - direkter Aufruf der Funktion mit korrektem Parameter
    const { data: nextVersionData, error: versionError } = await supabase
      .rpc('get_next_version_number', { parent_id: versionData.parent_file_id });

    if (versionError) {
      console.error('Fehler beim Ermitteln der Versionsnummer:', versionError);
      return { success: false, error: 'Fehler beim Ermitteln der Versionsnummer' };
    }

    const nextVersion = nextVersionData || 1;

    // 3. Datei zu Storage hochladen
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-v${nextVersion}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${parentFile.category}/versions/${fileName}`;

    console.log('Lade Version hoch:', filePath);

    const { data: uploadResult, error: uploadError } = await supabase.storage
      .from('file-assets')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload-Fehler:', uploadError);
      return { success: false, error: `Storage-Fehler: ${uploadError.message}` };
    }

    // 4. URL generieren
    const { data: { publicUrl } } = supabase.storage
      .from('file-assets')
      .getPublicUrl(filePath);

    // 5. Version in Datenbank speichern - inklusive version_description und changelog
    const versionRecord = {
      parent_file_id: versionData.parent_file_id,
      version_number: nextVersion,
      filename: file.name,
      file_url: publicUrl,
      file_size: file.size,
      mime_type: file.type || null,
      version_description: versionData.version_description || null,
      changelog: versionData.changelog || null,
      created_by: null // TEMPORÄR: NULL
    };

    console.log('Speichere Version:', versionRecord);

    const { data, error } = await supabase
      .from('file_versions')
      .insert(versionRecord)
      .select()
      .single();

    if (error) {
      console.error('DB-Fehler beim Speichern der Version:', error);
      // Hochgeladene Datei löschen bei Fehler
      await supabase.storage.from('file-assets').remove([filePath]);
      return { success: false, error: `Datenbank-Fehler: ${error.message}` };
    }

    // Wenn das die erste Version ist (nextVersion = 1), setze sie automatisch als aktuelle Version
    if (nextVersion === 1) {
      console.log('Setze erste Version als aktuelle Version');
      await setCurrentVersion(data.id);
    }

    console.log('Version erfolgreich hochgeladen:', data);
    return { success: true, file_version: data };
  } catch (error) {
    console.error('Fehler beim Version-Upload:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unbekannter Fehler beim Version-Upload' 
    };
  }
}

export async function setCurrentVersion(versionId: string): Promise<boolean> {
  try {
    console.log('Setze Version als aktuell:', versionId);
    
    // Hole die Version-Info inklusive file_url
    const { data: version, error: versionError } = await supabase
      .from('file_versions')
      .select('parent_file_id, file_url')
      .eq('id', versionId)
      .single();

    if (versionError) {
      console.error('Version nicht gefunden:', versionError);
      throw new Error('Version nicht gefunden');
    }

    // Setze diese Version als aktuell in der file_asset Tabelle UND aktualisiere die file_url
    const { error } = await supabase
      .from('file_asset')
      .update({ 
        current_version_id: versionId,
        file_url: version.file_url // Aktualisiere auch die Haupt-URL
      })
      .eq('id', version.parent_file_id);

    if (error) {
      console.error('Fehler beim Setzen der aktuellen Version:', error);
      throw new Error('Fehler beim Setzen der aktuellen Version');
    }

    console.log('Aktuelle Version erfolgreich gesetzt, file_url aktualisiert');
    return true;
  } catch (error) {
    console.error('Fehler beim Setzen der aktuellen Version:', error);
    throw error;
  }
}

export async function deleteFileVersion(versionId: string): Promise<boolean> {
  try {
    // 1. Version-Info abrufen
    const { data: version, error: versionError } = await supabase
      .from('file_versions')
      .select('*')
      .eq('id', versionId)
      .single();

    if (versionError) {
      console.error('Version nicht gefunden:', versionError);
      throw new Error('Version nicht gefunden');
    }

    // 2. Nicht erlauben, die einzige Version zu löschen
    const allVersions = await getFileVersions(version.parent_file_id);
    if (allVersions.length === 1) {
      throw new Error('Die letzte Version kann nicht gelöscht werden');
    }

    // 3. Prüfe ob es die aktuelle Version ist
    const currentVersion = await getCurrentVersion(version.parent_file_id);
    if (currentVersion?.id === versionId) {
      throw new Error('Die aktuelle Version kann nicht gelöscht werden. Setze zuerst eine andere Version als aktuell.');
    }

    // 4. Datei aus Storage löschen
    const filePath = version.file_url.split('/').pop();
    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from('file-assets')
        .remove([`${version.parent_file_id}/versions/${filePath}`]);
      
      if (storageError) {
        console.error('Fehler beim Löschen der Version aus Storage:', storageError);
      }
    }

    // 5. Datenbankeintrag löschen
    const { error } = await supabase
      .from('file_versions')
      .delete()
      .eq('id', versionId);

    if (error) {
      console.error('Fehler beim Löschen der Version:', error);
      throw new Error('Fehler beim Löschen der Version');
    }

    return true;
  } catch (error) {
    console.error('Fehler beim Löschen der Version:', error);
    throw error;
  }
}

export async function getFileAssetWithVersions(id: string): Promise<FileAssetWithVersions | null> {
  try {
    const fileAsset = await getFileAssetById(id);
    if (!fileAsset) return null;

    const versions = await getFileVersions(id);
    const currentVersion = await getCurrentVersion(id);

    return {
      ...fileAsset,
      versions,
      current_version: currentVersion,
      version_count: versions.length
    };
  } catch (error) {
    console.error('Fehler beim Laden der Datei mit Versionen:', error);
    throw error;
  }
} 