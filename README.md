# Weicken & Schmidt – App

Progressive Web App für das Fachgeschäft Weicken und Schmidt in Witten.

**Tech-Stack:** Next.js 14 · TypeScript · Tailwind CSS · Supabase

---

## 🚀 Schritt-für-Schritt Setup (ca. 30 Minuten)

### Schritt 1: Supabase-Projekt anlegen

1. Gehe auf [supabase.com](https://supabase.com) und erstelle einen **kostenlosen Account**
2. Klicke auf **"New Project"**
3. Projektname: `weicken-schmidt`
4. Passwort: sicher aufbewahren
5. Region: **Frankfurt (eu-central-1)** wählen
6. Klicke **"Create new project"** und warte ~2 Minuten

### Schritt 2: Datenbank einrichten

**Wichtig: Beide SQL-Dateien nacheinander ausführen!**

**2a – Schema anlegen:**
1. Im Supabase-Dashboard: **SQL Editor** → **New Query**
2. Öffne `supabase/migrations/001_initial_schema.sql`
3. Inhalt komplett einfügen → **Run** (▶)

**2b – Testdaten einspielen:**
1. Neuen Query öffnen: **SQL Editor** → **New Query**
2. Öffne `supabase/migrations/002_seed_data.sql`
3. Inhalt komplett einfügen → **Run** (▶)
4. Jetzt sind ~30 echte Produkte (Caparol, Alligator, Ardex usw.) und Angebote vorhanden.

**2c – Verifizierungssystem einrichten:**
1. Neuen Query öffnen: **SQL Editor** → **New Query**
2. Öffne `supabase/migrations/003_verification_codes.sql`
3. Inhalt komplett einfügen → **Run** (▶)
4. Aktiviert das Stammkunden-Verifizierungssystem für den Farbmischservice.

### Schritt 3: Storage Buckets anlegen

Im Supabase-Dashboard → **Storage** → **New Bucket**:

| Bucket-Name | Public |
|---|---|
| `offer-images` | ✅ Ja |
| `catalog-files` | ✅ Ja |
| `product-images` | ✅ Ja |

### Schritt 4: API-Keys kopieren

Im Supabase-Dashboard → **Settings** → **API**:
- `Project URL` → kopieren
- `anon public` Key → kopieren
- `service_role` Key → kopieren (geheim halten!)

### Schritt 5: Projekt lokal einrichten

```bash
# 1. In den Projektordner wechseln
cd weicken-schmidt-app

# 2. .env.local Datei erstellen
cp .env.local.example .env.local

# 3. .env.local öffnen und Werte eintragen:
# NEXT_PUBLIC_SUPABASE_URL=https://DEIN_PROJEKT.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=dein_anon_key
# SUPABASE_SERVICE_ROLE_KEY=dein_service_role_key
# NEXT_PUBLIC_APP_URL=http://localhost:3000

# 4. Abhängigkeiten installieren
npm install

# 5. Dev-Server starten
npm run dev
```

→ App ist erreichbar unter: **http://localhost:3000**

### Schritt 6: Admin-Account einrichten

1. Rufe `http://localhost:3000/register` auf
2. Registriere dich mit deiner E-Mail-Adresse
3. Bestätige die E-Mail (Link im Postfach klicken)
4. Gehe im Supabase-Dashboard zu **Table Editor** → **profiles**
5. Finde deinen Eintrag und setze das Feld `role` auf `admin`
6. Speichern → Du hast jetzt Admin-Zugang unter `/admin`

---

## 📁 Projektstruktur

```
weicken-schmidt-app/
├── app/
│   ├── (auth)/               # Login, Registrierung, Passwort-Reset
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (customer)/           # Kunden-Interface (geschützt)
│   │   ├── dashboard/        # Startseite nach Login
│   │   ├── angebote/         # Angebotsübersicht
│   │   ├── vorbestellungen/  # Bestellliste + Neue Bestellung
│   │   ├── farbmischung/     # Farbmisch-Anfrage (Phase 2 ready)
│   │   ├── kataloge/         # PDF-Kataloge
│   │   └── profil/           # Profilverwaltung
│   ├── admin/                # Admin-Bereich (nur für role='admin')
│   │   ├── page.tsx          # Admin-Übersicht mit Statistiken
│   │   ├── bestellungen/     # Bestellverwaltung + Statusänderung
│   │   ├── farbanfragen/     # Farbmischanfragen verwalten
│   │   ├── verifizierung/    # Stammkunden-Verifizierungscodes verwalten
│   │   ├── angebote/         # Angebote erstellen/bearbeiten
│   │   ├── produkte/         # Produkte verwalten
│   │   └── kunden/           # Kundenliste
│   ├── auth/callback/        # Supabase Auth Callback
│   └── page.tsx              # Öffentliche Startseite (Landing)
├── components/
│   ├── layout/               # TopBar, BottomNav
│   ├── orders/               # NewOrderForm, CancelOrderButton
│   └── admin/                # AdminNav, Forms, Actions
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Browser-Client
│   │   └── server.ts         # Server-Client
│   └── utils.ts              # Hilfsfunktionen
├── types/
│   └── database.types.ts     # TypeScript-Typen für DB-Tabellen
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql      # Gesamtes Datenbankschema
│       ├── 002_seed_data.sql           # Realistische Testdaten (Produkte, Angebote, Kataloge)
│       └── 003_verification_codes.sql  # Stammkunden-Verifizierungssystem
├── public/
│   └── manifest.json         # PWA Manifest
├── middleware.ts              # Auth-Schutz für Routen
└── .env.local.example        # Vorlage für Umgebungsvariablen
```

---

## 🌐 Deployment auf Vercel (kostenlos)

1. Erstelle einen Account auf [vercel.com](https://vercel.com)
2. Verbinde deinen GitHub-Account (Projekt vorher auf GitHub pushen)
3. Klicke **"New Project"** → Repository auswählen
4. **Environment Variables** eintragen (gleiche wie in `.env.local`, aber mit echter Domain):
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   NEXT_PUBLIC_APP_URL=https://app.weicken-schmidt.de
   ```
5. **Deploy** klicken → App ist live!

### Domain einrichten
- Vercel Dashboard → Project → **Settings** → **Domains**
- Eigene Domain hinzufügen: `app.weicken-schmidt.de`
- DNS-Einstellungen beim Domain-Anbieter anpassen (Vercel zeigt dir genau was zu tun ist)

### Supabase Auth URL aktualisieren
Im Supabase-Dashboard → **Authentication** → **URL Configuration**:
- **Site URL:** `https://app.weicken-schmidt.de`
- **Redirect URLs:** `https://app.weicken-schmidt.de/auth/callback`

---

## 📱 Als App installieren (PWA)

**Android (Chrome):**
1. Webseite im Chrome-Browser öffnen
2. Menü (⋮) → "Zum Startbildschirm hinzufügen"

**iPhone (Safari):**
1. Webseite in Safari öffnen
2. Teilen-Symbol (↑) → "Zum Home-Bildschirm"

---

## 🔑 Wichtige URLs

| URL | Beschreibung |
|---|---|
| `/` | Öffentliche Startseite |
| `/register` | Kundenregistrierung |
| `/login` | Anmeldung |
| `/dashboard` | Kunden-Dashboard |
| `/angebote` | Aktuelle Angebote |
| `/vorbestellungen` | Bestellhistorie |
| `/vorbestellungen/neu` | Neue Vorbestellung |
| `/farbmischung` | Farbmischanfrage |
| `/kataloge` | PDF-Kataloge |
| `/admin` | Admin-Dashboard |
| `/admin/bestellungen` | Bestellverwaltung |
| `/admin/farbanfragen` | Farbmischanfragen verwalten |
| `/admin/verifizierung` | Stammkunden-Verifizierungscodes |
| `/admin/angebote` | Angebotsverwaltung |
| `/admin/produkte` | Produktverwaltung |
| `/admin/kunden` | Kundenliste |

---

## ✅ Was bereits gebaut ist (Phase 1 vollständig)

- [x] Öffentliche Landing-Page mit Shop-Infos
- [x] Kundenregistrierung mit E-Mail-Bestätigung
- [x] Login / Passwort-Reset
- [x] Profilverwaltung (Name, Telefon)
- [x] Vorbestellsystem mit 3-Schritt-Formular (Produkte → Termin → Bestätigung)
- [x] Bestelldetail-Seite mit Fortschrittsanzeige
- [x] Bestellung stornieren (Kunden)
- [x] Angebotsseite (digitales Angebotsblatt)
- [x] Kataloge-Seite (PDF-Links)
- [x] Farbmischservice-Anfrage (Phase 2 Frontend bereits fertig!)
- [x] Admin: Übersicht mit Statistiken
- [x] Admin: Bestellungen verwalten (Status ändern, Kundennotiz)
- [x] Admin: Angebote erstellen / bearbeiten / aktivieren/deaktivieren
- [x] Admin: Produkte verwalten (inkl. Varianten mit Preisen)
- [x] Admin: Kundenliste mit Kundennummer-Zuweisung
- [x] Admin: Farbanfragen-Verwaltung (Status-Flow: offen → wird gemischt → abholbereit → abgeholt)
- [x] Stammkunden-Verifizierungssystem: Farbmischservice nur für vertrauenswürdige Kunden mit Code
- [x] Admin: Codes generieren, Notiz hinzufügen, Zugang entziehen
- [x] Automatische Sperrung per DB-Trigger: Code widerrufen → Kundenzugang sofort entzogen
- [x] PWA-Manifest (installierbar als App)
- [x] Row-Level-Security (Datenschutz)
- [x] Bottom-Navigationbar für Mobile
- [x] Vollständige TypeScript-Typisierung
- [x] Realistische Testdaten: ~30 Produkte (Caparol, Alligator, Ardex, Erfurt, Pufas, Jaeger, Mirka usw.), 6 Saisonangebote, 4 Katalog-Einträge
- [x] Korrekte Öffnungszeiten: Mo–Do 7:00–16:30, Fr 7:00–15:00 (kein Samstag!)
- [x] Echte Kontaktdaten: Brauckstraße 43, 58454 Witten · +49 2302 9732-0

## ⚠️ Einmaliger Hinweis: Route-Konflikt beheben

Es gibt eine Stub-Datei `app/dashboard/page.tsx` die gelöscht werden muss, bevor du die App baust:

```bash
rm weicken-schmidt-app/app/dashboard/page.tsx
```

Diese Datei stammt aus dem initialen Scaffolding und kollidiert mit `app/(customer)/dashboard/page.tsx`. Ohne das Löschen zeigt Next.js einen Build-Fehler.

## 🔜 Nächste Schritte (Phase 2)

- [ ] App-Icons erstellen: `public/icons/icon-192.png` und `icon-512.png` (z.B. W&S Logo auf orangem Hintergrund)
- [ ] Supabase Auth E-Mail-Templates auf Deutsch umstellen (Dashboard → Authentication → Email Templates)
- [ ] Bilder-Upload für Angebote (via Supabase Storage → `offer-images` Bucket)
- [ ] E-Mail-Benachrichtigungen bei Statusänderungen (z.B. via [Resend](https://resend.com))
- [ ] Admin: PDF-Upload für Kataloge (Storage → `catalog-files` Bucket)
- [ ] Push-Benachrichtigungen (wenn Bestellung abholbereit ist)

---

## 🛠 Entwicklungsbefehle

```bash
npm run dev      # Dev-Server starten (http://localhost:3000)
npm run build    # Produktions-Build erstellen
npm run start    # Produktions-Build starten
npm run lint     # Linting ausführen
```

---

*Gebaut mit Next.js 14, Supabase & Tailwind CSS | April 2026*
