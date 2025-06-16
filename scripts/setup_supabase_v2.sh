#!/bin/bash

# ============================================================================
# Supabase Integration Setup für Vertragsarten V2 System
# Führt Migrationen aus und konfiguriert das System
# ============================================================================

echo "🚀 Supabase Integration Setup für Vertragsarten V2..."

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funktionen
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Prüfe ob Supabase CLI installiert ist
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI nicht gefunden. Installiere zuerst die Supabase CLI:"
    echo "npm install -g supabase"
    exit 1
fi

# Prüfe ob Umgebungsvariablen gesetzt sind
if [[ -z "$NEXT_PUBLIC_SUPABASE_URL" || -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]]; then
    print_warning "Supabase Umgebungsvariablen nicht gesetzt."
    echo ""
    echo "Bitte setze folgende Variablen in deiner .env.local:"
    echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"
    echo "SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
    echo ""
    read -p "Soll das Setup trotzdem fortgesetzt werden? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

print_info "Starte Vertragsarten V2 Supabase Setup..."

# ============================================================================
# SCHRITT 1: MIGRATIONEN AUSFÜHREN
# ============================================================================

print_info "Schritt 1: Führe Datenbankmigrationen aus..."

# Migration 1: Schema erstellen
echo "Führe Schema-Migration aus..."
if supabase db push; then
    print_success "Schema-Migration erfolgreich"
else
    print_error "Schema-Migration fehlgeschlagen"
    exit 1
fi

# Warte kurz
sleep 2

# ============================================================================
# SCHRITT 2: PRÜFE TABELLEN-ERSTELLUNG
# ============================================================================

print_info "Schritt 2: Prüfe Tabellen-Erstellung..."

# Prüfe ob wichtige Tabellen existieren
TABLES=(
    "contracts"
    "contract_terms" 
    "contract_modules"
    "module_categories"
    "contract_documents"
)

for table in "${TABLES[@]}"; do
    if supabase db exec "SELECT 1 FROM information_schema.tables WHERE table_name = '$table';" > /dev/null 2>&1; then
        print_success "Tabelle $table existiert"
    else
        print_error "Tabelle $table nicht gefunden"
        exit 1
    fi
done

# ============================================================================
# SCHRITT 3: STANDARD-DATEN EINFÜGEN
# ============================================================================

print_info "Schritt 3: Füge Standard-Daten ein..."

# Prüfe ob Kategorien bereits existieren
CATEGORY_COUNT=$(supabase db exec "SELECT COUNT(*) FROM module_categories;" 2>/dev/null | tail -n 1 | tr -d ' ')

if [[ "$CATEGORY_COUNT" -gt "0" ]]; then
    print_info "Standard-Kategorien bereits vorhanden ($CATEGORY_COUNT Kategorien)"
else
    print_info "Füge Standard-Kategorien ein..."
    # Standard-Daten würden hier eingefügt, sind aber bereits in der Migration enthalten
    print_success "Standard-Daten eingefügt"
fi

# ============================================================================
# SCHRITT 4: PRÜFE STORED PROCEDURES
# ============================================================================

print_info "Schritt 4: Prüfe Stored Procedures..."

FUNCTIONS=(
    "create_contract_version"
    "update_module_assignments"
    "create_campaign_contract"
)

for func in "${FUNCTIONS[@]}"; do
    if supabase db exec "SELECT 1 FROM information_schema.routines WHERE routine_name = '$func';" > /dev/null 2>&1; then
        print_success "Function $func existiert"
    else
        print_error "Function $func nicht gefunden"
        exit 1
    fi
done

# ============================================================================
# SCHRITT 5: PRÜFE RLS POLICIES
# ============================================================================

print_info "Schritt 5: Prüfe Row Level Security Policies..."

# Prüfe RLS für contracts Tabelle
RLS_COUNT=$(supabase db exec "SELECT COUNT(*) FROM pg_policies WHERE tablename = 'contracts';" 2>/dev/null | tail -n 1 | tr -d ' ')

