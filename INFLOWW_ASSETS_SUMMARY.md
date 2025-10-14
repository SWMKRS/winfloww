# Infloww Assets Summary

## Search Locations
- **Application**: `/Applications/Infloww.app`
- **User Data**: `/Users/lkwbr/Library/Application Support/infloww`
- **Copied to**: `/Users/lkwbr/Workspace/freelance/winfloww/infloww-assets`

## Icons Found

### Total Icons: 80 image files
- **SVG files**: 68 vector icons
- **PNG files**: 9 raster images
- **ICNS files**: 4 macOS icon files
- **ICO files**: 1 favicon
- **WEBP files**: 1 logo

### Icon Categories

#### 1. App Logo (`app-logo/`)
- `logo.png` - Main app logo
- `logo.icns` - macOS app icon
- `favicon.ico` - Web favicon
- `16x16.png`, `32x32.png` - Standard size icons
- `16x16Template.png`, `16x16Template@2x.png`, `16x16Template@3x.png` - macOS menu bar templates
- `16x16.icns`, `32x32.icns` - macOS icon resources

#### 2. Main App Icon
- `app-icon.icns` - Main application icon (from Resources)

#### 3. Messages Icons (`preload/messages/`)
45 icons including:
- **Navigation**: `msg-home.svg`, `msg-home-active.svg`, `msg-notice.svg`, `msg-notice-active.svg`, `msg-tab-all.svg`, `msg-tab-all-active.svg`
- **Actions**: `send-chat.svg`, `send-list.svg`, `icon-send.svg`
- **Media**: `video-icon.svg`, `img-icon.svg`, `audio-bg.svg`
- **Status**: `hot.svg`, `new.svg`, `expired.svg`, `off.svg`, `snow.svg`, `ding.svg`
- **Icons**: `icon-dollar.svg`, `icon-emoji.svg`, `icon-emoji-setting.svg`, `icon-expired.svg`, `icon-hot.svg`, `icon-msg.svg`, `icon-new.svg`, `icon-off.svg`, `icon-online-msg.svg`, `icon-snow.svg`
- **Fans**: `fans-back.svg`, `fans-chat-add.svg`, `fans-chat-close.svg`, `fans-check.svg`, `fans-nocheck.svg`, `fans-search.svg`
- **Editor**: `edit-label.svg`
- **Misc**: `media-posted.svg`, `sendstatus.svg`, `toolbar-close.svg`, `toolbar-logo.svg`, `notification-back.svg`, `server-error-img.svg`
- **Permissions**: `no-permission.png`, `no-permission-dark.png`, `no-data.svg`

#### 4. Chart Icons (`preload/chart/`)
13 icons including:
- `audio.svg`, `audio-dark.svg` - Audio indicators
- `video.svg`, `drm-video.svg` - Video indicators
- `image.svg`, `gif.svg` - Image type indicators
- `chart.png`, `sing.png` - Chart visuals
- `default-bg.svg`, `default-bg-dark.svg` - Background patterns
- `ppv-audio-bg.svg`, `ppv-no-pay.svg`, `ppv-pay.svg` - Pay-per-view status

#### 5. Notification Icons (`renderer/notification/`)
8 files including:
- `icon.png` - Notification icon
- `avatar.svg` - Default avatar
- `btn-close.png` - Close button
- `tip.svg`, `paided_message.svg`, `subscribed.svg`, `unsend-msg.svg` - Notification types
- `notify.mp3` - Notification sound

#### 6. Renderer Assets (`renderer/`)
- `infloww.png` - Infloww logo
- `fansly_logo.webp` - Fansly logo
- `network-fail.png` - Network error image

#### 7. Emoji Icons (`preload/emojis/`)
- `exclamation-point.png`
- `relaxed.png`

## Font Libraries

### System Fonts Used (from CSS analysis)
Infloww **does not include custom font files**. Instead, it uses system font stacks:

**Primary Font Stack:**
```css
font-family: Roboto, -apple-system, Helvetica Neue, Arial, Noto Sans, sans-serif,
             "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"
```

**Notification Font Stack:**
```css
font-family: Helvetica, Arial, sans-serif
```

### Font Details:
- **Primary**: Roboto (Google font, needs to be installed or loaded from CDN)
- **Fallbacks**:
  - `-apple-system` - macOS system font (San Francisco)
  - `Helvetica Neue` - macOS/iOS
  - `Arial` - Windows fallback
  - `Noto Sans` - Android/Linux
  - Various emoji fonts for cross-platform emoji support

### No Custom Font Files Found
- Searched for: `.ttf`, `.woff`, `.woff2`, `.otf`, `.eot`
- Result: **0 custom font files**
- The app relies entirely on system fonts and Google Fonts CDN

## Additional Assets Found

### Audio Files (`preload/audio/`)
12 timeout audio notification files:
- `timeOutAudio1.mp3` through `timeOutAudio12.mp3`

### Location Details
All assets are located within the Electron app bundle at:
```
/Applications/Infloww.app/Contents/Resources/app/dist/renderer/
```

## Recommendations

If you want to use the same design system:

1. **Icons**: Use the copied SVG files from `infloww-assets/` directory
2. **Fonts**: Include Roboto from Google Fonts:
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
   ```
   Or use the system font stack as-is for better performance.

3. **Color Scheme**: From CSS analysis:
   - Primary Blue: `#3467ff`
   - Text Dark: `#333333`, `#151515`
   - Text Light: `#999999`
   - White: `#ffffff`

## File Structure
```
infloww-assets/
├── app-icon.icns
├── app-logo/          (11 files - logos and icons)
├── preload/
│   ├── audio/         (12 files - notification sounds)
│   ├── chart/         (13 files - chart/media icons)
│   ├── emojis/        (2 files - emoji images)
│   └── messages/      (45 files - UI icons)
└── renderer/
    ├── fansly_logo.webp
    ├── infloww.png
    ├── network-fail.png
    └── notification/  (8 files - notification assets)
```

Total: **94 files** including icons, images, and audio files.


