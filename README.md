# Infloww - OnlyFans Creator Management Dashboard

Complete Electron + React + Vite application for managing OnlyFans creators, employees, and analytics.

## 🚀 Features

- **Dashboard**: Real-time earnings overview with breakdown by type (subscriptions, posts, messages, tips, referrals, streams)
- **Multi-Platform**: Support for OnlyFans and Fansly
- **Employee Management**: Track employee shifts and sales
- **Analytics**: Visual charts and performance metrics
- **Messages Pro**: Advanced messaging features
- **Growth Tools**: Creator growth and engagement tools

## 🛠️ Tech Stack

- **Electron** 28.0.0 - Desktop app framework
- **React** 18.2.0 - UI library
- **Vite** 5.0.0 - Build tool & dev server
- **Ant Design** 5.12.0 - UI component library
- **Recharts** 2.10.0 - Chart library
- **React Router** 6.20.0 - Navigation
- **Zustand** 4.4.0 - State management

## 📦 Installation

```bash
# Install dependencies
npm install
```

## 🏃 Development

```bash
# Start web dev server (React only)
npm run dev

# Start Electron app in development mode (with hot reload)
npm run electron:dev
```

The app will open automatically with:
- Web version at http://localhost:5173
- Electron app with dev tools

## 🏗️ Building

```bash
# Build for production
npm run build

# Build Electron app
npm run electron:build
```

This will create:
- Web build in `dist/`
- Electron app in `dist-electron/`

## 📁 Project Structure

```
infloww/
├── electron/              # Electron main process
│   ├── main.js           # Main process entry
│   └── preload.js        # Preload script
├── src/                  # React application
│   ├── components/       # Reusable components
│   │   ├── Sidebar.jsx
│   │   └── Header.jsx
│   ├── pages/           # Page components
│   │   └── Dashboard.jsx
│   ├── hooks/           # Custom React hooks
│   ├── stores/          # Zustand stores
│   ├── styles/          # Global styles
│   ├── App.jsx          # Main app component
│   └── main.jsx         # React entry point
├── infloww-assets/      # Icons, images, audio
├── og/                  # Original Infloww code (reference)
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies
```

## 🎨 Design System

### Colors
- Primary Blue: `#3467ff`
- Success Green: `#52c41a`
- Background: `#f5f5f5`
- Text Dark: `#000000`
- Text Light: `#666666`

### Typography
- Font Family: Roboto, -apple-system, Helvetica, Arial, sans-serif
- Base Size: 14px

## 🔧 Configuration

### Electron Settings

Edit `electron/main.js` to customize:
- Window size and behavior
- DevTools settings
- Security policies

### Vite Settings

Edit `vite.config.js` for:
- Build optimization
- Path aliases
- Plugin configuration

## 📱 Available Pages

- `/dashboard` - Main dashboard with earnings overview
- `/of-manager` - OnlyFans manager (coming soon)
- `/analytics` - Analytics and reports (coming soon)
- `/messages-pro` - Advanced messaging (coming soon)
- `/settings` - App settings (coming soon)

## 🎯 Development Tips

### Hot Reload
Changes to React components will hot reload automatically. Electron main process changes require restart.

### Dev Tools
Press `Cmd+Option+I` (Mac) or `Ctrl+Shift+I` (Windows/Linux) to open Chrome DevTools.

### Path Aliases
Use `@/` for src directory and `@assets/` for infloww-assets:
```jsx
import Component from '@/components/Component';
import logo from '@assets/app-logo/logo.png';
```

## 🐛 Troubleshooting

### Electron won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port 5173 already in use
```bash
# Kill the process using port 5173
lsof -ti:5173 | xargs kill -9
```

### Build errors
```bash
# Clean dist folders
rm -rf dist dist-electron build
npm run build
```

## 📄 License

MIT

## 🙋‍♂️ Support

Version: 5.6.0

For issues and support, check the Help Center in the app.
