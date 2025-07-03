# ClarityAI Chrome Extension

A Chrome browser extension that automatically summarizes web articles using AI. This extension extracts content from web pages and sends it to a backend API for intelligent summarization using Google's Gemini AI.

## 🚀 Current Status: **FULLY FUNCTIONAL**

The extension has been completely refactored to use a simple, functional approach and is ready for production use.

## 📋 Features

- **Smart Content Detection**: Automatically detects long-form articles and content worth summarizing
- **AI-Powered Summarization**: Uses Google Gemini AI for intelligent, accurate summaries
- **Floating Action Button**: Non-intrusive summarize button that appears on supported pages
- **Local Storage**: Saves summaries locally for quick access
- **Site Management**: Enable/disable extension for specific sites
- **Export Options**: Copy summaries to clipboard
- **Clean UI**: Simple, modern popup interface

## 🏗️ Architecture

### Backend Integration

- **API Endpoint**: `https://clarityai-qrnk.onrender.com/api/summarize`
- **AI Service**: Google Gemini AI (only AI service used)
- **Deployment**: Render.com

### Extension Structure

```
src/
├── background.ts        # Service worker for extension lifecycle
├── content.ts          # Content script (functional style)
├── popup.ts            # Popup interface (functional style)
├── contentExtractor.ts # Content extraction logic (functional style)
├── storageManager.ts   # Local storage management (class-based)
├── summarizationService.ts # API communication (functional style)
└── types.ts           # TypeScript type definitions
```

## 🛠️ Build & Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Chrome browser

### Build Process

```bash
# Install dependencies
npm install

# Build the extension
npm run build

# Output will be in ./dist/ folder
```

### Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `dist` folder
5. Extension is now loaded and ready to use

## 🧪 Testing

Use the included `test-extension.html` file to test the extension:

```bash
# Open the test file in Chrome
open test-extension.html
```

The test page includes:

- Long-form article content (500+ words)
- Instructions for testing features
- What to expect when testing

## 📁 Key Files

### Content Extraction (`contentExtractor.ts`)

- Functional approach for extracting article content
- Supports semantic HTML elements and common content patterns
- Noise filtering for ads, navigation, etc.
- Multi-language support

### Popup Interface (`popup.ts`)

- Functional style (no classes)
- Tab-based interface (summaries & settings)
- Local storage management
- Site-specific controls

### API Service (`summarizationService.ts`)

- Simple fetch-based API calls
- Error handling and timeout management
- Fallback summarization (client-side)

## ⚙️ Configuration

The extension uses these default settings:

```typescript
{
  enabled: true,           // Global enable/disable
  autoDetect: true,        // Auto-detect long articles
  disabledSites: [],       // Sites where extension is disabled
  summaryFormat: "bullets" // Summary format preference
}
```

## 🔧 Code Style

The entire codebase has been refactored to use:

- **Functional programming**: No classes in content scripts
- **Simple patterns**: Easy to understand and maintain
- **TypeScript**: Full type safety
- **Modern ES6+**: Clean, readable code

## 📦 Deployment

### Extension Store (Future)

The extension is ready for Chrome Web Store submission:

- All manifest requirements met
- Icons and metadata included
- Privacy policy compliant

### Backend Deployment

Backend is already deployed on Render.com:

- Health endpoint: `https://clarityai-qrnk.onrender.com/health`
- API endpoint: `https://clarityai-qrnk.onrender.com/api/summarize`

## 🐛 Troubleshooting

### Build Errors

- Ensure Node.js 18+ is installed
- Run `npm install` to ensure all dependencies are installed
- Check TypeScript compilation with `npm run build`

### Extension Not Working

- Check if extension is enabled in Chrome
- Verify the page has sufficient content (50+ words)
- Check browser console for error messages
- Ensure backend API is accessible

### Summary Quality Issues

- Content extraction works best on article-style pages
- Some dynamic content might not be captured
- Very short content (< 50 words) is filtered out

## 📝 Recent Changes

### v1.0.0 - Functional Refactor (Latest)

- ✅ Converted all extension scripts to functional style
- ✅ Removed all duplicate/legacy code
- ✅ Fixed TypeScript compilation errors
- ✅ Updated backend to use only Gemini AI
- ✅ Clean, maintainable codebase ready for production

## 🤝 Contributing

The codebase is now clean and well-structured for future development:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/name`)
3. Make changes following the functional style
4. Test thoroughly using the test page
5. Submit pull request

## 📄 License

MIT License - See LICENSE file for details.
