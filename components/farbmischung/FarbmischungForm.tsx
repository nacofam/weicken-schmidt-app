'use client'

import { useState } from 'react'
import { Send, Droplets, ChevronLeft, X } from 'lucide-react'
import toast from 'react-hot-toast'
import ColorScanner, { type ScannedColor } from './ColorScanner'

// ─── Basis-Produkte (Farbeimer) ───────────────────────────────────────────────
const PAINT_BASES = [
  {
    id: 'caparol-indeko',
    brand: 'Caparol',
    name: 'Indeko-plus',
    desc: 'Innenfarbe Wohnraum',
    brandColor: '#E8333A',
    img: 'https://www.caparol.de/fileadmin/caparol/Produkte/Dispersionsfarben/Indeko-plus/Indeko-plus_10L.png',
  },
  {
    id: 'caparol-muresko',
    brand: 'Caparol',
    name: 'Muresko',
    desc: 'Fassadenfarbe',
    brandColor: '#E8333A',
    img: 'https://www.caparol.de/fileadmin/caparol/Produkte/Fassadenfarben/Muresko/Muresko_10L.png',
  },
  {
    id: 'caparol-capazinn',
    brand: 'Caparol',
    name: 'CapaZinn',
    desc: 'Metallschutzlack',
    brandColor: '#E8333A',
    img: 'https://www.caparol.de/fileadmin/caparol/Produkte/Lacke/CapaZinn/CapaZinn_750ml.png',
  },
  {
    id: 'sigma-s2u',
    brand: 'Sigma',
    name: 'S2U Nova',
    desc: 'Acryllack seidenmatt',
    brandColor: '#005CA9',
    img: 'https://www.sigma-coatings.de/media/products/s2u-nova.png',
  },
  {
    id: 'dorken-delta',
    brand: 'Dörken',
    name: 'Delta-Therm',
    desc: 'Wärmedämmfarbe',
    brandColor: '#1A3C6E',
    img: 'https://www.doerken.de/media/products/delta-therm.png',
  },
  {
    id: 'caparol-disboxan',
    brand: 'Caparol',
    name: 'Disboxan 485',
    desc: 'Fassadenhydrophob.',
    brandColor: '#E8333A',
    img: 'https://www.caparol.de/fileadmin/caparol/Produkte/Impraegnierungen/Disboxan-485/Disboxan-485_10L.png',
  },
]

// ─── Farbkarten ───────────────────────────────────────────────────────────────
type ColorEntry = { code: string; name: string; hex: string }

