'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiX, FiImage, FiSettings } from 'react-icons/fi'

interface QuickActionsProps {
  onNewPhoto: () => void
}

export default function QuickActions({ onNewPhoto }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-24 right-8 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="mb-4 space-y-2"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNewPhoto}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-bhutan-saffron to-bhutan-royalRed text-white shadow-lg flex items-center justify-center"
              aria-label="New photo"
            >
              <FiImage className="w-6 h-6" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full bg-gradient-to-br from-bhutan-saffron to-bhutan-royalRed text-white shadow-2xl flex items-center justify-center"
        aria-label="Quick actions"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <FiX className="w-8 h-8" />
          ) : (
            <FiPlus className="w-8 h-8" />
          )}
        </motion.div>
      </motion.button>
    </div>
  )
}
