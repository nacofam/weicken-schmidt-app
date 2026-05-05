-- ============================================================
-- Weicken & Schmidt – Verifizierungssystem für Farbmischservice
-- ============================================================
-- Zweck: Nur Stammkunden, die vom Laden persönlich einen Code
--        erhalten haben, können den Farbmischservice nutzen.
--
-- Ablauf:
--   1. Admin generiert einen Code und gibt ihn persönlich an den Kunden
--   2. Kunde gibt Code in der App ein → Profil wird als "verifiziert" markiert
--   3. Verifizierte Kunden haben dauerhaft Zugang zum Farbmischservice
--   4. Admin kann den Zugang bei Bedarf entziehen (Code widerrufen)
--
-- Ausführen NACH 001_initial_schema.sql und 002_seed_data.sql
-- ============================================================

-- ENUM für Code-Status
CREATE TYPE verification_code_status AS ENUM ('unused', 'active', 'revoked');

-- ============================================================
-- TABELLE: verification_codes
-- ============================================================

CREATE TABLE public.verification_codes (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code         TEXT NOT NULL UNIQUE,                              -- z.B. "ABCDE-FGHJK"
  status       verification_code_status NOT NULL DEFAULT 'unused',
  notes        TEXT,                                              -- Interne Notiz (z.B. "für Hans Müller / Stammkunde seit 2019")
  created_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  activated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  activated_at TIMESTAMPTZ,
  revoked_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PROFILE-TABELLE erweitern
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_farbmischung_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verification_code_id UUID REFERENCES public.verification_codes(id) ON DELETE SET NULL;

-- ============================================================
-- TRIGGER: Wenn ein Code widerrufen wird, Kundenzugang automatisch entziehen
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_code_revoked()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Nur bei Statuswechsel nach 'revoked' reagieren
  IF NEW.status = 'revoked' AND OLD.status != 'revoked' THEN
    -- Alle Kunden, die diesen Code verwendet haben, auf unverifiziert setzen
    UPDATE public.profiles
    SET
      is_farbmischung_verified = FALSE,
      verification_code_id = NULL
    WHERE verification_code_id = NEW.id;

    -- Widerrufszeitpunkt festhalten
    NEW.revoked_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_verification_code_revoked
  BEFORE UPDATE ON public.verification_codes
  FOR EACH ROW EXECUTE FUNCTION public.handle_code_revoked();

-- ============================================================
-- RPC-FUNKTION: Code einlösen (von Kunden aufgerufen)
-- ============================================================
-- Wird vom Client via supabase.rpc('activate_verification_code', { p_code: '...' }) aufgerufen.
-- Läuft mit SECURITY DEFINER → kein direkter Tabellenzugriff durch den Kunden nötig.

CREATE OR REPLACE FUNCTION public.activate_verification_code(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_code_id   UUID;
  v_user_id   UUID;
BEGIN
  -- Aktuellen Nutzer ermitteln
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  -- Bereits verifiziert? Dann kein zweiter Code nötig
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = v_user_id AND is_farbmischung_verified = TRUE
  ) THEN
    RETURN jsonb_build_object('success', true, 'already_verified', true);
  END IF;

  -- Code suchen (Groß-/Kleinschreibung egal, Leerzeichen ignorieren)
  SELECT id INTO v_code_id
  FROM public.verification_codes
  WHERE UPPER(REPLACE(code, ' ', '')) = UPPER(REPLACE(p_code, ' ', ''))
    AND status = 'unused'
  LIMIT 1;

  IF v_code_id IS NULL THEN
    -- Prüfen ob Code existiert aber bereits verwendet wurde
    IF EXISTS (
      SELECT 1 FROM public.verification_codes
      WHERE UPPER(REPLACE(code, ' ', '')) = UPPER(REPLACE(p_code, ' ', ''))
        AND status != 'unused'
    ) THEN
      RETURN jsonb_build_object('success', false, 'error', 'code_already_used');
    END IF;
    RETURN jsonb_build_object('success', false, 'error', 'invalid_code');
  END IF;

  -- Code aktivieren
  UPDATE public.verification_codes
  SET
    status       = 'active',
    activated_by = v_user_id,
    activated_at = NOW()
  WHERE id = v_code_id;

  -- Profil als verifiziert markieren
  UPDATE public.profiles
  SET
    is_farbmischung_verified = TRUE,
    verification_code_id     = v_code_id
  WHERE id = v_user_id;

  RETURN jsonb_build_object('success', true, 'already_verified', false);
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY für verification_codes
-- ============================================================

ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Kunden können nur ihren eigenen aktivierten Code einsehen
-- (kein direkter Zugriff auf fremde Codes oder ungenutzte Codes)
CREATE POLICY "Kunden sehen eigenen aktivierten Code"
  ON public.verification_codes FOR SELECT
  USING (activated_by = auth.uid());

-- Admins haben vollen Zugriff
CREATE POLICY "Admins verwalten alle Codes"
  ON public.verification_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- KOMMENTAR
-- ============================================================

COMMENT ON TABLE public.verification_codes IS
  'Verifizierungscodes für den Farbmischservice — werden persönlich vom Laden an Stammkunden vergeben';
COMMENT ON COLUMN public.verification_codes.notes IS
  'Interne Notiz für den Admin (z.B. Name des Kunden, Anlass)';
COMMENT ON COLUMN public.profiles.is_farbmischung_verified IS
  'TRUE wenn der Kunde einen gültigen Code eingelöst hat und den Farbmischservice nutzen darf';
COMMENT ON COLUMN public.profiles.verification_code_id IS
  'Referenz auf den eingelösten Verifizierungscode';