const RAL_COLORS: ColorEntry[] = [
  { code: 'RAL 1000', name: 'Grünbeige', hex: '#BEBD7F' },
  { code: 'RAL 1001', name: 'Beige', hex: '#C2B078' },
  { code: 'RAL 1002', name: 'Sandgelb', hex: '#C6A664' },
  { code: 'RAL 1003', name: 'Signalgelb', hex: '#E5BE01' },
  { code: 'RAL 1004', name: 'Goldgelb', hex: '#CDA434' },
  { code: 'RAL 1006', name: 'Maisgelb', hex: '#E4A010' },
  { code: 'RAL 1007', name: 'Narzissengelb', hex: '#DC9D00' },
  { code: 'RAL 2000', name: 'Gelborange', hex: '#ED760E' },
  { code: 'RAL 2001', name: 'Rotorange', hex: '#C93C20' },
  { code: 'RAL 2003', name: 'Pastellorange', hex: '#FF7514' },
  { code: 'RAL 2004', name: 'Reinorange', hex: '#F44611' },
  { code: 'RAL 2009', name: 'Verkehrsorange', hex: '#F97D21' },
  { code: 'RAL 3000', name: 'Feuerrot', hex: '#AF2B1E' },
  { code: 'RAL 3002', name: 'Karminrot', hex: '#A2231D' },
  { code: 'RAL 3003', name: 'Rubinrot', hex: '#9B111E' },
  { code: 'RAL 3012', name: 'Beigerot', hex: '#C1876B' },
  { code: 'RAL 3014', name: 'Altrosa', hex: '#D36E70' },
  { code: 'RAL 3015', name: 'Hellrosa', hex: '#EA899A' },
  { code: 'RAL 3018', name: 'Erdbeerrot', hex: '#D53032' },
  { code: 'RAL 3020', name: 'Verkehrsrot', hex: '#CC0605' },
  { code: 'RAL 3022', name: 'Lachsrot', hex: '#D95030' },
  { code: 'RAL 3027', name: 'Himbeerrot', hex: '#C51D34' },
  { code: 'RAL 4001', name: 'Rotlila', hex: '#6D3F5B' },
  { code: 'RAL 4003', name: 'Erikaviolett', hex: '#DE4C8A' },
  { code: 'RAL 4005', name: 'Blaulila', hex: '#6C4675' },
  { code: 'RAL 4008', name: 'Signalviolett', hex: '#924E7D' },
  { code: 'RAL 4009', name: 'Pastellviolett', hex: '#A18594' },
  { code: 'RAL 5000', name: 'Violettblau', hex: '#354D73' },
  { code: 'RAL 5005', name: 'Signalblau', hex: '#1A3668' },
  { code: 'RAL 5007', name: 'Brillantblau', hex: '#3E5F8A' },
  { code: 'RAL 5009', name: 'Azurblau', hex: '#025669' },
  { code: 'RAL 5012', name: 'Lichtblau', hex: '#3B83BD' },
  { code: 'RAL 5014', name: 'Taubenblau', hex: '#606E8C' },
  { code: 'RAL 5015', name: 'Himmelblau', hex: '#2271B3' },
  { code: 'RAL 5017', name: 'Verkehrsblau', hex: '#063971' },
  { code: 'RAL 5018', name: 'Türkisblau', hex: '#3F888F' },
  { code: 'RAL 5021', name: 'Wasserblau', hex: '#256D7B' },
  { code: 'RAL 5024', name: 'Pastellblau', hex: '#5D9B9B' },
  { code: 'RAL 6002', name: 'Laubgrün', hex: '#2D572C' },
  { code: 'RAL 6005', name: 'Moosgrün', hex: '#1F3A3D' },
  { code: 'RAL 6009', name: 'Tannengrün', hex: '#27352A' },
  { code: 'RAL 6010', name: 'Grasgrün', hex: '#3E7C44' },
  { code: 'RAL 6011', name: 'Resedagrün', hex: '#6C8F71' },
  { code: 'RAL 6016', name: 'Türkisgrün', hex: '#1E5945' },
  { code: 'RAL 6017', name: 'Maigrün', hex: '#4C9141' },
  { code: 'RAL 6018', name: 'Gelbgrün', hex: '#57A639' },
  { code: 'RAL 6019', name: 'Weißgrün', hex: '#BDECB6' },
  { code: 'RAL 6024', name: 'Verkehrsgrün', hex: '#308446' },
  { code: 'RAL 6027', name: 'Lichtgrün', hex: '#84C3BE' },
  { code: 'RAL 6029', name: 'Mintgrün', hex: '#20603D' },
  { code: 'RAL 6034', name: 'Pastrelltürkis', hex: '#7FB5B5' },
  { code: 'RAL 7001', name: 'Silbergrau', hex: '#8A9597' },
  { code: 'RAL 7004', name: 'Signalgrau', hex: '#969992' },
  { code: 'RAL 7005', name: 'Mausgrau', hex: '#646B63' },
  { code: 'RAL 7011', name: 'Eisengrau', hex: '#434B4D' },
  { code: 'RAL 7015', name: 'Schiefergrau', hex: '#434750' },
  { code: 'RAL 7016', name: 'Anthrazitgrau', hex: '#293133' },
  { code: 'RAL 7021', name: 'Schwarzgrau', hex: '#23282B' },
  { code: 'RAL 7024', name: 'Graphitgrau', hex: '#474A51' },
  { code: 'RAL 7030', name: 'Steingrau', hex: '#8B8C7A' },
  { code: 'RAL 7032', name: 'Kieselgrau', hex: '#B8B799' },
  { code: 'RAL 7035', name: 'Lichtgrau', hex: '#D7D7D7' },
  { code: 'RAL 7037', name: 'Staubgrau', hex: '#7D7F7D' },
  { code: 'RAL 7038', name: 'Achatgrau', hex: '#B5B8B1' },
  { code: 'RAL 7040', name: 'Fenstergrau', hex: '#9DA1AA' },
  { code: 'RAL 7042', name: 'Verkehrsgrau A', hex: '#8D948D' },
  { code: 'RAL 7044', name: 'Seidengrau', hex: '#CAC4B0' },
  { code: 'RAL 7047', name: 'Telegrau 4', hex: '#D0D0D0' },
  { code: 'RAL 8001', name: 'Ockerbraun', hex: '#955F20' },
  { code: 'RAL 8003', name: 'Lehmbraun', hex: '#734222' },
  { code: 'RAL 8004', name: 'Kupferbraun', hex: '#8E402A' },
  { code: 'RAL 8007', name: 'Rehbraun', hex: '#59351F' },
  { code: 'RAL 8011', name: 'Nußbraun', hex: '#5B3A29' },
  { code: 'RAL 8012', name: 'Rotbraun', hex: '#592321' },
  { code: 'RAL 8014', name: 'Sepiabraun', hex: '#382C1E' },
  { code: 'RAL 8017', name: 'Schokoladebraun', hex: '#45322E' },
  { code: 'RAL 8019', name: 'Graubraun', hex: '#403A3A' },
  { code: 'RAL 8023', name: 'Orangebraun', hex: '#A65E2E' },
  { code: 'RAL 8024', name: 'Beigebraun', hex: '#79553D' },
  { code: 'RAL 8028', name: 'Terrabraun', hex: '#4E3B31' },
  { code: 'RAL 9001', name: 'Cremeweiß', hex: '#FDF4E3' },
  { code: 'RAL 9002', name: 'Grauweiß', hex: '#E7EBDA' },
  { code: 'RAL 9003', name: 'Signalweiß', hex: '#F4F4F4' },
  { code: 'RAL 9005', name: 'Tiefschwarz', hex: '#0A0A0A' },
  { code: 'RAL 9006', name: 'Weißaluminium', hex: '#A5A5A5' },
  { code: 'RAL 9010', name: 'Reinweiß', hex: '#FFFFFF' },
  { code: 'RAL 9011', name: 'Graphitschwarz', hex: '#1C1C1C' },
  { code: 'RAL 9016', name: 'Verkehrsweiß', hex: '#F6F6F6' },
  { code: 'RAL 9018', name: 'Papyrusweiß', hex: '#D7D7D7' },
]

