-- Migration: Erweitere transaction_type ENUM um 'pauschale'
-- Created: 24.06.2025 - 11:35
-- Purpose: Vollständige Forderungstypen-Abdeckung für Beitragskonto-System

-- Erweitere transaction_type ENUM um 'pauschale'
ALTER TYPE transaction_type ADD VALUE 'pauschale';

-- Kommentar für Dokumentation
COMMENT ON TYPE transaction_type IS 'Enhanced transaction types including pauschale for membership flat rates'; 