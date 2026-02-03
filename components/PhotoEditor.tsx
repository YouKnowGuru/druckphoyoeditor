'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiDownload, FiRotateCw, FiMaximize2, FiMinimize2 } from 'react-icons/fi'
import BackgroundRemoval from './BackgroundRemoval'
import PhotoSizing from './PhotoSizing'
import ManualAdjustments from './ManualAdjustments'
import PrintLayout from './PrintLayout'
import { exportAsPNG, exportAsJPG, exportAsPDF } from '@/utils/exportUtils'
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface PhotoEditorProps {
  imageUrl: string
  onImageEdit: (imageUrl: string) => void
  onNewPhoto: () => void
}

export default function PhotoEditor({ imageUrl, onImageEdit, onNewPhoto }: PhotoEditorProps) {
  const [currentImage, setCurrentImage] = useState<string>(imageUrl)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'background' | 'sizing' | 'adjustments' | 'print'>('background')
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null)
  const [isCropping, setIsCropping] = useState(false)
  const [aspect, setAspect] = useState<number | undefined>(undefined)
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

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        1,
        width,
        height
      ),
      width,
      height
    )
    setCrop(initialCrop)
  }

  const handleApplyCrop = () => {
    if (!completedCrop || !imageRef.current || !canvasRef.current) {
      alert('Please select a crop area first.')
      return
    }

    const image = imageRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    canvas.width = completedCrop.width * scaleX
    canvas.height = completedCrop.height * scaleY

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    )

    const base64Image = canvas.toDataURL('image/png')
    handleImageUpdate(base64Image)
    setIsCropping(false)
    setCompletedCrop(null)
    setCrop(undefined)
    setAspect(undefined)
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
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold ${index === 0 ? 'bg-bhutan-saffron text-white' :
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
                <div className={`w-16 h-1 mx-2 ${index === 0 ? 'bg-bhutan-saffron' : 'bg-bhutan-charcoal/20 dark:bg-bhutan-slate'
                  }`} />
              )}
            </div>
          ))}
        </div>

        {/* Image Preview */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="relative bg-bhutan-cream dark:bg-bhutan-darkCharcoal rounded-xl p-4 flex flex-col items-center">
                {isCropping ? (
                  <div className="max-w-full">
                    <ReactCrop
                      crop={crop}
                      onChange={(c) => setCrop(c)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={aspect}
                    >
                      <img
                        ref={imageRef}
                        src={processedImage || currentImage}
                        alt="Crop preview"
                        className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                        onLoad={onImageLoad}
                      />
                    </ReactCrop>

                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {[
                        { label: 'Free', val: undefined },
                        { label: 'Square', val: 1 },
                        { label: 'Passport', val: 3.5 / 4.5 },
                        { label: 'Half Photo', val: 3.5 / 5 },
                      ].map((p) => (
                        <button
                          key={p.label}
                          onClick={() => {
                            setAspect(p.val)
                            if (imageRef.current) {
                              const { width, height } = imageRef.current
                              const newCrop = centerCrop(
                                makeAspectCrop(
                                  { unit: '%', width: 90 },
                                  p.val || 1,
                                  width,
                                  height
                                ),
                                width,
                                height
                              )
                              setCrop(newCrop)
                            }
                          }}
                          className={`px-3 py-1 text-xs rounded-full border transition-colors ${aspect === p.val
                              ? 'bg-bhutan-saffron text-white border-bhutan-saffron'
                              : 'bg-white dark:bg-bhutan-slate border-bhutan-gold/30'
                            }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-center gap-3 mt-4">
                      <button
                        onClick={() => {
                          setIsCropping(false)
                          setCompletedCrop(null)
                        }}
                        className="btn-secondary py-2 px-4 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleApplyCrop}
                        className="btn-primary py-2 px-4 text-sm"
                        disabled={!completedCrop?.width || !completedCrop?.height}
                      >
                        Apply Crop
                      </button>
                    </div>
                  </div>
                ) : (
                  <img
                    ref={imageRef}
                    src={processedImage || currentImage}
                    alt="Edited photo"
                    className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                  />
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() => setIsCropping(true)}
                  className={`p-3 rounded-xl transition-colors ${isCropping
                    ? 'bg-bhutan-saffron text-white'
                    : 'bg-bhutan-gold/10 dark:bg-bhutan-saffron/20 hover:bg-bhutan-gold/20'
                    }`}
                  aria-label="Crop image"
                  title="Crop Image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3v18M17 3v18M3 7h18M3 17h18" />
                  </svg>
                </button>
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
                className={`px-6 py-3 font-heading font-medium rounded-t-xl transition-all duration-300 ${activeTab === tab.id
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
