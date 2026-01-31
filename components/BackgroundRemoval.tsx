'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiLoader, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import { backgroundRemovalService } from '@/utils/backgroundRemovalService'

interface BackgroundRemovalProps {
  imageUrl: string
  onImageUpdate: (imageUrl: string) => void
}

export default function BackgroundRemoval({ imageUrl, onImageUpdate }: BackgroundRemovalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [currentProvider, setCurrentProvider] = useState<string>('')
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const removeBackground = useCallback(async () => {
    setIsProcessing(true)
    setProgress(10)
    setProgressMessage('Preparing image...')
    setError(null)
    setSuccess(null)
    setCurrentProvider('')

    try {
      setProgress(20)

      // Use the API service with automatic fallback
      const result = await backgroundRemovalService.removeBackground(
        imageUrl,
        (message: string, provider: string) => {
          setProgressMessage(message)
          setCurrentProvider(provider)
          setProgress(prev => Math.min(prev + 15, 80))
        }
      )

      if (result.success && result.imageUrl) {
        setProgress(95)
        setProgressMessage('Finalizing...')

        onImageUpdate(result.imageUrl)

        setProgress(100)
        setSuccess(`Background removed successfully using ${result.provider}!`)
        setProgressMessage('Complete!')

        setTimeout(() => {
          setIsProcessing(false)
          setProgress(0)
          setProgressMessage('')
          setSuccess(null)
        }, 3000)
      } else {
        throw new Error(result.error || 'Failed to remove background')
      }
    } catch (error: any) {
      console.error('Background removal failed:', error)
      setIsProcessing(false)
      setProgress(0)
      setProgressMessage('')
      setError(error?.message || 'All API providers failed. Please try again later.')
    }
  }, [imageUrl, onImageUpdate])


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

        {/* Current Provider Indicator */}
        <AnimatePresence>
          {currentProvider && isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 text-sm text-bhutan-charcoal/60 dark:text-bhutan-softWhite/60"
            >
              <span>Using: <strong className="text-bhutan-saffron">{currentProvider}</strong></span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400"
            >
              <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{success}</span>
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
