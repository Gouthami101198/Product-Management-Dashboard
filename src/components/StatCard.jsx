import { useNavigate } from "react-router-dom";
import { MONO } from "../constants";
import { useSettings } from "../context/SettingsContext";

export default function StatCard({ label, value, sub, accent, icon: Icon, to, onClick }) {
  const { colors } = useSettings();
  const navigate = useNavigate();
  const clickable = Boolean(to || onClick);

  function handleClick() {
    if (onClick) onClick();
    else if (to) navigate(to);
  }

  return (
    <div
      onClick={clickable ? handleClick : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => (e.key === "Enter" ? handleClick() : null) : undefined}
      style={{
        background: colors.panel,
        border: `1px solid ${colors.border}`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: 8,
        padding: "15px 17px",
        display: "flex",
        flexDirection: "column",
        gap: 7,
        minWidth: 0,
        cursor: clickable ? "pointer" : "default",
        transition: "background-color 0.12s ease, box-shadow 0.12s ease, transform 0.12s ease",
        boxShadow: colors.shadowSm,
      }}
      onMouseEnter={
        clickable
          ? (e) => {
              e.currentTarget.style.background = colors.panelHover;
              e.currentTarget.style.boxShadow = colors.shadowMd;
              e.currentTarget.style.transform = "translateY(-1px)";
            }
          : undefined
      }
      onMouseLeave={
        clickable
          ? (e) => {
              e.currentTarget.style.background = colors.panel;
              e.currentTarget.style.boxShadow = colors.shadowSm;
              e.currentTarget.style.transform = "translateY(0)";
            }
          : undefined
      }
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: colors.muted, letterSpacing: 0.1 }}>{label}</span>
        <Icon size={14} color={accent} strokeWidth={2} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 24, fontWeight: 600, color: colors.text }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: colors.muted }}>{sub}</span>}
    </div>
  );
}
