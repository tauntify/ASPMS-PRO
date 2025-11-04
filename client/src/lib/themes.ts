export interface ThemeColors {
  // Sidebar colors
  sidebarBg: string;
  sidebarText: string;
  sidebarTextHover: string;
  sidebarActive: string;

  // Main content colors
  background: string;
  foreground: string;

  // Card colors
  cardBg: string;
  cardBorder: string;
  cardShadow: string;

  // Accent colors (purple/blue theme from Asana)
  primary: string;
  primaryHover: string;
  secondary: string;
  accent: string;

  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Border and divider
  border: string;
  divider: string;

  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Chart colors (purple/blue gradient)
  chartPrimary: string;
  chartSecondary: string;
  chartTertiary: string;
  chartQuaternary: string;
}

export type ThemeMode = 'light' | 'dark';

export const lightTheme: ThemeColors = {
  // Sidebar - Dark navy (like Asana)
  sidebarBg: '#1f2937',
  sidebarText: '#9ca3af',
  sidebarTextHover: '#f3f4f6',
  sidebarActive: '#8b5cf6',

  // Main content - Clean white
  background: '#ffffff',
  foreground: '#f9fafb',

  // Cards - White with subtle shadows
  cardBg: '#ffffff',
  cardBorder: '#e5e7eb',
  cardShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',

  // Primary colors - Purple theme
  primary: '#8b5cf6',
  primaryHover: '#7c3aed',
  secondary: '#6366f1',
  accent: '#06b6d4',

  // Text colors
  textPrimary: '#111827',
  textSecondary: '#4b5563',
  textMuted: '#9ca3af',

  // Borders
  border: '#e5e7eb',
  divider: '#f3f4f6',

  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Chart colors - Purple/blue gradient
  chartPrimary: '#8b5cf6',
  chartSecondary: '#6366f1',
  chartTertiary: '#a78bfa',
  chartQuaternary: '#c4b5fd',
};

export const darkTheme: ThemeColors = {
  // Sidebar - Darker navy
  sidebarBg: '#111827',
  sidebarText: '#9ca3af',
  sidebarTextHover: '#f3f4f6',
  sidebarActive: '#8b5cf6',

  // Main content - Dark gray
  background: '#1f2937',
  foreground: '#111827',

  // Cards - Slightly lighter than background
  cardBg: '#374151',
  cardBorder: '#4b5563',
  cardShadow: '0 1px 3px 0 rgb(0 0 0 / 0.3)',

  // Primary colors - Same purple theme
  primary: '#8b5cf6',
  primaryHover: '#7c3aed',
  secondary: '#6366f1',
  accent: '#06b6d4',

  // Text colors - Inverted
  textPrimary: '#f9fafb',
  textSecondary: '#d1d5db',
  textMuted: '#9ca3af',

  // Borders
  border: '#4b5563',
  divider: '#374151',

  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Chart colors - Purple/blue gradient (same as light)
  chartPrimary: '#8b5cf6',
  chartSecondary: '#6366f1',
  chartTertiary: '#a78bfa',
  chartQuaternary: '#c4b5fd',
};

export const themes: Record<ThemeMode, ThemeColors> = {
  light: lightTheme,
  dark: darkTheme,
};

// Helper to convert hex to HSL
function hexToHSL(hex: string): string {
  // Remove the # if present
  hex = hex.replace(/^#/, '');

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}

export function applyTheme(mode: ThemeMode) {
  const theme = themes[mode];
  if (!theme) return;

  const root = document.documentElement;

  // Apply all theme colors as CSS variables
  Object.entries(theme).forEach(([key, value]) => {
    const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVarName, value);

    // Also set HSL version for some colors (for Tailwind compatibility)
    if (key.includes('primary') || key.includes('background') || key.includes('card') || key.includes('text')) {
      root.style.setProperty(`${cssVarName}-hsl`, hexToHSL(value));
    }
  });

  // Set Tailwind CSS variables
  root.style.setProperty("--primary", hexToHSL(theme.primary));
  root.style.setProperty("--accent", hexToHSL(theme.accent));
  root.style.setProperty("--background", hexToHSL(theme.background));
  root.style.setProperty("--foreground", hexToHSL(theme.textPrimary));
  root.style.setProperty("--card", hexToHSL(theme.cardBg));
  root.style.setProperty("--border", hexToHSL(theme.border));

  // Set data attribute for CSS usage
  root.setAttribute('data-theme', mode);
}

export function getCurrentTheme(): ThemeMode {
  return (localStorage.getItem("ofivio-theme-mode") as ThemeMode) || "light";
}

export function setTheme(mode: ThemeMode) {
  localStorage.setItem("ofivio-theme-mode", mode);
  applyTheme(mode);
}

export function toggleTheme(): ThemeMode {
  const currentTheme = getCurrentTheme();
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  return newTheme;
}
