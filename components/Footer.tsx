'use client'

export default function Footer() {
  return (
    <footer className="bg-bhutan-charcoal dark:bg-bhutan-darkCharcoal text-bhutan-softWhite mt-20 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-lg font-accent mb-2">Tashi Delek!</p>
          <p className="text-bhutan-softWhite/70 mb-4">
            May all beings be happy and free from suffering
          </p>
          <p className="text-sm text-bhutan-softWhite/50">
            © {new Date().getFullYear()} Photo Editor. All processing happens in your browser - your privacy is protected.
          </p>
        </div>
      </div>
    </footer>
  )
}
