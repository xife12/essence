-- Migration: Erweitere transaction_type ENUM um 'modul' für exklusive Module
-- Created: 24.06.2025 - 12:50
-- Purpose: Vollständige Forderungstypen-Abdeckung inkl. exklusiver Module

-- Erweitere transaction_type ENUM um 'modul'
ALTER TYPE transaction_type ADD VALUE 'modul';

-- Kommentar für Dokumentation
COMMENT ON TYPE transaction_type IS 'Enhanced transaction types including modul for exclusive module charges'; 