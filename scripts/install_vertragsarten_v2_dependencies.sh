#!/bin/bash

# ============================================================================
# Vertragsarten V2 Dependencies Installation Script
# Installiert alle notwendigen NPM-Pakete für das neue System
# ============================================================================

echo "🚀 Installiere Dependencies für Vertragsarten V2 System..."

# Core Dependencies
echo "📦 Installiere Core Dependencies..."
npm install \
  @supabase/supabase-js@latest \
  react@latest \
  react-dom@latest \
  next@latest \
  typescript@latest \
  @types/react@latest \
  @types/react-dom@latest \
  @types/node@latest

# UI Dependencies  
echo "🎨 Installiere UI Dependencies..."
npm install \
  lucide-react@latest \
  @radix-ui/react-tabs@latest \
  @radix-ui/react-dialog@latest \
  @radix-ui/react-switch@latest \
  @radix-ui/react-label@latest \
  @radix-ui/react-separator@latest \
  class-variance-authority@latest \
  clsx@latest \
  tailwind-merge@latest

# Document Processing Dependencies
echo "📄 Installiere Document Processing Dependencies..."
npm install \
  @tinymce/tinymce-react@latest \
  puppeteer@latest \
  html-pdf@latest \
  react-pdf@latest \
  jspdf@latest

# Form & Validation Dependencies
echo "📝 Installiere Form & Validation Dependencies..."
npm install \
  react-hook-form@latest \
  @hookform/resolvers@latest \
  zod@latest \
  date-fns@latest

# Development Dependencies
echo "🛠️ Installiere Development Dependencies..."
npm install --save-dev \
  @types/html-pdf@latest \
  @types/jspdf@latest \
  tailwindcss@latest \
  postcss@latest \
  autoprefixer@latest

# Optional: UI Components (falls noch nicht vorhanden)
echo "🧩 Überprüfe UI Components..."
if [ ! -d "components/ui" ]; then
  echo "📋 Installiere Shadcn/UI Components..."
  npx shadcn-ui@latest init
  npx shadcn-ui@latest add card button input label textarea switch badge tabs dialog separator
fi

echo "✅ Alle Dependencies erfolgreich installiert!"
echo ""
echo "🔄 Nächste Schritte:"
echo "1. Führe die Datenbank-Migrationen aus:"
echo "   psql -f migrations/001_create_contracts_v2_schema.sql"
echo "   psql -f migrations/002_insert_standard_data.sql"
echo ""
echo "2. Starte die Entwicklungsumgebung:"
echo "   npm run dev"
echo ""
echo "3. Öffne das neue System unter:"
echo "   http://localhost:3000/vertragsarten-v2"
echo ""
echo "🎉 Vertragsarten V2 System ist bereit!"