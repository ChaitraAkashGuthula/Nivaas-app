import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Theme = "light" | "dark" | "system";

export interface ThemeContextType {
  theme: Theme;
  effectiveTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  switchable = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark" || stored === "system") {
        return stored;
      }
    } catch (e) {
      // ignore
    }
    return defaultTheme;
  });

  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">("light");

  const applyTheme = useCallback((currentTheme: Theme) => {
    const root = document.documentElement;
    let isDark = false;

    if (currentTheme === "dark") {
      isDark = true;
    } else if (currentTheme === "light") {
      isDark = false;
    } else {
      // System
      isDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    if (isDark) {
      root.classList.add("dark");
      setEffectiveTheme("dark");
    } else {
      root.classList.remove("dark");
      setEffectiveTheme("light");
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      // ignore
    }

    if (theme === "system" && typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme, applyTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme, toggleTheme, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
