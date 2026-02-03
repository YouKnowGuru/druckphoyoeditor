'use client'

import { useState, useRef, useEffect } from 'react'
import { FiDownload } from 'react-icons/fi'
import jsPDF from 'jspdf'

interface PrintLayoutProps {
  imageUrl: string
}

const LAYOUTS = [
  { name: 'A4 Paper', width: 8.27, height: 11.69 },
  { name: '4x6" Photo Paper', width: 4, height: 6 },
  { name: 'Letter Paper', width: 8.5, height: 11 },
]

const PHOTO_SIZES = [
  { name: 'Passport (35x45mm)', width: 1.38, height: 1.77 },
  { name: 'Half Photo (3.5x5")', width: 3.5, height: 5 },
  { name: 'Square (2x2")', width: 2, height: 2 },
]

export default function PrintLayout({ imageUrl }: PrintLayoutProps) {
  const [selectedLayout, setSelectedLayout] = useState(LAYOUTS[0])
  const [selectedPhotoSize, setSelectedPhotoSize] = useState(PHOTO_SIZES[0])
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [showCutLines, setShowCutLines] = useState(true)
  const [copies, setCopies] = useState(8)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generatePrintLayout = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const dpi = 300

      const pWidth = orientation === 'portrait' ? selectedLayout.width : selectedLayout.height
      const pHeight = orientation === 'portrait' ? selectedLayout.height : selectedLayout.width

      const paperWidth = pWidth * dpi
      const paperHeight = pHeight * dpi

      canvas.width = paperWidth
      canvas.height = paperHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // White background
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const photoWidthInches = selectedPhotoSize.width
      const photoHeightInches = selectedPhotoSize.height
      const photoWidth = photoWidthInches * dpi
      const photoHeight = photoHeightInches * dpi

      // Calculate how many fit
      const spacing = 0
      const margin = 0.1 * dpi

      const cols = Math.floor((paperWidth - margin * 2) / photoWidth)
      const rows = Math.floor((paperHeight - margin * 2) / photoHeight)

      const cellWidth = photoWidth
      const cellHeight = photoHeight


      // Use minimal margin at the top-left to avoid wasting paper as requested
      const marginX = 0.1 * dpi
      const marginY = 0.1 * dpi

      // Draw photos
      let copyIndex = 0
      for (let row = 0; row < rows && copyIndex < copies; row++) {
        for (let col = 0; col < cols && copyIndex < copies; col++) {
          const x = marginX + col * (cellWidth + spacing)
          const y = marginY + row * (cellHeight + spacing)

          // Draw photo with aspect ratio preservation (object-fit: cover equivalent)
          const imageAspect = img.width / img.height
          const slotAspect = photoWidth / photoHeight

          let drawWidth = photoWidth
          let drawHeight = photoHeight
          let offsetX = 0
          let offsetY = 0

          if (imageAspect > slotAspect) {
            // Image is wider than slot - crop sides
            drawWidth = img.height * slotAspect
            drawHeight = img.height
            offsetX = (img.width - drawWidth) / 2
          } else {
            // Image is taller than slot - crop top/bottom
            // To avoid cutting off heads, we'll keep the top fixed and crop from the bottom if it's too tall, 
            // but standard 'cover' centers it. The user said head is cut, so let's shift it.
            drawWidth = img.width
            drawHeight = img.width / slotAspect
            // Instead of (img.height - drawHeight) / 2, we can prioritize the top
            offsetY = Math.max(0, (img.height - drawHeight) * 0.2) // Shift slightly down to keep head
          }

          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight, x, y, photoWidth, photoHeight)

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
  }, [selectedLayout, selectedPhotoSize, orientation, showCutLines, imageUrl, copies])

  const exportAsPDF = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    generatePrintLayout()

    setTimeout(() => {
      const pWidth = orientation === 'portrait' ? selectedLayout.width : selectedLayout.height
      const pHeight = orientation === 'portrait' ? selectedLayout.height : selectedLayout.width

      const pdf = new jsPDF({
        orientation: pWidth > pHeight ? 'landscape' : 'portrait',
        unit: 'in',
        format: [pWidth, pHeight]
      })

      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 0, 0, pWidth, pHeight)
      pdf.save('print-layout.pdf')
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-bhutan-charcoal/40 dark:text-bhutan-softWhite/40">Paper Size</h4>
            <div className="flex flex-col gap-2">
              {LAYOUTS.map((layout) => (
                <button
                  key={layout.name}
                  onClick={() => {
                    setSelectedLayout(layout)
                    setTimeout(generatePrintLayout, 100)
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${selectedLayout.name === layout.name
                    ? 'border-bhutan-saffron bg-bhutan-gold/10 dark:bg-bhutan-saffron/20'
                    : 'border-bhutan-gold/30 dark:border-bhutan-saffron/30 hover:border-bhutan-saffron'
                    }`}
                >
                  <div className="font-heading font-semibold text-sm">{layout.name}</div>
                  <div className="text-xs text-bhutan-charcoal/60 dark:text-bhutan-softWhite/60">
                    {layout.width}&quot; × {layout.height}&quot;
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-bhutan-charcoal/40 dark:text-bhutan-softWhite/40">Photo Size</h4>
            <div className="flex flex-col gap-2">
              {PHOTO_SIZES.map((size) => (
                <button
                  key={size.name}
                  onClick={() => {
                    setSelectedPhotoSize(size)
                    setTimeout(generatePrintLayout, 100)
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${selectedPhotoSize.name === size.name
                    ? 'border-bhutan-saffron bg-bhutan-gold/10 dark:bg-bhutan-saffron/20'
                    : 'border-bhutan-gold/30 dark:border-bhutan-saffron/30 hover:border-bhutan-saffron'
                    }`}
                >
                  <div className="font-heading font-semibold text-sm">{size.name}</div>
                  <div className="text-xs text-bhutan-charcoal/60 dark:text-bhutan-softWhite/60">
                    {size.width}&quot; × {size.height}&quot;
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-bhutan-charcoal/40 dark:text-bhutan-softWhite/40">Orientation</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setOrientation('portrait')}
                className={`p-3 rounded-xl border-2 text-center transition-all ${orientation === 'portrait'
                  ? 'border-bhutan-saffron bg-bhutan-gold/10 dark:bg-bhutan-saffron/20'
                  : 'border-bhutan-gold/30 dark:border-bhutan-saffron/30 hover:border-bhutan-saffron'
                  }`}
              >
                Portrait
              </button>
              <button
                onClick={() => setOrientation('landscape')}
                className={`p-3 rounded-xl border-2 text-center transition-all ${orientation === 'landscape'
                  ? 'border-bhutan-saffron bg-bhutan-gold/10 dark:bg-bhutan-saffron/20'
                  : 'border-bhutan-gold/30 dark:border-bhutan-saffron/30 hover:border-bhutan-saffron'
                  }`}
              >
                Landscape
              </button>
            </div>
          </div>
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
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="font-heading font-semibold">Number of Copies</h4>
              <p className="text-sm text-bhutan-charcoal/60 dark:text-bhutan-softWhite/60">
                Adjust the total number of photos to print on this page.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCopies(Math.max(1, copies - 1))}
                className="w-10 h-10 rounded-lg bg-bhutan-gold/10 dark:bg-bhutan-saffron/20 flex items-center justify-center hover:bg-bhutan-gold/20 transition-colors"
                disabled={copies <= 1}
              >
                -
              </button>
              <input
                type="number"
                value={copies}
                onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 text-center bg-transparent border-2 border-bhutan-gold/30 dark:border-bhutan-saffron/30 rounded-lg py-1 font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="1"
              />
              <button
                onClick={() => setCopies(copies + 1)}
                className="w-10 h-10 rounded-lg bg-bhutan-gold/10 dark:bg-bhutan-saffron/20 flex items-center justify-center hover:bg-bhutan-gold/20 transition-colors"
              >
                +
              </button>
            </div>
          </div>
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
