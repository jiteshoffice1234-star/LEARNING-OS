import { usePersistentState } from './storage';

export type Theme = 'dark' | 'light';

const THEME_KEY = 'settings:theme';

/**
 * Applies the theme to <html> so Tailwind's `dark:` variant and the CSS
 * variables in index.css both follow it. Runs before first paint when called
 * from a module-level bootstrap to avoid a flash of the wrong theme.
 */
export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/** Read the stored theme without hooks (for bootstrap before React mounts). */
export function getStoredTheme(): Theme {
  try {
    const raw = localStorage.getItem(`learningos:v1:${THEME_KEY}`);
    // Stored shape is either a bare string or a JSON string.
    if (!raw) return 'dark';
    const parsed = JSON.parse(raw);
    return parsed === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

/** Hook used by Settings and anywhere the theme must react to changes. */
export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setTheme] = usePersistentState<Theme>(THEME_KEY, 'dark');
  const set = (t: Theme) => {
    setTheme(t); // persists to localStorage
    applyTheme(t); // updates the DOM immediately
  };
  return [theme, set];
}

/** Called once at app start to apply the persisted theme. */
export function initTheme() {
  applyTheme(getStoredTheme());
}
