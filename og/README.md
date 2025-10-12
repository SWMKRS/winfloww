# Infloww Original Code (v5.6.0)

This directory contains the complete application code extracted from Infloww.app.

## Contents

**Total Files**: 152 files
**Total Size**: ~17 MB
**Code Files**: 55 JavaScript/CSS/HTML files
**Source**: `/Applications/Infloww.app/Contents/Resources/app/`

## Directory Structure

```
og/
├── app-Info.plist              # macOS app bundle configuration
├── app-update.yml              # Auto-update configuration
├── package.json                # App metadata and dependencies
└── dist/                       # Production build
    ├── main/                   # Electron main process
    │   ├── index.js            # Entry point (loads main.jsc)
    │   └── main.jsc            # Compiled bytecode (Bytenode)
    ├── preload/                # Preload scripts (bridge)
    │   ├── index.js            # Main preload entry
    │   ├── empty.js            # Empty preload placeholder
    │   ├── browserview/        # Platform injections
    │   │   ├── of-base.js      # OnlyFans integration
    │   │   └── fansly-base.js  # Fansly integration
    │   ├── hooks/              # API & WebSocket hooks
    │   │   ├── api.js          # API interception
    │   │   └── ws.js           # WebSocket handling
    │   └── pages/              # Preload window pages (MJS modules)
    │       ├── main-*.mjs      # Main window preloads
    │       ├── fansly/         # Fansly-specific
    │       ├── of/             # OnlyFans-specific
    │       └── *.css           # Preload styles
    └── renderer/               # Web UI (Vite build)
        ├── index.html          # Main HTML entry
        ├── index.*.js          # Main app bundle
        ├── index.*.css         # App styles (3 CSS files)
        ├── error.*.js          # Error handling
        ├── notification.*.js   # Notification window
        ├── modulepreload-polyfill.*.js
        ├── _commonjsHelpers.*.js
        ├── app-logo/           # App icons
        │   ├── logo.png
        │   ├── favicon.ico
        │   └── *.icns          # macOS icons
        ├── pages/              # Additional HTML pages
        │   ├── error/
        │   ├── loading/
        │   └── notification/
        ├── preload/            # Static assets
        │   ├── audio/          # 12 timeout audio files
        │   ├── chart/          # Chart & media icons
        │   ├── emojis/         # Emoji images
        │   └── messages/       # Message UI icons
        └── renderer/           # Additional resources
            ├── infloww.png
            ├── fansly_logo.webp
            ├── network-fail.png
            └── notification/   # Notification assets
```

## File Breakdown

### Main Process (`dist/main/`)

- **index.js** (42 bytes): Tiny loader
  ```js
  require('bytenode');
  require('./main.jsc')
  ```
- **main.jsc**: Compiled bytecode - the actual Electron main process logic
  - Cannot be decompiled to readable source
  - Handles app lifecycle, windows, native integrations

### Preload Scripts (`dist/preload/`)

**Core Files:**
- `index.js` - Main preload entry point
- `empty.js` - Minimal preload for simple windows

**Platform Integrations (`browserview/`):**
- `of-base.js` - OnlyFans platform hooks
- `fansly-base.js` - Fansly platform hooks
- These inject custom JS into the platform websites

**Hooks (`hooks/`):**
- `api.js` - API request/response interception
- `ws.js` - WebSocket message handling

**Pages (`pages/`):**
- 29 MJS (ES modules) files
- 5 CSS files
- Code-split chunks for different features
- Organized by platform: `of/` and `fansly/`

### Renderer Process (`dist/renderer/`)

**Core Application:**
- `index.html` - Main entry point
- `index.4ef2949d.js` - Main app bundle (~8MB minified)
- `index.2206621e.css` - Main styles
- `index.4030081f.css` - Additional styles
- `index.846b9f47.css` - Notification styles

**Additional Windows:**
- `notification.ff0926fb.js` - Notification window
- `error.502c3042.js` - Error page

**Pages:**
- `pages/error/index.html`
- `pages/loading/index.html`
- `pages/loading/fansly.html`
- `pages/notification/index.html`

**Assets:**
- 80+ icons (SVG/PNG) in `preload/`
- 12 audio notification files
- Logo files in multiple formats

## Technologies Identified

