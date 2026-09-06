import { useSettings } from "../context/SettingsContext";
import PageHeader from "../components/PageHeader";

function SettingRow({ label, description, children, colors }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 20,
        padding: "16px 0",
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div>
        <div style={{ fontSize: 13.5, color: colors.text, marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 12, color: colors.muted }}>{description}</div>
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function Settings() {
  const {
    pageSize, setPageSize,
    lowStockThreshold, setLowStockThreshold,
    accentKey, setAccentKey, accents,
    currency, setCurrency,
    colors,
  } = useSettings();

  const selectStyle = {
    background: colors.panel2,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    padding: "7px 10px",
    fontSize: 13,
    color: colors.text,
  };

  const pillStyle = (active) => ({
    background: active ? colors.panel2 : "transparent",
    border: `1px solid ${active ? colors.blue : colors.border}`,
    color: active ? colors.text : colors.muted,
    borderRadius: 6,
    padding: "7px 12px",
    fontSize: 12.5,
    cursor: "pointer",
    fontWeight: active ? 500 : 400,
  });

  return (
    <div style={{ maxWidth: 560 }}>
      <PageHeader title="Settings" subtitle="Product management preferences for this catalog" />

      <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "4px 20px", boxShadow: colors.shadowSm }}>
        <SettingRow label="Currency" description="Used for prices and inventory value across the dashboard" colors={colors}>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={pillStyle(currency === "INR")} onClick={() => setCurrency("INR")}>₹ INR</button>
            <button style={pillStyle(currency === "USD")} onClick={() => setCurrency("USD")}>$ USD</button>
          </div>
        </SettingRow>

        <SettingRow label="Rows per page" description="Products shown per page on the Overview table" colors={colors}>
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} style={selectStyle}>
            {[5, 10, 15, 25, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </SettingRow>

        <SettingRow label="Low stock threshold" description="Units below this level are flagged as low stock" colors={colors}>
          <select value={lowStockThreshold} onChange={(e) => setLowStockThreshold(Number(e.target.value))} style={selectStyle}>
            {[5, 10, 15, 20, 30, 50].map((n) => (
              <option key={n} value={n}>
                {n} units
              </option>
            ))}
          </select>
        </SettingRow>

        <SettingRow label="Accent color" description="Highlight color used across KPI cards and active states" colors={colors}>
          <div style={{ display: "flex", gap: 8 }}>
            {Object.entries(accents).map(([key, color]) => (
              <button
                key={key}
                onClick={() => setAccentKey(key)}
                title={key}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: color,
                  border: accentKey === key ? `2px solid ${colors.text}` : "2px solid transparent",
                  cursor: "pointer",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </SettingRow>
      </div>

      <div style={{ marginTop: 14, fontSize: 12, color: colors.muted }}>
        Light/dark theme toggle lives in the top-right of the Overview page. Other preferences apply to this session only.
      </div>
    </div>
  );
}
