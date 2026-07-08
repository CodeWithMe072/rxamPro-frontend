// 5 curated preset themes for ExamPro.
// Each theme defines CSS variable values for both light and dark modes.
// Variable names match exactly what is defined in index.css :root and .dark blocks.

export const THEMES = {
  'indigo-blue': {
    name: 'Indigo Blue',
    description: 'Classic blue & emerald — the default ExamPro palette',
    preview: { primary: '#004ac6', secondary: '#006c49', bg: '#faf8ff' },
    light: {
      '--color-primary': '#004ac6',
      '--color-primary-container': '#2563eb',
      '--color-on-primary': '#ffffff',
      '--color-on-primary-container': '#eeefff',
      '--color-secondary': '#006c49',
      '--color-secondary-container': '#6cf8bb',
      '--color-on-secondary': '#ffffff',
      '--color-on-secondary-container': '#00714d',
      '--color-tertiary': '#943700',
      '--color-tertiary-container': '#bc4800',
      '--color-on-tertiary': '#ffffff',
      '--color-on-tertiary-container': '#ffede6',
      '--color-background': '#faf8ff',
      '--color-on-background': '#131b2e',
      '--color-surface': '#faf8ff',
      '--color-surface-dim': '#d2d9f4',
      '--color-surface-bright': '#faf8ff',
      '--color-surface-container-lowest': '#ffffff',
      '--color-surface-container-low': '#f2f3ff',
      '--color-surface-container': '#eaedff',
      '--color-surface-container-high': '#e2e7ff',
      '--color-surface-container-highest': '#dae2fd',
      '--color-on-surface': '#131b2e',
      '--color-on-surface-variant': '#434655',
      '--color-outline': '#737686',
      '--color-outline-variant': '#c3c6d7',
      '--color-surface-variant': '#dae2fd',
      '--color-error': '#ba1a1a',
      '--color-error-container': '#ffdad6',
      '--color-on-error': '#ffffff',
      '--color-on-error-container': '#93000a',
    },
    dark: {
      '--color-primary': '#b4c5ff',
      '--color-primary-container': '#003ea8',
      '--color-on-primary': '#002573',
      '--color-on-primary-container': '#dbe1ff',
      '--color-secondary': '#6ffbbe',
      '--color-secondary-container': '#005236',
      '--color-on-secondary': '#003823',
      '--color-on-secondary-container': '#6ffbbe',
      '--color-tertiary': '#ffb596',
      '--color-tertiary-container': '#7d2d00',
      '--color-on-tertiary': '#541b00',
      '--color-on-tertiary-container': '#ffdbcd',
      '--color-background': '#0f1322',
      '--color-on-background': '#e2e2ec',
      '--color-surface': '#0f1322',
      '--color-surface-dim': '#0a0d18',
      '--color-surface-bright': '#1b2034',
      '--color-surface-container-lowest': '#050811',
      '--color-surface-container-low': '#131726',
      '--color-surface-container': '#1b2034',
      '--color-surface-container-high': '#252a3f',
      '--color-surface-container-highest': '#2f354b',
      '--color-on-surface': '#e2e2ec',
      '--color-on-surface-variant': '#c3c6d7',
      '--color-outline': '#8d90a0',
      '--color-outline-variant': '#434655',
      '--color-surface-variant': '#434655',
      '--color-error': '#ffb4ab',
      '--color-error-container': '#93000a',
      '--color-on-error': '#690005',
      '--color-on-error-container': '#ffdad6',
    }
  },

  'violet-rose': {
    name: 'Violet Rose',
    description: 'Deep purple & rose pink — bold and expressive',
    preview: { primary: '#6d28d9', secondary: '#be185d', bg: '#fdf4ff' },
    light: {
      '--color-primary': '#6d28d9',
      '--color-primary-container': '#7c3aed',
      '--color-on-primary': '#ffffff',
      '--color-on-primary-container': '#f3eeff',
      '--color-secondary': '#be185d',
      '--color-secondary-container': '#f472b6',
      '--color-on-secondary': '#ffffff',
      '--color-on-secondary-container': '#4a0020',
      '--color-tertiary': '#0369a1',
      '--color-tertiary-container': '#38bdf8',
      '--color-on-tertiary': '#ffffff',
      '--color-on-tertiary-container': '#e0f2fe',
      '--color-background': '#fdf4ff',
      '--color-on-background': '#1e0d2e',
      '--color-surface': '#fdf4ff',
      '--color-surface-dim': '#e9d5f5',
      '--color-surface-bright': '#fdf4ff',
      '--color-surface-container-lowest': '#ffffff',
      '--color-surface-container-low': '#f8eeff',
      '--color-surface-container': '#f0e3fa',
      '--color-surface-container-high': '#e9d5f5',
      '--color-surface-container-highest': '#e0c8ef',
      '--color-on-surface': '#1e0d2e',
      '--color-on-surface-variant': '#4a3555',
      '--color-outline': '#806891',
      '--color-outline-variant': '#d4b8e0',
      '--color-surface-variant': '#e9d5f5',
      '--color-error': '#ba1a1a',
      '--color-error-container': '#ffdad6',
      '--color-on-error': '#ffffff',
      '--color-on-error-container': '#93000a',
    },
    dark: {
      '--color-primary': '#d8b4fe',
      '--color-primary-container': '#5b21b6',
      '--color-on-primary': '#2e0060',
      '--color-on-primary-container': '#ede9fe',
      '--color-secondary': '#f9a8d4',
      '--color-secondary-container': '#9d174d',
      '--color-on-secondary': '#4a0020',
      '--color-on-secondary-container': '#fce7f3',
      '--color-tertiary': '#7dd3fc',
      '--color-tertiary-container': '#075985',
      '--color-on-tertiary': '#003456',
      '--color-on-tertiary-container': '#e0f2fe',
      '--color-background': '#130820',
      '--color-on-background': '#eedcff',
      '--color-surface': '#130820',
      '--color-surface-dim': '#0d0515',
      '--color-surface-bright': '#1e1030',
      '--color-surface-container-lowest': '#080210',
      '--color-surface-container-low': '#180d25',
      '--color-surface-container': '#1e1030',
      '--color-surface-container-high': '#291a3c',
      '--color-surface-container-highest': '#352449',
      '--color-on-surface': '#eedcff',
      '--color-on-surface-variant': '#d4b8e0',
      '--color-outline': '#9c7fb0',
      '--color-outline-variant': '#4a3555',
      '--color-surface-variant': '#4a3555',
      '--color-error': '#ffb4ab',
      '--color-error-container': '#93000a',
      '--color-on-error': '#690005',
      '--color-on-error-container': '#ffdad6',
    }
  },

  'ocean-teal': {
    name: 'Ocean Teal',
    description: 'Cyan & teal — clean, calm, and professional',
    preview: { primary: '#0e7490', secondary: '#0f766e', bg: '#f0fdfe' },
    light: {
      '--color-primary': '#0e7490',
      '--color-primary-container': '#0891b2',
      '--color-on-primary': '#ffffff',
      '--color-on-primary-container': '#ecfeff',
      '--color-secondary': '#0f766e',
      '--color-secondary-container': '#2dd4bf',
      '--color-on-secondary': '#ffffff',
      '--color-on-secondary-container': '#042f2e',
      '--color-tertiary': '#7c3aed',
      '--color-tertiary-container': '#a78bfa',
      '--color-on-tertiary': '#ffffff',
      '--color-on-tertiary-container': '#f3eeff',
      '--color-background': '#f0fdfe',
      '--color-on-background': '#0a1e22',
      '--color-surface': '#f0fdfe',
      '--color-surface-dim': '#b2e8f0',
      '--color-surface-bright': '#f0fdfe',
      '--color-surface-container-lowest': '#ffffff',
      '--color-surface-container-low': '#e8f9fc',
      '--color-surface-container': '#d8f4f8',
      '--color-surface-container-high': '#c8eef4',
      '--color-surface-container-highest': '#b8e8f0',
      '--color-on-surface': '#0a1e22',
      '--color-on-surface-variant': '#1f4550',
      '--color-outline': '#4a8997',
      '--color-outline-variant': '#a2cfd8',
      '--color-surface-variant': '#d8f4f8',
      '--color-error': '#ba1a1a',
      '--color-error-container': '#ffdad6',
      '--color-on-error': '#ffffff',
      '--color-on-error-container': '#93000a',
    },
    dark: {
      '--color-primary': '#67e8f9',
      '--color-primary-container': '#0c6478',
      '--color-on-primary': '#012e3a',
      '--color-on-primary-container': '#cffafe',
      '--color-secondary': '#5eead4',
      '--color-secondary-container': '#0d5c55',
      '--color-on-secondary': '#012b28',
      '--color-on-secondary-container': '#ccfbf1',
      '--color-tertiary': '#c4b5fd',
      '--color-tertiary-container': '#5b21b6',
      '--color-on-tertiary': '#2e0060',
      '--color-on-tertiary-container': '#ede9fe',
      '--color-background': '#031a1e',
      '--color-on-background': '#cffafe',
      '--color-surface': '#031a1e',
      '--color-surface-dim': '#011215',
      '--color-surface-bright': '#0a2830',
      '--color-surface-container-lowest': '#010b0d',
      '--color-surface-container-low': '#071c20',
      '--color-surface-container': '#0a2830',
      '--color-surface-container-high': '#103440',
      '--color-surface-container-highest': '#164050',
      '--color-on-surface': '#cffafe',
      '--color-on-surface-variant': '#a2cfd8',
      '--color-outline': '#5c9fac',
      '--color-outline-variant': '#1f4550',
      '--color-surface-variant': '#1f4550',
      '--color-error': '#ffb4ab',
      '--color-error-container': '#93000a',
      '--color-on-error': '#690005',
      '--color-on-error-container': '#ffdad6',
    }
  },

  'amber-slate': {
    name: 'Amber Slate',
    description: 'Warm amber & ocean blue — energetic and trustworthy',
    preview: { primary: '#b45309', secondary: '#0369a1', bg: '#fffbeb' },
    light: {
      '--color-primary': '#b45309',
      '--color-primary-container': '#d97706',
      '--color-on-primary': '#ffffff',
      '--color-on-primary-container': '#fffbeb',
      '--color-secondary': '#0369a1',
      '--color-secondary-container': '#38bdf8',
      '--color-on-secondary': '#ffffff',
      '--color-on-secondary-container': '#082f49',
      '--color-tertiary': '#7c3aed',
      '--color-tertiary-container': '#a78bfa',
      '--color-on-tertiary': '#ffffff',
      '--color-on-tertiary-container': '#f3eeff',
      '--color-background': '#fffbeb',
      '--color-on-background': '#1c1107',
      '--color-surface': '#fffbeb',
      '--color-surface-dim': '#f5e0aa',
      '--color-surface-bright': '#fffbeb',
      '--color-surface-container-lowest': '#ffffff',
      '--color-surface-container-low': '#fef7d6',
      '--color-surface-container': '#fdefc0',
      '--color-surface-container-high': '#fce7aa',
      '--color-surface-container-highest': '#fbdf94',
      '--color-on-surface': '#1c1107',
      '--color-on-surface-variant': '#4a3a10',
      '--color-outline': '#8a6f30',
      '--color-outline-variant': '#d4b96a',
      '--color-surface-variant': '#fdefc0',
      '--color-error': '#ba1a1a',
      '--color-error-container': '#ffdad6',
      '--color-on-error': '#ffffff',
      '--color-on-error-container': '#93000a',
    },
    dark: {
      '--color-primary': '#fcd34d',
      '--color-primary-container': '#92400e',
      '--color-on-primary': '#3d1c00',
      '--color-on-primary-container': '#fef3c7',
      '--color-secondary': '#7dd3fc',
      '--color-secondary-container': '#075985',
      '--color-on-secondary': '#003456',
      '--color-on-secondary-container': '#e0f2fe',
      '--color-tertiary': '#c4b5fd',
      '--color-tertiary-container': '#5b21b6',
      '--color-on-tertiary': '#2e0060',
      '--color-on-tertiary-container': '#ede9fe',
      '--color-background': '#1c1107',
      '--color-on-background': '#fef3c7',
      '--color-surface': '#1c1107',
      '--color-surface-dim': '#120b02',
      '--color-surface-bright': '#2d1d0a',
      '--color-surface-container-lowest': '#0d0601',
      '--color-surface-container-low': '#201408',
      '--color-surface-container': '#2d1d0a',
      '--color-surface-container-high': '#3a2810',
      '--color-surface-container-highest': '#473316',
      '--color-on-surface': '#fef3c7',
      '--color-on-surface-variant': '#d4b96a',
      '--color-outline': '#a88a40',
      '--color-outline-variant': '#4a3a10',
      '--color-surface-variant': '#4a3a10',
      '--color-error': '#ffb4ab',
      '--color-error-container': '#93000a',
      '--color-on-error': '#690005',
      '--color-on-error-container': '#ffdad6',
    }
  },

  'crimson-gold': {
    name: 'Crimson Gold',
    description: 'Deep red & gold — prestigious and powerful',
    preview: { primary: '#9f1239', secondary: '#92400e', bg: '#fff1f2' },
    light: {
      '--color-primary': '#9f1239',
      '--color-primary-container': '#e11d48',
      '--color-on-primary': '#ffffff',
      '--color-on-primary-container': '#fff1f2',
      '--color-secondary': '#92400e',
      '--color-secondary-container': '#f59e0b',
      '--color-on-secondary': '#ffffff',
      '--color-on-secondary-container': '#3d1f00',
      '--color-tertiary': '#0e7490',
      '--color-tertiary-container': '#67e8f9',
      '--color-on-tertiary': '#ffffff',
      '--color-on-tertiary-container': '#ecfeff',
      '--color-background': '#fff1f2',
      '--color-on-background': '#200b0e',
      '--color-surface': '#fff1f2',
      '--color-surface-dim': '#f5c8cf',
      '--color-surface-bright': '#fff1f2',
      '--color-surface-container-lowest': '#ffffff',
      '--color-surface-container-low': '#fde8eb',
      '--color-surface-container': '#f8d8de',
      '--color-surface-container-high': '#f2c8d0',
      '--color-surface-container-highest': '#edb8c2',
      '--color-on-surface': '#200b0e',
      '--color-on-surface-variant': '#522530',
      '--color-outline': '#9a4455',
      '--color-outline-variant': '#e8aab6',
      '--color-surface-variant': '#f8d8de',
      '--color-error': '#ba1a1a',
      '--color-error-container': '#ffdad6',
      '--color-on-error': '#ffffff',
      '--color-on-error-container': '#93000a',
    },
    dark: {
      '--color-primary': '#fca5a5',
      '--color-primary-container': '#881337',
      '--color-on-primary': '#460010',
      '--color-on-primary-container': '#ffe4e6',
      '--color-secondary': '#fcd34d',
      '--color-secondary-container': '#78350f',
      '--color-on-secondary': '#3d1f00',
      '--color-on-secondary-container': '#fef3c7',
      '--color-tertiary': '#67e8f9',
      '--color-tertiary-container': '#0c6478',
      '--color-on-tertiary': '#012e3a',
      '--color-on-tertiary-container': '#cffafe',
      '--color-background': '#200b0e',
      '--color-on-background': '#ffe4e6',
      '--color-surface': '#200b0e',
      '--color-surface-dim': '#150508',
      '--color-surface-bright': '#31141a',
      '--color-surface-container-lowest': '#0f0205',
      '--color-surface-container-low': '#260d11',
      '--color-surface-container': '#31141a',
      '--color-surface-container-high': '#3e1e24',
      '--color-surface-container-highest': '#4c282e',
      '--color-on-surface': '#ffe4e6',
      '--color-on-surface-variant': '#e8aab6',
      '--color-outline': '#c47080',
      '--color-outline-variant': '#522530',
      '--color-surface-variant': '#522530',
      '--color-error': '#ffb4ab',
      '--color-error-container': '#93000a',
      '--color-on-error': '#690005',
      '--color-on-error-container': '#ffdad6',
    }
  }
};

