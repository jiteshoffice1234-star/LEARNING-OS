# Changelog

All notable changes to LEARNING OS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- IndexedDB persistence for web version
- Complete CRUD operations for all entities
- Timer persistence across sessions
- File upload and storage
- Light theme implementation
- Spaced repetition algorithm
- Cross-module relationships
- Advanced search functionality

## [1.0.0] - 2026-10-31

### Added
- **24 functional screens** across 7 modules
- **Home module**: Dashboard with widgets, Quick Capture inbox
- **Learn module**: Study Center, Timer, Revisions, Tests, Flashcards
- **Build module**: Tasks, Projects
- **Plan module**: Calendar, Roadmap, Goals
- **Remember module**: Knowledge Base, Skills, Vault, Notes
- **Measure module**: Analytics, Qualifications
- **System module**: Profile, Backup, Settings
- **Navigation**: 7-section desktop sidebar, 5-item mobile bottom nav
- **Command Palette**: ⌘K keyboard shortcut
- **Responsive design**: Desktop and mobile layouts
- **Dark theme**: Premium violet/purple accent design
- **Welcome screen**: 6-step onboarding flow
- **Android support**: Capacitor-based APK packaging

### Known Limitations
- Web version uses in-memory state (data lost on refresh)
- Some create/edit operations are UI-only
- Timer not persistent in web version
- File upload not fully implemented
- Light theme toggle non-functional
- No spaced repetition algorithm
- No automated tests

### Technical
- React 18 + TypeScript
- Vite build system
- Tailwind CSS 4
- Capacitor for Android
- Recharts for data visualization
- Lucide React icons
- Framer Motion animations

## [0.1.0] - 2026-10-30

### Added
- Initial project setup
- Basic component library
- Design system foundation
- Core navigation structure

---

## Version History

- **v1.0.0** — First public release (2026-10-31)
- **v0.1.0** — Initial development (2026-10-30)

---

For detailed technical information, see [DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md).

For audit reports, see [docs/V1_AUDIT_REPORT.md](docs/V1_AUDIT_REPORT.md).
