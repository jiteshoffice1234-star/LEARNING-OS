# LEARNING OS

### LEARN WITH INTENTION. TRACK WITH PRECISION.

A premium, offline-first personal learning and development management system.

![LEARNING OS](docs/assets/brand-hero.png)

---

## Overview

LEARNING OS is a comprehensive personal learning management application designed to help students, professionals, and independent learners organize their entire academic and professional development journey.

**Your device is the home of your learning data.**

- 🔒 **100% Offline** — No cloud dependency, no mandatory accounts
- 📱 **Cross-Platform** — Android APK + responsive web
- 🎯 **Complete Tracking** — Courses, skills, goals, projects, and more
- 📊 **Real Analytics** — Performance insights from your actual data
- 💾 **Full Control** — Backup, restore, and export your data

---

## Features

### 🏠 Home
- Customizable dashboard with widgets
- Quick capture inbox for ideas, links, and documents
- Daily overview of tasks, goals, and progress

### 📚 Learn
- **Study Center** — Organize courses, subjects, chapters, and topics
- **Study Timer** — Persistent timer with session tracking
- **Revision Manager** — Spaced repetition for long-term retention
- **Tests & Exams** — Track performance and identify weak areas
- **Flashcards** — Active recall with spaced repetition

### 🔨 Build
- **Tasks** — Manage to-dos with priorities and due dates
- **Projects** — Track real-world projects and skill application

### 🧭 Plan
- **Calendar** — Visual schedule with events and deadlines
- **Roadmap** — Gantt charts and timelines for skill development
- **Goals** — Set and track learning objectives with milestones

### 🧠 Remember
- **Knowledge Base** — Store concepts, facts, and resources
- **Skills** — Track proficiency levels and development
- **Achievement Vault** — Store certificates and documents
- **Notes** — Organized notes with tags and search

### 📏 Measure
- **Analytics** — Comprehensive performance insights
- **Qualifications** — Track academic and professional credentials

### ⚙️ System
- **Profile** — Manage your learning identity
- **Backup** — Export and restore your data
- **Settings** — Customize themes, notifications, and preferences

---

## Screenshots

> 📸 *Screenshots coming soon*

<!-- Add screenshots here once available -->

---

## Download

### Android

