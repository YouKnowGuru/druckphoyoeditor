'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi'
import { useTheme } from './ThemeProvider'

export default function Header() {
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-bhutan-darkCharcoal/80 backdrop-blur-md border-b border-bhutan-gold/20 dark:border-bhutan-saffron/30 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 overflow-hidden rounded-lg">
              <Image
                src="/logo.png"
                alt="our store logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold gradient-text">
                our store
              </h1>
              <p className="text-xs text-bhutan-charcoal/60 dark:text-bhutan-softWhite/60">
                Welcome to our store
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-bhutan-gold/10 dark:bg-bhutan-saffron/20 hover:bg-bhutan-gold/20 dark:hover:bg-bhutan-saffron/30 transition-all duration-300"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <FiMoon className="w-5 h-5 text-bhutan-charcoal dark:text-bhutan-softWhite" />
              ) : (
                <FiSun className="w-5 h-5 text-bhutan-charcoal dark:text-bhutan-softWhite" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-bhutan-gold/10 dark:bg-bhutan-saffron/20"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <FiX className="w-5 h-5" />
              ) : (
                <FiMenu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
