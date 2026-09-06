import { Sun, Moon } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import ApiStatusBadge from "./ApiStatusBadge";

export default function PageHeader({ title, subtitle, actions, showThemeToggle = false, showApiStatus = false }) {
  const { colors, mode, toggleMode, accent } = useSettings();

  return (
    <div className="page-header">
      <div>
        <div style={{ fontSize: 19, fontWeight: 600, color: colors.text, letterSpacing: -0.2 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12.5, color: colors.muted, marginTop: 3 }}>{subtitle}</div>}
      </div>

      <div className="page-header-actions">
        {actions}
        {showApiStatus && <ApiStatusBadge />}
        {showThemeToggle && (
          <button
            onClick={toggleMode}
            aria-label={mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title={mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 6,
              background: colors.panel2,
              border: `1px solid ${colors.border}`,
              color: mode === "dark" ? accent : colors.amber,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            {mode === "dark" ? <Moon size={15} /> : <Sun size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}