const NCS_COLORS: ColorEntry[] = [
  { code: 'NCS S 0500-N', name: 'Arktisch Weiß', hex: '#F5F5F5' },
  { code: 'NCS S 0502-Y', name: 'Hellcreme', hex: '#F2EED8' },
  { code: 'NCS S 0505-Y20R', name: 'Pastellbeige', hex: '#EFE5C2' },
  { code: 'NCS S 1005-Y50R', name: 'Warmsand', hex: '#E0C9A6' },
  { code: 'NCS S 1020-Y30R', name: 'Pastellgelb', hex: '#E8D080' },
  { code: 'NCS S 2005-B20G', name: 'Nebelgrau', hex: '#A8B5B8' },
  { code: 'NCS S 2010-B30G', name: 'Eisblau', hex: '#92B4BE' },
  { code: 'NCS S 2020-B', name: 'Pastellblau', hex: '#6E9EBF' },
  { code: 'NCS S 2030-R90B', name: 'Taubenblau', hex: '#5578A8' },
  { code: 'NCS S 2050-B', name: 'Signalblau', hex: '#1A6896' },
  { code: 'NCS S 3005-G20Y', name: 'Salbeigrün', hex: '#8AA88A' },
  { code: 'NCS S 3020-G', name: 'Mintgrün', hex: '#5E9E7E' },
  { code: 'NCS S 3030-Y30R', name: 'Ockerlehm', hex: '#C49A40' },
  { code: 'NCS S 4000-N', name: 'Mittelgrau', hex: '#8E8E8E' },
  { code: 'NCS S 4010-B30G', name: 'Dunkelblaugrau', hex: '#607080' },
  { code: 'NCS S 4020-G30Y', name: 'Olivgrün', hex: '#647A50' },
  { code: 'NCS S 4040-R', name: 'Burgunderrot', hex: '#9E3030' },
  { code: 'NCS S 4550-R70B', name: 'Marineblau', hex: '#2A3D6E' },
  { code: 'NCS S 5000-N', name: 'Dunkelgrau', hex: '#696969' },
  { code: 'NCS S 5005-Y20R', name: 'Erdbrown', hex: '#7A5E3E' },
  { code: 'NCS S 6000-N', name: 'Graphit', hex: '#4A4A4A' },
  { code: 'NCS S 7000-N', name: 'Dunkelgraphit', hex: '#383838' },
  { code: 'NCS S 8000-N', name: 'Fast Schwarz', hex: '#222222' },
  { code: 'NCS S 9000-N', name: 'Tiefschwarz', hex: '#0E0E0E' },
]

