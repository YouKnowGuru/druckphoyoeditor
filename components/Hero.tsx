'use client'

import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="relative py-20 px-4 overflow-hidden bhutan-pattern">
      <div className="container mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-accent font-bold mb-6 gradient-text">
            our store
          </h1>
          <p className="text-xl md:text-2xl text-bhutan-charcoal/70 dark:text-bhutan-softWhite/70 mb-8 max-w-2xl mx-auto">
            Create perfect passport and ID photos with automatic enhancements.
            All processing happens in your browser - your privacy is protected.
          </p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-bhutan-saffron to-bhutan-royalRed flex items-center justify-center animate-pulse-glow">
              <span className="text-3xl">📸</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
