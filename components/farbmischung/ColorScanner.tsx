'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Camera, X, ScanLine, CheckCircle, AlertCircle } from 'lucide-react'

export type ScannedColor = {
  code: string
  name: string
  hex: string
  system: string
}

// Curated color list for matching (RAL + NCS essentials)
const MATCH_COLORS: ScannedColor[] = [
  { code: 'RAL 9010', name: 'Reinweiß', hex: '#FFFFFF', system: 'RAL' },
  { code: 'RAL 9001', name: 'Cremeweiß', hex: '#FDF4E3', system: 'RAL' },
  { code: 'RAL 9003', name: 'Signalweiß', hex: '#F4F4F4', system: 'RAL' },
  { code: 'RAL 9016', name: 'Verkehrsweiß', hex: '#F6F6F6', system: 'RAL' },
  { code: 'RAL 9002', name: 'Grauweiß', hex: '#E7EBDA', system: 'RAL' },
  { code: 'RAL 7035', name: 'Lichtgrau', hex: '#D7D7D7', system: 'RAL' },
  { code: 'RAL 7047', name: 'Telegrau', hex: '#D0D0D0', system: 'RAL' },
  { code: 'RAL 7044', name: 'Seidengrau', hex: '#CAC4B0', system: 'RAL' },
  { code: 'RAL 7038', name: 'Achatgrau', hex: '#B5B8B1', system: 'RAL' },
  { code: 'RAL 7032', name: 'Kieselgrau', hex: '#B8B799', system: 'RAL' },
  { code: 'RAL 9006', name: 'Weißaluminium', hex: '#A5A5A5', system: 'RAL' },
  { code: 'RAL 7040', name: 'Fenstergrau', hex: '#9DA1AA', system: 'RAL' },
  { code: 'RAL 7004', name: 'Signalgrau', hex: '#969992', system: 'RAL' },
  { code: 'RAL 7037', name: 'Staubgrau', hex: '#7D7F7D', system: 'RAL' },
  { code: 'RAL 7030', name: 'Steingrau', hex: '#8B8C7A', system: 'RAL' },
  { code: 'RAL 7042', name: 'Verkehrsgrau A', hex: '#8D948D', system: 'RAL' },
  { code: 'RAL 7001', name: 'Silbergrau', hex: '#8A9597', system: 'RAL' },
  { code: 'RAL 7005', name: 'Mausgrau', hex: '#646B63', system: 'RAL' },
  { code: 'RAL 7024', name: 'Graphitgrau', hex: '#474A51', system: 'RAL' },
  { code: 'RAL 7016', name: 'Anthrazitgrau', hex: '#293133', system: 'RAL' },
  { code: 'RAL 7021', name: 'Schwarzgrau', hex: '#23282B', system: 'RAL' },
  { code: 'RAL 7011', name: 'Eisengrau', hex: '#434B4D', system: 'RAL' },
  { code: 'RAL 9005', name: 'Tiefschwarz', hex: '#0A0A0A', system: 'RAL' },
  { code: 'RAL 9011', name: 'Graphitschwarz', hex: '#1C1C1C', system: 'RAL' },
  { code: 'RAL 1000', name: 'Grünbeige', hex: '#BEBD7F', system: 'RAL' },
  { code: 'RAL 1001', name: 'Beige', hex: '#C2B078', system: 'RAL' },
  { code: 'RAL 1002', name: 'Sandgelb', hex: '#C6A664', system: 'RAL' },
  { code: 'RAL 1003', name: 'Signalgelb', hex: '#E5BE01', system: 'RAL' },
  { code: 'RAL 1004', name: 'Goldgelb', hex: '#CDA434', system: 'RAL' },
  { code: 'RAL 1006', name: 'Maisgelb', hex: '#E4A010', system: 'RAL' },
  { code: 'RAL 2000', name: 'Gelborange', hex: '#ED760E', system: 'RAL' },
  { code: 'RAL 2003', name: 'Pastellorange', hex: '#FF7514', system: 'RAL' },
  { code: 'RAL 2004', name: 'Reinorange', hex: '#F44611', system: 'RAL' },
  { code: 'RAL 3000', name: 'Feuerrot', hex: '#AF2B1E', system: 'RAL' },
  { code: 'RAL 3002', name: 'Karminrot', hex: '#A2231D', system: 'RAL' },
  { code: 'RAL 3003', name: 'Rubinrot', hex: '#9B111E', system: 'RAL' },
  { code: 'RAL 3020', name: 'Verkehrsrot', hex: '#CC0605', system: 'RAL' },
  { code: 'RAL 3014', name: 'Altrosa', hex: '#D36E70', system: 'RAL' },
  { code: 'RAL 3015', name: 'Hellrosa', hex: '#EA899A', system: 'RAL' },
  { code: 'RAL 4003', name: 'Erikaviolett', hex: '#DE4C8A', system: 'RAL' },
  { code: 'RAL 4008', name: 'Signalviolett', hex: '#924E7D', system: 'RAL' },
  { code: 'RAL 5000', name: 'Violettblau', hex: '#354D73', system: 'RAL' },
  { code: 'RAL 5005', name: 'Signalblau', hex: '#1A3668', system: 'RAL' },
  { code: 'RAL 5012', name: 'Lichtblau', hex: '#3B83BD', system: 'RAL' },
  { code: 'RAL 5015', name: 'Himmelblau', hex: '#2271B3', system: 'RAL' },
  { code: 'RAL 5017', name: 'Verkehrsblau', hex: '#063971', system: 'RAL' },
  { code: 'RAL 5018', name: 'Türkisblau', hex: '#3F888F', system: 'RAL' },
  { code: 'RAL 5021', name: 'Wasserblau', hex: '#256D7B', system: 'RAL' },
  { code: 'RAL 5024', name: 'Pastellblau', hex: '#5D9B9B', system: 'RAL' },
  { code: 'RAL 6002', name: 'Laubgrün', hex: '#2D572C', system: 'RAL' },
  { code: 'RAL 6010', name: 'Grasgrün', hex: '#3E7C44', system: 'RAL' },
  { code: 'RAL 6011', name: 'Resedagrün', hex: '#6C8F71', system: 'RAL' },
  { code: 'RAL 6017', name: 'Maigrün', hex: '#4C9141', system: 'RAL' },
  { code: 'RAL 6018', name: 'Gelbgrün', hex: '#57A639', system: 'RAL' },
  { code: 'RAL 6019', name: 'Weißgrün', hex: '#BDECB6', system: 'RAL' },
  { code: 'RAL 6027', name: 'Lichtgrün', hex: '#84C3BE', system: 'RAL' },
  { code: 'RAL 8001', name: 'Ockerbraun', hex: '#955F20', system: 'RAL' },
  { code: 'RAL 8003', name: 'Lehmbraun', hex: '#734222', system: 'RAL' },
  { code: 'RAL 8004', name: 'Kupferbraun', hex: '#8E402A', system: 'RAL' },
  { code: 'RAL 8011', name: 'Nußbraun', hex: '#5B3A29', system: 'RAL' },
  { code: 'RAL 8017', name: 'Schokoladebraun', hex: '#45322E', system: 'RAL' },
  { code: 'RAL 8024', name: 'Beigebraun', hex: '#79553D', system: 'RAL' },
  { code: 'NCS S 0500-N', name: 'Arktisch Weiß', hex: '#F5F5F5', system: 'NCS' },
  { code: 'NCS S 1005-Y50R', name: 'Warmsand', hex: '#E0C9A6', system: 'NCS' },
  { code: 'NCS S 2005-B20G', name: 'Nebelgrau', hex: '#A8B5B8', system: 'NCS' },
  { code: 'NCS S 2020-B', name: 'Pastellblau', hex: '#6E9EBF', system: 'NCS' },
  { code: 'NCS S 3020-G', name: 'Mintgrün', hex: '#5E9E7E', system: 'NCS' },
  { code: 'NCS S 4040-R', name: 'Burgunderrot', hex: '#9E3030', system: 'NCS' },
  { code: 'NCS S 4550-R70B', name: 'Marineblau', hex: '#2A3D6E', system: 'NCS' },
]

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  const dr = r1 - r2, dg = g1 - g2, db = b1 - b2
  return Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db)
}

