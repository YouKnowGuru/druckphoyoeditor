'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiLoader, FiCheck, FiAlertCircle } from 'react-icons/fi'

interface BackgroundRemovalProps {
  imageUrl: string
  onImageUpdate: (imageUrl: string) => void
}

export default function BackgroundRemoval({ imageUrl, onImageUpdate }: BackgroundRemovalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF')
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const workerRef = useRef<Worker | null>(null)

  // Initialize Web Worker
  useEffect(() => {
    // Check if Web Workers are supported
    if (typeof Worker !== 'undefined') {
      try {
        workerRef.current = new Worker('/background-worker.js')

        workerRef.current.onmessage = (e) => {
          const { type, imageUrl: resultUrl, progress: prog, message, error: err } = e.data

          if (type === 'PROGRESS') {
            setProgress(prog)
            setProgressMessage(message)
          } else if (type === 'SUCCESS') {
            setProgress(100)
            setProgressMessage('Complete!')
            onImageUpdate(resultUrl)
            setTimeout(() => {
              setIsProcessing(false)
              setProgress(0)
              setProgressMessage('')
            }, 500)
          } else if (type === 'ERROR') {
            setError(err)
            setIsProcessing(false)
            setProgress(0)
            setProgressMessage('')
            // Fallback to main thread processing
            console.warn('Worker failed, using main thread fallback')
            removeBackgroundFallback()
          }
        }

        workerRef.current.onerror = (err) => {
          console.error('Worker error:', err)
          setError('Worker failed')
          setIsProcessing(false)
          // Fallback to main thread processing
          removeBackgroundFallback()
        }
      } catch (err) {
        console.warn('Failed to create worker, will use main thread fallback')
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
      }
    }
  }, [])

  const removeBackground = async () => {
    setIsProcessing(true)
    setProgress(0)
    setProgressMessage('Starting...')
    setError(null)

    // Try to use Web Worker first
    if (workerRef.current) {
      try {
        workerRef.current.postMessage({
          type: 'REMOVE_BACKGROUND',
          imageUrl: imageUrl
        })
        return
      } catch (err) {
        console.warn('Failed to post message to worker, using fallback')
      }
    }

    // Fallback to main thread if worker not available
    removeBackgroundFallback()
  }

  const removeBackgroundFallback = async () => {
    setIsProcessing(true)
    setProgress(10)
    setProgressMessage('Loading image...')

    try {
      // Try to use @imgly/background-removal library
      try {
        setProgress(20)
        setProgressMessage('Initializing AI model...')

        const bgRemovalModule = await import('@imgly/background-removal')

        // Try different import patterns
        let removeBackgroundFn: any = bgRemovalModule.removeBackground
        if (!removeBackgroundFn && bgRemovalModule.default) {
          removeBackgroundFn = typeof bgRemovalModule.default === 'function'
            ? bgRemovalModule.default
            : bgRemovalModule.default.removeBackground
        }

        if (removeBackgroundFn && typeof removeBackgroundFn === 'function') {
          setProgress(40)
          setProgressMessage('Processing image...')

          // Convert image URL to blob
          const response = await fetch(imageUrl)
          if (!response.ok) {
            throw new Error('Failed to fetch image')
          }

          const blob = await response.blob()

          setProgress(60)
          setProgressMessage('Removing background...')

          // Try with options first, then without
          let resultBlob: Blob
          try {
            resultBlob = await removeBackgroundFn(blob, {
              model: 'isnet', // Use the default high-quality model
              output: {
                format: 'image/png',
                quality: 1.0 // Maximum quality
              },
              progress: (key: string, current: number, total: number) => {
                const progressPercent = 60 + Math.floor((current / total) * 30)
                setProgress(progressPercent)
                setProgressMessage(`Removing background... (${key})`)
              }
            })
          } catch (optionsError) {
            console.warn('Trying without options:', optionsError)
            resultBlob = await removeBackgroundFn(blob)
          }

          setProgress(95)
          setProgressMessage('Finalizing...')

          // Convert blob to data URL
          const reader = new FileReader()
          reader.onloadend = () => {
            const result = reader.result as string
            if (result) {
              onImageUpdate(result)
              setProgress(100)
              setProgressMessage('Complete!')
              setTimeout(() => {
                setIsProcessing(false)
                setProgress(0)
                setProgressMessage('')
              }, 500)
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
        setProgress(30)
        setProgressMessage('Using fallback method...')
      }

      // Fallback: Simple color-based background removal using Canvas
      setProgress(50)
      setProgressMessage('Processing with fallback...')

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

        setProgress(70)
        setProgressMessage('Analyzing image...')

        // Simple background removal: detect edges and corners (usually background)
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

        setProgress(80)
        setProgressMessage('Removing background...')

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

        setProgress(95)
        setProgressMessage('Finalizing...')

        const newImageUrl = canvas.toDataURL('image/png')
        onImageUpdate(newImageUrl)

        setProgress(100)
        setProgressMessage('Complete!')
        setTimeout(() => {
          setIsProcessing(false)
          setProgress(0)
          setProgressMessage('')
        }, 500)
      }
      img.onerror = () => {
        setIsProcessing(false)
        setError('Failed to load image for background removal.')
      }
      img.src = imageUrl
    } catch (error: any) {
      console.error('Background removal failed:', error)
      setIsProcessing(false)
      setError(error?.message || 'Unknown error occurred')
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

      <div className="flex flex-col gap-4">
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

        {/* Progress Bar */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-bhutan-charcoal/70 dark:text-bhutan-softWhite/70">
                  {progressMessage}
                </span>
                <span className="font-semibold text-bhutan-saffron">
                  {progress}%
                </span>
              </div>
              <div className="w-full h-2 bg-bhutan-charcoal/10 dark:bg-bhutan-softWhite/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-bhutan-saffron to-bhutan-gold rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400"
            >
              <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
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