### Build Tools
- **Vite** - Modern bundler (evident from output format)
- **Bytenode** - Node.js bytecode compiler

### Libraries (from code analysis)
- **Axios** - HTTP client
- **Ant Design** - React UI components
- **ECharts** - Charting library (in preload pages)
- System fonts: Roboto, Helvetica, Arial

### Architecture
- **Electron** multi-process
- **React** frontend framework
- **ES Modules** (MJS files)
- Code splitting with dynamic imports

## Key Files to Examine

### 1. Configuration
```bash
cat app-Info.plist          # App metadata
cat app-update.yml          # Update config
cat package.json            # Dependencies
```

### 2. Main Entry Points
```bash
cat dist/main/index.js      # Main process loader
cat dist/preload/index.js   # Preload bridge
cat dist/renderer/index.html # UI entry
```

### 3. Platform Integrations
```bash
cat dist/preload/browserview/of-base.js      # OnlyFans code
cat dist/preload/browserview/fansly-base.js  # Fansly code
```

### 4. API Hooks
```bash
cat dist/preload/hooks/api.js  # API interception
cat dist/preload/hooks/ws.js   # WebSocket hooks
```

### 5. Minified Bundles
```bash
# These are minified and hard to read, but contain the full app logic
head -100 dist/renderer/index.4ef2949d.js
head -100 dist/preload/pages/main-AL4UTFTV.mjs
```

## Important Notes

### ⚠️ Code Protection
- **main.jsc** is compiled bytecode - cannot read source
- Renderer bundles are minified but can be analyzed
- Contains production API keys and secrets

### 🔒 Licensing
- This code is proprietary to Infloww
- Extracted for educational/reference purposes only
- Do not redistribute or use in production

### 🔍 What You Can Learn
- ✅ Application structure and architecture
- ✅ Build configuration and tooling
- ✅ Asset organization patterns
- ✅ Electron multi-process setup
- ✅ Platform integration approach
- ❌ Main process logic (compiled)
- ❌ Original source code (minified)

## Useful Commands

### Search for specific code
```bash
# Search all JS files for a term
grep -r "your-search-term" dist/ --include="*.js" --include="*.mjs"

# Find API endpoints
grep -r "https://" dist/ --include="*.js" | head -20

# List all icons
find dist/renderer/preload -name "*.svg" -o -name "*.png"
```

### Analyze bundle sizes
```bash
ls -lh dist/renderer/*.js
du -h dist/renderer/index.4ef2949d.js
```

### Extract constants
```bash
# Find configuration in main bundle
head -1000 dist/renderer/index.4ef2949d.js | grep -o '"https://[^"]*"'
```

### Examine minified code
```bash
# Use a JS beautifier for better readability
npx js-beautify dist/renderer/index.4ef2949d.js > readable.js
```

## Integration Points

### API Endpoints (found in code)
- `https://api2.infloww.com` - Main API
- `https://embed-remote-web.infloww.com` - Embedded web views

### Platform Sites
- OnlyFans integration via browserview
- Fansly integration via browserview
- Custom JavaScript injection for both

### Features Inferred
- Multi-account management
- Message automation
- Analytics/charts (ECharts)
- Notification system
- WebSocket real-time updates
- Audio notifications
- Custom emoji support

## Next Steps

1. **Examine readable files first**:
   - Start with `dist/preload/` JavaScript files
   - Check `dist/renderer/index.html`
   - Review configuration files

2. **Analyze minified code**:
   - Use beautifier tools
   - Search for specific strings/patterns
   - Identify API calls and data structures

3. **Study architecture**:
   - Understand main/renderer/preload separation
   - See how platform integration works
   - Learn from asset organization

4. **Reference for your project**:
   - Copy useful patterns
   - Adapt file structure
   - Use similar tooling (Vite, Electron)

## File Statistics

- **JavaScript/MJS**: 36 files
- **CSS**: 8 files
- **HTML**: 5 files
- **SVG Icons**: 68 files
- **Images**: 9 PNG files
- **Audio**: 13 MP3 files
- **Icons**: 4 ICNS files
- **Config**: 3 files (plist, yml, json)

---

**Extracted**: $(date)
**Version**: 5.6.0
**Platform**: macOS ARM64
**Build**: Production (minified)

