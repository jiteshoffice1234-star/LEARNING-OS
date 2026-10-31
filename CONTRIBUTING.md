# Contributing to LEARNING OS

Thank you for your interest in contributing to LEARNING OS! This document provides guidelines and information for contributors.

## Code of Conduct

Please be respectful and constructive in all interactions. We're building something valuable for learners everywhere.

## How to Contribute

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Use the bug report template
3. Include:
   - Clear description of the issue
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment (browser, OS, device)
   - Screenshots if applicable

### Suggesting Features

1. Check existing issues and roadmap
2. Use the feature request template
3. Explain the problem you're solving
4. Describe your proposed solution
5. Consider alternatives

### Contributing Code

#### Setup

```bash
# Fork the repository
# Clone your fork
git clone https://github.com/YOUR_USERNAME/learning-os.git
cd learning-os

# Install dependencies
npm install

# Create a feature branch
git checkout -b feature/your-feature-name
```

#### Development Workflow

1. **Make changes** in your feature branch
2. **Test thoroughly** — ensure no regressions
3. **Follow code style** — TypeScript, consistent formatting
4. **Write tests** if applicable
5. **Update documentation** if needed
6. **Commit with clear messages** using conventional commits:
   - `feat:` new feature
   - `fix:` bug fix
   - `docs:` documentation
   - `style:` formatting
   - `refactor:` code restructuring
   - `test:` adding tests
   - `chore:` maintenance

#### Pull Request Process

1. Push your branch to your fork
2. Open a Pull Request against `main`
3. Fill out the PR template
4. Wait for review
5. Address feedback
6. Merge after approval

### Code Style

- **TypeScript**: Use strict mode, proper typing
- **React**: Functional components, hooks
- **Styling**: Tailwind CSS classes
- **Naming**: Descriptive, consistent
- **Comments**: Explain "why", not "what"

### Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck
```

### Documentation

- Update README.md for user-facing changes
- Update DEVELOPMENT_STATUS.md for technical changes
- Add inline comments for complex logic
- Keep code self-documenting

## Architecture Guidelines

### Adding a New Screen

1. Create component in `src/pages/`
2. Add to navigation in `src/components/Layout.tsx`
3. Add route in `src/App.tsx`
4. Update documentation

### Adding a New Feature

1. Check if it fits the product vision
2. Discuss in an issue first for major features
3. Follow existing patterns
4. Ensure offline functionality
5. Test on both desktop and mobile

### Data Persistence

- All data must work offline
- Use localStorage/IndexedDB for web
- Consider Android SQLite for native
- Implement backup/restore
- Never lose user data

## Review Process

- All PRs require review
- CI must pass (build, typecheck)
- No breaking changes without discussion
- Maintain backward compatibility

## Questions?

Open a discussion or issue if you need help.

---

Thank you for contributing to LEARNING OS! 🎓
