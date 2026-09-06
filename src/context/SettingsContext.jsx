import { createContext, useContext, useState, useEffect } from "react";
import { THEMES, CHART_COLORS, ACCENTS } from "../constants";

const SettingsContext = createContext(null);

const STORAGE_KEY = "stockroom-theme-mode";

function getInitialMode() {
  if (typeof window === "undefined") return "dark";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "dark" || saved === "light") return saved;
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
  return "dark";
}

export function SettingsProvider({ children }) {
  const [pageSize, setPageSize] = useState(10);
  const [lowStockThreshold, setLowStockThreshold] = useState(15);
  const [accentKey, setAccentKey] = useState("blue");
  const [currency, setCurrency] = useState("INR");
  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    const theme = THEMES[mode];
    window.localStorage.setItem(STORAGE_KEY, mode);
    document.documentElement.style.colorScheme = mode;
    document.documentElement.style.setProperty("--scroll-thumb", theme.scrollThumb);
    document.documentElement.style.setProperty("--focus-ring", theme.blue);
    document.body.style.background = theme.bg;
    document.body.style.colorScheme = mode;
  }, [mode]);

  function toggleMode() {
    setMode((m) => (m === "dark" ? "light" : "dark"));
  }

  const colors = THEMES[mode];
  const chartColors = CHART_COLORS[mode];
  const accents = Object.fromEntries(Object.entries(ACCENTS).map(([key, byMode]) => [key, byMode[mode]]));

  const value = {
    pageSize,
    setPageSize,
    lowStockThreshold,
    setLowStockThreshold,
    accentKey,
    setAccentKey,
    accent: accents[accentKey],
    accents,
    currency,
    setCurrency,
    mode,
    setMode,
    toggleMode,
    colors,
    chartColors,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
}
