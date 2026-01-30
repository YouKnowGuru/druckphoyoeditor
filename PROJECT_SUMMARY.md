# Photo Editor - Project Summary

## 🎯 Project Overview

A professional, fully-featured web-based photo editing application for passport/ID photo processing with a beautiful Bhutanese-inspired design. All processing happens client-side in the browser - no backend or server required!

## ✨ Key Features

### Core Functionality
- **Photo Upload**: Drag-and-drop interface with instant preview
- **Background Removal**: AI-powered automatic background removal using @imgly/background-removal
- **Photo Sizing**: Preset templates for common passport/ID sizes (35mm x 45mm standard)
- **Automatic Enhancements**: Color correction, lighting adjustment, sharpening
- **Manual Adjustments**: Real-time controls for brightness, contrast, saturation, sharpness, exposure
- **Print Layout Generator**: Create multiple copies on standard paper sizes (4x6", A4, 5x7")
- **Export Options**: Download as PNG, JPG, or PDF

### Design Features
- **Bhutanese-Inspired UI**: Beautiful color palette with saffron, gold, royal red, and mountain blue
- **Dark/Light Mode**: Smooth transitions with system preference detection
- **Fully Responsive**: Perfect on mobile, tablet, and desktop
- **Smooth Animations**: Framer Motion for elegant transitions
- **Bottom-to-Top Buttons**: Back to top and quick actions floating buttons
- **Traditional Patterns**: Subtle Bhutanese textile-inspired patterns

## 🛠️ Technology Stack

### Frontend Framework
- **Next.js 14**: React framework with App Router
- **React 18**: UI library
- **TypeScript**: Type safety

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Custom Bhutanese Theme**: Extended color palette and design tokens
- **Framer Motion**: Animation library

### Image Processing
- **Canvas API**: Native browser image manipulation
- **@imgly/background-removal**: Free AI background removal (no API key)
- **Pica.js**: High-quality image resizing
- **Custom Filters**: Brightness, contrast, saturation, sharpness, exposure

### PDF Generation
- **jsPDF**: Client-side PDF creation

### UI Components
- **react-dropzone**: Drag-and-drop file upload
- **react-icons**: Icon library

## 📁 Project Structure

```
photoo/
├── app/
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx            # Main page component
│   └── globals.css         # Global styles and Bhutanese theme
├── components/
│   ├── Header.tsx           # Sticky header with theme toggle
│   ├── Hero.tsx            # Hero section
│   ├── PhotoUpload.tsx     # Drag-and-drop upload component
│   ├── PhotoEditor.tsx     # Main editor with tabs
│   ├── BackgroundRemoval.tsx  # Background removal tool
│   ├── PhotoSizing.tsx     # Size presets and custom sizing
│   ├── ManualAdjustments.tsx  # Adjustment sliders
│   ├── PrintLayout.tsx     # Print layout generator
│   ├── Footer.tsx          # Footer with Bhutanese blessing
│   ├── BackToTop.tsx       # Scroll to top button
│   ├── QuickActions.tsx    # Floating action button
│   ├── ThemeProvider.tsx   # Dark/light mode provider
│   └── Toast.tsx           # Notification component
├── hooks/
│   └── useToast.ts         # Toast notification hook
├── utils/
│   └── exportUtils.ts      # Export functions (PNG, JPG, PDF)
└── Configuration files...
```

## 🎨 Design System

### Color Palette
- **Primary**: Saffron (#FF9933), Gold (#F4A460), Royal Red (#DC143C)
- **Secondary**: Mountain Blue (#4A90E2), Forest Green (#2D5016)
- **Neutrals**: Cloud White (#F8F9FA), Charcoal (#2D3748)

### Typography
- **Headings**: Poppins/Montserrat (bold, modern)
- **Body**: Inter/Roboto (clean, readable)
- **Accent**: Playfair Display (elegant headers)

### Components
- **Buttons**: Gradient primary, outlined secondary
- **Cards**: Rounded corners (12-16px), soft shadows
- **Inputs**: Golden borders with focus states
- **Animations**: 300ms ease transitions

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Deployment

### Free Hosting Options
- **Vercel** (Recommended): Automatic deployments from GitHub
- **Netlify**: Free tier with continuous deployment
- **GitHub Pages**: Free static hosting

### Build for Production
```bash
npm run build
npm start
```

## 🔒 Privacy & Security

- ✅ All processing happens client-side
- ✅ No data sent to servers
- ✅ No API keys required
- ✅ Works offline after initial load
- ✅ Images never leave the browser

## 📱 Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🎯 Use Cases

- Passport photo processing
- ID card photos
- Visa application photos
- Professional headshots
- Document photos
- Batch photo processing

## 🔧 Customization

### Adding New Photo Sizes
Edit `components/PhotoSizing.tsx` - add to `PRESETS` array

### Adding New Print Layouts
Edit `components/PrintLayout.tsx` - add to `LAYOUTS` array

### Customizing Colors
Edit `tailwind.config.js` - modify `bhutan` color palette

### Adding Features
All components are modular and can be extended easily

## 📝 License

This project uses only free and open-source libraries. No paid services or API keys required.

## 🙏 Acknowledgments

- Bhutanese design inspiration
- Free open-source libraries
- Browser APIs for client-side processing

---

**Tashi Delek!** May this tool help create beautiful passport photos! 🐉