export const THEME_KEYS = Object.keys(THEMES);

function adjustBrightness(hex, percent) {
  // Strip the # if present
  let color = hex.replace(/^\s*#|\s*$/g, '');
  if (color.length === 3) {
    color = color.replace(/(.)/g, '$1$1');
  }

  let R = parseInt(color.substring(0, 2), 16);
  let G = parseInt(color.substring(2, 4), 16);
  let B = parseInt(color.substring(4, 6), 16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R < 255) ? R : 255;
  G = (G < 255) ? G : 255;
  B = (B < 255) ? B : 255;

  R = (R > 0) ? R : 0;
  G = (G > 0) ? G : 0;
  B = (B > 0) ? B : 0;

  const rHex = R.toString(16).padStart(2, '0');
  const gHex = G.toString(16).padStart(2, '0');
  const bHex = B.toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

export const generateCustomThemeVars = (customTheme, isDark) => {
  const defaults = {
    primary: '#004ac6',
    secondary: '#006c49',
    background: '#faf8ff',
    darkPrimary: '#b4c5ff',
    darkSecondary: '#6ffbbe',
    darkBackground: '#0f1322'
  };

  const colors = { ...defaults, ...customTheme };

  if (isDark) {
    return {
      '--color-primary': colors.darkPrimary,
      '--color-primary-container': adjustBrightness(colors.darkPrimary, -60),
      '--color-on-primary': adjustBrightness(colors.darkPrimary, -80),
      '--color-on-primary-container': adjustBrightness(colors.darkPrimary, 20),
      '--color-secondary': colors.darkSecondary,
      '--color-secondary-container': adjustBrightness(colors.darkSecondary, -60),
      '--color-on-secondary': adjustBrightness(colors.darkSecondary, -80),
      '--color-on-secondary-container': colors.darkSecondary,
      '--color-tertiary': '#ffb596',
      '--color-tertiary-container': '#7d2d00',
      '--color-on-tertiary': '#541b00',
      '--color-on-tertiary-container': '#ffdbcd',
      '--color-background': colors.darkBackground,
      '--color-on-background': '#e2e2ec',
      '--color-surface': colors.darkBackground,
      '--color-surface-dim': adjustBrightness(colors.darkBackground, -20),
      '--color-surface-bright': adjustBrightness(colors.darkBackground, 15),
      '--color-surface-container-lowest': adjustBrightness(colors.darkBackground, -40),
      '--color-surface-container-low': adjustBrightness(colors.darkBackground, 5),
      '--color-surface-container': adjustBrightness(colors.darkBackground, 10),
      '--color-surface-container-high': adjustBrightness(colors.darkBackground, 18),
      '--color-surface-container-highest': adjustBrightness(colors.darkBackground, 25),
      '--color-on-surface': '#e2e2ec',
      '--color-on-surface-variant': '#c3c6d7',
      '--color-outline': '#8d90a0',
      '--color-outline-variant': '#434655',
      '--color-surface-variant': '#434655',
      '--color-error': '#ffb4ab',
      '--color-error-container': '#93000a',
      '--color-on-error': '#690005',
      '--color-on-error-container': '#ffdad6',
    };
  } else {
    return {
      '--color-primary': colors.primary,
      '--color-primary-container': adjustBrightness(colors.primary, 20),
      '--color-on-primary': '#ffffff',
      '--color-on-primary-container': adjustBrightness(colors.primary, -60),
      '--color-secondary': colors.secondary,
      '--color-secondary-container': adjustBrightness(colors.secondary, 40),
      '--color-on-secondary': '#ffffff',
      '--color-on-secondary-container': adjustBrightness(colors.secondary, -60),
      '--color-tertiary': '#943700',
      '--color-tertiary-container': '#bc4800',
      '--color-on-tertiary': '#ffffff',
      '--color-on-tertiary-container': '#ffede6',
      '--color-background': colors.background,
      '--color-on-background': '#131b2e',
      '--color-surface': colors.background,
      '--color-surface-dim': adjustBrightness(colors.background, -10),
      '--color-surface-bright': colors.background,
      '--color-surface-container-lowest': '#ffffff',
      '--color-surface-container-low': adjustBrightness(colors.background, -2),
      '--color-surface-container': adjustBrightness(colors.background, -5),
      '--color-surface-container-high': adjustBrightness(colors.background, -8),
      '--color-surface-container-highest': adjustBrightness(colors.background, -12),
      '--color-on-surface': '#131b2e',
      '--color-on-surface-variant': '#434655',
      '--color-outline': '#737686',
      '--color-outline-variant': '#c3c6d7',
      '--color-surface-variant': adjustBrightness(colors.background, -8),
      '--color-error': '#ba1a1a',
      '--color-error-container': '#ffdad6',
      '--color-on-error': '#ffffff',
      '--color-on-error-container': '#93000a',
    };
  }
};

/**
 * Apply a color theme to the document root element.
 * Reads the current dark/light mode from the html element's class list.
 * @param {string} themeKey - one of THEME_KEYS or 'custom'
 * @param {boolean} isDark - whether dark mode is currently active
 * @param {object} customTheme - custom colors object if themeKey is 'custom'
 */
export const applyTheme = (themeKey, isDark, customTheme = null) => {
  let vars;
  if (themeKey === 'custom') {
    vars = generateCustomThemeVars(customTheme, isDark);
  } else {
    const theme = THEMES[themeKey] || THEMES['indigo-blue'];
    vars = isDark ? theme.dark : theme.light;
  }
  
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};
