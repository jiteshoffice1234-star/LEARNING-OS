# Installation Guide

This guide covers installing LEARNING OS on different platforms.

## Android Installation

### Method 1: Download APK (Recommended)

1. Go to the [Releases page](https://github.com/YOUR_USERNAME/learning-os/releases/latest)
2. Download `learning-os-v1.0.0.apk`
3. On your Android device:
   - Go to **Settings → Security → Unknown Sources** (or **Install unknown apps**)
   - Enable installation from your browser or file manager
4. Open the downloaded APK file
5. Tap **Install**
6. Launch LEARNING OS from your app drawer

### Method 2: Build from Source

See [BUILD_ANDROID.md](BUILD_ANDROID.md) for detailed instructions.

### System Requirements

- **Android**: 5.1 (Lollipop) or higher
- **Storage**: ~50 MB free space
- **RAM**: 2 GB or more recommended

---

## Web Installation

### Option 1: Development Server

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/learning-os.git
cd learning-os

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:3000` in your browser.

### Option 2: Production Build

```bash
# Build for production
npm run build

# Serve the dist folder
npx serve dist
```

Or deploy the `dist/` folder to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- Any web server

### Browser Requirements

- Modern browser with localStorage support
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- JavaScript enabled

---

## Desktop (Web Version)

The web version works on desktop browsers:

1. Install using the web instructions above
2. Optionally, create a desktop shortcut:
   - **Chrome**: Menu → More tools → Create shortcut → Check "Open as window"
   - **Edge**: Menu → Apps → Install this site as an app
   - **Firefox**: Menu → Save Page As (not PWA yet)

---

## First Launch

### Welcome Screen

On first launch, you'll see the Welcome screen with 6 steps:

1. **Your name** — How you'd like to be addressed
2. **Education level** — Current academic stage
3. **Current focus** — Primary area of study
4. **Current situation** — Student, professional, etc.
5. **Main goal** — What you want to achieve
6. **Daily time** — Available learning time

This information helps personalize your experience.

### Dashboard

After onboarding, you'll see the Dashboard with:
- Today's study stats
- Weekly progress chart
- Active courses
- Upcoming revisions
- Recent achievements

---

## Data Storage

### Where is my data stored?

**Web version:**
- Browser localStorage
- Browser IndexedDB (when implemented)
- Cleared if you clear browser data

**Android version:**
- App-private SQLite database
- Survives app updates
- Cleared only if you uninstall the app

### Backup your data

Regularly export your data:

1. Go to **System → Backup**
2. Click **Export Data**
3. Save the JSON file somewhere safe

### Restore from backup

1. Go to **System → Backup**
2. Click **Import Data**
3. Select your backup file
4. Confirm the import

---

## Updating

### Android

1. Download the new APK from [Releases](https://github.com/YOUR_USERNAME/learning-os/releases)
2. Install over the existing app
3. Your data is preserved

### Web

Simply refresh the page or clear cache and reload.

---

## Uninstalling

### Android

1. Long-press the LEARNING OS icon
2. Tap **Uninstall**
3. Confirm

⚠️ **Warning**: This deletes all your data. Export a backup first!

### Web

Clear browser data for the site, or remove the PWA if installed.

---

## Troubleshooting

### App won't open

- **Android**: Force close and reopen, or reinstall
- **Web**: Clear browser cache and reload

### Data lost after update

- **Android**: Should not happen (data is persistent)
- **Web**: Expected if browser cache was cleared — restore from backup

### Performance issues

- Close other apps
- Restart the app
- Check available storage space

### Can't install APK

- Enable "Unknown Sources" in Settings
- Check available storage space
- Try a different file manager
- Ensure APK is not corrupted (check file size)

---

## Getting Help

- 📖 Read the [README](../README.md)
- 📚 Check [documentation](./)
- 🐛 Report issues on [GitHub](https://github.com/YOUR_USERNAME/learning-os/issues)
- 💬 Ask questions in [Discussions](https://github.com/YOUR_USERNAME/learning-os/discussions)

---

For build instructions, see [BUILD_ANDROID.md](BUILD_ANDROID.md).