function findNearestColor(r: number, g: number, b: number): ScannedColor {
  let best = MATCH_COLORS[0]
  let bestDist = Infinity
  for (const color of MATCH_COLORS) {
    const [cr, cg, cb] = hexToRgb(color.hex)
    const dist = colorDistance(r, g, b, cr, cg, cb)
    if (dist < bestDist) { bestDist = dist; best = color }
  }
  return best
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

// Check if camera is available in this browser
function isCameraSupported(): boolean {
  return !!(
    typeof navigator !== 'undefined' &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function'
  )
}

// iOS Safari needs special handling
function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
}

interface Props {
  onColorDetected: (color: ScannedColor, rawHex: string) => void
}

export default function ColorScanner({ onColorDetected }: Props) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<{ color: ScannedColor; rawHex: string } | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = useCallback(async () => {
    setError(null)
    setPreview(null)
    setCameraReady(false)

    if (!isCameraSupported()) {
      setError('Kamera wird von diesem Browser nicht unterstützt. Bitte Chrome oder Safari verwenden.')
      return
    }

    // Try back camera first, fall back to any camera (important for iOS)
    const constraints: MediaStreamConstraints[] = [
      { video: { facingMode: { exact: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } },
      { video: { facingMode: 'environment' } },
      { video: true },
    ]

    let stream: MediaStream | null = null
    let lastError: Error | null = null

    for (const constraint of constraints) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraint)
        break
      } catch (err) {
        lastError = err as Error
        continue
      }
    }

    if (!stream) {
      const msg = lastError?.name === 'NotAllowedError' || lastError?.name === 'PermissionDeniedError'
        ? 'Kamera-Zugriff verweigert. Bitte in den Browser-Einstellungen erlauben.'
        : lastError?.name === 'NotFoundError' || lastError?.name === 'DevicesNotFoundError'
        ? 'Keine Kamera gefunden.'
        : isIOS()
        ? 'Kamera konnte nicht geöffnet werden. Bitte Safari verwenden und Kamera-Zugriff erlauben.'
        : 'Kamera konnte nicht geöffnet werden. Bitte Kamera-Berechtigung erteilen.'
      setError(msg)
      return
    }

    streamRef.current = stream

    if (videoRef.current) {
      videoRef.current.srcObject = stream
      // iOS Safari requires a user-gesture triggered play
      try {
        await videoRef.current.play()
        setCameraReady(true)
      } catch {
        // On iOS, play may fail if not triggered by user gesture
        // The onCanPlay event will handle this
      }
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCameraReady(false)
  }, [])

  useEffect(() => {
    if (open) startCamera()
    return () => stopCamera()
  }, [open, startCamera, stopCamera])

  const capture = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    if (video.readyState < 2) {
      setError('Kamera noch nicht bereit. Bitte kurz warten.')
      return
    }

    const w = video.videoWidth || video.clientWidth
    const h = video.videoHeight || video.clientHeight
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, w, h)

    // Sample 20×20 px at center
    const cx = Math.floor(w / 2)
    const cy = Math.floor(h / 2)
    const sampleSize = 20
    const x0 = Math.max(0, cx - sampleSize / 2)
    const y0 = Math.max(0, cy - sampleSize / 2)
    const data = ctx.getImageData(x0, y0, sampleSize, sampleSize).data

    let r = 0, g = 0, b = 0
    const pixelCount = sampleSize * sampleSize
    for (let i = 0; i < data.length; i += 4) {
      r += data[i]; g += data[i + 1]; b += data[i + 2]
    }
    r = Math.round(r / pixelCount)
    g = Math.round(g / pixelCount)
    b = Math.round(b / pixelCount)

    const rawHex = rgbToHex(r, g, b)
    const nearest = findNearestColor(r, g, b)
    setPreview({ color: nearest, rawHex })
  }, [])

  const confirm = useCallback(() => {
    if (!preview) return
    onColorDetected(preview.color, preview.rawHex)
    stopCamera()
    setOpen(false)
    setPreview(null)
  }, [preview, onColorDetected, stopCamera])

  const close = useCallback(() => {
    stopCamera()
    setOpen(false)
    setPreview(null)
    setError(null)
  }, [stopCamera])

  // Don't render scanner button if camera not supported at all
  if (!isCameraSupported() && typeof window !== 'undefined') {
    return null
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 text-xs font-medium hover:bg-purple-100 transition-colors w-full justify-center"
      >
        <Camera size={15} />
        Farbe mit Kamera scannen
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Close button */}
      <button
        onClick={close}
        className="absolute top-4 right-4 z-10 w-9 h-9 bg-black/50 rounded-full flex items-center justify-center"
      >
        <X size={18} className="text-white" />
      </button>

      {/* Header */}
      <div className="absolute top-4 left-4 z-10">
        <p className="text-white text-sm font-semibold">Farb-Scanner</p>
        <p className="text-white/60 text-xs mt-0.5">Kamera auf Farbfläche richten</p>
      </div>

      {/* Camera view */}
      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
            <div>
              <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
              <p className="text-white text-sm">{error}</p>
              <div className="flex gap-3 mt-4 justify-center">
                <button
                  onClick={() => { setError(null); startCamera() }}
                  className="px-4 py-2 bg-white/20 text-white rounded-xl text-sm"
                >
                  Erneut versuchen
                </button>
                <button onClick={close} className="px-4 py-2 bg-white/10 text-white/60 rounded-xl text-sm">
                  Schließen
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              // iOS Safari: webkit-playsinline attribute
              {...({ 'webkit-playsinline': 'true' } as any)}
              onCanPlay={() => setCameraReady(true)}
              onLoadedMetadata={async () => {
                if (videoRef.current) {
                  try {
                    await videoRef.current.play()
                    setCameraReady(true)
                  } catch { /* ignore */ }
                }
              }}
              className="w-full h-full object-cover"
            />

            {/* Loading overlay */}
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-white/70 text-sm">Kamera wird gestartet…</p>
                </div>
              </div>
            )}

            {/* Crosshair overlay */}
            {cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-24 h-24">
                  <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-white rounded-tl-sm" />
                  <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-white rounded-tr-sm" />
                  <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-white rounded-bl-sm" />
                  <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-white rounded-br-sm" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white/80" />
                  </div>
                </div>
                <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                  <p className="text-white/70 text-xs bg-black/40 px-3 py-1 rounded-full">
                    Fadenkreuz auf Farbe ausrichten
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Preview result */}
      {preview && (
        <div className="absolute bottom-24 left-4 right-4 bg-white rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex-none border border-black/10" style={{ background: preview.rawHex }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-neutral-500 mb-0.5">Erkannt: {preview.rawHex.toUpperCase()}</p>
            <p className="font-semibold text-sm text-neutral-900 truncate">{preview.color.name}</p>
            <p className="text-xs text-neutral-500 font-mono">{preview.color.code}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPreview(null)} className="px-3 py-2 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-medium">
              Erneut
            </button>
            <button onClick={confirm} className="px-3 py-2 rounded-xl bg-purple-600 text-white text-xs font-medium flex items-center gap-1">
              <CheckCircle size={13} />
              Übernehmen
            </button>
          </div>
        </div>
      )}

      {/* Capture button */}
      {!error && !preview && cameraReady && (
        <div className="px-6 pb-8 pt-4 flex justify-center">
          <button
            onClick={capture}
            className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <ScanLine size={24} className="text-purple-600" />
          </button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
