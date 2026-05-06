-- ============================================================
-- Weicken & Schmidt App – Migration 004: Delivery Notes
-- Lieferscheinsystem mit digitaler Unterschrift
-- ============================================================
-- Ausführen in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

CREATE TYPE delivery_note_status AS ENUM ('sent', 'signed', 'cancelled');

CREATE TABLE public.delivery_notes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_number     TEXT NOT NULL UNIQUE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_by      UUID NOT NULL REFERENCES public.profiles(id),
  items           JSONB NOT NULL DEFAULT '[]',
  -- items format: [{name, quantity, unit, unit_price}]
  notes           TEXT,
  delivery_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  status          delivery_note_status NOT NULL DEFAULT 'sent',
  signature_data  TEXT,       -- base64 PNG der Unterschrift
  signed_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_delivery_notes_updated_at
  BEFORE UPDATE ON public.delivery_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS aktivieren (App nutzt Service Role Key → RLS wird umgangen,
-- aber Best Practice trotzdem aktivieren)
ALTER TABLE public.delivery_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutzer sehen eigene Lieferscheine"
  ON public.delivery_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Nutzer können eigene Lieferscheine unterschreiben"
  ON public.delivery_notes FOR UPDATE
  USING (auth.uid() = user_id AND status = 'sent');

CREATE POLICY "Admins verwalten alle Lieferscheine"
  ON public.delivery_notes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

COMMENT ON TABLE public.delivery_notes IS 'Lieferscheine mit digitaler Unterschrift';
