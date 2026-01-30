'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

interface ManualAdjustmentsProps {
  baseImageUrl: string
  onPreviewUpdate: (imageUrl: string) => void
  onCommitUpdate: (imageUrl: string) => void
  onCancelPreview: () => void
}

function clampByte(n: number) {
  return Math.max(0, Math.min(255, n))
}

export default function ManualAdjustments({
  baseImageUrl,
  onPreviewUpdate,
  onCommitUpdate,
  onCancelPreview,
}: ManualAdjustmentsProps) {
  // Non-destructive controls (preview-only until Apply)
  const [brightness, setBrightness] = useState(0) // -100..100 (%)
  const [contrast, setContrast] = useState(0) // -100..100 (%)
  const [saturation, setSaturation] = useState(0) // -100..100 (%)
  const [exposure, setExposure] = useState(0) // -100..100 (EV-ish)
  const [hue, setHue] = useState(0) // -180..180 (deg)
  const [temperature, setTemperature] = useState(0) // -100..100 (blue..warm)
  const [tint, setTint] = useState(0) // -100..100 (green..magenta)
  const [sharpness, setSharpness] = useState(0) // 0..100

  const [isRendering, setIsRendering] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const latestBaseRef = useRef<string>(baseImageUrl)

  // If the base image changes (e.g., background removal or sizing), reset preview state.
  useEffect(() => {
    if (latestBaseRef.current !== baseImageUrl) {
      latestBaseRef.current = baseImageUrl
      resetFilters(false)
      onCancelPreview()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseImageUrl])

  useEffect(() => {
    schedulePreview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brightness, contrast, saturation, sharpness, exposure, hue, temperature, tint, baseImageUrl])

  const hasAdjustments = useMemo(() => {
    return (
      brightness !== 0 ||
      contrast !== 0 ||
      saturation !== 0 ||
      exposure !== 0 ||
      hue !== 0 ||
      temperature !== 0 ||
      tint !== 0 ||
      sharpness !== 0
    )
  }, [brightness, contrast, saturation, exposure, hue, temperature, tint, sharpness])

  const schedulePreview = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      void renderPreview()
    })
  }

  const renderPreview = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsRendering(true)

    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = baseImageUrl
    }).catch((e) => {
      console.error(e)
      setIsRendering(false)
    })

    if (!img.width || !img.height) {
      setIsRendering(false)
      return
    }

    canvas.width = img.width
    canvas.height = img.height

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) {
      setIsRendering(false)
      return
    }

    // Use browser’s color pipeline for the core adjustments (better than manual RGB math)
    const brightnessPct = 100 + brightness
    const contrastPct = 100 + contrast
    const saturatePct = 100 + saturation
    const hueDeg = hue

    ctx.filter = `brightness(${brightnessPct}%) contrast(${contrastPct}%) saturate(${saturatePct}%) hue-rotate(${hueDeg}deg)`
    ctx.drawImage(img, 0, 0)
    ctx.filter = 'none'

    // Pixel-level tweaks: exposure (EV-ish), temperature, tint, sharpening
    const needsPixelPass = exposure !== 0 || temperature !== 0 || tint !== 0 || sharpness !== 0
    if (needsPixelPass) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Exposure factor: -100..100 => 0.5..2.0
      const exposureFactor = Math.pow(2, exposure / 100)

      // Temperature: warm increases R, decreases B. Cool does opposite.
      const temp = temperature / 100 // -1..1
      const tintN = tint / 100 // -1..1 (green..magenta)
      const rGain = 1 + 0.12 * temp + 0.08 * tintN
      const gGain = 1 - 0.06 * temp - 0.10 * tintN
      const bGain = 1 - 0.12 * temp + 0.08 * tintN

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i]
        let g = data[i + 1]
        let b = data[i + 2]

        // Exposure
        if (exposure !== 0) {
          r = r * exposureFactor
          g = g * exposureFactor
          b = b * exposureFactor
        }

        // Temp/tint
        if (temperature !== 0 || tint !== 0) {
          r = r * rGain
          g = g * gGain
          b = b * bGain
        }

        data[i] = clampByte(r)
        data[i + 1] = clampByte(g)
        data[i + 2] = clampByte(b)
      }

      ctx.putImageData(imageData, 0, 0)

      if (sharpness !== 0) {
        // Lightweight sharpen kernel (unsharp-ish). Strength is intentionally subtle.
        const amount = (sharpness / 100) * 0.6 // 0..0.6
        const src = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const dst = ctx.createImageData(src)

        const w = canvas.width
        const h = canvas.height

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4
            for (let c = 0; c < 3; c++) {
              const center = src.data[idx + c]
              // 4-neighbor average (with edge clamping)
              const left = src.data[(y * w + Math.max(0, x - 1)) * 4 + c]
              const right = src.data[(y * w + Math.min(w - 1, x + 1)) * 4 + c]
              const up = src.data[(Math.max(0, y - 1) * w + x) * 4 + c]
              const down = src.data[(Math.min(h - 1, y + 1) * w + x) * 4 + c]
              const avg = (left + right + up + down) / 4
              dst.data[idx + c] = clampByte(center + (center - avg) * amount)
            }
            dst.data[idx + 3] = src.data[idx + 3]
          }
        }
        ctx.putImageData(dst, 0, 0)
      }
    }

    // Preview only (do NOT overwrite base in the parent on every slider move)
    const previewUrl = canvas.toDataURL('image/png', 1.0)
    onPreviewUpdate(previewUrl)
    setIsRendering(false)
  }

  const resetFilters = (triggerPreview = true) => {
    setBrightness(0)
    setContrast(0)
    setSaturation(0)
    setExposure(0)
    setHue(0)
    setTemperature(0)
    setTint(0)
    setSharpness(0)
    if (triggerPreview) {
      onCancelPreview()
    }
  }

  const adjustments = useMemo(
    () => [
      { label: 'Exposure', value: exposure, setValue: setExposure, min: -100, max: 100 },
      { label: 'Brightness', value: brightness, setValue: setBrightness, min: -100, max: 100 },
      { label: 'Contrast', value: contrast, setValue: setContrast, min: -100, max: 100 },
      { label: 'Saturation', value: saturation, setValue: setSaturation, min: -100, max: 100 },
      { label: 'Hue', value: hue, setValue: setHue, min: -180, max: 180 },
      { label: 'Temperature', value: temperature, setValue: setTemperature, min: -100, max: 100 },
      { label: 'Tint', value: tint, setValue: setTint, min: -100, max: 100 },
      { label: 'Sharpness', value: sharpness, setValue: setSharpness, min: 0, max: 100 },
    ],
    [brightness, contrast, saturation, exposure, hue, temperature, tint, sharpness]
  )

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-heading font-bold mb-4">Manual Adjustments</h3>
        <p className="text-bhutan-charcoal/70 dark:text-bhutan-softWhite/70 mb-6">
          Advanced, non-destructive adjustments. Changes are previewed live and only saved when you press Apply.
        </p>
      </div>

      <div className="space-y-6">
        {adjustments.map((adj) => (
          <div key={adj.label}>
            <div className="flex justify-between items-center mb-2">
              <label className="font-heading font-medium">{adj.label}</label>
              <span className="text-sm text-bhutan-charcoal/60 dark:text-bhutan-softWhite/60">
                {adj.value > 0 ? '+' : ''}{adj.value}
              </span>
            </div>
            <input
              type="range"
              min={adj.min}
              max={adj.max}
              value={adj.value}
              onChange={(e) => adj.setValue(parseInt(e.target.value))}
              className="w-full h-2 bg-bhutan-gold/20 dark:bg-bhutan-saffron/20 rounded-lg appearance-none cursor-pointer accent-bhutan-saffron"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => {
            resetFilters(true)
          }}
          className="btn-secondary w-full"
        >
          Reset
        </button>
        <button
          onClick={() => {
            onCancelPreview()
          }}
          className="btn-secondary w-full"
          disabled={!hasAdjustments}
        >
          Cancel
        </button>
        <button
          onClick={() => {
            const canvas = canvasRef.current
            if (!canvas) return
            const finalUrl = canvas.toDataURL('image/png', 1.0)
            onCommitUpdate(finalUrl)
          }}
          className="btn-primary w-full"
          disabled={!hasAdjustments || isRendering}
        >
          {isRendering ? 'Rendering…' : 'Apply'}
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
