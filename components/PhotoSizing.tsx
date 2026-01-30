'use client'

import { useState, useRef } from 'react'
import Pica from 'pica'

interface PhotoSizingProps {
  imageUrl: string
  onImageUpdate: (imageUrl: string) => void
}

const PRESETS = [
  { name: 'Passport (35x45mm)', width: 413, height: 531, dpi: 300 },
  { name: '2x2 inches', width: 600, height: 600, dpi: 300 },
  { name: '3.5x4.5 cm', width: 413, height: 531, dpi: 300 },
  { name: '5x5 cm', width: 591, height: 591, dpi: 300 },
  { name: 'Visa Photo', width: 600, height: 600, dpi: 300 },
]

export default function PhotoSizing({ imageUrl, onImageUpdate }: PhotoSizingProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [customWidth, setCustomWidth] = useState(413)
  const [customHeight, setCustomHeight] = useState(531)
  const [dpi, setDpi] = useState(300)
  const [isProcessing, setIsProcessing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null)

  const resizeImage = async (width: number, height: number) => {
    setIsProcessing(true)
    
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = imageUrl
      })

      const sourceCanvas = sourceCanvasRef.current
      const targetCanvas = canvasRef.current
      
      if (!sourceCanvas || !targetCanvas) return

      sourceCanvas.width = img.width
      sourceCanvas.height = img.height
      const sourceCtx = sourceCanvas.getContext('2d')
      if (sourceCtx) {
        sourceCtx.drawImage(img, 0, 0)
      }

      targetCanvas.width = width
      targetCanvas.height = height

      const pica = new Pica()
      await pica.resize(sourceCanvas, targetCanvas, {
        unsharpAmount: 160,
        unsharpRadius: 0.6,
        unsharpThreshold: 0
      })

      const resizedImageUrl = targetCanvas.toDataURL('image/png', 1.0)
      onImageUpdate(resizedImageUrl)
      setIsProcessing(false)
    } catch (error) {
      console.error('Resize failed:', error)
      setIsProcessing(false)
      alert('Failed to resize image. Please try again.')
    }
  }

  const handlePresetSelect = (preset: typeof PRESETS[0]) => {
    setSelectedPreset(preset.name)
    resizeImage(preset.width, preset.height)
  }

  const handleCustomResize = () => {
    resizeImage(customWidth, customHeight)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-heading font-bold mb-4">Photo Sizing</h3>
        <p className="text-bhutan-charcoal/70 dark:text-bhutan-softWhite/70 mb-6">
          Select a preset size or enter custom dimensions. All sizes maintain 300 DPI for print quality.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => handlePresetSelect(preset)}
            disabled={isProcessing}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              selectedPreset === preset.name
                ? 'border-bhutan-saffron bg-bhutan-gold/10 dark:bg-bhutan-saffron/20'
                : 'border-bhutan-gold/30 dark:border-bhutan-saffron/30 hover:border-bhutan-saffron'
            } disabled:opacity-50`}
          >
            <div className="font-heading font-semibold mb-1">{preset.name}</div>
            <div className="text-sm text-bhutan-charcoal/60 dark:text-bhutan-softWhite/60">
              {preset.width} × {preset.height}px @ {preset.dpi} DPI
            </div>
          </button>
        ))}
      </div>

      <div className="card">
        <h4 className="font-heading font-semibold mb-4">Custom Size</h4>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Width (px)</label>
            <input
              type="number"
              value={customWidth}
              onChange={(e) => setCustomWidth(parseInt(e.target.value) || 0)}
              className="input-field"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Height (px)</label>
            <input
              type="number"
              value={customHeight}
              onChange={(e) => setCustomHeight(parseInt(e.target.value) || 0)}
              className="input-field"
              min="1"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">DPI: {dpi}</label>
          <input
            type="range"
            value={dpi}
            onChange={(e) => setDpi(parseInt(e.target.value))}
            min="72"
            max="600"
            step="1"
            className="w-full"
          />
        </div>
        <button
          onClick={handleCustomResize}
          disabled={isProcessing}
          className="btn-primary w-full disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : 'Apply Custom Size'}
        </button>
      </div>

      <canvas ref={sourceCanvasRef} className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
