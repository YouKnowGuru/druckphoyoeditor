'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FiUpload, FiImage, FiX } from 'react-icons/fi'
import { motion } from 'framer-motion'

interface PhotoUploadProps {
  onImageUpload: (imageUrl: string) => void
}

export default function PhotoUpload({ onImageUpload }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsProcessing(true)
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreview(result)
      setIsProcessing(false)
      onImageUpload(result)
    }

    reader.readAsDataURL(file)
  }, [onImageUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.heic', '.webp']
    },
    multiple: false
  })

  const handleRemove = () => {
    setPreview(null)
  }

  return (
    <section className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div
          {...getRootProps()}
          className={`
            relative border-4 border-dashed rounded-2xl p-12 text-center cursor-pointer
            transition-all duration-300
            ${isDragActive 
              ? 'border-bhutan-saffron bg-bhutan-gold/10 scale-105' 
              : 'border-bhutan-gold/30 dark:border-bhutan-saffron/30 hover:border-bhutan-saffron hover:bg-bhutan-gold/5'
            }
            ${preview ? 'border-solid' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="max-w-full max-h-96 mx-auto rounded-xl shadow-2xl"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
                className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                aria-label="Remove image"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {isProcessing ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-bhutan-saffron border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-lg font-heading">Processing your photo...</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-bhutan-saffron to-bhutan-royalRed flex items-center justify-center">
                      <FiUpload className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-heading font-bold mb-2">
                      {isDragActive ? 'Drop your photo here' : 'Upload Your Photo'}
                    </h2>
                    <p className="text-bhutan-charcoal/60 dark:text-bhutan-softWhite/60 mb-4">
                      Drag and drop an image, or click to browse
                    </p>
                    <p className="text-sm text-bhutan-charcoal/50 dark:text-bhutan-softWhite/50">
                      Supports: JPG, PNG, HEIC, WEBP
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </section>
  )
}
