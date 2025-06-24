-- Migration: Sales-Tool-Integration und Business-Logic-Tracking
-- Created: 24.06.2025 - 11:36
-- Purpose: Future-ready für Sales-Tool-Integration + automatisierte Business-Logic

-- Erweitere member_transactions für Sales-Tool-Integration
ALTER TABLE member_transactions 
ADD COLUMN sales_tool_reference_id UUID,
ADD COLUMN sales_tool_origin TEXT CHECK (sales_tool_origin IN ('sales_tool', 'manual', 'import', 'automatic')),
ADD COLUMN business_logic_trigger TEXT;

-- Indexes für Performance
CREATE INDEX idx_member_transactions_sales_tool ON member_transactions(sales_tool_reference_id);
CREATE INDEX idx_member_transactions_origin ON member_transactions(sales_tool_origin);
CREATE INDEX idx_member_transactions_trigger ON member_transactions(business_logic_trigger);

-- Kommentare für Dokumentation
COMMENT ON COLUMN member_transactions.sales_tool_reference_id IS 'Reference ID for future sales tool integration';
COMMENT ON COLUMN member_transactions.sales_tool_origin IS 'Origin of transaction: sales_tool, manual, import, automatic';
COMMENT ON COLUMN member_transactions.business_logic_trigger IS 'Trigger for automatic business logic: stillegung, kuendigung, guthaben_verrechnung'; 