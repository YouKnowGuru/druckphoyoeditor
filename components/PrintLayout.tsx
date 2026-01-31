'use client'

import { useState, useRef, useEffect } from 'react'
import { FiDownload } from 'react-icons/fi'
import jsPDF from 'jspdf'

interface PrintLayoutProps {
  imageUrl: string
}

const LAYOUTS = [
  { name: 'A4 - Half Photo (3.5x5") - No Space', width: 8.27, height: 11.69, photoWidth: 3.5, photoHeight: 5, copies: 4, cols: 2, rows: 2 },
  { name: '4x6" - Half Photo (3.5x5") - No Space', width: 4, height: 6, photoWidth: 3.5, photoHeight: 5, copies: 1, cols: 1, rows: 1 },
  { name: 'A4 - 35x45mm (No Space)', width: 8.27, height: 11.69, photoWidth: 1.38, photoHeight: 1.77, copies: 12, cols: 3, rows: 4 },
  { name: '4x6" - 35x45mm (No Space)', width: 4, height: 6, photoWidth: 1.38, photoHeight: 1.77, copies: 8, cols: 4, rows: 2 },
  { name: 'Letter - 35x45mm (No Space)', width: 8.5, height: 11, photoWidth: 1.38, photoHeight: 1.77, copies: 10, cols: 2, rows: 5 },
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

      // Calculate photo size from layout or default to passport
      const photoWidthInches = (selectedLayout as any).photoWidth || 1.38
      const photoHeightInches = (selectedLayout as any).photoHeight || 1.77
      const photoWidth = photoWidthInches * dpi
      const photoHeight = photoHeightInches * dpi

      // Zero margin and zero spacing as requested
      const margin = 0
      const spacing = 0
      const cols = selectedLayout.cols
      const rows = selectedLayout.rows
      const cellWidth = photoWidth
      const cellHeight = photoHeight

      // Draw photos
      let copyIndex = 0
      for (let row = 0; row < rows && copyIndex < selectedLayout.copies; row++) {
        for (let col = 0; col < cols && copyIndex < selectedLayout.copies; col++) {
          const x = margin + col * (cellWidth + spacing)
          const y = margin + row * (cellHeight + spacing)

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

  const printLayout = () => {
    generatePrintLayout()

    setTimeout(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const dataUrl = canvas.toDataURL('image/png')
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        alert('Please allow pop-ups to print')
        return
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Print Photo Layout</title>
            <style>
              @media print {
                @page { margin: 0; size: auto; }
                body { margin: 0; padding: 0; }
                img { width: 100%; height: auto; display: block; }
              }
              body { 
                margin: 0; 
                padding: 0; 
                display: flex; 
                justify-content: center; 
                align-items: center;
                background: #f0f0f0;
                min-height: 100vh;
              }
              img { 
                max-width: 100%; 
                height: auto; 
                box-shadow: 0 0 20px rgba(0,0,0,0.2);
                background: white;
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" />
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.onafterprint = function() { window.close(); };
                }, 500);
              };
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
    }, 500)
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="space-y-6 no-print">
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
              className="max-w-full h-auto border border-bhutan-gold/20 rounded-lg mx-auto"
              style={{ maxHeight: '600px' }}
            />
          </div>
          {/* Hidden container specifically for printing */}
          <div className="print-only-container" />
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={() => {
                generatePrintLayout()
              }}
              className="btn-secondary flex-1 min-w-[140px]"
            >
              Generate Layout
            </button>
            <button
              onClick={printLayout}
              className="btn-primary flex-1 min-w-[140px] flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Now
            </button>
            <button
              onClick={exportAsPDF}
              className="btn-primary flex-1 min-w-[140px] flex items-center justify-center gap-2"
            >
              <FiDownload className="w-5 h-5" />
              Download PDF
            </button>
            <button
              onClick={exportAsImage}
              className="btn-primary flex-1 min-w-[140px] flex items-center justify-center gap-2"
            >
              <FiDownload className="w-5 h-5" />
              Download PNG
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
