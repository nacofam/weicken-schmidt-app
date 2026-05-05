-- ============================================================
-- Weicken & Schmidt – Realistische Testdaten / Seed
-- ============================================================
-- Ausführen NACH 001_initial_schema.sql
-- Weicken & Schmidt Witten ist Caparol-Haupthändler + führt
-- Marken: Alligator, Pufas, Rasch, Marburg, Erfurt, Mirka,
-- Festool, Jaeger, Tesa, Gerflor, Wineo u.v.m.
-- ============================================================

-- Zuerst bestehende Beispieldaten löschen (aus 001_schema)
TRUNCATE public.offers CASCADE;
TRUNCATE public.products CASCADE;

-- ============================================================
-- PRODUKTE: Innenfarben (Caparol Hauptsortiment)
-- ============================================================

INSERT INTO public.products (name, category, description, variants, active, sort_order) VALUES

-- Caparol Amphibolin – Universalfarbe
(
  'Caparol Amphibolin', 'Innenfarbe',
  'Die universelle Farbe für Innen und Außen. Hochwertig, deckend, lösemittelfrei. Ideal für Wände und Decken. Hohe Ergiebigkeit, gut zu verarbeiten.',
  '[{"name":"1 Liter","price":12.80},{"name":"2,5 Liter","price":27.90},{"name":"5 Liter","price":49.50},{"name":"10 Liter","price":89.00},{"name":"15 Liter","price":124.00}]',
  true, 10
),

-- Caparol Indeko-plus – Innenfarbe
(
  'Caparol Indeko-plus', 'Innenfarbe',
  'Emulsionsfarbe für anspruchsvolle Innenwände. Nassabriebklasse 2, Kontrastverhältnis > 99,5 %. Besonders geeignet für Wohnräume und Büros.',
  '[{"name":"2,5 Liter","price":22.50},{"name":"5 Liter","price":39.90},{"name":"10 Liter","price":72.00},{"name":"15 Liter","price":99.00}]',
  true, 11
),

-- Caparol Capalatex – Hochwertige Wandfarbe
(
  'Caparol Capalatex', 'Innenfarbe',
  'Hochwertige Innenfarbe mit seidenmatter Oberfläche. Strapazierfähig, reinigungsfähig (Nassabrieb Kl. 1). Ideal für stark beanspruchte Räume, Flure, Küchen.',
  '[{"name":"2,5 Liter","price":34.90},{"name":"5 Liter","price":62.00},{"name":"10 Liter","price":109.00}]',
  true, 12
),

-- Alligator Weißwand
(
  'Alligator Weißwand Plus', 'Innenfarbe',
  'Hochdeckende weiße Innenfarbe. Extra weiß, Klasse 1 nach DIN EN 13300. Geruchsarm, schnell trocknend. 1 Auftrag reicht.',
  '[{"name":"2,5 Liter","price":19.90},{"name":"5 Liter","price":34.50},{"name":"10 Liter","price":59.00},{"name":"15 Liter","price":82.00}]',
  true, 13
),

-- ============================================================
-- PRODUKTE: Grundierungen & Tiefgrund
-- ============================================================

(
  'Caparol Tiefgrund LF', 'Grundierung',
  'Lösemittelfreier Tiefgrund für saugende, sandende und kreidehaltige Untergründe. Innen und außen. Verhindert Ausblühungen. Auf Wasser-Basis, geruchsarm.',
  '[{"name":"1 Liter","price":9.50},{"name":"5 Liter","price":36.90},{"name":"10 Liter","price":64.00}]',
  true, 20
),

(
  'Caparol CapaGrund Universal', 'Grundierung',
  'Universell einsetzbare Haftgrundierung auf Dispersions-Basis. Ideal vor Dispersionsfarben, Lacken und Putzen. Innen und außen verwendbar.',
  '[{"name":"750 ml","price":12.50},{"name":"5 Liter","price":44.90},{"name":"10 Liter","price":79.00}]',
  true, 21
),

(
  'Caparol Haftgrund', 'Grundierung',
  'Schnell trocknender Haftvermittler für glatte, wenig saugende Untergründe (Fliesen, Glas, Metall). Innen und außen. Lösemittelfrei.',
  '[{"name":"750 ml","price":16.90},{"name":"5 Liter","price":69.00}]',
  true, 22
),

-- ============================================================
-- PRODUKTE: Fassadenfarben
-- ============================================================

