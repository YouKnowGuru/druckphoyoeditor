# Setup Instructions

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Building for Production

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Deploy automatically

### Netlify

1. Push your code to GitHub
2. Import your repository on [Netlify](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `.next`

### GitHub Pages

1. Install `gh-pages`: `npm install --save-dev gh-pages`
2. Add to package.json scripts:
   ```json
   "deploy": "next build && next export && touch out/.nojekyll && gh-pages -d out"
   ```
3. Run: `npm run deploy`

## Features

✅ Photo upload with drag-and-drop
✅ Automatic background removal
✅ Standard passport/ID photo sizing
✅ Manual adjustments (brightness, contrast, saturation, etc.)
✅ Print layout generator
✅ Export as PNG, JPG, or PDF
✅ Dark/Light mode
✅ Fully responsive design
✅ All processing client-side (no backend needed)

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## Notes

- Background removal uses @imgly/background-removal library (free, no API key needed)
- All image processing happens in the browser
- No data is sent to any server
- Works offline after initial load
