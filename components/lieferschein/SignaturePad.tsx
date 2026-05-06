'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Pen, RotateCcw, Check } from 'lucide-react'

interface SignaturePadProps {
  onSave: (dataUrl: string) => void
  disabled?: boolean
}

export default function SignaturePad({ onSave, disabled }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  const getCanvas = () => canvasRef.current
  const getCtx = () => canvasRef.current?.getContext('2d')

  // Setup canvas on mount
  useEffect(() => {
    const canvas = getCanvas()
    if (!canvas) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      const ctx = getCtx()
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
        ctx.strokeStyle = '#1a1a1a'
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
      }
    }
    resizeCanvas()
  }, [])

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      const touch = e.touches[0]
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      }
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    }
  }

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return
    e.preventDefault()
    const canvas = getCanvas()
    if (!canvas) return
    setIsDrawing(true)
    setIsEmpty(false)
    lastPos.current = getPos(e, canvas)
  }, [disabled])

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return
    e.preventDefault()
    const canvas = getCanvas()
    const ctx = getCtx()
    if (!canvas || !ctx || !lastPos.current) return

    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPos.current = pos
  }, [isDrawing, disabled])

  const stopDrawing = useCallback(() => {
    setIsDrawing(false)
    lastPos.current = null
  }, [])

  const clear = () => {
    const canvas = getCanvas()
    const ctx = getCtx()
    if (!canvas || !ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.clearRect(0, 0, rect.width, rect.height)
    setIsEmpty(true)
  }

  const save = () => {
    const canvas = getCanvas()
    if (!canvas || isEmpty) return
    const dataUrl = canvas.toDataURL('image/png')
    onSave(dataUrl)
  }

  return (
    <div className="space-y-3">
      {/* Signatur-Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-36 border-2 border-dashed border-neutral-300 rounded-xl bg-white touch-none cursor-crosshair"
          style={{ touchAction: 'none' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 text-neutral-400">
              <Pen size={16} />
              <span className="text-sm">Hier unterschreiben</span>
            </div>
          </div>
        )}
      </div>

      {/* Aktionen */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={clear}
          disabled={isEmpty || disabled}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-40"
        >
          <RotateCcw size={13} />
          Löschen
        </button>
        <button
          type="button"
          onClick={save}
          disabled={isEmpty || disabled}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-40"
        >
          <Check size={13} />
          Unterschrift bestätigen
        </button>
      </div>
    </div>
  )
}
