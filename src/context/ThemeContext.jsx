import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { applyTheme } from '../config/themes';
import { settingsService } from '../services/settings.service';

const ThemeContext = createContext();

// ─── Helpers ────────────────────────────────────────────────────────────────

function resolveIsDark(themeMode) {
  if (themeMode === 'dark') return true;
  if (themeMode === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Apply the dark/light class on <html> AND inject CSS variable overrides.
 * This runs both synchronously (on init) and inside useEffect (on change).
 */
function applyMode(resolvedDark, colorTheme, customTheme) {
  const root = document.documentElement;
  if (resolvedDark) {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
  }
  applyTheme(colorTheme, resolvedDark, customTheme);
}

// ─── Provider ────────────────────────────────────────────────────────────────

export const ThemeProvider = ({ children }) => {
  // Light / dark / system — browser-local preference
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');

  // Server-side color theme key  (e.g. "indigo-blue", "violet-rose", "custom")
  const [colorTheme, setColorThemeState] = useState(
    () => sessionStorage.getItem('colorTheme') || 'indigo-blue'
  );

  // Custom color overrides (only used when colorTheme === 'custom')
  const [customTheme, setCustomThemeState] = useState(() => {
    try {
      const s = sessionStorage.getItem('customTheme');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const [uiStrings, setUiStrings] = useState(() => {
    try {
      const s = sessionStorage.getItem('uiStrings');
      return s ? JSON.parse(s) : {};
    } catch {
      return {};
    }
  });

  // Resolved dark flag — computed synchronously so the initial value is correct
  const [isDark, setIsDark] = useState(() => resolveIsDark(localStorage.getItem('theme') || 'system'));

  // Keep a ref to the latest colorTheme / customTheme so the matchMedia listener
  // always has fresh values without causing stale-closure bugs.
  const colorThemeRef = useRef(colorTheme);
  const customThemeRef = useRef(customTheme);
  useEffect(() => { colorThemeRef.current = colorTheme; }, [colorTheme]);
  useEffect(() => { customThemeRef.current = customTheme; }, [customTheme]);

  // ── Synchronous initial apply ──────────────────────────────────────────────
  // Runs once on module load (before first React render) so there is zero flash.
  useState(() => {
    const t = localStorage.getItem('theme') || 'system';
    const dark = resolveIsDark(t);
    const ct = sessionStorage.getItem('colorTheme') || 'indigo-blue';
    let cTheme = null;
    try { cTheme = JSON.parse(sessionStorage.getItem('customTheme')); } catch { /* noop */ }
    applyMode(dark, ct, cTheme);
  });

  // ── Re-apply whenever theme mode / color theme / custom colors change ──────
  useEffect(() => {
    const dark = resolveIsDark(theme);
    setIsDark(dark);
    applyMode(dark, colorTheme, customTheme);

    // Track system preference changes when mode = 'system'
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e) => {
        const d = e.matches;
        setIsDark(d);
        applyMode(d, colorThemeRef.current, customThemeRef.current);
      };
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, [theme, colorTheme, customTheme]);

  // ── Fetch active theme & UI strings on mount ───────────────────────────────
  useEffect(() => {
    // 1. Fetch public UI strings
    settingsService.getUIStrings()
      .then((data) => {
        if (data) {
          setUiStrings(data);
          sessionStorage.setItem('uiStrings', JSON.stringify(data));
        }
      })
      .catch(() => {});

    // 2. Fetch authenticated theme
    const token = localStorage.getItem('token');
    if (!token) return;

    settingsService.getTheme()
      .then(({ activeTheme, customTheme: serverCustom }) => {
        const dark = resolveIsDark(localStorage.getItem('theme') || 'system');

        if (activeTheme) {
          setColorThemeState(activeTheme);
          sessionStorage.setItem('colorTheme', activeTheme);
        }
        if (serverCustom) {
          setCustomThemeState(serverCustom);
          sessionStorage.setItem('customTheme', JSON.stringify(serverCustom));
        }

        // Always re-apply after fetching so the server's latest theme is active
        applyMode(dark, activeTheme || colorTheme, serverCustom || customTheme);
      })
      .catch(() => {
        // Network error — fall back to cached values
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  // Cycle: light → dark → system → light
  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light';
      localStorage.setItem('theme', next);
      return next;
    });
  }, []);

  const setManualTheme = useCallback((newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }, []);

  /**
   * Called by Admin ThemeSettings after a successful PUT /api/settings/theme.
   * Immediately updates local state + cache so the change is instant site-wide.
   */
  const setColorTheme = useCallback((key, customConfig = null) => {
    setColorThemeState(key);
    sessionStorage.setItem('colorTheme', key);
    if (customConfig) {
      setCustomThemeState(customConfig);
      sessionStorage.setItem('customTheme', JSON.stringify(customConfig));
    } else if (key !== 'custom') {
      // Clear stale custom config when switching away from custom
      setCustomThemeState(null);
      sessionStorage.removeItem('customTheme');
    }
  }, []);

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      setManualTheme,
      colorTheme,
      setColorTheme,
      customTheme,
      isDark,
      uiStrings,
      setUiStrings
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};
