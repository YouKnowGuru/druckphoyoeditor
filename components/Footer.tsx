'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { FiGithub, FiTwitter, FiLinkedin, FiMail, FiHeart } from 'react-icons/fi'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    features: [
      { name: 'Background Removal', href: '#background-removal' },
      { name: 'Photo Sizing', href: '#photo-sizing' },
      { name: 'Manual Adjustments', href: '#adjustments' },
      { name: 'Print Layout', href: '#print-layout' },
    ],
    resources: [
      { name: 'Getting Started', href: '#hero' },
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Terms of Service', href: '#terms' },
      { name: 'Help & Support', href: '#help' },
    ],
    social: [
      { name: 'GitHub', icon: FiGithub, href: 'https://github.com', color: 'hover:text-gray-900 dark:hover:text-white' },
      { name: 'Twitter', icon: FiTwitter, href: 'https://twitter.com', color: 'hover:text-blue-400' },
      { name: 'LinkedIn', icon: FiLinkedin, href: 'https://linkedin.com', color: 'hover:text-blue-600' },
      { name: 'Email', icon: FiMail, href: 'mailto:contact@example.com', color: 'hover:text-bhutan-saffron' },
    ],
  }

  return (
    <footer className="relative mt-20 bg-gradient-to-br from-bhutan-charcoal via-bhutan-darkCharcoal to-bhutan-charcoal dark:from-bhutan-darkCharcoal dark:via-black dark:to-bhutan-darkCharcoal text-bhutan-softWhite overflow-hidden">
      {/* Decorative Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,153,51,0.1) 35px, rgba(255,153,51,0.1) 70px)`,
        }} />
      </div>

      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-bhutan-saffron to-transparent" />

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-12 h-12 overflow-hidden rounded-lg bg-white/10 backdrop-blur-sm p-1">
                <Image
                  src="/logo.png"
                  alt="our store logo"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-2xl font-heading font-bold bg-gradient-to-r from-bhutan-saffron to-bhutan-gold bg-clip-text text-transparent">
                our store
              </h3>
            </div>
            <p className="text-bhutan-softWhite/70 mb-4 leading-relaxed">
              Professional passport photo editing. All processing happens securely in your browser.
            </p>
            <div className="flex items-center gap-2 text-sm text-bhutan-softWhite/60">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>100% Client-Side Processing</span>
            </div>
          </motion.div>

          {/* Features Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="text-lg font-heading font-semibold mb-4 text-bhutan-gold">
              Features
            </h4>
            <ul className="space-y-2">
              {footerLinks.features.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-bhutan-softWhite/70 hover:text-bhutan-saffron transition-colors duration-300 inline-flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-bhutan-saffron transition-all duration-300 mr-0 group-hover:mr-2" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-lg font-heading font-semibold mb-4 text-bhutan-gold">
              Resources
            </h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-bhutan-softWhite/70 hover:text-bhutan-saffron transition-colors duration-300 inline-flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-bhutan-saffron transition-all duration-300 mr-0 group-hover:mr-2" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social & Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="text-lg font-heading font-semibold mb-4 text-bhutan-gold">
              Connect With Us
            </h4>
            <div className="flex gap-3 mb-6">
              {footerLinks.social.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-lg bg-bhutan-softWhite/10 backdrop-blur-sm flex items-center justify-center text-bhutan-softWhite/70 ${social.color} transition-all duration-300 hover:scale-110 hover:bg-bhutan-softWhite/20`}
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
            <p className="text-sm text-bhutan-softWhite/60 italic">
              &quot;Quality photos for your specialized needs.&quot;
            </p>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-bhutan-softWhite/10" />
          </div>
          <div className="relative flex justify-center">
            <div className="bg-bhutan-charcoal dark:bg-bhutan-darkCharcoal px-4">
              <div className="w-8 h-1 bg-gradient-to-r from-bhutan-saffron via-bhutan-gold to-bhutan-saffron rounded-full" />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-bhutan-softWhite/50">
          <div className="flex items-center gap-2">
            <span>© {currentYear} our store.</span>
            <span className="hidden md:inline">•</span>
            <span>All rights reserved.</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Made with</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
            >
              <FiHeart className="w-4 h-4 text-red-500 fill-current" />
            </motion.div>
            <span>for beautiful photos</span>
          </div>

          <div className="text-xs">
            <span className="px-3 py-1 rounded-full bg-bhutan-softWhite/5 border border-bhutan-softWhite/10">
              🔒 Privacy Protected
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-bhutan-saffron via-bhutan-gold to-bhutan-royalRed" />
    </footer>
  )
}
