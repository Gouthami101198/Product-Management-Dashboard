import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MONO, stockStatus, fmtMoney } from "../constants";
import { useProducts } from "../hooks/useProducts";
import { useSettings } from "../context/SettingsContext";
import PageHeader from "../components/PageHeader";

export default function Categories() {
  const { products, loading } = useProducts();
  const { lowStockThreshold, colors, chartColors, currency } = useSettings();
  const navigate = useNavigate();

  const categoryStats = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      if (!map.has(p.category)) {
        map.set(p.category, { name: p.category, count: 0, totalStock: 0, totalValue: 0, ratingSum: 0, lowStock: 0 });
      }
      const entry = map.get(p.category);
      const finalPrice = p.price * (1 - p.discountPercentage / 100);
      entry.count += 1;
      entry.totalStock += p.stock;
      entry.totalValue += finalPrice * p.stock;
      entry.ratingSum += p.rating;
      if (stockStatus(colors, p.stock, lowStockThreshold).label !== "healthy") entry.lowStock += 1;
    }
    return Array.from(map.values())
      .map((e) => ({ ...e, avgRating: e.ratingSum / e.count }))
      .sort((a, b) => b.totalValue - a.totalValue);
  }, [products, lowStockThreshold, colors]);

  if (loading) {
    return <div style={{ padding: 32, textAlign: "center", color: colors.muted, fontSize: 13 }}>Loading categories…</div>;
  }

  return (
    <div>
      <PageHeader title="Categories" subtitle={`${categoryStats.length} categories across ${products.length} products`} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 12 }}>
        {categoryStats.map((c, i) => {
          const accent = chartColors[i % chartColors.length];
          return (
            <button
              key={c.name}
              onClick={() => navigate(`/?category=${encodeURIComponent(c.name)}`)}
              style={{
                textAlign: "left",
                background: colors.panel,
                border: `1px solid ${colors.border}`,
                borderTop: `3px solid ${accent}`,
                borderRadius: 8,
                padding: "14px 16px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                boxShadow: colors.shadowSm,
                transition: "background-color 0.12s ease, box-shadow 0.12s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.panelHover;
                e.currentTarget.style.boxShadow = colors.shadowMd;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.panel;
                e.currentTarget.style.boxShadow = colors.shadowSm;
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, textTransform: "capitalize" }}>
                  {c.name.replace(/-/g, " ")}
                </div>
                <div style={{ fontSize: 11.5, color: colors.muted, marginTop: 1 }}>{c.count} products</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div style={{ background: colors.panel2, borderRadius: 5, padding: "8px 10px" }}>
                  <div style={{ fontSize: 10.5, color: colors.muted, marginBottom: 2 }}>Value</div>
                  <div style={{ fontFamily: MONO, fontSize: 13, color: colors.text }}>{fmtMoney(c.totalValue, currency)}</div>
                </div>
                <div style={{ background: colors.panel2, borderRadius: 5, padding: "8px 10px" }}>
                  <div style={{ fontSize: 10.5, color: colors.muted, marginBottom: 2 }}>Avg rating</div>
                  <div style={{ fontFamily: MONO, fontSize: 13, color: colors.text }}>{c.avgRating.toFixed(2)}</div>
                </div>
              </div>

              {c.lowStock > 0 && (
                <div style={{ fontSize: 11, color: colors.amber }}>{c.lowStock} item{c.lowStock > 1 ? "s" : ""} need attention</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
