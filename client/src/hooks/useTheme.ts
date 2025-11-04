import { useState, useEffect } from "react";
import type { ThemeKey } from "@shared/schema";
import { applyTheme, getCurrentTheme, setTheme as saveTheme } from "@/lib/themes";

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeKey>(getCurrentTheme());

  useEffect(() => {
    // Apply theme on mount
    applyTheme(theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeKey) => {
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  return { theme, setTheme };
}
