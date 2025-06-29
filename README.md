# ClarityAI - Smart Content Summarizer

A Chrome extension that intelligently extracts and summarizes web content with AI-powered insights. Built with TypeScript, featuring smart content detection, one-click summarization, and a clean interface.

## 🌟 Core Features

### Smart Content Detection & Extraction

- **Automatic noise removal**: Eliminates ads, navigation, sidebars automatically
- **Intelligent main content detection**: Achieves 80%+ accuracy on common sites
- **Multi-strategy extraction**: Uses semantic HTML, readability algorithms, and fallback methods
- **Broad compatibility**: Handles Medium, news sites, blogs, and general web content

### One-Click Summarization

- **Floating action button**: Always visible "Summarize" button on every page
- **Consistent format**: Clean 3-bullet point summary format for easy scanning
- **Real-time feedback**: Loading states with progress indicators
- **Error resilience**: Comprehensive error handling with retry options

### Clean Popup Interface

- **Slide-out panel design**: Non-intrusive slide panel (not popup window)
- **Summary management**: View, copy, and export summaries
- **Quick actions**: One-click copy and export functionality
- **Settings control**: Toggle extension on/off per site

### Local Storage & Quick Access

- **Recent summaries**: Automatically saves last 10 summaries locally
- **Quick access**: Instant access via extension popup
- **Auto-cleanup**: Automatically deletes old summaries to manage storage
- **Export options**: Export summaries as text or markdown files

## 🚀 Technology Stack

### Frontend (Chrome Extension)

- **TypeScript**: Type-safe development
- **Webpack**: Module bundling and build optimization
- **Chrome Extension API**: Manifest V3 for modern Chrome extensions

### Backend (API Server)

- **Node.js + Express**: RESTful API server with MVC architecture
- **TypeScript**: Full type safety and modern JavaScript features
- **MVC Pattern**: Organized into Models, Views, Controllers for maintainability
- **Service Layer**: Separated business logic and external API integrations
- **Mozilla Readability**: Advanced content extraction
- **JSDOM**: Server-side DOM manipulation

## 📁 Project Structure

```
e:\ClarityAI\
├── backend/                     # API Server
│   ├── src/
│   │   ├── server.ts           # Main server entry point
│   │   ├── controllers/        # Request handlers
│   │   ├── services/           # Business logic
│   │   ├── routes/            # API routes
│   │   ├── models/            # Type definitions
│   │   ├── utils/             # Helper functions
│   │   └── middleware/        # CORS, logging, error handling
│   ├── package.json
│   └── tsconfig.json
│
└── chrome-extension/           # Chrome Extension
    ├── src/                    # TypeScript source files
    │   ├── content.ts          # Main content script
    │   ├── background.ts       # Service worker
    │   ├── popup.ts           # Extension popup
    │   ├── contentExtractor.ts # Smart content detection
    │   ├── storageManager.ts   # Local storage management
    │   ├── summarizationService.ts # API communication
    │   └── types.ts           # TypeScript definitions
    ├── styles/                # CSS styling
    ├── icons/                 # Extension icons
    ├── dist/                  # Built extension files
    ├── manifest.json          # Chrome extension manifest
    ├── popup.html            # Popup HTML
    ├── package.json
    ├── tsconfig.json
    └── webpack.config.js
```

## 🛠️ Quick Start

### Prerequisites

- Node.js 18+ and npm
- Google Chrome browser

### 1. Backend Setup

```powershell
cd "e:\ClarityAI\backend"
npm install
npm run dev
```

### 2. Extension Setup

```powershell
cd "e:\ClarityAI\chrome-extension"
npm install
npm run build
```

### 3. Load Extension in Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `e:\ClarityAI\chrome-extension\` folder

### 4. Test the Extension

1. Visit any webpage with content
2. Click the floating "Summarize" button
3. View the summary in the slide-out panel

## 🌐 API Endpoints

- **GET `/health`**: Health check
- **POST `/api/summarize`**: Generate summary
  - Body: `{ content: string, title: string, url: string }`
  - Returns: `{ points: string[], timestamp: string, wordCount: number }`

## 📊 How It Works

### Content Detection

1. **Semantic HTML**: Looks for `<article>`, `[role="main"]`, `.content`
2. **Readability Algorithm**: Scores elements based on content density
3. **Noise Removal**: Filters out ads, navigation, sidebars
4. **Fallback**: Uses full page content if other methods fail

### Summarization

- **Position scoring**: Prioritizes opening sentences
- **Length optimization**: Prefers 10-30 word sentences
- **Keyword matching**: Boosts sentences with title keywords
- **Content indicators**: Recognizes important terms and numbers

## 🔒 Privacy & Security

- **Local storage**: Summaries stored locally in Chrome
- **No tracking**: No analytics or user data collection
- **CORS enabled**: Secure backend communication
- **Minimal permissions**: Only necessary Chrome permissions

## 🚀 Future Enhancements

- AI Integration (OpenAI, Claude)
- Custom summary lengths
- Multiple summary formats
- Highlight integration
- Sharing features

## 🐛 Troubleshooting

### Extension not working?

1. Ensure backend is running at `http://localhost:3000`
2. Check Chrome extensions page for errors
3. Refresh extension after code changes

### Content not extracting?

- Works best on article-style content
- Some JavaScript-heavy sites may not work perfectly
- Dynamic content may require page refresh

---

**ClarityAI** - Making web content digestible! 🎯
