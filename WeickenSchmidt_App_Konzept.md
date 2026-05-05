# App-Konzept & Umsetzungsplan
## Weicken und Schmidt – Farben & Malerbedarf, Witten

**Version:** 1.0 | **Datum:** April 2026

---

## 1. Projektziel

Entwicklung einer mobilen App / Progressive Web App für das lokale Fachgeschäft **Weicken und Schmidt** in Witten. Die App soll Stammkunden und Neukunden einen digitalen Servicezugang bieten – von der Vorbestellung über den Farbmischservice bis hin zur Angebots- und Katalogansicht – und gleichzeitig dem Ladeninhaber eine einfache Verwaltungsoberfläche zur Verfügung stellen.

---

## 2. Technologie-Empfehlung

### Empfehlung: Progressive Web App (PWA) + Web-Backend

Für ein lokales Einzelhandelsgeschäft dieser Größe ist eine **PWA auf Basis von React (Next.js)** die optimale Wahl. Die Gründe:

| Kriterium | PWA (Next.js) | React Native / Flutter | Native iOS/Android |
|---|---|---|---|
| Entwicklungsaufwand | ★★★★★ gering | ★★★ mittel | ★ sehr hoch |
| Kosten | ★★★★★ niedrig | ★★★ mittel | ★ sehr hoch |
| App Store nötig? | Nein | Ja (aufwendig) | Ja |
| Updates | Sofort live | Store-Review nötig | Store-Review nötig |
| Auf Handy nutzbar | ✅ Vollständig | ✅ Vollständig | ✅ Vollständig |
| Offline-Funktion | ✅ (begrenzt) | ✅ | ✅ |
| Ladeninhaber-Admin | ✅ im selben System | Extra App nötig | Extra App nötig |

**Kernvorteil:** Eine PWA funktioniert direkt im Browser, kann aber auch als Icon auf dem Smartphone-Startbildschirm installiert werden – ohne App Store. Der Ladeninhaber verwaltet alles über ein einfaches Web-Dashboard auf demselben Rechner oder Tablet im Laden.

> **Für spätere Phasen** (nach Launch, bei hoher Nutzung): Wrapper-App via Expo/React Native für App-Store-Präsenz nachrüsten.

---

## 3. Feature-Priorisierung (MoSCoW)

### 🔴 Must-have – Phase 1 (MVP)

#### 3.1 Kundenregistrierung & Login
- Registrierung via E-Mail + Passwort
- Optionale Angabe einer vorhandenen Kundennummer
- Profil: Name, Telefon, E-Mail, Kundennummer
- Passwort-Reset per E-Mail
- Admin-Ansicht: Kundenliste einsehen

#### 3.2 Vorbestellungen
- Produktsuche / Produktauswahl aus vordefinierten Kategorien
- Menge, Variante (z. B. Größe, Gebindegröße) auswählbar
- Wunsch-Abholtag auswählen (Kalender-Picker, nur Öffnungstage)
- Bestellbestätigung per E-Mail
- Admin-Ansicht: Offene Bestellungen als Liste, Status setzen (offen / bereit / abgeholt)

#### 3.3 Aktuelle Angebote
- Admin legt Angebote an (Bild, Titel, Preis, Gültigkeitsdatum)
- Kunden sehen Angebote als Kachel-Ansicht / digitales Angebotsblatt
- Automatisches Ausblenden abgelaufener Angebote

### 🟡 Should-have – Phase 2

#### 3.4 Farbmischservice / Farbkonfigurator
- Kunde wählt: Farbsystem (z. B. NCS, RAL, Caparol, Alpina), Farbcode oder Farbname
- Basis auswählen (matt, seidenmatt, glänzend)
- Menge / Gebindegröße wählen (1 L, 2,5 L, 5 L, 10 L)
- Anfrage absenden (keine direkte Buchung – Laden bestätigt Preis & Verfügbarkeit)
- Admin erhält E-Mail-Benachrichtigung + Eintrag im Dashboard
- Kunden-Verlauf: "Meine Farbanfragen" mit Status

