import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { MONO, stockStatus, fmtMoney } from "../constants";
import { useProducts } from "../hooks/useProducts";
import { useSettings } from "../context/SettingsContext";
import PageHeader from "../components/PageHeader";

export default function Alerts() {
  const { products, loading } = useProducts();
  const { lowStockThreshold, colors, currency } = useSettings();
  const navigate = useNavigate();

  const flagged = useMemo(() => {
    return products
      .map((p) => ({ ...p, status: stockStatus(colors, p.stock, lowStockThreshold) }))
      .filter((p) => p.status.label !== "healthy")
      .sort((a, b) => a.stock - b.stock);
  }, [products, lowStockThreshold, colors]);

  const outCount = flagged.filter((p) => p.status.label === "out").length;
  const lowCount = flagged.length - outCount;

  if (loading) {
    return <div style={{ padding: 32, textAlign: "center", color: colors.muted, fontSize: 13 }}>Checking stock levels…</div>;
  }

  return (
    <div>
      <PageHeader
        title="Alerts"
        subtitle={`${outCount} out of stock · ${lowCount} running low (threshold: ${lowStockThreshold} units)`}
      />

      {flagged.length === 0 ? (
        <div
          style={{
            background: colors.panel,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            padding: 32,
            textAlign: "center",
            color: colors.muted,
            fontSize: 13,
            boxShadow: colors.shadowSm,
          }}
        >
          Everything is well stocked. No alerts right now.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {flagged.map((p) => {
            const finalPrice = p.price * (1 - p.discountPercentage / 100);
            return (
              <div
                key={p.id}
                onClick={() => navigate(`/products/${p.id}`)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: colors.panel,
                  border: `1px solid ${colors.border}`,
                  borderLeft: `3px solid ${p.status.color}`,
                  borderRadius: 8,
                  padding: "12px 16px",
                  cursor: "pointer",
                  boxShadow: colors.shadowSm,
                  transition: "background-color 0.12s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = colors.panelHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = colors.panel)}
              >
                <img src={p.thumbnail} alt="" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 5, border: `1px solid ${colors.border}` }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, color: colors.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</div>
                  <div style={{ fontSize: 11.5, color: colors.muted, textTransform: "capitalize" }}>
                    {p.brand || "—"} · {p.category.replace(/-/g, " ")}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: MONO, fontSize: 13, color: colors.text }}>{fmtMoney(finalPrice, currency)}</div>
                  <div style={{ fontSize: 11, color: colors.muted }}>per unit</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 90, justifyContent: "flex-end" }}>
                  <AlertTriangle size={13} color={p.status.color} />
                  <span style={{ fontFamily: MONO, fontSize: 13, color: p.status.color, textTransform: "capitalize" }}>
                    {p.status.label} · {p.stock}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
