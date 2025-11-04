import type { ThemeKey } from "@shared/schema";

export interface ThemeColors {
  primary: string;
  accent: string;
  background: string;
  text: string;
  cardBg: string;
  borderColor: string;
}

export const themes: Record<ThemeKey, { name: string; colors: ThemeColors }> = {
  default: {
    name: "Default Blue",
    colors: {
      primary: "#2B6CB0",
      accent: "#60A5FA",
      background: "#F8F9FA",
      text: "#1F2937",
      cardBg: "#FFFFFF",
      borderColor: "#E5E7EB",
    },
  },
  "modern-slate": {
    name: "Modern Slate",
    colors: {
      primary: "#1F2937",
      accent: "#7C3AED",
      background: "#0F172A",
      text: "#F9FAFB",
      cardBg: "#1E293B",
      borderColor: "#334155",
    },
  },
  "warm-architect": {
    name: "Warm Architect",
    colors: {
      primary: "#3B2F2F",
      accent: "#F6AD55",
      background: "#FFF7ED",
      text: "#292524",
      cardBg: "#FFFBF5",
      borderColor: "#FED7AA",
    },
  },
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

export function applyTheme(themeKey: ThemeKey) {
  const theme = themes[themeKey];
  if (!theme) return;

  const root = document.documentElement;
  const { colors } = theme;

  // Convert colors to HSL format for Tailwind CSS variables
  root.style.setProperty("--primary", hexToHSL(colors.primary));
  root.style.setProperty("--accent", hexToHSL(colors.accent));
  root.style.setProperty("--background", hexToHSL(colors.background));
  root.style.setProperty("--foreground", hexToHSL(colors.text));
  root.style.setProperty("--card", hexToHSL(colors.cardBg));
  root.style.setProperty("--border", hexToHSL(colors.borderColor));

  // Also set the legacy variables for backwards compatibility
  root.style.setProperty("--color-primary", colors.primary);
  root.style.setProperty("--color-accent", colors.accent);
  root.style.setProperty("--color-background", colors.background);
  root.style.setProperty("--color-text", colors.text);
  root.style.setProperty("--color-card-bg", colors.cardBg);
  root.style.setProperty("--color-border", colors.borderColor);
}

export function getCurrentTheme(): ThemeKey {
  return (localStorage.getItem("ofivio-theme") as ThemeKey) || "default";
}

export function setTheme(themeKey: ThemeKey) {
  localStorage.setItem("ofivio-theme", themeKey);
  applyTheme(themeKey);
}