#### 3.5 Produktkataloge
- PDF-Kataloge hochladen (Admin)
- Kunden können Kataloge im Browser/PDF-Viewer durchblättern
- Optional: Blätterfunktion (Flipbook-Stil)

### 🟢 Nice-to-have – Phase 3

- Push-Benachrichtigungen (Bestellung bereit, neue Angebote)
- Favoritenliste / Merkliste für Produkte
- Bewertungen & Kommentare zu Produkten
- Treuepunkte-System / Kundenkarte digital
- Mehrsprachigkeit (Türkisch, Englisch)
- Integration Kassensystem / Warenwirtschaft

---

## 4. Technischer Stack

### Frontend
| Komponente | Technologie |
|---|---|
| Framework | **Next.js 14** (React, TypeScript) |
| Styling | **Tailwind CSS** |
| UI-Komponenten | **shadcn/ui** |
| PWA | **next-pwa** (Service Worker, Offline-Cache) |
| Farbpicker | **react-colorful** oder eigene Komponente |
| PDF-Viewer | **react-pdf** |

### Backend
| Komponente | Technologie |
|---|---|
| Backend-as-a-Service | **Supabase** (PostgreSQL, Auth, Storage, Realtime) |
| Authentifizierung | Supabase Auth (E-Mail/Passwort) |
| Datei-Storage | Supabase Storage (Katalog-PDFs, Angebotsbilder) |
| E-Mail-Versand | **Resend** oder **SendGrid** (kostenloser Tier ausreichend) |
| API | Next.js API Routes (server-side) |

### Hosting
| Komponente | Empfehlung | Kosten |
|---|---|---|
| Frontend + API | **Vercel** (Next.js-native, 0€/Monat im Hobby-Plan) | Kostenlos |
| Datenbank + Auth | **Supabase** (Free Tier: 500 MB DB, 1 GB Storage) | Kostenlos |
| Domain | Eigene Domain (z. B. `app.weicken-schmidt.de`) | ~10–15 €/Jahr |
| E-Mail-Versand | Resend (100 E-Mails/Tag kostenlos) | Kostenlos |

**Gesamtkosten laufend: ~10–15 €/Jahr** (nur Domain) für den Anfang. Bei Wachstum skalieren Supabase und Vercel günstig.

---

## 5. Datenbankmodell (vereinfacht)

```
users
  id, email, name, phone, customer_number, role (customer/admin), created_at

products
  id, name, category, description, variants (JSON), image_url, active

orders (Vorbestellungen)
  id, user_id, pickup_date, status (pending/ready/picked_up), notes, created_at

order_items
  id, order_id, product_id, variant, quantity

color_requests (Farbmischanfragen)
  id, user_id, color_system, color_code, color_name, base_type, quantity_liters, notes, status, created_at

offers (Angebote)
  id, title, description, price, image_url, valid_from, valid_until, active

catalogs (Kataloge)
  id, title, file_url, thumbnail_url, published_at, active
```

---

## 6. Admin-Dashboard (Ladeninhaber)

Das Admin-Panel ist passwortgeschützt und unter `/admin` erreichbar. Funktionen:

- **Bestellungen:** Liste aller offenen Vorbestellungen, Statusänderung per Klick, Filter nach Datum
- **Farbanfragen:** Liste aller Anfragen, Statusaktualisierung, Notizen hinzufügen
- **Angebote verwalten:** Neu anlegen (Bild hochladen, Titel, Preis, Zeitraum), bearbeiten, deaktivieren
- **Kataloge hochladen:** PDF-Upload, Titel vergeben, veröffentlichen/verstecken
- **Kunden:** Übersicht aller registrierten Kunden, Kundennummer zuweisen
- **Produkte:** Artikel anlegen und pflegen (für Vorbestellsystem)

> Ziel: Der Ladeninhaber soll alles ohne technisches Wissen bedienen können. Einfache Formulare, klare Buttons, keine technischen Begriffe.

---

## 7. Umsetzungsplan & Zeitschätzung

### Phase 1 – MVP (ca. 6–8 Wochen)

