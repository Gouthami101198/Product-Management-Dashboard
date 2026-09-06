import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

export default function SortHeader({ label, sortKey, active, dir, onClick, align }) {
  const { colors } = useSettings();
  return (
    <th
      onClick={() => onClick(sortKey)}
      style={{
        textAlign: align || "left",
        padding: "11px 14px",
        fontSize: 11.5,
        color: active ? colors.blue : colors.muted,
        letterSpacing: 0.2,
        cursor: "pointer",
        userSelect: "none",
        whiteSpace: "nowrap",
        fontWeight: 500,
        transition: "color 0.12s ease",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          justifyContent: align === "right" ? "flex-end" : "flex-start",
        }}
      >
        {label}
        {active ? (
          dir === "asc" ? <ArrowUp size={11} /> : <ArrowDown size={11} />
        ) : (
          <ArrowUpDown size={11} opacity={0.4} />
        )}
      </span>
    </th>
  );
}
