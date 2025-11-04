import { useState, useEffect } from "react";
import { applyTheme, getCurrentTheme, setTheme as saveTheme, toggleTheme as toggle, type ThemeMode } from "@/lib/themes";

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(getCurrentTheme());

  useEffect(() => {
    // Apply theme on mount
    applyTheme(theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = toggle();
    setThemeState(newTheme);
  };

  return { theme, setTheme, toggleTheme, isDark: theme === 'dark' };
}
