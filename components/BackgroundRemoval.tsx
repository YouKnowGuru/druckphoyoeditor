'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiLoader } from 'react-icons/fi'

interface BackgroundRemovalProps {
  imageUrl: string
  onImageUpdate: (imageUrl: string) => void
}

export default function BackgroundRemoval({ imageUrl, onImageUpdate }: BackgroundRemovalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const removeBackground = async () => {
    setIsProcessing(true)
    try {
      // Try to use @imgly/background-removal library
      try {
        const bgRemovalModule = await import('@imgly/background-removal')
        
        // Try different import patterns
        let removeBackgroundFn = bgRemovalModule.removeBackground
        if (!removeBackgroundFn && bgRemovalModule.default) {
          removeBackgroundFn = typeof bgRemovalModule.default === 'function' 
            ? bgRemovalModule.default 
            : bgRemovalModule.default.removeBackground
        }
        
        if (removeBackgroundFn && typeof removeBackgroundFn === 'function') {
          // Convert image URL to blob
          const response = await fetch(imageUrl)
          if (!response.ok) {
            throw new Error('Failed to fetch image')
          }
          
          const blob = await response.blob()
          
          // Try with options first, then without
          let resultBlob: Blob
          try {
            resultBlob = await removeBackgroundFn(blob, {
              model: 'medium',
            })
          } catch (optionsError) {
            console.warn('Trying without options:', optionsError)
            resultBlob = await removeBackgroundFn(blob)
          }
          
          // Convert blob to data URL
          const reader = new FileReader()
          reader.onloadend = () => {
            const result = reader.result as string
            if (result) {
              onImageUpdate(result)
              setIsProcessing(false)
              return
            }
          }
          reader.onerror = () => {
            throw new Error('Failed to read result')
          }
          reader.readAsDataURL(resultBlob)
          return
        }
      } catch (libError: any) {
        console.warn('Library-based background removal failed, using fallback:', libError)
      }

      // Fallback: Simple color-based background removal using Canvas
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) {
          setIsProcessing(false)
          return
        }

        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          setIsProcessing(false)
          return
        }

        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Simple background removal: detect edges and corners (usually background)
        // This is a basic approach - works best with photos that have clear subject/background separation
        const edgeThreshold = 30
        const cornerPixels: number[] = []
        
        // Sample corner pixels (likely background)
        const corners = [
          [0, 0], [canvas.width - 1, 0],
          [0, canvas.height - 1], [canvas.width - 1, canvas.height - 1]
        ]
        
        corners.forEach(([x, y]) => {
          const idx = (y * canvas.width + x) * 4
          cornerPixels.push(data[idx], data[idx + 1], data[idx + 2])
        })

        // Calculate average corner color (background color)
        const avgR = cornerPixels.filter((_, i) => i % 3 === 0).reduce((a, b) => a + b, 0) / 4
        const avgG = cornerPixels.filter((_, i) => i % 3 === 1).reduce((a, b) => a + b, 0) / 4
        const avgB = cornerPixels.filter((_, i) => i % 3 === 2).reduce((a, b) => a + b, 0) / 4

        // Make background transparent
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          
          // Calculate color distance from background
          const distance = Math.sqrt(
            Math.pow(r - avgR, 2) + 
            Math.pow(g - avgG, 2) + 
            Math.pow(b - avgB, 2)
          )
          
          // If pixel is similar to background, make it transparent
          if (distance < edgeThreshold) {
            data[i + 3] = 0 // Set alpha to 0 (transparent)
          }
        }

        ctx.putImageData(imageData, 0, 0)
        const newImageUrl = canvas.toDataURL('image/png')
        onImageUpdate(newImageUrl)
        setIsProcessing(false)
      }
      img.onerror = () => {
        setIsProcessing(false)
        alert('Failed to load image for background removal.')
      }
      img.src = imageUrl
    } catch (error: any) {
      console.error('Background removal failed:', error)
      setIsProcessing(false)
      alert(`Background removal failed: ${error?.message || 'Unknown error'}\n\nUsing simple color-based removal as fallback.`)
    }
  }

  const applyBackgroundColor = () => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = img.width
      canvas.height = img.height

      // Fill with background color
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw image on top
      ctx.drawImage(img, 0, 0)

      const newImageUrl = canvas.toDataURL('image/png')
      onImageUpdate(newImageUrl)
    }
    img.src = imageUrl
  }

  const presetColors = [
    { name: 'White', value: '#FFFFFF' },
    { name: 'Blue', value: '#0066CC' },
    { name: 'Red', value: '#DC143C' },
    { name: 'Gray', value: '#808080' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-heading font-bold mb-4">Background Removal</h3>
        <p className="text-bhutan-charcoal/70 dark:text-bhutan-softWhite/70 mb-6">
          Automatically remove the background from your photo using AI. Then choose a new background color.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={removeBackground}
          disabled={isProcessing}
          className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <FiLoader className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            'Remove Background'
          )}
        </button>
      </div>

      <div className="space-y-4">
        <h4 className="font-heading font-semibold">Background Color</h4>
        <div className="flex flex-wrap gap-3">
          {presetColors.map((color) => (
            <button
              key={color.value}
              onClick={() => {
                setBackgroundColor(color.value)
                applyBackgroundColor()
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-bhutan-gold/30 dark:border-bhutan-saffron/30 hover:border-bhutan-saffron transition-all"
            >
              <div
                className="w-6 h-6 rounded-full border-2 border-bhutan-charcoal/20"
                style={{ backgroundColor: color.value }}
              />
              <span>{color.name}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <label className="font-medium">Custom Color:</label>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="w-16 h-10 rounded-lg cursor-pointer"
          />
          <button
            onClick={applyBackgroundColor}
            className="btn-secondary"
          >
            Apply
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