(
  'Caparol Muresko', 'Fassadenfarbe',
  'Premium-Siliconharzfarbe für Fassaden. Wasserabweisend (Lotuseffekt), hoch deckend, langlebig. Schützt vor Algen und Schimmel. 10 Jahre Gewährleistung.',
  '[{"name":"5 Liter","price":59.90},{"name":"10 Liter","price":105.00},{"name":"15 Liter","price":149.00}]',
  true, 30
),

(
  'Caparol Capatect Fassadenfarbe', 'Fassadenfarbe',
  'Wetterschutzfarbe für Außenwände auf Dispersionsbasis. Diffusionsfähig, wasserabweisend, UV-stabil. Ideal für mineralische Untergründe.',
  '[{"name":"5 Liter","price":42.90},{"name":"10 Liter","price":79.00},{"name":"15 Liter","price":109.00}]',
  true, 31
),

-- ============================================================
-- PRODUKTE: Lacke & Holzschutz
-- ============================================================

(
  'Caparol Capalac Aqua Holzlack glänzend', 'Lack',
  'Wasserbasierter Holzlack für Türen, Fenster, Möbel und Holzteile innen. Hochglänzend, strapazierfähig, schnell trocknend. Lösemittelarm.',
  '[{"name":"375 ml","price":12.90},{"name":"750 ml","price":19.90},{"name":"2,5 Liter","price":54.00}]',
  true, 40
),

(
  'Caparol Capacryl PU-Satin', 'Lack',
  'Seidenglänzender Alkydharzlack auf Wasserbasis für Holz- und Metalluntergründe. Innen und außen. Sehr harte und strapazierfähige Oberfläche.',
  '[{"name":"750 ml","price":22.50},{"name":"2,5 Liter","price":62.00},{"name":"5 Liter","price":109.00}]',
  true, 41
),

(
  'Caparol Capadur Holzlasur', 'Lasur & Holzschutz',
  'Dünnschicht-Holzlasur für Holzuntergründe außen. UV-Schutz, wasserabweisend, atmungsaktiv. Erhältlich in 12 Farbtönen. Einfache Nachbehandlung.',
  '[{"name":"750 ml","price":14.90},{"name":"2,5 Liter","price":39.90},{"name":"5 Liter","price":69.00}]',
  true, 42
),

-- ============================================================
-- PRODUKTE: Tapeten
-- ============================================================

(
  'Erfurt Mav Raufasertapete fein', 'Tapete',
  'Klassische Raufasertapete, feine Struktur. Überstreichbar, hohe Deckkraft. 25 m² pro Rolle. Einfache Verarbeitung, ideal für glatte und leicht unebene Wände.',
  '[{"name":"Einzelrolle (25 m²)","price":7.90},{"name":"5 Rollen","price":36.50},{"name":"10 Rollen","price":69.00}]',
  true, 50
),

(
  'Erfurt Mav Raufasertapete grob', 'Tapete',
  'Raufasertapete mit grober Struktur für rustikalen Look. Überstreichbar. 25 m² pro Rolle. Kaschiert Unebenheiten optimal.',
  '[{"name":"Einzelrolle (25 m²)","price":8.50},{"name":"5 Rollen","price":39.50},{"name":"10 Rollen","price":74.00}]',
  true, 51
),

(
  'Rasch Vlies-Tapete weiß strukturiert', 'Tapete',
  'Moderne Vliestapete mit leichter 3D-Struktur. Überstreichbar (bis zu 8x). Leicht zu verarbeiten, reißfest nass, kein Einweichen nötig. 10,05 × 0,53 m pro Rolle.',
  '[{"name":"Einzelrolle","price":12.90},{"name":"5 Rollen","price":59.00}]',
  true, 52
),

(
  'Marburg Glasgewebe grob', 'Tapete',
  'Glasgewebe-Tapete für hohe Beanspruchung. Ideal für Treppenhäuser, Garagen, Kellerwände. Überstreichbar. 25 m² pro Rolle. Sehr reißfest.',
  '[{"name":"Einzelrolle (25 m²)","price":19.50},{"name":"5 Rollen","price":89.00}]',
  true, 53
),

(
  'Pufas Tapetenkleister extra stark', 'Tapeten-Zubehör',
  'Universeller Tapetenkleister für alle Tapeten-Typen. Auch geeignet für Glasgewebe und schwere Tapeten. Ergibt ca. 40 Liter Kleister.',
  '[{"name":"200 g (Einzelpackung)","price":2.90},{"name":"5 × 200 g Sparpack","price":12.90}]',
  true, 54
),

