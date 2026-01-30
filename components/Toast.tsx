'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertCircle, FiX } from 'react-icons/fi'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastProps {
  toast: Toast | null
  onClose: () => void
}

export default function Toast({ toast, onClose }: ToastProps) {
  if (!toast) return null

  const icons = {
    success: FiCheckCircle,
    error: FiXCircle,
    info: FiInfo,
    warning: FiAlertCircle,
  }

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  }

  const Icon = icons[toast.type]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className={`fixed top-4 right-4 z-50 ${colors[toast.type]} text-white rounded-xl shadow-2xl p-4 min-w-[300px] max-w-md`}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 flex-shrink-0" />
          <p className="flex-1 font-medium">{toast.message}</p>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Close"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
