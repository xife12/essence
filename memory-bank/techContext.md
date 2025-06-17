# Technischer Kontext - Tech Stack & Development Setup

## Core Technology Stack

### Frontend Framework
- **Next.js 13.5.11** - App Router für moderne React-Architektur
- **React 18** - Mit Concurrent Features und Server Components
- **TypeScript 5.x** - Vollständige Type-Safety im gesamten Stack

### Backend & Database
- **Supabase** - PostgreSQL Database mit Auth und Realtime
- **PostgreSQL 15** - Robuste relationale Datenbank
- **Row Level Security (RLS)** - Granulare Zugriffskontrollen
- **Supabase Auth** - E-Mail/Passwort + 2FA Support

### Styling & UI
- **Tailwind CSS 3.x** - Utility-first Styling Framework
- **Lucide React** - Konsistente Icon-Library
- **Custom Components** - Eigene UI-Library in `components/ui/`

### Development Tools
- **ESLint** - Code-Qualität und Konsistenz
- **Prettier** - Automatische Code-Formatierung
- **TypeScript Compiler** - Zero-Error-Policy

## Environment Setup

### Development Environment
```bash
Node.js: 18.x LTS
Package Manager: npm
Port: 3000 (localhost)
Hot Reload: Aktiviert
TypeScript: Strict Mode
```

### Environment Variables
```env
# Database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Authentication  
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# External APIs
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
CANVA_API_KEY=
```

### Development Commands
```bash
npm run dev     # Development Server
npm run build   # Production Build
npm run start   # Production Server
npm run lint    # ESLint Check
npm run type    # TypeScript Check
```

## Project Structure

### Directory Organization
```
MemberCore/
├── app/                      # Next.js App Router
│   ├── (protected)/         # Authenticated Routes
│   ├── api/                 # API Routes
│   ├── components/          # UI Components
│   └── lib/                 # Utilities & APIs
├── memory-bank/             # AI Context Management
├── .cursor/                 # Cursor Rules & Tasks
├── migrations/              # Database Migrations
└── public/                  # Static Assets
```

### Key Directories Explained
- **`app/(protected)/`**: Alle authentifizierten Seiten (Dashboard, Module)
- **`app/components/`**: Wiederverwendbare UI-Komponenten
- **`app/lib/api/`**: API-Layer für Supabase-Interaktionen
- **`.cursor/rules/`**: Dokumentation und Module-Spezifikationen

## Database Architecture

### Connection Management
```typescript
// Supabase Client Singleton
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Key Tables & Relationships
```sql
-- Benutzer & Rollen
staff → staff_hours, staff_file_permissions

-- Business Logic
leads → consultations → members
campaigns → landingpages, ads, content_posts
forms → form_fields, form_submissions

-- Configuration
contracts_v2 → contract_modules, pricing_tiers
ci_templates → ci_logos, ci_settings
```

### Security Implementation
```sql
-- Beispiel RLS Policy
CREATE POLICY "Staff can only see own hours" ON staff_hours
FOR ALL USING (staff_id = auth.uid() OR is_admin_user(auth.uid()));
```

## API Layer Architecture

### Consistent API Pattern
```typescript
// Standardisierte API-Klassen
export class EntityAPI {
  static async getAll(filters?: Filters): Promise<Entity[]>
  static async getById(id: string): Promise<Entity | null>
  static async create(data: CreateEntityData): Promise<Entity>
  static async update(id: string, data: UpdateEntityData): Promise<Entity>
  static async delete(id: string): Promise<void>
}
```

### Error Handling
```typescript
// Konsistente Error-Behandlung
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message)
  }
}
```

## External Integrations

### Facebook Ads API
```typescript
// lib/facebook.ts
export class FacebookAdsAPI {
  static async createCampaign(data: CampaignData): Promise<Campaign>
  static async getAdInsights(campaignId: string): Promise<Insights>
}
```

### Supabase Storage
```typescript
// File Upload mit RLS
export class FileAssetAPI {
  static async upload(file: File, bucket: string): Promise<FileAsset>
  static async getVersions(fileId: string): Promise<FileVersion[]>
}
```

## Performance Considerations

### Bundle Optimization
- **Dynamic Imports**: Lazy-loading von Heavy Components
- **Code Splitting**: Route-basierte Chunks
- **Tree Shaking**: Unused Code Elimination

### Database Performance
- **Prepared Statements**: Für wiederkehrende Queries
- **Connection Pooling**: Supabase Connection Management
- **Indexing**: Optimierte Queries für große Datensätze

### Caching Strategy
```typescript
// SWR für Client-Side Caching
import useSWR from 'swr'

const { data, error, mutate } = useSWR(
  `/api/entities/${id}`,
  fetcher,
  { refreshInterval: 30000 }
)
```

## Development Workflow

### Code Quality Gates
1. **TypeScript Compilation**: Muss fehlerfrei sein
2. **ESLint Rules**: Keine Warnings erlaubt
3. **Prettier Format**: Automatische Formatierung
4. **Manual Testing**: Kritische Pfade prüfen

### Git Workflow
```bash
# Feature Development
git checkout -b feature/new-module
# Development & Testing
git add . && git commit -m "feat: add new module"
git push origin feature/new-module
# Merge nach Review
```

### Testing Strategy
- **Manual Testing**: UI-Flows in Browser
- **API Testing**: Postman/Insomnia für Endpoints
- **Database Testing**: SQL-Queries direkt testen
- **Error Scenarios**: Edge Cases und Fehlerbehandlung

## Security Considerations

### Authentication Flow
```typescript
// Protected Route Pattern
export default function ProtectedPage() {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  if (!user) redirect('/login')
  
  return <PageContent user={user} />
}
```

### Data Validation
```typescript
// Input Validation mit Zod
import { z } from 'zod'

const CreateLeadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional()
})
```

### Environment Security
- **API Keys**: Nur in Environment Variables
- **Client/Server**: Public vs. Private Key Separation
- **CORS**: Restrictive Cross-Origin Policies

## Monitoring & Debugging

### Development Tools
- **React DevTools**: Component State Inspection
- **Supabase Dashboard**: Database & Auth Monitoring
- **Browser DevTools**: Network, Performance, Console
- **VS Code Extensions**: TypeScript, ESLint, Prettier

### Production Monitoring
- **Supabase Analytics**: Query Performance & Usage
- **Vercel Analytics**: Next.js Performance Metrics
- **Error Tracking**: Application Error Monitoring

## Deployment Configuration

### Development
```bash
npm run dev
# → localhost:3000
# → Hot Reload aktiv
# → Source Maps aktiv
```

### Production Build
```bash
npm run build
npm run start
# → Optimized Bundle
# → No Source Maps
# → Performance Optimiert
``` 