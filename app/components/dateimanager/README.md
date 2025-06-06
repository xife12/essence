# Dateimanager-Modul

## Übersicht

Das Dateimanager-Modul implementiert eine zentrale Dateiablage und Medienverwaltung für das MemberCore-System. Es bietet strukturierte Zuordnung nach Kategorien, Kampagnen, Arbeitsbereichen und Dateitypen.

## Features

### ✅ Implementiert

- **Drag & Drop Upload**: Intuitive Datei-Upload-Oberfläche mit Drag & Drop-Funktionalität
- **Kategorisierung**: Automatische und manuelle Kategorisierung von Dateien
- **Virtuelle Ordnerstruktur**: Intelligente Organisation basierend auf Kategorie, Arbeitsbereich und Kampagne
- **Filter & Suche**: Erweiterte Filter- und Suchfunktionen
- **Grid- und Listen-Ansicht**: Flexible Darstellungsoptionen
- **Tags-System**: Freie Schlagworte für bessere Auffindbarkeit
- **Berechtigungen**: Rollenbasierte Zugriffskontrolle
- **Kampagnen-Integration**: Verknüpfung mit Kampagnen-Modul

### 🔧 Komponenten

#### FileUpload.tsx
- Drag & Drop-Upload
- Kategorisierung und Metadaten-Eingabe
- Kampagnenzuordnung
- Tag-Management
- Validierung und Fehlerbehandlung

#### FileGrid.tsx
- Grid- und Listen-Ansicht
- Filter und Suche
- Datei-Aktionen (Download, Bearbeiten, Löschen)
- Virtuelle Ordnerstruktur-Anzeige
- Bild-Vorschau

#### API (file-asset.ts)
- CRUD-Operationen für Dateien
- Supabase Storage Integration
- Filter- und Suchfunktionen
- Bulk-Operationen

## Datenstruktur

### Tabelle: `file_asset`

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | UUID | Primärschlüssel |
| filename | TEXT | Ursprünglicher Dateiname |
| file_url | TEXT | Speicherpfad (Supabase Storage) |
| category | ENUM | Hauptkategorie (image, document, print, etc.) |
| type | TEXT | Unterkategorie (flyer, logo, testimonial, etc.) |
| work_area | ENUM | Arbeitsbereich (Trainer, Rezeption, etc.) |
| campaign_id | UUID | Verknüpfung zu Kampagne (optional) |
| module_reference | ENUM | Modulkontext (campaign, system, etc.) |
| is_print_ready | BOOLEAN | Druckfertige Datei |
| tags | TEXT[] | Freie Schlagworte |
| description | TEXT | Beschreibung |
| created_by | UUID | Uploader |
| created_at | TIMESTAMP | Upload-Datum |
| updated_at | TIMESTAMP | Letzte Änderung |

### ENUMs

```typescript
// Kategorien
type FileCategory = 'image' | 'graphic' | 'document' | 'print' | 'template' | 'web' | 'video';

// Arbeitsbereiche
type WorkAreaType = 'Trainer' | 'Rezeption' | 'Service' | 'Verwaltung' | 'Studioleitung';

// Modulbezug
type ModuleReferenceType = 'campaign' | 'landingpage' | 'system' | 'task' | 'contentplaner';
```

## Berechtigungen

### Row Level Security (RLS)
- **SELECT**: Alle authentifizierten Benutzer können Dateien sehen
- **INSERT**: Alle authentifizierten Benutzer können Dateien hochladen
- **UPDATE**: Nur Ersteller und Admins/Studioleiter können bearbeiten
- **DELETE**: Nur Ersteller und Admins können löschen

### Rollenbasierte Zugriffe
- **Mitarbeiter**: Dateien ansehen, eigene hochladen und bearbeiten
- **Studioleiter**: Vollzugriff auf alle Dateien
- **Admin**: Vollzugriff auf alle Dateien und Systemeinstellungen

## Virtuelle Ordnerstruktur

Das System generiert automatisch eine intelligente Ordnerstruktur:

```
📁 Kampagnen
  └── 📁 [Kampagnenname]
      └── 📁 [Kategorie]
          └── 📄 Dateien

📁 System
  └── 📁 [Kategorie]
      └── 📁 [Arbeitsbereich]
          └── 📄 Dateien

📁 Module
  └── 📁 [Modulbezug]
      └── 📁 [Kategorie]
          └── 📄 Dateien
```

## Installation & Setup

### 1. Datenbank-Migration
```sql
-- Migration ausführen
psql -h [host] -U [user] -d [database] -f migrations/16_dateimanager_file_asset.sql
```

### 2. Supabase Storage Bucket erstellen
```sql
-- Bucket für file-assets erstellen
INSERT INTO storage.buckets (id, name, public) VALUES ('file-assets', 'file-assets', true);
```

### 3. Dependencies installieren
```bash
npm install react-dropzone
```

## Verwendung

### Basic Upload
```tsx
import FileUpload from '../components/dateimanager/FileUpload';

<FileUpload
  onUploadComplete={(file) => console.log('Upload complete:', file)}
  defaultCategory="document"
  defaultModuleReference="system"
/>
```

### Grid mit Filtern
```tsx
import FileGrid from '../components/dateimanager/FileGrid';

<FileGrid
  defaultFilters={{ category: 'image' }}
  onFileSelect={(file) => console.log('Selected:', file)}
  onFileEdit={(file) => console.log('Edit:', file)}
/>
```

### API-Nutzung
```typescript
import { getFileAssets, uploadFile } from '../lib/api/file-asset';

// Dateien laden
const files = await getFileAssets({ category: 'image' });

// Datei hochladen
const result = await uploadFile(file, {
  category: 'document',
  module_reference: 'system',
  is_print_ready: false,
  tags: ['important', 'contract'],
  description: 'Vertragsdokument'
});
```

## Erweiterungen

### Geplante Features
- [ ] Dateiversionen-Verwaltung
- [ ] Automatische Bildoptimierung
- [ ] OCR für PDF-Dokumente
- [ ] Automatische Tag-Vorschläge
- [ ] Bulk-Upload mit Excel-Import
- [ ] Externes Storage (AWS S3, Google Drive)
- [ ] Kollaborative Bearbeitung

### Integration mit anderen Modulen
- **Kampagnen**: Automatische Dateizuordnung bei Kampagnenerstellung
- **Landingpages**: Direkte Bildauswahl aus Dateimanager
- **Aufgaben**: Anhänge und Briefings
- **Canva**: Integrierte Design-Workflows

## Troubleshooting

### Upload-Probleme
- Überprüfe Supabase Storage-Konfiguration
- Prüfe Dateigröße-Limits
- Validiere Dateityp-Restrictions

### Performance
- Nutze Pagination bei großen Dateimengen
- Implementiere Lazy Loading für Bilder
- Optimiere Supabase-Queries mit Indizes

### Berechtigungen
- Prüfe RLS-Policies in Supabase
- Validiere User-Authentifizierung
- Überprüfe Rollenzuweisungen 