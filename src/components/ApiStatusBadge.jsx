import { Wifi, WifiOff, ShieldAlert } from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { useSettings } from "../context/SettingsContext";

export default function ApiStatusBadge() {
  const { error, simulateError, toggleSimulateError } = useProducts();
  const { colors } = useSettings();

  const online = !error;
  const statusColor = online ? colors.green : colors.red;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 12px",
          borderRadius: 999,
          border: `1px solid ${statusColor}55`,
          background: `${statusColor}14`,
          color: statusColor,
          fontSize: 12,
          fontWeight: 500,
          whiteSpace: "nowrap",
        }}
      >
        {online ? <Wifi size={13} /> : <WifiOff size={13} />}
        API {online ? "Online" : "Error"}
      </div>

      <button
        onClick={toggleSimulateError}
        aria-pressed={simulateError}
        aria-label={simulateError ? "Turn off simulated API error" : "Simulate an API error"}
        title={simulateError ? "Turn off simulated API error" : "Simulate an API error"}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: simulateError ? colors.red : colors.panel2,
          border: `1px solid ${simulateError ? colors.red : colors.border}`,
          color: simulateError ? "#fff" : colors.muted,
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <ShieldAlert size={13} />
      </button>
    </div>
  );
}
