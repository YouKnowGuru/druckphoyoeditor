'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import PhotoUpload from '@/components/PhotoUpload'
import PhotoEditor from '@/components/PhotoEditor'
import Footer from '@/components/Footer'
import BackToTop from '@/components/BackToTop'
import QuickActions from '@/components/QuickActions'
import Toast from '@/components/Toast'
import { useToast } from '@/hooks/useToast'

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [editedImage, setEditedImage] = useState<string | null>(null)
  const { toast, hideToast } = useToast()

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl)
    setEditedImage(null)
  }

  const handleImageEdit = (imageUrl: string) => {
    setEditedImage(imageUrl)
  }

  const handleNewPhoto = () => {
    setUploadedImage(null)
    setEditedImage(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen relative">
      <Header />
      {!uploadedImage ? (
        <>
          <Hero />
          <PhotoUpload onImageUpload={handleImageUpload} />
        </>
      ) : (
        <PhotoEditor
          imageUrl={uploadedImage}
          onImageEdit={handleImageEdit}
          onNewPhoto={handleNewPhoto}
        />
      )}
      <Footer />
      <BackToTop />
      <QuickActions onNewPhoto={handleNewPhoto} />
      <Toast toast={toast} onClose={hideToast} />
    </main>
  )
}
