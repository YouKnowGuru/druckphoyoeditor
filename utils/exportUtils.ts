import jsPDF from 'jspdf'

export async function exportAsPNG(imageUrl: string) {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  
  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = reject
    img.src = imageUrl
  })

  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.drawImage(img, 0, 0)
  }

  const link = document.createElement('a')
  link.download = 'passport-photo.png'
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export async function exportAsJPG(imageUrl: string) {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  
  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = reject
    img.src = imageUrl
  })

  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  if (ctx) {
    // Fill white background for JPG
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0)
  }

  const link = document.createElement('a')
  link.download = 'passport-photo.jpg'
  link.href = canvas.toDataURL('image/jpeg', 0.95)
  link.click()
}

export async function exportAsPDF(imageUrl: string) {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  
  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = reject
    img.src = imageUrl
  })

  // Standard passport size: 35mm x 45mm = 1.38" x 1.77"
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: [1.38, 1.77]
  })

  const imgData = imageUrl
  pdf.addImage(imgData, 'PNG', 0, 0, 1.38, 1.77)
  pdf.save('passport-photo.pdf')
}
