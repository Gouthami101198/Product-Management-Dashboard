import { MONO, stockStatus } from "../constants";
import { useSettings } from "../context/SettingsContext";

export default function StockBar({ stock, max, threshold }) {
  const { colors } = useSettings();
  const pct = Math.max(4, Math.min(100, (stock / max) * 100));
  const status = stockStatus(colors, stock, threshold);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 100 }}>
      <div style={{ flex: 1, height: 5, background: colors.panel2, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: pct + "%", height: "100%", background: status.color, borderRadius: 3, transition: "width 0.2s ease" }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 12, color: colors.text, minWidth: 26, textAlign: "right" }}>{stock}</span>
    </div>
  );
}
