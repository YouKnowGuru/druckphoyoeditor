'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiDownload, FiRotateCw, FiMaximize2, FiMinimize2 } from 'react-icons/fi'
import BackgroundRemoval from './BackgroundRemoval'
import PhotoSizing from './PhotoSizing'
import ManualAdjustments from './ManualAdjustments'
import PrintLayout from './PrintLayout'
import { exportAsPNG, exportAsJPG, exportAsPDF } from '@/utils/exportUtils'

interface PhotoEditorProps {
  imageUrl: string
  onImageEdit: (imageUrl: string) => void
  onNewPhoto: () => void
}

export default function PhotoEditor({ imageUrl, onImageEdit, onNewPhoto }: PhotoEditorProps) {
  const [currentImage, setCurrentImage] = useState<string>(imageUrl)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'background' | 'sizing' | 'adjustments' | 'print'>('background')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    setCurrentImage(imageUrl)
    setProcessedImage(null)
  }, [imageUrl])

  const handleImageUpdate = (newImageUrl: string) => {
    setCurrentImage(newImageUrl)
    setProcessedImage(newImageUrl)
    onImageEdit(newImageUrl)
  }

  // Non-destructive preview (used by ManualAdjustments)
  const handlePreviewUpdate = (previewUrl: string) => {
    setProcessedImage(previewUrl)
  }

  const handleCancelPreview = () => {
    setProcessedImage(null)
  }

  const handleCommitUpdate = (newImageUrl: string) => {
    handleImageUpdate(newImageUrl)
  }

  const handleRotate = (degrees: number) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const size = Math.max(img.width, img.height)
      canvas.width = size
      canvas.height = size

      ctx.translate(size / 2, size / 2)
      ctx.rotate((degrees * Math.PI) / 180)
      ctx.drawImage(img, -img.width / 2, -img.height / 2)

      const newImageUrl = canvas.toDataURL('image/png')
      handleImageUpdate(newImageUrl)
    }
    img.src = currentImage
  }

  const handleFlip = (direction: 'horizontal' | 'vertical') => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = img.width
      canvas.height = img.height

      if (direction === 'horizontal') {
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
      } else {
        ctx.translate(0, canvas.height)
        ctx.scale(1, -1)
      }

      ctx.drawImage(img, 0, 0)

      const newImageUrl = canvas.toDataURL('image/png')
      handleImageUpdate(newImageUrl)
    }
    img.src = currentImage
  }

  const handleExport = async (format: 'png' | 'jpg' | 'pdf') => {
    const imageToExport = processedImage || currentImage
    if (!imageToExport) return

    switch (format) {
      case 'png':
        await exportAsPNG(imageToExport)
        break
      case 'jpg':
        await exportAsJPG(imageToExport)
        break
      case 'pdf':
        await exportAsPDF(imageToExport)
        break
    }
  }

  const tabs = [
    { id: 'background', label: 'Background' },
    { id: 'sizing', label: 'Sizing' },
    { id: 'adjustments', label: 'Adjustments' },
    { id: 'print', label: 'Print Layout' },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Progress Stepper */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {['Upload', 'Edit', 'Export'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold ${
                  index === 0 ? 'bg-bhutan-saffron text-white' : 
                  index === 1 ? 'bg-bhutan-royalRed text-white' : 
                  'bg-bhutan-charcoal/20 dark:bg-bhutan-slate text-bhutan-charcoal dark:text-bhutan-softWhite'
                }`}>
                  {index + 1}
                </div>
                <span className="text-xs mt-2 text-bhutan-charcoal/60 dark:text-bhutan-softWhite/60">
                  {step}
                </span>
              </div>
              {index < 2 && (
                <div className={`w-16 h-1 mx-2 ${
                  index === 0 ? 'bg-bhutan-saffron' : 'bg-bhutan-charcoal/20 dark:bg-bhutan-slate'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Image Preview */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="relative bg-bhutan-cream dark:bg-bhutan-darkCharcoal rounded-xl p-4">
                <img
                  ref={imageRef}
                  src={processedImage || currentImage}
                  alt="Edited photo"
                  className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                />
              </div>
              
              {/* Quick Actions */}
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() => handleRotate(90)}
                  className="p-3 rounded-xl bg-bhutan-gold/10 dark:bg-bhutan-saffron/20 hover:bg-bhutan-gold/20 transition-colors"
                  aria-label="Rotate 90 degrees"
                  title="Rotate 90°"
                >
                  <FiRotateCw className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleFlip('horizontal')}
                  className="p-3 rounded-xl bg-bhutan-gold/10 dark:bg-bhutan-saffron/20 hover:bg-bhutan-gold/20 transition-colors"
                  aria-label="Flip horizontal"
                  title="Flip Horizontal"
                >
                  <FiMaximize2 className="w-5 h-5 rotate-90" />
                </button>
                <button
                  onClick={() => handleFlip('vertical')}
                  className="p-3 rounded-xl bg-bhutan-gold/10 dark:bg-bhutan-saffron/20 hover:bg-bhutan-gold/20 transition-colors"
                  aria-label="Flip vertical"
                  title="Flip Vertical"
                >
                  <FiMinimize2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Export Options */}
            <div className="md:w-64 space-y-4">
              <h3 className="font-heading font-bold text-lg mb-4">Export</h3>
              <button
                onClick={() => handleExport('png')}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <FiDownload className="w-5 h-5" />
                Download PNG
              </button>
              <button
                onClick={() => handleExport('jpg')}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <FiDownload className="w-5 h-5" />
                Download JPG
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <FiDownload className="w-5 h-5" />
                Download PDF
              </button>
              <button
                onClick={onNewPhoto}
                className="w-full btn-secondary"
              >
                New Photo
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="flex flex-wrap gap-2 mb-6 border-b border-bhutan-gold/20 dark:border-bhutan-saffron/20">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 font-heading font-medium rounded-t-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-bhutan-saffron text-white border-b-2 border-bhutan-saffron'
                    : 'text-bhutan-charcoal/60 dark:text-bhutan-softWhite/60 hover:text-bhutan-saffron'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'background' && (
              <BackgroundRemoval
                imageUrl={currentImage}
                onImageUpdate={handleImageUpdate}
              />
            )}
            {activeTab === 'sizing' && (
              <PhotoSizing
                imageUrl={currentImage}
                onImageUpdate={handleImageUpdate}
              />
            )}
            {activeTab === 'adjustments' && (
              <ManualAdjustments
                baseImageUrl={currentImage}
                onPreviewUpdate={handlePreviewUpdate}
                onCommitUpdate={handleCommitUpdate}
                onCancelPreview={handleCancelPreview}
              />
            )}
            {activeTab === 'print' && (
              <PrintLayout
                imageUrl={processedImage || currentImage}
              />
            )}
          </div>
        </div>
      </motion.div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
