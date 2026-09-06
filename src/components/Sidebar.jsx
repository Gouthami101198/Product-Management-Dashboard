import { NavLink } from "react-router-dom";
import { LayoutGrid, Tags, Award, LineChart, MessageSquareText, AlertTriangle, Settings as SettingsIcon, Boxes, X } from "lucide-react";
import { MONO, SANS } from "../constants";
import { useSettings } from "../context/SettingsContext";

const NAV_ITEMS = [
  { to: "/", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/brands", label: "Brands", icon: Award },
  { to: "/analytics", label: "Analytics", icon: LineChart },
  { to: "/reviews", label: "Reviews", icon: MessageSquareText },
  { to: "/alerts", label: "Alerts", icon: AlertTriangle },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar({ open, onClose }) {
  const { colors, accent } = useSettings();

  return (
    <aside
      className={`sidebar${open ? " sidebar-open" : ""}`}
      style={{
        width: 208,
        borderRight: `1px solid ${colors.border}`,
        padding: "20px 14px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: colors.panel,
        transition: "background-color 0.15s ease, border-color 0.15s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 4px" }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Boxes size={15} color="#0B0D12" strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: colors.text, letterSpacing: 0.2 }}>
              Stockroom
            </div>
            <div style={{ fontSize: 10.5, color: colors.muted }}>Product control</div>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close menu"
          className="sidebar-close-btn"
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: 6,
            background: "transparent",
            border: `1px solid ${colors.border}`,
            color: colors.muted,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <X size={14} />
        </button>
      </div>

      <div style={{ fontSize: 11, color: colors.faint, marginBottom: 8, padding: "0 4px" }}>Menu</div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 9,
              textAlign: "left",
              background: isActive ? colors.panel2 : "transparent",
              borderLeft: `2px solid ${isActive ? accent : "transparent"}`,
              borderRadius: 6,
              padding: "8px 9px",
              fontSize: 13,
              color: isActive ? colors.text : colors.muted,
              textDecoration: "none",
              fontFamily: SANS,
              fontWeight: isActive ? 500 : 400,
              transition: "background-color 0.12s ease, color 0.12s ease, border-color 0.12s ease",
            })}
          >
            <Icon size={14} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
