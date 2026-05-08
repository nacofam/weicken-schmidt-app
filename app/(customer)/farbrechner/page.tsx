'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calculator, ChevronRight, Info, Paintbrush } from 'lucide-react'

const PAINT_TYPES = [
  { id: 'innen', label: 'Innenfarbe', coverage: 12, product: 'Caparol Indeko Plus' },
  { id: 'decke', label: 'Deckenfarbe', coverage: 10, product: 'Caparol Deckenweiss' },
  { id: 'aussen', label: 'Fassadenfarbe', coverage: 8, product: 'Caparol Muresko' },
  { id: 'lack', label: 'Holz & Lack', coverage: 14, product: 'Caparol Capacryl' },
]

const SIZES = [
  { label: '1 L', value: 1 },
  { label: '2,5 L', value: 2.5 },
  { label: '5 L', value: 5 },
  { label: '10 L', value: 10 },
  { label: '15 L', value: 15 },
]

export default function FarbrechnerPage() {
  const [paintType, setPaintType] = useState(PAINT_TYPES[0])
  const [laenge, setLaenge] = useState('')
  const [breite, setBreite] = useState('')
  const [hoehe, setHoehe] = useState('')
  const [anstriche, setAnstriche] = useState(2)
  const [tuerCount, setTuerCount] = useState(1)
  const [fensterCount, setFensterCount] = useState(2)
  const [deckeIncluded, setDeckeIncluded] = useState(false)

  const l = parseFloat(laenge) || 0
  const b = parseFloat(breite) || 0
  const h = parseFloat(hoehe) || 0

  const wandFlaeche = 2 * (l + b) * h
  const deckeFlaeche = deckeIncluded ? l * b : 0
  const abzug = (tuerCount * 2.0) + (fensterCount * 1.5)
  const nettoFlaeche = Math.max(0, wandFlaeche + deckeFlaeche - abzug)
  const gesamtFlaeche = nettoFlaeche * anstriche
  const liter = gesamtFlaeche / paintType.coverage
  const literAufgerundet = Math.ceil(liter * 10) / 10

  const besteGroesse = SIZES.find(s => s.value >= literAufgerundet) || SIZES[SIZES.length - 1]

  const hatEingabe = l > 0 && b > 0 && h > 0

  return (
    <div className="px-4 py-5 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
          <Calculator size={22} className="text-brand-500" />
          Mengenrechner
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Berechne genau wie viel Farbe du brauchst
        </p>
      </div>

      {/* Farbart */}
      <section className="card space-y-3">
        <p className="font-semibold text-sm text-neutral-700">Was möchtest du streichen?</p>
        <div className="grid grid-cols-2 gap-2">
          {PAINT_TYPES.map(pt => (
            <button
              key={pt.id}
              onClick={() => setPaintType(pt)}
              className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-colors text-left ${
                paintType.id === pt.id
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-neutral-200 bg-white text-neutral-600'
              }`}
            >
              {pt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Raummaße */}
      <section className="card space-y-4">
        <p className="font-semibold text-sm text-neutral-700">Raummaße (in Meter)</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Länge', value: laenge, setter: setLaenge, placeholder: 'z.B. 5' },
            { label: 'Breite', value: breite, setter: setBreite, placeholder: 'z.B. 4' },
            { label: 'Höhe', value: hoehe, setter: setHoehe, placeholder: 'z.B. 2,5' },
          ].map(field => (
            <div key={field.label}>
              <label className="text-xs text-neutral-500 mb-1 block">{field.label}</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                value={field.value}
                onChange={e => field.setter(e.target.value)}
                placeholder={field.placeholder}
                className="w-full border border-neutral-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          ))}
        </div>

        {/* Decke mit einrechnen */}
        <button
          onClick={() => setDeckeIncluded(!deckeIncluded)}
          className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl border-2 transition-colors w-full ${
            deckeIncluded
              ? 'border-brand-500 bg-brand-50 text-brand-700'
              : 'border-neutral-200 text-neutral-500'
          }`}
        >
          <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 ${
            deckeIncluded ? 'border-brand-500 bg-brand-500' : 'border-neutral-400'
          }`}>
            {deckeIncluded && <span className="text-white text-xs">✓</span>}
          </div>
          Decke mit einrechnen (+{l > 0 && b > 0 ? (l * b).toFixed(1) : '?'} m²)
        </button>
      </section>

      {/* Türen & Fenster */}
      <section className="card space-y-4">
        <p className="font-semibold text-sm text-neutral-700">Abzüge</p>
        <div className="flex gap-6">
          {[
            { label: 'Türen', sub: '(je 2,0 m²)', value: tuerCount, setter: setTuerCount },
            { label: 'Fenster', sub: '(je 1,5 m²)', value: fensterCount, setter: setFensterCount },
          ].map(item => (
            <div key={item.label} className="flex-1">
              <p className="text-xs text-neutral-500 mb-1">{item.label} <span className="text-neutral-400">{item.sub}</span></p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => item.setter(Math.max(0, item.value - 1))}
                  className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-600 font-bold text-lg flex items-center justify-center"
                >−</button>
                <span className="font-semibold text-neutral-800 w-4 text-center">{item.value}</span>
                <button
                  onClick={() => item.setter(item.value + 1)}
                  className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-600 font-bold text-lg flex items-center justify-center"
                >+</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Anstriche */}
      <section className="card space-y-3">
        <p className="font-semibold text-sm text-neutral-700">Anzahl Anstriche</p>
        <div className="flex gap-2">
          {[1, 2, 3].map(n => (
            <button
              key={n}
              onClick={() => setAnstriche(n)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                anstriche === n
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-neutral-200 text-neutral-500'
              }`}
            >
              {n}× {n === 1 ? '(1 Anstrich)' : n === 2 ? '(Standard)' : '(Vollton)'}
            </button>
          ))}
        </div>
        <p className="text-xs text-neutral-400 flex items-start gap-1">
          <Info size={12} className="shrink-0 mt-0.5" />
          Für Volltöne oder dunkle Farben empfehlen wir 3 Anstriche
        </p>
      </section>

      {/* Ergebnis */}
      {hatEingabe ? (
        <section className="rounded-2xl bg-brand-500 text-white p-5 space-y-4">
          <div className="text-center">
            <p className="text-brand-100 text-sm mb-1">Du brauchst ca.</p>
            <p className="text-5xl font-bold">{literAufgerundet.toFixed(1)} L</p>
            <p className="text-brand-200 text-sm mt-1">{paintType.product}</p>
          </div>

          <div className="bg-white/10 rounded-xl p-3 text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-brand-100">Wandfläche</span>
              <span className="font-medium">{wandFlaeche.toFixed(1)} m²</span>
            </div>
            {deckeIncluded && (
              <div className="flex justify-between">
                <span className="text-brand-100">Deckenfläche</span>
                <span className="font-medium">{(l * b).toFixed(1)} m²</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-brand-100">Abzüge (Türen/Fenster)</span>
              <span className="font-medium">−{abzug.toFixed(1)} m²</span>
            </div>
            <div className="flex justify-between border-t border-white/20 pt-1.5">
              <span className="text-brand-100">Nettofläche × {anstriche} Anstriche</span>
              <span className="font-medium">{gesamtFlaeche.toFixed(1)} m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-100">Ergiebigkeit</span>
              <span className="font-medium">{paintType.coverage} m²/L</span>
            </div>
          </div>

          <div>
            <p className="text-brand-100 text-xs mb-2">Empfohlene Gebindegröße:</p>
            <div className="flex gap-2 flex-wrap">
              {SIZES.filter(s => s.value >= literAufgerundet).slice(0, 2).map(s => (
                <span key={s.value} className={`px-3 py-1 rounded-full text-sm font-medium ${
                  s.value === besteGroesse.value ? 'bg-white text-brand-600' : 'bg-white/20 text-white'
                }`}>
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          <Link
            href="/farbmischung"
            className="flex items-center justify-center gap-2 bg-white text-brand-600 font-semibold py-3 rounded-xl text-sm"
          >
            <Paintbrush size={16} />
            Direkt zum Farbmischservice
            <ChevronRight size={14} />
          </Link>
        </section>
      ) : (
        <div className="card text-center py-8 text-neutral-400">
          <Calculator size={36} className="mx-auto mb-3 text-neutral-200" />
          <p className="text-sm">Gib die Raummaße ein um die benötigte Menge zu berechnen</p>
        </div>
      )}

      {/* Hinweis */}
      <p className="text-xs text-neutral-400 text-center pb-4">
        Richtwert bei glatter Wandfläche und normalen Bedingungen. Bei rauem Untergrund ca. 15–20% mehr einkalkulieren.
      </p>
    </div>
  )
}
