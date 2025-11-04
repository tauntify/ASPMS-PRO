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
    name: "Default",
    colors: {
      primary: "#7e8987",
      accent: "#8db580",
      background: "#ddd1c7",
      text: "#4b4a67",
      cardBg: "#d0d0bd",
      borderColor: "#c2cfb2",
    },
  },
  interior: {
    name: "Interior Mode",
    colors: {
      primary: "#b97375",
      accent: "#c4929a",
      background: "#f1e4e8",
      text: "#2d2d34",
      cardBg: "#d8c7ce",
      borderColor: "#ceb1be",
    },
  },
  architect: {
    name: "Architect Mode",
    colors: {
      primary: "#ff7f11",
      accent: "#ffbf87",
      background: "#414141",
      text: "#ffefdf",
      cardBg: "#80807e",
      borderColor: "#ffdfc2",
    },
  },
  workload: {
    name: "Work Load",
    colors: {
      primary: "#80b6cc",
      accent: "#9fb9c2",
      background: "#bd9391",
      text: "#414141",
      cardBg: "#b5a7a7",
      borderColor: "#adbabd",
    },
  },
  corporate: {
    name: "Corporate",
    colors: {
      primary: "#5d5c90",
      accent: "#b497d6",
      background: "#e1e2ef",
      text: "#05122b",
      cardBg: "#cbbde3",
      borderColor: "#b497d6",
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