const CAPAROL_COLORS: ColorEntry[] = [
  { code: 'Cap. 3D 10 Y 50 M 00', name: 'Lehmweiß', hex: '#E8DFC8' },
  { code: 'Cap. 3D 20 Y 30 M 10', name: 'Wüstensand', hex: '#DDD0AE' },
  { code: 'Cap. 3D 30 Y 20 M 00', name: 'Strohgelb', hex: '#E8D898' },
  { code: 'Cap. 3D 40 Y 50 M 00', name: 'Sonnengelb', hex: '#E8C840' },
  { code: 'Cap. 3D 10 R 60 Y 00', name: 'Lachsrosa', hex: '#E8C0A8' },
  { code: 'Cap. 3D 20 R 30 Y 10', name: 'Terrakotta', hex: '#C87850' },
  { code: 'Cap. 3D 30 R 20 Y 00', name: 'Signalrot', hex: '#C83020' },
  { code: 'Cap. 3D 10 B 60 G 00', name: 'Meeresblau', hex: '#68A8C8' },
  { code: 'Cap. 3D 20 B 40 G 00', name: 'Atlantikblau', hex: '#3878A8' },
  { code: 'Cap. 3D 30 B 20 G 00', name: 'Tiefblau', hex: '#184878' },
  { code: 'Cap. 3D 10 G 50 Y 00', name: 'Frühlingsgrün', hex: '#A8C878' },
  { code: 'Cap. 3D 20 G 30 Y 00', name: 'Waldgrün', hex: '#508050' },
  { code: 'Cap. 3D 30 G 20 B 00', name: 'Tannengrün', hex: '#285840' },
  { code: 'Cap. 3D 00 N 10 00', name: 'Alpinweiß', hex: '#F2F2F2' },
  { code: 'Cap. 3D 00 N 30 00', name: 'Hellgrau', hex: '#C8C8C8' },
  { code: 'Cap. 3D 00 N 50 00', name: 'Mittelgrau', hex: '#989898' },
  { code: 'Cap. 3D 00 N 70 00', name: 'Dunkelgrau', hex: '#606060' },
  { code: 'Cap. 3D 00 N 90 00', name: 'Anthrazit', hex: '#282828' },
  { code: 'Cap. Histolith Kalk', name: 'Naturkalk', hex: '#F0EDE0' },
  { code: 'Cap. Sensitiv 33', name: 'Pastellflieder', hex: '#C8B8D8' },
]

const SIGMA_COLORS: ColorEntry[] = [
  { code: 'SG 0503-Y', name: 'Wollweiß', hex: '#F0EAD6' },
  { code: 'SG 0907-Y30R', name: 'Frischcreme', hex: '#F5DDA0' },
  { code: 'SG 1510-R90B', name: 'Eisblau hell', hex: '#C5D8E8' },
  { code: 'SG 2030-B', name: 'Taubenblau hell', hex: '#90BAD8' },
  { code: 'SG 3040-B20G', name: 'Azur', hex: '#4090C0' },
  { code: 'SG 4550-R80B', name: 'Marineblau', hex: '#2A406A' },
  { code: 'SG 2020-G30Y', name: 'Salbei', hex: '#98C090' },
  { code: 'SG 3030-G', name: 'Mintgrün', hex: '#60A880' },
  { code: 'SG 5010-Y50R', name: 'Sandbrown', hex: '#B89060' },
  { code: 'SG 5030-Y20R', name: 'Ockerbraun', hex: '#C0884A' },
  { code: 'SG 6020-R20B', name: 'Weinrot', hex: '#983050' },
  { code: 'SG 3010-R50B', name: 'Altrose', hex: '#C07898' },
  { code: 'SG 5050-Y', name: 'Goldgelb', hex: '#C8A020' },
  { code: 'SG 4030-R', name: 'Koralle', hex: '#D06040' },
  { code: 'SG W-1 Weiß', name: 'Reinweiß', hex: '#F8F8F8' },
  { code: 'SG N-50 Grau', name: 'Mittelgrau', hex: '#909090' },
  { code: 'SG N-80 Dunkelgrau', name: 'Dunkelgrau', hex: '#404040' },
]