Download the latest APK from the [Releases page](https://github.com/YOUR_USERNAME/learning-os/releases/latest).

**Installation:**
1. Download `learning-os-v1.0.0.apk`
2. Enable "Install from Unknown Sources" in your device settings
3. Open the APK file and follow the installation prompts
4. Launch LEARNING OS from your app drawer

### Web

The web version can be accessed by building and serving the project locally:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

---

## Technology Stack

### Core
- **React 18** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool and dev server
- **Tailwind CSS** — Styling
- **Capacitor** — Android packaging

### Features
- **Recharts** — Data visualization
- **Lucide React** — Icon library
- **Supabase** (optional) — Cloud file storage for PDFs and images

### Architecture
- **Offline-first** — All data stored locally
- **Responsive design** — Works on desktop and mobile
- **Component-based** — Modular, maintainable code

---

## Project Structure

```
learning-os/
├── android/                    # Android project (Capacitor)
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/          # Native Android code
│   │   │   ├── res/           # Android resources
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle
│   ├── build.gradle
│   └── settings.gradle
├── src/
│   ├── components/            # Shared components
│   │   ├── Layout.tsx
│   │   └── CommandPalette.tsx
│   ├── pages/                 # Screen components
│   │   ├── Dashboard.tsx
│   │   ├── StudyCenter.tsx
│   │   ├── StudyTimer.tsx
│   │   ├── Tasks.tsx
│   │   ├── Projects.tsx
│   │   └── ... (24 screens total)
│   ├── data/                  # Mock data
│   ├── App.tsx                # Root component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── docs/                      # Documentation
├── capacitor.config.ts        # Capacitor configuration
├── package.json
├── tsconfig.json
└── vite.config.js
```

---

## Development Setup

### Prerequisites

- **Node.js** 18+ and npm
- **Android Studio** (for Android builds)
- **Java JDK** 17+ (for Android builds)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/learning-os.git
cd learning-os

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
# Build web version
npm run build

# Build Android APK
npx cap sync android
cd android
./gradlew assembleRelease
```

The APK will be located at `android/app/build/outputs/apk/release/app-release.apk`.

---

## Data Storage & Privacy

### Local-First Architecture

LEARNING OS stores all data locally on your device:

- **Web version**: Uses browser localStorage (survives refresh and navigation)
- **Android version**: Uses SQLite database in app-private storage

### Optional Cloud Storage

Connect your Supabase account in **Settings → Cloud Storage** to store uploaded files (PDFs, images, documents) in the cloud. Files sync across devices when Supabase is configured. Without Supabase, uploads save to your browser only.

### What We Don't Do

- ❌ No mandatory user accounts
- ❌ No data collection or analytics
- ❌ No third-party API dependencies (cloud is optional)
- ❌ No advertising or tracking

### Backup & Restore

You can export your data at any time:

1. Go to **System → Backup**
2. Click **Export Data**
3. Save the JSON file to your device

To restore:

1. Go to **System → Backup**
2. Click **Import Data**
3. Select your backup file

---

## Known Limitations

### Current Version (v1.0.0)

**Data Persistence:**
- ✅ Web version: Data persisted in browser localStorage (survives refresh and navigation)
- ✅ Android version: Persistent local database

**Features:**
- ✅ All create/edit/delete operations fully functional with persistence
- ✅ Timer state persisted across browser refresh
- ✅ File upload fully implemented (Vault, Profile avatar)
- ✅ Light theme toggle fully implemented
- ✅ SM-2 spaced repetition algorithm for flashcards
- ✅ Welcome/onboarding shown on first launch
- ✅ Backup/restore via JSON export/import

**Platform:**
- ⚠️ Web version requires modern browser with localStorage support
- ⚠️ Android version requires Android 5.1+ (API 22)
- ⚠️ localStorage has a ~5 MB quota; connect Supabase for larger file storage

### Roadmap

**v1.1.0** (Planned):
- Cross-module relationships
- Advanced search
- Notification system
- Dashboard widget customization

**v1.2.0** (Planned):
- Flutter native rewrite
- iOS support
- Desktop apps (Windows, macOS, Linux)
- Plugin system

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Start for Contributors

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/learning-os.git
cd learning-os

# Install dependencies
npm install

# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes and test
npm run dev

# Build and verify
npm run build

# Submit a pull request
```

---

## License

This project is currently **unlicensed**. All rights reserved.

If you're interested in using this project under an open-source license, please open an issue to discuss licensing options.

**Potential license options:**
- MIT License (permissive)
- Apache 2.0 (permissive with patent grant)
- GPL 3.0 (copyleft)
- Custom commercial license

---

## Support

- 📖 **Documentation**: See the `docs/` folder
- 🐛 **Bug Reports**: [Open an issue](https://github.com/YOUR_USERNAME/learning-os/issues)
- 💡 **Feature Requests**: [Open an issue](https://github.com/YOUR_USERNAME/learning-os/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/learning-os/discussions)

---

## Credits

**Developed with focus on:**
- Privacy and user control
- Offline-first architecture
- Premium user experience
- Clean, maintainable code

**Design inspiration:**
- Linear (clean, professional UI)
- Raycast (fast, keyboard-driven interface)

---

## Links

- 🌐 **Website**: [Coming Soon]
- 📱 **Android APK**: [Latest Release](https://github.com/YOUR_USERNAME/learning-os/releases/latest)
- 📚 **Documentation**: [docs/](docs/)
- 🐛 **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/learning-os/issues)

---

<div align="center">

**LEARN WITH INTENTION. TRACK WITH PRECISION.**

Made with ❤️ for learners everywhere

</div>
