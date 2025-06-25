-- Migration: Funktion zum Bereinigen von Beitragskalender-Einträgen
-- Diese Funktion kann RLS umgehen, da sie als SECURITY DEFINER läuft

-- Funktion zum Löschen aller Beitragskalender-Einträge für einen Member
CREATE OR REPLACE FUNCTION delete_member_beitragskalender(p_member_id UUID)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM beitragskalender WHERE member_id = p_member_id;
END;
$$;

-- Funktion zum Erstellen bereinigter Beitragskalender-Einträge
CREATE OR REPLACE FUNCTION create_clean_beitragskalender(
  p_member_id UUID,
  p_membership_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_monthly_fee DECIMAL
)
RETURNS INT
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  current_date DATE;
  entry_count INT := 0;
BEGIN
  -- Setze den Starttermin auf den 25. des ersten Monats
  current_date := DATE_TRUNC('month', p_start_date) + INTERVAL '24 days';
  
  -- Falls der 25. vor dem Startdatum liegt, gehe zum nächsten Monat
  IF current_date < p_start_date THEN
    current_date := current_date + INTERVAL '1 month';
  END IF;
  
  -- Erstelle monatliche Einträge bis zum Enddatum
  WHILE current_date <= p_end_date LOOP
    INSERT INTO beitragskalender (
      member_id,
      vertrags_id,
      due_date,
      amount,
      transaction_type,
      description,
      status,
      zahllaufgruppe_id,
      is_recurring,
      recurrence_pattern,
      created_by
    ) VALUES (
      p_member_id,
      p_membership_id,
      current_date,
      p_monthly_fee::TEXT,
      'membership_fee',
      'Monatsbeitrag ' || TO_CHAR(current_date, 'Month YYYY'),
      'scheduled',
      'monthly_1',
      true,
      'monthly',
      'system_trigger'
    );
    
    entry_count := entry_count + 1;
    current_date := current_date + INTERVAL '1 month';
  END LOOP;
  
  RETURN entry_count;
END;
$$;

-- Berechtigungen setzen
GRANT EXECUTE ON FUNCTION delete_member_beitragskalender(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_clean_beitragskalender(UUID, UUID, DATE, DATE, DECIMAL) TO authenticated; 