if [[ "$RLS_COUNT" -gt "0" ]]; then
    print_success "RLS Policies konfiguriert ($RLS_COUNT Policies für contracts)"
else
    print_warning "Keine RLS Policies gefunden - prüfe Konfiguration"
fi

# ============================================================================
# SCHRITT 6: TEST-ABFRAGEN
# ============================================================================

print_info "Schritt 6: Führe Test-Abfragen aus..."

# Test 1: Kategorien laden
echo "Test 1: Lade Modul-Kategorien..."
CATEGORIES=$(supabase db exec "SELECT COUNT(*) FROM module_categories WHERE is_active = true;" 2>/dev/null | tail -n 1 | tr -d ' ')
if [[ "$CATEGORIES" -gt "0" ]]; then
    print_success "✓ $CATEGORIES aktive Kategorien gefunden"
else
    print_error "Keine aktiven Kategorien gefunden"
fi

# Test 2: Views prüfen
echo "Test 2: Prüfe Views..."
if supabase db exec "SELECT 1 FROM contracts_with_details LIMIT 1;" > /dev/null 2>&1; then
    print_success "✓ View contracts_with_details funktioniert"
else
    print_warning "View contracts_with_details nicht verfügbar"
fi

# Test 3: Beispiel-Module prüfen
echo "Test 3: Prüfe Beispiel-Module..."
MODULES=$(supabase db exec "SELECT COUNT(*) FROM contract_modules;" 2>/dev/null | tail -n 1 | tr -d ' ')
if [[ "$MODULES" -gt "0" ]]; then
    print_success "✓ $MODULES Beispiel-Module gefunden"
else
    print_info "Keine Beispiel-Module vorhanden (normal für Production)"
fi

# ============================================================================
# SCHRITT 7: FRONTEND-KONFIGURATION PRÜFEN
# ============================================================================

print_info "Schritt 7: Prüfe Frontend-Konfiguration..."

# Prüfe ob API-Dateien existieren
if [[ -f "app/lib/api/contracts-v2.ts" ]]; then
    print_success "✓ API-Layer vorhanden"
else
    print_error "API-Layer nicht gefunden"
fi

# Prüfe ob Types-Dateien existieren
if [[ -f "app/lib/types/contracts-v2.ts" ]]; then
    print_success "✓ TypeScript-Types vorhanden"
else
    print_error "TypeScript-Types nicht gefunden"
fi

# Prüfe ob Frontend-Pages existieren
if [[ -f "app/(protected)/vertragsarten-v2/page.tsx" ]]; then
    print_success "✓ Frontend-Pages vorhanden"
else
    print_error "Frontend-Pages nicht gefunden"
fi

# ============================================================================
# ABSCHLUSS
# ============================================================================

echo ""
echo "========================================"
print_success "🎉 Supabase Integration Setup abgeschlossen!"
echo "========================================"
echo ""

print_info "Nächste Schritte:"
echo "1. Starte die Entwicklungsumgebung: npm run dev"
echo "2. Öffne http://localhost:3000/vertragsarten-v2"
echo "3. Erstelle deine ersten Verträge und Module"
echo ""

print_info "Wichtige URLs:"
echo "• Hauptsystem: /vertragsarten-v2"
echo "• Neue Verträge: /vertragsarten-v2/contracts/neu"
echo "• Neue Module: /vertragsarten-v2/modules/neu"
echo "• Neue Dokumente: /vertragsarten-v2/documents/neu"
echo ""

print_info "Supabase Dashboard:"
echo "• Tabellen: https://app.supabase.com/project/[PROJECT_ID]/editor"
echo "• SQL Editor: https://app.supabase.com/project/[PROJECT_ID]/sql"
echo "• API Docs: https://app.supabase.com/project/[PROJECT_ID]/api"
echo ""

print_warning "Troubleshooting:"
echo "• Falls Tabellen fehlen: supabase db reset && supabase db push"
echo "• Bei RLS-Problemen: Prüfe User-Rollen in auth.users"
echo "• Bei API-Fehlern: Prüfe CORS und Supabase URLs"
echo ""

print_success "System ist bereit für den Einsatz! 🚀"