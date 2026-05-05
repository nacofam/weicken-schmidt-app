import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, isWeekend, addDays, isBefore, startOfToday } from 'date-fns'
import { de } from 'date-fns/locale'

// Tailwind-Klassen zusammenführen
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Datum formatieren (deutsch)
export function formatDate(date: string | Date, formatStr = 'dd.MM.yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, formatStr, { locale: de })
}

// Datum + Uhrzeit formatieren
export function formatDateTime(date: string | Date): string {
  return formatDate(date, "dd.MM.yyyy 'um' HH:mm 'Uhr'")
}

// Preis formatieren (€)
export function formatPrice(price: number | null | undefined): string {
  if (price == null) return '–'
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

// Prüft ob ein Datum ein Wochentag ist (kein Wochenende)
export function isWeekday(date: Date): boolean {
  return !isWeekend(date)
}

// Gibt die nächsten N Öffnungstage ab heute zurück (min. 1 Tag Vorlauf)
// Weicken & Schmidt Witten: Mo–Do 7:00–16:30, Fr 7:00–15:00, Sa+So geschlossen
export function getNextWorkdays(count: number = 14): Date[] {
  const days: Date[] = []
  let current = addDays(startOfToday(), 1) // Mindestens morgen

  while (days.length < count) {
    if (!isClosedDay(current)) {
      days.push(current)
    }
    current = addDays(current, 1)
  }

  return days
}

// Prüft ob ein Datum in der Vergangenheit liegt
export function isPastDate(date: Date): boolean {
  return isBefore(date, startOfToday())
}

// Öffnungszeiten des Ladens (für Kalender-Disabling)
// Weicken & Schmidt Witten: Mo–Do 7:00–16:30, Fr 7:00–15:00
// Sa und So: GESCHLOSSEN
export function isClosedDay(date: Date): boolean {
  const day = date.getDay() // 0=So, 6=Sa
  return day === 0 || day === 6 // Wochenende geschlossen
}

// Öffnungszeit-Label für einen Wochentag
export function getOpeningHours(date: Date): string {
  const day = date.getDay()
  if (day === 5) return '7:00 – 15:00 Uhr'
  if (day >= 1 && day <= 4) return '7:00 – 16:30 Uhr'
  return 'geschlossen'
}

// Kürzt langen Text ab
export function truncate(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '…'
}

// Initialen aus Name extrahieren
export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
