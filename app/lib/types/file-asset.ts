// TypeScript-Typen für das Dateimanager-Modul

export type FileCategory = 
  | 'image'
  | 'graphic'
  | 'document'
  | 'print'
  | 'template'
  | 'web'
  | 'video';

export type WorkAreaType = 
  | 'Trainer'
  | 'Rezeption'
  | 'Service'
  | 'Verwaltung'
  | 'Studioleitung';

export type ModuleReferenceType = 
  | 'campaign'
  | 'landingpage'
  | 'system'
  | 'task'
  | 'contentplaner';

// Neue Typen für erweiterte Berechtigungen
export type FileVisibility = 
  | 'staff_only'  // Nur für Mitarbeiter mit Upload-Berechtigung
  | 'admin_only'; // Nur für Admins/Studioleiter

export type UploadPermission = 
  | 'none'        // Keine Upload-Berechtigung
  | 'own_files'   // Kann nur eigene Dateien verwalten
  | 'all_files';  // Kann alle Dateien verwalten (Admin/Studioleiter)

export interface FileAsset {
  id: string;
  filename: string;
  file_url: string;
  category: FileCategory;
  type?: string;
  work_area?: WorkAreaType;
  campaign_id?: string;
  module_reference: ModuleReferenceType;
  is_print_ready: boolean;
  tags: string[];
  description?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Neue Felder
  visibility: FileVisibility;
  is_hidden_from_staff: boolean;
  allowed_roles: string[];
}

export interface StaffFilePermissions {
  id: string;
  staff_id: string;
  upload_permission: UploadPermission;
  can_see_admin_files: boolean;
  created_at: string;
  updated_at: string;
}

export interface FileAssetWithCampaign extends FileAsset {
  campaign?: {
    id: string;
    name: string;
  };
}

export interface FileAssetWithCreator extends FileAsset {
  creator?: {
    id: string;
    email: string;
  };
}

export interface FileUploadData {
  filename: string;
  category: FileCategory;
  type?: string;
  work_area?: WorkAreaType;
  campaign_id?: string;
  module_reference: ModuleReferenceType;
  is_print_ready: boolean;
  tags: string[];
  description?: string;
  // Neue Felder
  visibility?: FileVisibility;
  is_hidden_from_staff?: boolean;
  allowed_roles?: string[];
}

export interface FileUploadResponse {
  success: boolean;
  file_asset?: FileAsset;
  error?: string;
}

export interface FileFilterOptions {
  category?: FileCategory;
  work_area?: WorkAreaType;
  campaign_id?: string;
  module_reference?: ModuleReferenceType;
  tags?: string[];
  search?: string;
  is_print_ready?: boolean;
  // Neue Filter
  visibility?: FileVisibility;
  show_hidden?: boolean;
}

// Konstanten für UI
export const FILE_CATEGORIES: { value: FileCategory; label: string }[] = [
  { value: 'image', label: 'Bild' },
  { value: 'graphic', label: 'Grafik' },
  { value: 'document', label: 'Dokument' },
  { value: 'print', label: 'Druck' },
  { value: 'template', label: 'Vorlage' },
  { value: 'web', label: 'Web' },
  { value: 'video', label: 'Video' }
];

export const WORK_AREAS: { value: WorkAreaType; label: string }[] = [
  { value: 'Trainer', label: 'Trainer' },
  { value: 'Rezeption', label: 'Rezeption' },
  { value: 'Service', label: 'Service' },
  { value: 'Verwaltung', label: 'Verwaltung' },
  { value: 'Studioleitung', label: 'Studioleitung' }
];

export const MODULE_REFERENCES: { value: ModuleReferenceType; label: string }[] = [
  { value: 'campaign', label: 'Kampagne' },
  { value: 'landingpage', label: 'Landingpage' },
  { value: 'system', label: 'System' },
  { value: 'task', label: 'Aufgabe' },
  { value: 'contentplaner', label: 'Contentplaner' }
];

// Neue Konstanten für Berechtigungen
export const FILE_VISIBILITY: { value: FileVisibility; label: string; description: string }[] = [
  { value: 'staff_only', label: 'Team', description: 'Alle Mitarbeiter können zugreifen' },
  { value: 'admin_only', label: 'Admin/Studioleiter', description: 'Nur für Admins und Studioleiter' }
];

export const UPLOAD_PERMISSIONS: { value: UploadPermission; label: string; description: string }[] = [
  { value: 'none', label: 'Keine Berechtigung', description: 'Kann keine Dateien hochladen' },
  { value: 'own_files', label: 'Eigene Dateien', description: 'Kann nur eigene Dateien verwalten' },
  { value: 'all_files', label: 'Alle Dateien', description: 'Kann alle Dateien verwalten' }
];

// Hilfsfunktionen für Dateityp-Mapping
export const TYPE_OPTIONS_BY_CATEGORY: Record<FileCategory, string[]> = {
  image: ['testimonial', 'hero-banner', 'logo', 'portrait', 'gallery'],
  graphic: ['infografik', 'icon', 'illustration', 'chart'],
  document: ['checkliste', 'anleitung', 'formular', 'vertrag'],
  print: ['flyer', 'poster', 'broschure', 'visitenkarte'],
  template: ['email-vorlage', 'social-media', 'praesentation'],
  web: ['banner', 'button', 'header', 'footer'],
  video: ['tutorial', 'werbung', 'testimonial', 'social-media']
};

export const getFileIcon = (category: FileCategory): string => {
  const iconMap: Record<FileCategory, string> = {
    image: '🖼️',
    graphic: '🎨',
    document: '📄',
    print: '🖨️',
    template: '📝',
    web: '🌐',
    video: '🎬'
  };
  return iconMap[category] || '📁';
};

export const getVisibilityIcon = (visibility: FileVisibility): string => {
  const iconMap: Record<FileVisibility, string> = {
    staff_only: '👥',
    admin_only: '🔒'
  };
  return iconMap[visibility];
};

export const getVisibilityColor = (visibility: FileVisibility): string => {
  const colorMap: Record<FileVisibility, string> = {
    staff_only: 'bg-blue-100 text-blue-800',
    admin_only: 'bg-red-100 text-red-800'
  };
  return colorMap[visibility];
};

export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
};

export const isVideoFile = (filename: string): boolean => {
  const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'];
  return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
};

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

// **NEUE INTERFACES FÜR VERSIONIERUNG**
export interface FileVersion {
  id: string;
  parent_file_id: string;
  version_number: number;
  filename: string;
  file_url: string;
  file_size?: number;
  version_description?: string;
  changelog?: string;
  is_current_version: boolean;
  created_by?: string;
  created_at: string;
}

export interface FileAssetWithVersions extends FileAsset {
  versions?: FileVersion[];
  current_version?: FileVersion;
  version_count?: number;
}

export interface VersionUploadData {
  parent_file_id: string;
  version_description?: string;
  changelog?: string;
}

export interface VersionUploadResponse {
  success: boolean;
  file_version?: FileVersion;
  error?: string;
} 