const DORKEN_COLORS: ColorEntry[] = [
  { code: 'Dörken DW-100', name: 'Arcticweiß', hex: '#F0F0EC' },
  { code: 'Dörken DW-105', name: 'Kalkweiß', hex: '#EDE8DC' },
  { code: 'Dörken DG-200', name: 'Hellgrau', hex: '#CACAC0' },
  { code: 'Dörken DG-205', name: 'Silbergrau', hex: '#A8A8A0' },
  { code: 'Dörken DG-210', name: 'Mittelgrau', hex: '#888880' },
  { code: 'Dörken DG-220', name: 'Schiefergrau', hex: '#585858' },
  { code: 'Dörken DG-230', name: 'Anthrazit', hex: '#363630' },
  { code: 'Dörken DB-300', name: 'Himmelblau', hex: '#7098C0' },
  { code: 'Dörken DB-305', name: 'Stahlblau', hex: '#486090' },
  { code: 'Dörken DB-310', name: 'Nachtblau', hex: '#283858' },
  { code: 'Dörken DGr-400', name: 'Hellgrün', hex: '#90C080' },
  { code: 'Dörken DGr-405', name: 'Moosgrün', hex: '#607048' },
  { code: 'Dörken DGr-410', name: 'Tannengrün', hex: '#304030' },
  { code: 'Dörken DR-500', name: 'Koralle', hex: '#D07060' },
  { code: 'Dörken DR-505', name: 'Ziegelrot', hex: '#A04030' },
  { code: 'Dörken DY-600', name: 'Sandgelb', hex: '#D8C080' },
  { code: 'Dörken DY-605', name: 'Ockergelb', hex: '#C09840' },
]

const COLOR_TABS: { id: string; label: string; colors: ColorEntry[] }[] = [
  { id: 'ral', label: 'RAL Classic', colors: RAL_COLORS },
  { id: 'ncs', label: 'NCS', colors: NCS_COLORS },
  { id: 'caparol', label: 'Caparol 3D', colors: CAPAROL_COLORS },
  { id: 'sigma', label: 'Sigma', colors: SIGMA_COLORS },
  { id: 'dorken', label: 'Dörken', colors: DORKEN_COLORS },
]

const BASE_TYPES = ['matt', 'seidenmatt', 'glänzend', 'hochglänzend']
const QUANTITIES = [1, 2.5, 5, 10]

function isLight(hex: string): boolean {
  const h = hex.replace('#', '')
  if (h.length < 6) return true
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 140
}

