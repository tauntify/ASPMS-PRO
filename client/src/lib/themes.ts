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

export function applyTheme(themeKey: ThemeKey) {
  const theme = themes[themeKey];
  if (!theme) return;

  const root = document.documentElement;
  const { colors } = theme;

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
