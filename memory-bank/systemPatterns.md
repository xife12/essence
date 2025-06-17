# System-Architektur und Design Patterns

## Architektur-Übersicht
MemberCore folgt einer modernen, modularen Architektur mit klarer Trennung der Verantwortlichkeiten:

```
Frontend (Next.js)     Backend (Supabase)     External APIs
├── App Router         ├── PostgreSQL         ├── Facebook Ads
├── Protected Routes   ├── Auth               ├── Canva
├── UI Components      ├── Storage            └── Social Media
└── API Clients        └── RLS Policies
```

## Kern-Design-Patterns

### 1. Module-First Architecture
Jedes Feature ist als eigenständiges Modul implementiert:
- **Selbstdokumentierend**: Eigene MDC-Datei pro Modul
- **API-gekapselt**: Eindeutige Schnittstellen
- **UI-konsistent**: Geteilte Komponenten-Library

### 2. Role-Based Security (RLS)
Supabase Row Level Security auf allen Datenebenen:
```sql
-- Beispiel: Mitarbeiter sehen nur eigene Stunden
CREATE POLICY staff_hours_policy ON staff_hours
FOR ALL USING (staff_id = auth.uid() OR is_admin());
```

### 3. Repository Pattern (API Layer)
Konsistente API-Abstraktionen in `lib/api/`:
```typescript
export class StaffAPI {
  static async getAll(): Promise<Staff[]>
  static async getById(id: string): Promise<Staff>
  static async create(data: CreateStaffData): Promise<Staff>
  static async update(id: string, data: UpdateStaffData): Promise<Staff>
}
```

### 4. Component Composition
Modulare UI-Komponenten mit Props-Drilling-Vermeidung:
- **Atomic Design**: Button → Card → Modal → Page
- **Context Providers**: Auth, Supabase, Theme
- **Custom Hooks**: useAuth, useSupabase, useLocalStorage

## Datenarchitektur

### Haupt-Entitäten
```
staff (Benutzer) → staff_hours, staff_file_permissions
leads → consultations → members
campaigns → landingpages, ads, content_posts
forms → form_fields, form_submissions
contracts_v2 → contract_modules, pricing_tiers
```

### Referentielle Integrität
- **FK Constraints**: Automatische Konsistenz
- **ON DELETE CASCADE**: Saubere Datenbereinigung
- **ENUM Types**: Typsichere Status-Werte

## Sicherheits-Patterns

### 1. Zero-Trust Authentication
```typescript
// Jede Route prüft Authentication
export default function ProtectedPage() {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  if (!user) redirect('/login')
  // ...
}
```

### 2. Permission Matrix
Granulare Berechtigungen auf Feature-Ebene:
- **File Permissions**: none/own_files/all_files + admin_files
- **Module Access**: Rollen-basierte Sichtbarkeit
- **Data Access**: RLS-Policies pro Tabelle

### 3. Input Validation
Mehrschichtige Validierung:
- **Client-Side**: React Hook Form + Zod
- **Server-Side**: Supabase Validation + Policies
- **Database**: Constraints + Triggers

## Performance Patterns

### 1. Lazy Loading
```typescript
// Komponenten-Level
const LazyComponent = lazy(() => import('./HeavyComponent'))

// Route-Level  
const page = dynamic(() => import('./page'), { ssr: false })
```

### 2. Optimistic Updates
```typescript
// UI-Updates vor Server-Bestätigung
const { mutate } = useSWR(key, fetcher)
await mutate(optimisticData, { revalidate: false })
const result = await updateServer(data)
await mutate(result)
```

### 3. Caching Strategy
- **SWR**: Automatic background revalidation
- **Supabase Realtime**: Live Updates für kritische Daten
- **Local Storage**: User-Preferences und Session-Daten

## Integration Patterns

### 1. API-First Design
Alle Module exposieren klare APIs:
```typescript
interface ModuleAPI {
  list(filters?: Filters): Promise<Entity[]>
  get(id: string): Promise<Entity>
  create(data: CreateData): Promise<Entity>
  update(id: string, data: UpdateData): Promise<Entity>
  delete(id: string): Promise<void>
}
```

### 2. Event-Driven Architecture
```typescript
// Modul-übergreifende Events
emitEvent('lead.converted', { leadId, memberId })
subscribeEvent('lead.converted', handleMemberCreation)
```

### 3. Cross-Module Dependencies
Definierte Abhängigkeiten in MDC-Dateien:
```yaml
dependencies:
  - Dateimanager  # Für Bilder
  - CI-Styling    # Für Design-Konsistenz
  - Kampagnen     # Für Landing-Integration
```

## Error Handling Patterns

### 1. Graceful Degradation
```typescript
try {
  const data = await fetchCriticalData()
  return <FullFeature data={data} />
} catch (error) {
  return <FallbackComponent error={error} />
}
```

### 2. User-Friendly Errors
- **Toast Notifications**: Für Aktions-Feedback
- **Error Boundaries**: Für Component-Crashes
- **Validation Messages**: Für Eingabe-Fehler

## Deployment & DevOps

### 1. Environment Management
```
.env.local          # Development
.env.production     # Production
.env.staging        # Staging
```

### 2. Database Migrations
```sql
-- Versionierte SQL-Dateien in migrations/
-- Jede Änderung trackbar und rollback-fähig
```

### 3. CI/CD Pipeline
- **TypeScript Compilation**: Zero errors policy
- **Linting**: ESLint + Prettier enforcement
- **Testing**: Critical paths covered 