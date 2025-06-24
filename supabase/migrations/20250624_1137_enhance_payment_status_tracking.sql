-- Migration: Enhanced Payment-Status-Tracking für präzise "Offen"-Berechnung
-- Created: 24.06.2025 - 11:37
-- Purpose: Präzise "Offen"-Berechnung für Beitragskonto-System

-- Erweitere payment_run_items für präzise "Offen"-Berechnung
ALTER TABLE payment_run_items 
ADD COLUMN partial_payment_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN return_partial_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN outstanding_amount DECIMAL(10,2) GENERATED ALWAYS AS (
  amount - COALESCE(partial_payment_amount, 0) + COALESCE(return_partial_amount, 0)
) STORED;

-- Index für Performance
CREATE INDEX idx_payment_run_items_outstanding ON payment_run_items(outstanding_amount);

-- Kommentare für Dokumentation
COMMENT ON COLUMN payment_run_items.partial_payment_amount IS 'Amount already paid (for partial payments)';
COMMENT ON COLUMN payment_run_items.return_partial_amount IS 'Amount returned due to chargebacks';
COMMENT ON COLUMN payment_run_items.outstanding_amount IS 'Calculated outstanding amount: amount - partial_payment + return_amount'; 