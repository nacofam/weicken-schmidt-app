-- ============================================================
-- Weicken & Schmidt App – Initiales Datenbankschema
-- ============================================================
-- Ausführen in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Erweiterungen aktivieren
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM-Typen
-- ============================================================

CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'ready', 'picked_up', 'cancelled');
CREATE TYPE color_request_status AS ENUM ('pending', 'processing', 'ready', 'picked_up', 'cancelled');

-- ============================================================
-- TABELLE: profiles
-- Erweitert die Supabase auth.users Tabelle
-- ============================================================

CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  full_name    TEXT,
  phone        TEXT,
  customer_number TEXT UNIQUE,
  role         user_role NOT NULL DEFAULT 'customer',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Automatisch ein Profil anlegen wenn ein User sich registriert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at automatisch aktualisieren
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- TABELLE: products (Produkte für Vorbestellungen)
-- ============================================================

CREATE TABLE public.products (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  category     TEXT NOT NULL,        -- z.B. "Farbe", "Werkzeug", "Zubehör"
  description  TEXT,
  image_url    TEXT,
  variants     JSONB DEFAULT '[]',   -- [{name: "1 Liter", price: 12.50}, ...]
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- TABELLE: orders (Vorbestellungen)
-- ============================================================

CREATE TABLE public.orders (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pickup_date  DATE NOT NULL,
  status       order_status NOT NULL DEFAULT 'pending',
  notes        TEXT,                 -- Kundennotiz
  admin_notes  TEXT,                 -- Interne Notiz des Ladens
  -- HINWEIS: total_items wird dynamisch via View berechnet (kein generated column,
  -- da PostgreSQL kein cross-table GENERATED ALWAYS AS unterstützt)
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- TABELLE: order_items (Bestellpositionen)
-- ============================================================

CREATE TABLE public.order_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id     UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,        -- Snapshot des Produktnamens
  variant_name TEXT,                 -- z.B. "2,5 Liter"
  quantity     INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELLE: offers (Angebote / digitales Angebotsblatt)
-- ============================================================

CREATE TABLE public.offers (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  description  TEXT,
  original_price DECIMAL(10,2),      -- Durchgestrichener Preis
  offer_price  DECIMAL(10,2),        -- Angebotspreis
  image_url    TEXT,
  badge_text   TEXT,                 -- z.B. "NEU", "-20%", "Tipp"
  valid_from   DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until  DATE,                 -- NULL = kein Ablaufdatum
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- TABELLE: catalogs (Produktkataloge als PDF)
-- ============================================================

CREATE TABLE public.catalogs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  description  TEXT,
  file_url     TEXT NOT NULL,        -- Supabase Storage URL
  thumbnail_url TEXT,
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_catalogs_updated_at
  BEFORE UPDATE ON public.catalogs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- TABELLE: color_requests (Farbmischanfragen) – Phase 2
-- ============================================================

CREATE TABLE public.color_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  color_system    TEXT NOT NULL,     -- z.B. "RAL", "NCS", "Caparol"
  color_code      TEXT,              -- z.B. "RAL 3020"
  color_name      TEXT,              -- z.B. "Verkehrsrot"
  base_type       TEXT,              -- z.B. "matt", "seidenmatt"
  quantity_liters DECIMAL(5,2) NOT NULL DEFAULT 1,
  notes           TEXT,
  status          color_request_status NOT NULL DEFAULT 'pending',
  admin_notes     TEXT,
  desired_pickup_date DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_color_requests_updated_at
  BEFORE UPDATE ON public.color_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutzer sehen eigenes Profil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Nutzer können eigenes Profil bearbeiten"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins sehen alle Profile"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins können alle Profile bearbeiten"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Products (Lesezugriff für alle authentifizierten Nutzer, Schreibzugriff nur Admin)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Alle authentifizierten Nutzer sehen aktive Produkte"
  ON public.products FOR SELECT
  USING (auth.role() = 'authenticated' AND active = TRUE);

CREATE POLICY "Admins sehen alle Produkte"
  ON public.products FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Admins verwalten Produkte"
  ON public.products FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutzer sehen eigene Bestellungen"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Nutzer können Bestellungen erstellen"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Nutzer können eigene Bestellungen stornieren"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins sehen alle Bestellungen"
  ON public.orders FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Order Items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutzer sehen eigene Bestellpositionen"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
  );

CREATE POLICY "Nutzer können Bestellpositionen erstellen"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
  );

CREATE POLICY "Admins verwalten alle Bestellpositionen"
  ON public.order_items FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Offers (Öffentlich lesbar für alle authentifizierten Nutzer)
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authentifizierte Nutzer sehen aktive Angebote"
  ON public.offers FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND active = TRUE
    AND valid_from <= CURRENT_DATE
    AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
  );

