export const SANS = "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif";
export const MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

// Semantic color tokens per mode. Every screen reads colors from
// useSettings().colors so the whole app repaints when the mode changes.
export const THEMES = {
  dark: {
    mode: "dark",
    bg: "#0B0D12",
    panel: "#14171D",
    panel2: "#1B1F27",
    panelHover: "#20242E",
    border: "#262B35",
    borderStrong: "#343B48",
    text: "#E7EAF0",
    textDim: "#C4C9D4",
    muted: "#8790A1",
    faint: "#4E5566",
    blue: "#4C8DFF",
    green: "#34C77B",
    amber: "#F0A83C",
    red: "#F0526B",
    purple: "#9B7CF0",
    teal: "#3FC7C7",
    shadowSm: "0 1px 2px rgba(0,0,0,0.24)",
    shadowMd: "0 8px 24px rgba(0,0,0,0.36)",
    overlay: "rgba(255,255,255,0.045)",
    scrollThumb: "#2E333F",
  },
  light: {
    mode: "light",
    bg: "#F4F5F7",
    panel: "#FFFFFF",
    panel2: "#F1F2F5",
    panelHover: "#E8EAEE",
    border: "#E2E4E9",
    borderStrong: "#CBCED6",
    text: "#171A21",
    textDim: "#3A3F4A",
    muted: "#6B7280",
    faint: "#A2A8B3",
    blue: "#2E63D9",
    green: "#12875D",
    amber: "#B4700A",
    red: "#D33C58",
    purple: "#7048D8",
    teal: "#0E8484",
    shadowSm: "0 1px 2px rgba(20,24,33,0.05)",
    shadowMd: "0 12px 28px rgba(20,24,33,0.10)",
    overlay: "rgba(20,24,33,0.035)",
    scrollThumb: "#D6D9E0",
  },
};

export const CHART_COLORS = {
  dark: ["#4C8DFF", "#34C77B", "#F0A83C", "#F0526B", "#9B7CF0", "#3FC7C7", "#E8C34C", "#6E8AF0"],
  light: ["#2E63D9", "#12875D", "#B4700A", "#D33C58", "#7048D8", "#0E8484", "#9A7A16", "#4A5FC9"],
};

export const ACCENTS = {
  blue: { dark: "#4C8DFF", light: "#2E63D9" },
  green: { dark: "#34C77B", light: "#12875D" },
  purple: { dark: "#9B7CF0", light: "#7048D8" },
  teal: { dark: "#3FC7C7", light: "#0E8484" },
};

export function stockStatus(colors, stock, threshold = 15) {
  if (stock <= 0) return { label: "out", color: colors.red };
  if (stock < threshold) return { label: "low", color: colors.amber };
  return { label: "healthy", color: colors.green };
}

export function fmtMoney(n, currency = "INR") {
  if (currency === "INR") {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
  }
  return "$" + Math.round(n).toLocaleString("en-US");
}