export default function FarbmischungForm() {
  const [form, setForm] = useState({
    color_system: 'RAL',
    color_code: '',
    color_name: '',
    base_type: 'matt',
    quantity_liters: '2.5',
    notes: '',
    desired_pickup_date: '',
  })
  const [selectedBase, setSelectedBase] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('ral')
  const [lightbox, setLightbox] = useState<ColorEntry | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const openLightbox = (color: ColorEntry) => { setLightbox(color) }

  const applyColor = (color: ColorEntry) => {
    const tab = COLOR_TABS.find(t => t.colors.includes(color))
    setForm(f => ({
      ...f,
      color_system: tab?.id === 'ral' ? 'RAL' : tab?.id === 'ncs' ? 'NCS' : tab?.id === 'caparol' ? 'Caparol' : tab?.id === 'sigma' ? 'Sigma' : 'Dörken',
      color_code: color.code,
      color_name: color.name,
    }))
    setLightbox(null)
  }


  const handleScannedColor = (color: ScannedColor) => {
    setForm(f => ({
      ...f,
      color_system: color.system,
      color_code: color.code,
      color_name: color.name,
    }))
    toast.success('Farbe erkannt: ' + color.code)
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.color_code && !form.color_name) {
      toast.error('Bitte wähle eine Farbe oder gib einen Farbcode ein.')
      return
    }
    setLoading(true)
    const baseProd = PAINT_BASES.find(b => b.id === selectedBase)
    const notesWithBase = [baseProd ? 'Basis-Produkt: ' + baseProd.brand + ' ' + baseProd.name : '', form.notes].filter(Boolean).join('\n')
    try {
      const res = await fetch('/api/farbmischung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, notes: notesWithBase }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Fehler')
      setSent(true)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Fehler beim Absenden.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="px-4 py-10 text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Droplets size={28} className="text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Anfrage gesendet!</h2>
        <p className="text-sm text-neutral-600 leading-relaxed">Wir haben deine Farbmischanfrage erhalten und melden uns bei dir.</p>
        <button
          onClick={() => { setSent(false); setSelectedBase(null); setForm({ color_system: 'RAL', color_code: '', color_name: '', base_type: 'matt', quantity_liters: '2.5', notes: '', desired_pickup_date: '' }) }}
          className="mt-6 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors"
        >Neue Anfrage</button>
      </div>
    )
  }

  const currentColors = COLOR_TABS.find(t => t.id === activeTab)?.colors ?? []

  return (
    <div className="px-4 py-5 pb-10">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-neutral-900">Farbmischservice</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Wähle Basis, Farbe und Menge – wir mischen für dich.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-sm font-semibold text-neutral-800 mb-2 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">1</span>
            Basis-Produkt wählen
          </p>
          <p className="text-xs text-neutral-400 mb-3">Das Produkt, in das wir deine Wunschfarbe einmischen.</p>
          <div className="grid grid-cols-2 gap-2.5">
            {PAINT_BASES.map(prod => (
              <button key={prod.id} type="button"
                onClick={() => setSelectedBase(prev => prev === prod.id ? null : prod.id)}
                className={'relative rounded-2xl border-2 overflow-hidden text-left transition-all ' + (selectedBase === prod.id ? 'border-purple-500 shadow-md shadow-purple-100' : 'border-neutral-200 hover:border-neutral-300')}
              >
                <div className="w-full h-24 flex items-center justify-center relative"
                  style={{ background: 'linear-gradient(135deg, ' + prod.brandColor + '18 0%, ' + prod.brandColor + '08 100%)' }}
                >
                  <img src={prod.img} alt={prod.name} className="h-20 w-auto object-contain drop-shadow-md"
                    onError={e => {
                      const t = e.currentTarget; t.style.display = 'none'
                      const p = t.parentElement
                      if (p && !p.querySelector('.fallback-bucket')) {
                        const fb = document.createElement('div')
                        fb.className = 'fallback-bucket flex items-center justify-center'
                        fb.innerHTML = '<span style="font-size:2.5rem">🪣</span>'
                        p.appendChild(fb)
                      }
                    }}
                  />
                  <span className="absolute top-2 left-2 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: prod.brandColor }}>{prod.brand}</span>
                  {selectedBase === prod.id && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  )}
                </div>
                <div className="px-2.5 py-2 bg-white">
                  <p className="text-xs font-semibold text-neutral-800 leading-tight">{prod.name}</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{prod.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-neutral-800 mb-2 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">2</span>
            Farbe aus Farbkarte wählen
          </p>
          <p className="text-xs text-neutral-400 mb-3">Tippe auf eine Farbe für die Detailansicht.</p>
                  <ColorScanner onColorDetected={handleScannedColor} />
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3">
            {COLOR_TABS.map(tab => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                className={'flex-none px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ' + (activeTab === tab.id ? 'bg-purple-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200')}
              >{tab.label}</button>
            ))}
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {currentColors.map(color => (
              <button key={color.code} type="button" title={color.code + ' · ' + color.name}
                onClick={() => openLightbox(color)}
                className={'aspect-square rounded-lg border-2 transition-all hover:scale-110 active:scale-95 ' + (form.color_code === color.code ? 'border-purple-500 shadow-md scale-110' : 'border-transparent hover:border-white hover:shadow-md')}
                style={{ background: color.hex }}
              />
            ))}
          </div>
          {form.color_code && (
            <div className="mt-3 flex items-center gap-2.5 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2">
              <div className="w-7 h-7 rounded-lg flex-none border border-black/10"
                style={{ background: [...RAL_COLORS, ...NCS_COLORS, ...CAPAROL_COLORS, ...SIGMA_COLORS, ...DORKEN_COLORS].find(c => c.code === form.color_code)?.hex ?? '#ccc' }}
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-neutral-800 truncate">{form.color_code}</p>
                <p className="text-[10px] text-neutral-400">{form.color_name}</p>
              </div>
              <button type="button" onClick={() => setForm(f => ({ ...f, color_code: '', color_name: '' }))} className="ml-auto text-neutral-400 hover:text-neutral-700">
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">Farbcode manuell eingeben <span className="text-neutral-400 font-normal">(oder aus Farbkarte)</span></label>
          <input type="text" value={form.color_code} onChange={e => setForm(f => ({ ...f, color_code: e.target.value }))}
            placeholder="z.B. RAL 3020, NCS S 2050-B"
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">Farbname <span className="text-neutral-400 font-normal">(optional)</span></label>
          <input type="text" value={form.color_name} onChange={e => setForm(f => ({ ...f, color_name: e.target.value }))}
            placeholder="z.B. Verkehrsrot, Himmelblau"
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">Oberfläche *</label>
          <div className="grid grid-cols-2 gap-2">
            {BASE_TYPES.map(base => (
              <button key={base} type="button" onClick={() => setForm(f => ({ ...f, base_type: base }))}
                className={'py-2 px-3 rounded-xl text-xs font-medium border transition-colors ' + (form.base_type === base ? 'bg-purple-500 text-white border-purple-500' : 'bg-white text-neutral-600 border-neutral-200 hover:border-purple-300')}
              >{base}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">Menge *</label>
          <div className="grid grid-cols-4 gap-2">
            {QUANTITIES.map(qty => (
              <button key={qty} type="button" onClick={() => setForm(f => ({ ...f, quantity_liters: qty.toString() }))}
                className={'py-2 rounded-xl text-xs font-medium border transition-colors ' + (form.quantity_liters === qty.toString() ? 'bg-purple-500 text-white border-purple-500' : 'bg-white text-neutral-600 border-neutral-200 hover:border-purple-300')}
              >{qty} L</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">Wunsch-Abholdatum <span className="text-neutral-400 font-normal">(optional)</span></label>
          <input type="date" value={form.desired_pickup_date} onChange={e => setForm(f => ({ ...f, desired_pickup_date: e.target.value }))}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">Hinweise <span className="text-neutral-400 font-normal">(optional)</span></label>
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="z.B. spezielle Anforderungen, Untergrund, Verarbeitung..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none h-20"
          />
        </div>

        <button type="submit" disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 text-white font-medium text-sm hover:bg-purple-700 active:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Wird gesendet…</>) : (<><Send size={15} />Anfrage absenden</>)}
        </button>
      </form>

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setLightbox(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm mx-4 mb-6 rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-full flex items-end justify-between px-5 pb-4 pt-16" style={{ background: lightbox.hex }}>
              <div>
                <p className="text-lg font-bold leading-tight" style={{ color: isLight(lightbox.hex) ? '#1a1a1a' : '#ffffff' }}>{lightbox.name}</p>
                <p className="text-sm font-mono mt-0.5 opacity-80" style={{ color: isLight(lightbox.hex) ? '#1a1a1a' : '#ffffff' }}>{lightbox.code}</p>
              </div>
              <button onClick={() => setLightbox(null)} className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: isLight(lightbox.hex) ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)' }}>
                <X size={16} style={{ color: isLight(lightbox.hex) ? '#1a1a1a' : '#ffffff' }} />
              </button>
            </div>
            <div className="bg-white px-5 py-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl border border-black/10 flex-none" style={{ background: lightbox.hex }} />
                <div>
                  <p className="text-xs text-neutral-500">HEX-Wert</p>
                  <p className="text-sm font-mono font-semibold text-neutral-800">{lightbox.hex.toUpperCase()}</p>
                </div>
              </div>
              <button type="button" onClick={() => applyColor(lightbox)}
                className="w-full py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors"
              >Diese Farbe verwenden</button>
              <button type="button" onClick={() => setLightbox(null)} className="w-full mt-2 py-2 text-xs text-neutral-400 hover:text-neutral-600">Schließen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
