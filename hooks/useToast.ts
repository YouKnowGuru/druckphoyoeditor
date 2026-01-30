'use client'

import { useState, useCallback } from 'react'
import { ToastType } from '@/components/Toast'

interface Toast {
  id: string
  message: string
  type: ToastType
}

export function useToast() {
  const [toast, setToast] = useState<Toast | null>(null)

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(7)
    setToast({ id, message, type })
    
    setTimeout(() => {
      setToast(null)
    }, 3000)
  }, [])

  const hideToast = useCallback(() => {
    setToast(null)
  }, [])

  return { toast, showToast, hideToast }
}
