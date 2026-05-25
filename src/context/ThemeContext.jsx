import React, { createContext, useContext, useState, useEffect } from "react";

export const THEMES = [
  {
    id: "oscuro",
    label: "Oscuro",
    emoji: "🌑",
    accent: "#ffffff",
    preview: ["#09090b", "#18181b", "#27272a"],
  },
  {
    id: "azul",
    label: "Azul Marino",
    emoji: "🌊",
    accent: "#38bdf8",
    preview: ["#020817", "#0f172a", "#1e3a5f"],
  },
  {
    id: "violeta",
    label: "Violeta",
    emoji: "🔮",
    accent: "#a78bfa",
    preview: ["#0d0a1a", "#1e1040", "#4c1d95"],
  },
  {
    id: "esmeralda",
    label: "Esmeralda",
    emoji: "🌿",
    accent: "#34d399",
    preview: ["#021a12", "#052e1c", "#064e3b"],
  },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem("app-theme") || "oscuro";
  });

  useEffect(() => {
    localStorage.setItem("app-theme", themeId);
    // Remove all theme classes then apply selected
    const root = document.documentElement;
    THEMES.forEach((t) => root.classList.remove(`theme-${t.id}`));
    root.classList.add(`theme-${themeId}`);
  }, [themeId]);

  const currentTheme = THEMES.find((t) => t.id === themeId) || THEMES[0];

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, currentTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return ctx;
}