| Woche | Inhalt |
|---|---|
| 1 | Projektsetup: Next.js, Supabase, Vercel-Deployment, Domain konfigurieren |
| 2 | Authentifizierung: Registrierung, Login, Passwort-Reset, Profil |
| 3 | Angebote: Admin-Formular, Kunden-Ansicht (Kacheln), Ablauf-Logik |
| 4 | Vorbestellungen: Produktverwaltung Admin, Bestellformular Kunde |
| 5 | Vorbestellungen: Kalender-Picker, E-Mail-Bestätigung, Admin-Übersicht |
| 6 | Admin-Dashboard: Bestellstatus, Kundenliste, Feinschliff |
| 7 | PWA-Konfiguration: Installierbar, Icons, Offline-Startseite |
| 8 | Testing, Bugfixing, Soft-Launch |

### Phase 2 – Farbkonfigurator & Kataloge (ca. 4 Wochen nach Phase 1)

| Woche | Inhalt |
|---|---|
| 9–10 | Farbmisch-Formular: Farbsystem, Code, Basis, Menge, Anfrage absenden |
| 11 | Katalog-Upload Admin, PDF-Viewer Kunde |
| 12 | Testing, E-Mail-Benachrichtigungen für Farbanfragen, Feinschliff |

### Phase 3 – Erweiterungen (nach Bedarf)

Push-Benachrichtigungen, Treuepunkte, App-Store-Wrapper – je nach Nutzerfeedback.

---

## 8. Was du zum Start brauchst

### Sofort (vor Entwicklung)
- [ ] **Entscheidung:** Eigene Domain kaufen oder vorhandene nutzen? (z. B. `app.weicken-schmidt.de`)
- [ ] **Supabase-Account** anlegen (kostenlos): [supabase.com](https://supabase.com)
- [ ] **Vercel-Account** anlegen (kostenlos): [vercel.com](https://vercel.com)
- [ ] **Logo & Farben** des Ladens bereitstellen (für App-Design)
- [ ] **Produktliste** (CSV oder handschriftlich): Welche Produkte sollen vorbestellbar sein?
- [ ] **Öffnungszeiten** für den Abhol-Kalender

### Für den Farbkonfigurator (Phase 2)
- [ ] Welche Farbsysteme werden gemischt? (RAL, NCS, Caparol, Alpina, andere?)
- [ ] Gibt es eine Preisliste für Farbmischungen?
- [ ] Wie viel Vorlaufzeit braucht eine Farbanfrage?

### Optional
- [ ] Resend-Account für E-Mail-Versand: [resend.com](https://resend.com)
- [ ] Bestehende Katalog-PDFs (für Katalog-Feature)

---

## 9. Kostenübersicht

### Entwicklungskosten (einmalig)
| Aufwand | Geschätzte Stunden | Beschreibung |
|---|---|---|
| Phase 1 (MVP) | 60–80 Std. | Vollständige Basis-App |
| Phase 2 (Farbe + Katalog) | 30–40 Std. | Farbkonfigurator, PDF-Viewer |
| Phase 3 (Erweiterungen) | nach Bedarf | Push, Loyalty, App Store |

*Bei Eigenentwicklung: Zeitinvestition. Bei externer Agentur: ca. 5.000–12.000 € für Phase 1+2.*

### Laufende Betriebskosten
| Posten | Kosten/Monat |
|---|---|
| Vercel (Hosting) | 0 € (Hobby) |
| Supabase (Datenbank) | 0 € (Free Tier) |
| Domain | ~1 €/Monat |
| E-Mail-Versand | 0 € (bis 100/Tag) |
| **Gesamt** | **~1 €/Monat** |

---

## 10. Nächste Schritte

1. **Dieses Konzept besprechen** – Fragen klären, Anpassungen vornehmen
2. **Accounts anlegen** (Supabase, Vercel)
3. **Design-Entscheidungen treffen** (Farben, Logo, Stil)
4. **Produktliste aufbereiten**
5. **Entwicklung starten** – Phase 1, Woche 1: Projektsetup

---

*Erstellt mit Claude Cowork | April 2026*