-- ============================================================
-- PRODUKTE: Spachtelmassen & Putze
-- ============================================================

(
  'Caparol Capatect Innenputz Q2 Fertigspachtel', 'Spachtel & Putz',
  'Glattspachtel für Innenwände, gebrauchsfertig. Qualitätsstufe Q2. Rissüberbrückend, schleifbar. Ideal zur Untergrundvorbereitung vor Tapezier- und Malerarbeiten.',
  '[{"name":"5 kg","price":14.90},{"name":"20 kg Eimer","price":29.90}]',
  true, 60
),

(
  'Ardex A 45 Schnellspachtel', 'Spachtel & Putz',
  'Schnell erhärtender Reparaturspachtel für Innen und Außen. Verarbeitungszeit ca. 45 Minuten, nach 3–4 Std. begehbar. Für Risse, Löcher, Ausbrüche.',
  '[{"name":"5 kg","price":11.90},{"name":"25 kg Sack","price":44.00}]',
  true, 61
),

-- ============================================================
-- PRODUKTE: Bodenbeläge
-- ============================================================

(
  'Gerflor Vinyl-Klickboden (PVC)', 'Bodenbelag',
  'Gerflor Creation 55 – Wasserfester Klick-Vinylboden. 5 mm dick, integrierte Trittschalldämmung. Robust, kratzer- und wasserresistent. Ideal für Bad, Küche, Flur.',
  '[{"name":"per m² (mind. 5 m²)","price":24.90}]',
  true, 70
),

(
  'Wineo 400 Laminat 8 mm', 'Bodenbelag',
  'Wineo 400 Wood – Laminat mit realistischer Holzoptik. 8 mm, Klasse AC4 (Nutzungsklasse 32). Mit Klick-System. Für Wohn- und Geschäftsräume.',
  '[{"name":"per m² (Paket ca. 2,5 m²)","price":16.50}]',
  true, 71
),

(
  'Tretford Teppichfliesen', 'Bodenbelag',
  'Hochwertige Kameelhaar-Teppichfliesen 50 × 50 cm. Schallabsorbierend, antistatisch, pflegeleicht. Ideal für Büros und Wohnräume. Viele Farbtöne verfügbar.',
  '[{"name":"pro Fliese (50×50 cm)","price":8.90},{"name":"10er Pack (2,5 m²)","price">82.00}]',
  true, 72
),

-- ============================================================
-- PRODUKTE: Werkzeuge & Maschinen
-- ============================================================

(
  'Jaeger Malerpinsel Set (4-teilig)', 'Werkzeug',
  'Profi-Malerpinsel-Set aus China-Borsten: 12 mm, 20 mm, 30 mm, 40 mm. Für Lacke, Lasuren und Dispersionsfarben. Abstreifring aus Edelstahl.',
  '[{"name":"4-teiliges Set","price":18.90}]',
  true, 80
),

(
  'Malerrolle 18 cm Profi-Fell', 'Werkzeug',
  'Hochwertige Profi-Fellrolle für glatte bis leicht strukturierte Untergründe. Kompatibel mit 6 mm und 8 mm Walzenrahmen. Für Dispersionsfarben und Lacke.',
  '[{"name":"Einzelrolle","price":5.90},{"name":"5er Pack","price">24.90}]',
  true, 81
),

(
  'Wagner W180P Airless-Gerät', 'Maschine',
  'Professionelles Airless-Sprühgerät für mittlere Projekte. Ideal für Innenfarben und dünne Lacke. Max. 120 bar, 0,9 l/min Durchfluss. Mit Sprühpistole und 10 m Schlauch.',
  '[{"name":"Komplett-Set","price":349.00}]',
  true, 82
),

(
  'Festool PLANEX LHS 2 225', 'Maschine',
  'Professionelle Langhalsschleifmaschine für Wände und Decken. Mit LED-Beleuchtung, stufenloser Drehzahlregelung. Systemkompatibel mit Festool Absaugung.',
  '[{"name":"Gerät ohne Absaugung","price">890.00},{"name":"Set mit CT26-Absaugung","price">1249.00}]',
  true, 83
),

