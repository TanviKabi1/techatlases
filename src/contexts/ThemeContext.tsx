import React, { createContext, useContext, useEffect, useState } from "react";
import { THEMES, Theme } from "@/lib/themes";

interface ThemeContextType {
  theme: Theme;
  setTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("app-theme");
    return THEMES.find((t) => t.id === saved) || THEMES[0];
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const colors = currentTheme.colors;

    // Set CSS variables
    Object.entries(colors).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`;
      root.style.setProperty(cssVar, value);
    });

    // Handle dark mode class
    if (currentTheme.isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Custom gradient and glow
    root.style.setProperty("--theme-gradient", colors.gradient);
    root.style.setProperty("--theme-glow", colors.glow);

    localStorage.setItem("app-theme", currentTheme.id);
  }, [currentTheme]);

  const setTheme = (themeId: string) => {
    const theme = THEMES.find((t) => t.id === themeId);
    if (theme) setCurrentTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