CREATE POLICY "Admins verwalten alle Angebote"
  ON public.offers FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Catalogs
ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authentifizierte Nutzer sehen aktive Kataloge"
  ON public.catalogs FOR SELECT
  USING (auth.role() = 'authenticated' AND active = TRUE);

CREATE POLICY "Admins verwalten Kataloge"
  ON public.catalogs FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Color Requests
ALTER TABLE public.color_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutzer sehen eigene Farbanfragen"
  ON public.color_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Nutzer können Farbanfragen stellen"
  ON public.color_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins verwalten alle Farbanfragen"
  ON public.color_requests FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- BEISPIELDATEN (Produkte & Angebote)
-- ============================================================

-- HINWEIS: Keine Testdaten hier – realistische Seed-Daten befinden sich
-- in supabase/migrations/002_seed_data.sql
-- Bitte BEIDE Dateien nacheinander ausführen!

-- ============================================================
-- HILFSFUNKTIONEN
-- ============================================================

-- Funktion: Prüfe ob User Admin ist (für Server-Side-Abfragen)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- View: Bestellungen mit Nutzerdaten (für Admin-Dashboard)
CREATE VIEW public.orders_with_customer AS
  SELECT
    o.*,
    p.full_name   AS customer_name,
    p.email       AS customer_email,
    p.phone       AS customer_phone,
    p.customer_number
  FROM public.orders o
  JOIN public.profiles p ON o.user_id = p.id;

-- View: Bestellungen mit Positionen (JSON aggregiert)
CREATE VIEW public.orders_with_items AS
  SELECT
    o.*,
    p.full_name AS customer_name,
    p.email AS customer_email,
    COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', oi.id,
          'product_name', oi.product_name,
          'variant_name', oi.variant_name,
          'quantity', oi.quantity,
          'notes', oi.notes
        ) ORDER BY oi.created_at
      ) FILTER (WHERE oi.id IS NOT NULL),
      '[]'
    ) AS items
  FROM public.orders o
  JOIN public.profiles p ON o.user_id = p.id
  LEFT JOIN public.order_items oi ON oi.order_id = o.id
  GROUP BY o.id, p.full_name, p.email;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Diese Buckets manuell in Supabase Dashboard anlegen:
-- Storage → New Bucket
--   1. "offer-images"   (public: true)
--   2. "catalog-files"  (public: true)
--   3. "product-images" (public: true)
-- ============================================================

COMMENT ON TABLE public.profiles IS 'Nutzerprofile – erweitert auth.users';
COMMENT ON TABLE public.products IS 'Produkte, die vorbestellt werden können';
COMMENT ON TABLE public.orders IS 'Vorbestellungen von Kunden';
COMMENT ON TABLE public.order_items IS 'Einzelpositionen einer Vorbestellung';
COMMENT ON TABLE public.offers IS 'Aktuelle Angebote des Ladens';
COMMENT ON TABLE public.catalogs IS 'Produktkataloge als PDF';
COMMENT ON TABLE public.color_requests IS 'Farbmischanfragen der Kunden (Phase 2)';