(
  'Mirka DEROS 5650CV Exzenterschleifer', 'Maschine',
  'Netz-Exzenterschleifer mit 5 mm Hub. Staubfrei dank Direktabsaugung. Leicht (780 g), vibrationsarm. Für Holz, Spachtel und Lackuntergründe.',
  '[{"name":"Gerät inkl. Schleifteller","price":299.00}]',
  true, 84
),

-- ============================================================
-- PRODUKTE: Verbrauchsmaterialien & Zubehör
-- ============================================================

(
  'Tesa Professional Abklebeband', 'Verbrauchsmaterial',
  'Professionelles Abklebeband, rückstandsfrei abziehbar (bis 14 Tage). Scharfe Farbkante. UV-beständig. Für Innen- und Außenanwendungen.',
  '[{"name":"19 mm × 50 m","price":3.50},{"name":"38 mm × 50 m","price":5.90},{"name":"50 mm × 50 m","price":7.50}]',
  true, 90
),

(
  'Malerfolie mit Abklebeband', 'Verbrauchsmaterial',
  'Vorgefaltete Schutzfolie mit integriertem Abklebeband. Breite 55 cm oder 110 cm, Länge 33 m. Schützt Böden, Fensterbänke und Möbel. Schnell auszurollen.',
  '[{"name":"55 cm × 33 m","price":4.90},{"name":"110 cm × 33 m","price">7.90},{"name":"180 cm × 33 m","price">11.90}]',
  true, 91
),

(
  'Mirka Schleifpapier Abranet', 'Verbrauchsmaterial',
  'Gitternetz-Schleifscheibe mit optimaler Staubabsaugung. Für Exzenterschleifer ⌀ 125 mm. Körnung K80 bis K320 verfügbar. Langlebig und gleichmäßig abrasiv.',
  '[{"name":"K80 (10er Pack)","price":14.90},{"name":"K120 (10er Pack)","price":13.90},{"name":"K180 (10er Pack)","price":13.50},{"name":"K240 (10er Pack)","price">13.50}]',
  true, 92
),

(
  'Mixol Abtönkonzentrat', 'Verbrauchsmaterial',
  'Hochkonzentrierte Abtönpaste für alle Farb-Typen (Dispersions-, Alkyd-, Kunstharzlacke). 1 Tube à 20 ml. Über 30 Farbtöne verfügbar. Sehr ergiebig.',
  '[{"name":"Einzeltube 20 ml (Farbton wählen)","price">3.90},{"name":"10er Set (Grundtöne)","price">32.00}]',
  true, 93
),

(
  'Sika Dichtstoff Universal weiß', 'Verbrauchsmaterial',
  'Universeller Acryl-Dichtstoff für Innenanwendungen. Für Fugen an Fenstern, Türen, Sockelleisten. Überstreichbar, elastisch, schimmelresistent.',
  '[{"name":"310 ml Kartusche","price":4.90},{"name":"10er Pack","price":43.00}]',
  true, 94
),

(
  'Layher Rollgerüst Basic 300', 'Leiter & Gerüst',
  'Mobiles Fahrgerüst bis 3 m Arbeitshöhe. Mit Rollen (zwei mit Feststellbremse). Plattformgröße 70 × 135 cm. Schnell auf- und abbaubar, EN1004 geprüft.',
  '[{"name":"Komplett-Set","price":349.00}]',
  true, 95
),

(
  'Arbeitsbekleidung Maler-Bundhose', 'Arbeitsschutz',
  'Robuste Bundhose für Maler und Trockenbauer. 65 % Polyester, 35 % Baumwolle. Viele Taschen, Kniepolstertaschen. Farbe: Weiß. Größen S–4XL.',
  '[{"name":"Größe S","price":39.90},{"name":"Größe M","price":39.90},{"name":"Größe L","price":39.90},{"name":"Größe XL","price":39.90},{"name":"Größe XXL","price":44.90}]',
  true, 96
);

-- ============================================================
-- ANGEBOTE: Realistische saisonale Aktionen
-- ============================================================

INSERT INTO public.offers (title, description, original_price, offer_price, badge_text, valid_from, valid_until, active, sort_order) VALUES

(
  'Caparol Amphibolin 10 Liter – Sommeraktion',
  'Jetzt im Sommer sparen! Unsere meistverkaufte Universalfarbe im attraktiven Aktionspreis. Hochdeckend, lösemittelfrei, für Innen und Außen. Solange der Vorrat reicht.',
  89.00, 74.90, '-16%',
  CURRENT_DATE, CURRENT_DATE + INTERVAL '21 days', true, 1
),

