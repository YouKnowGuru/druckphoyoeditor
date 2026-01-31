'use client'

import { useState, useRef, useEffect } from 'react'
import { FiDownload } from 'react-icons/fi'
import jsPDF from 'jspdf'

interface PrintLayoutProps {
  imageUrl: string
}

const LAYOUTS = [
  { name: '4x6" - 6 copies', width: 4, height: 6, copies: 6, cols: 3, rows: 2 },
  { name: 'A4 - 8 copies', width: 8.27, height: 11.69, copies: 8, cols: 2, rows: 4 },
  { name: '5x7" - 4 copies', width: 5, height: 7, copies: 4, cols: 2, rows: 2 },
]

export default function PrintLayout({ imageUrl }: PrintLayoutProps) {
  const [selectedLayout, setSelectedLayout] = useState(LAYOUTS[0])
  const [showCutLines, setShowCutLines] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generatePrintLayout = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const dpi = 300
      const paperWidth = selectedLayout.width * dpi
      const paperHeight = selectedLayout.height * dpi

      canvas.width = paperWidth
      canvas.height = paperHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // White background
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Calculate photo size (35x45mm = 1.38x1.77 inches)
      const photoWidthInches = 1.38
      const photoHeightInches = 1.77
      const photoWidth = photoWidthInches * dpi
      const photoHeight = photoHeightInches * dpi

      // Calculate spacing
      const margin = 0.2 * dpi
      const spacing = 0.1 * dpi
      const availableWidth = paperWidth - (margin * 2)
      const availableHeight = paperHeight - (margin * 2)
      const cols = selectedLayout.cols
      const rows = selectedLayout.rows
      const totalSpacingX = (cols - 1) * spacing
      const totalSpacingY = (rows - 1) * spacing
      const cellWidth = (availableWidth - totalSpacingX) / cols
      const cellHeight = (availableHeight - totalSpacingY) / rows

      // Draw photos
      let copyIndex = 0
      for (let row = 0; row < rows && copyIndex < selectedLayout.copies; row++) {
        for (let col = 0; col < cols && copyIndex < selectedLayout.copies; col++) {
          const x = margin + col * (cellWidth + spacing) + (cellWidth - photoWidth) / 2
          const y = margin + row * (cellHeight + spacing) + (cellHeight - photoHeight) / 2

          // Draw photo
          ctx.drawImage(img, x, y, photoWidth, photoHeight)

          // Draw cut lines if enabled
          if (showCutLines) {
            ctx.strokeStyle = '#FF0000'
            ctx.lineWidth = 2
            ctx.setLineDash([5, 5])
            ctx.strokeRect(x, y, photoWidth, photoHeight)
            ctx.setLineDash([])
          }

          copyIndex++
        }
      }

      // Draw outer border
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 1
      ctx.strokeRect(0, 0, canvas.width, canvas.height)
    }
    img.src = imageUrl
  }

  useEffect(() => {
    if (imageUrl) {
      generatePrintLayout()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLayout, showCutLines, imageUrl])

  const exportAsPDF = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    generatePrintLayout()

    setTimeout(() => {
      const pdf = new jsPDF({
        orientation: selectedLayout.width > selectedLayout.height ? 'landscape' : 'portrait',
        unit: 'in',
        format: [selectedLayout.width, selectedLayout.height]
      })

      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 0, 0, selectedLayout.width, selectedLayout.height)
      pdf.save('passport-photos.pdf')
    }, 500)
  }

  const exportAsImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    generatePrintLayout()

    setTimeout(() => {
      const link = document.createElement('a')
      link.download = 'passport-photos.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    }, 500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-heading font-bold mb-4">Print Layout</h3>
        <p className="text-bhutan-charcoal/70 dark:text-bhutan-softWhite/70 mb-6">
          Generate a print-ready layout with multiple copies of your photo on standard paper sizes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {LAYOUTS.map((layout) => (
          <button
            key={layout.name}
            onClick={() => {
              setSelectedLayout(layout)
              setTimeout(generatePrintLayout, 100)
            }}
            className={`p-4 rounded-xl border-2 text-left transition-all ${selectedLayout.name === layout.name
                ? 'border-bhutan-saffron bg-bhutan-gold/10 dark:bg-bhutan-saffron/20'
                : 'border-bhutan-gold/30 dark:border-bhutan-saffron/30 hover:border-bhutan-saffron'
              }`}
          >
            <div className="font-heading font-semibold mb-1">{layout.name}</div>
            <div className="text-sm text-bhutan-charcoal/60 dark:text-bhutan-softWhite/60">
              {layout.width}&quot; × {layout.height}&quot;
            </div>
          </button>
        ))}
      </div>

      <div className="card">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showCutLines}
            onChange={(e) => {
              setShowCutLines(e.target.checked)
              generatePrintLayout()
            }}
            className="w-5 h-5 accent-bhutan-saffron"
          />
          <span className="font-medium">Show cut lines</span>
        </label>
      </div>

      <div className="card">
        <h4 className="font-heading font-semibold mb-4">Preview</h4>
        <div className="bg-bhutan-cream dark:bg-bhutan-darkCharcoal rounded-xl p-4 overflow-auto">
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto border border-bhutan-gold/20 rounded-lg"
            style={{ maxHeight: '600px' }}
          />
        </div>
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => {
              generatePrintLayout()
            }}
            className="btn-secondary flex-1"
          >
            Generate Layout
          </button>
          <button
            onClick={exportAsPDF}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <FiDownload className="w-5 h-5" />
            Download PDF
          </button>
          <button
            onClick={exportAsImage}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <FiDownload className="w-5 h-5" />
            Download PNG
          </button>
        </div>
      </div>
    </div>
  )
}