(
  'Tesa Profi-Abklebeband – Probierpack',
  '3 Rollen 19 mm × 50 m zum Sparpreis. Rückstandsfrei, scharfe Kante, auch für Außen geeignet. Ideal für den täglichen Einsatz auf der Baustelle.',
  10.50, 8.90, '3 für 2',
  CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days', true, 2
),

(
  'Caparol Tiefgrund LF 10 Liter',
  'Der Klassiker unter den Tiefgründen jetzt im Aktionspreis. Lösemittelfrei, vielseitig einsetzbar, für innen und außen. Professionelle Qualität zum attraktiven Preis.',
  64.00, 52.90, 'Tipp',
  CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', true, 3
),

(
  'Gerflor Vinyl-Klickboden – Musterpaket gratis',
  'Beim Kauf von mind. 20 m² Gerflor Creation 55 erhalten Sie ein kostenloses Musterpaket (4 Dekore à 50 × 50 cm) zur Ansicht. Einfach bei Bestellung vermerken.',
  NULL, NULL, 'Neu',
  CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', true, 4
),

(
  'Mirka Abranet 10er Pack – 20 % auf alle Körnungen',
  'Professionelle Gitterschleifscheiben ⌀ 125 mm jetzt 20 % günstiger. Alle Körnungen K80 bis K320 im Angebot. Ideal für Exzenterschleifer. Nur solange Vorrat reicht.',
  14.90, 11.90, '-20%',
  CURRENT_DATE, CURRENT_DATE + INTERVAL '10 days', true, 5
),

(
  'Erfurt Raufaser fein – Aktionspaket 10 Rollen',
  '10 Rollen Erfurt Mav Raufasertapete (fein) im Aktionspaket. Reicht für ca. 250 m² Wandfläche. Schnell tapeziert, viele Jahre überstreichbar. Jetzt noch günstiger!',
  79.00, 64.90, '-18%',
  CURRENT_DATE, CURRENT_DATE + INTERVAL '28 days', true, 6
);

-- ============================================================
-- KATALOGE: Beispiel-Einträge
-- ============================================================

INSERT INTO public.catalogs (title, description, file_url, active, sort_order, published_at) VALUES
(
  'Caparol Hauptkatalog 2026',
  'Das komplette Caparol-Sortiment: Innenfarben, Fassadenfarben, Lacke, Grundierungen und Zubehör. Über 500 Seiten mit technischen Datenblättern und Farbkarten.',
  'https://www.caparol.de/kataloge/hauptkatalog-2026.pdf',
  true, 1,
  NOW()
),
(
  'Caparol Farbtonkarte 3D System',
  'Vollständige Farbtonkarte mit über 2.400 Caparol-Farbtönen im 3D-System. Für individuelle Farbmischungen. Perfekte Orientierung bei der Farbauswahl.',
  'https://www.caparol.de/kataloge/farbtonkarte-3d.pdf',
  true, 2,
  NOW()
),
(
  'Werkzeuge & Maschinen 2026',
  'Unser komplettes Werkzeug-Sortiment: Malerwerkzeug, Elektrogeräte, Schleifmaschinen, Sprühgeräte, Leitern und Gerüste von Jaeger, Festool, Mirka, Wagner, Layher.',
  'https://www.weicken-schmidt.de/kataloge/werkzeuge-2026.pdf',
  true, 3,
  NOW()
),
(
  'Bodenbeläge & Wand-Zubehör 2026',
  'Design-Bodenbeläge, Laminat, Parkett, Kork und Teppich. Plus Tapeten, Glasgewebe, Kleister und Wandzubehör von Gerflor, Wineo, Tretford, Rasch, Erfurt, Marburg.',
  'https://www.weicken-schmidt.de/kataloge/boden-wand-2026.pdf',
  true, 4,
  NOW()
);

-- ============================================================
-- HINWEIS ZU BENUTZERN & ADMIN
-- ============================================================
-- Sobald du dich in der App registriert hast:
-- 1. Gehe in Supabase → Table Editor → profiles
-- 2. Setze deine eigene Zeile: role = 'admin'
-- Das ist der einzige manuelle Schritt, den du im Browser machen musst!
-- Danach läuft alles über die App selbst.
-- ============================================================
