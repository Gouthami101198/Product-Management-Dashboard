import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { MONO, stockStatus, fmtMoney } from "../constants";
import { useProducts } from "../hooks/useProducts";
import { useSettings } from "../context/SettingsContext";
import PageHeader from "../components/PageHeader";

export default function Brands() {
  const { products, loading } = useProducts();
  const { lowStockThreshold, colors, chartColors, currency } = useSettings();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const brandStats = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      const key = p.brand || "Unbranded";
      if (!map.has(key)) {
        map.set(key, { name: key, count: 0, totalStock: 0, totalValue: 0, ratingSum: 0, lowStock: 0, categories: new Set() });
      }
      const entry = map.get(key);
      const finalPrice = p.price * (1 - p.discountPercentage / 100);
      entry.count += 1;
      entry.totalStock += p.stock;
      entry.totalValue += finalPrice * p.stock;
      entry.ratingSum += p.rating;
      entry.categories.add(p.category);
      if (stockStatus(colors, p.stock, lowStockThreshold).label !== "healthy") entry.lowStock += 1;
    }
    return Array.from(map.values())
      .map((e) => ({ ...e, avgRating: e.ratingSum / e.count, categoryCount: e.categories.size }))
      .sort((a, b) => b.totalValue - a.totalValue);
  }, [products, lowStockThreshold, colors]);

  const filtered = useMemo(() => {
    if (!search.trim()) return brandStats;
    const q = search.trim().toLowerCase();
    return brandStats.filter((b) => b.name.toLowerCase().includes(q));
  }, [brandStats, search]);

  if (loading) {
    return <div style={{ padding: 32, textAlign: "center", color: colors.muted, fontSize: 13 }}>Loading brands…</div>;
  }

  const inputStyle = {
    background: colors.panel2,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    fontSize: 13,
    color: colors.text,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div>
      <PageHeader title="Brands" subtitle={`${brandStats.length} brands across ${products.length} products`} />

      <div style={{ position: "relative", maxWidth: 320, marginBottom: 16 }}>
        <Search size={14} color={colors.muted} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search brands"
          style={{ ...inputStyle, width: "100%", padding: "8px 10px 8px 32px" }}
        />
      </div>

      <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 8, overflow: "hidden", boxShadow: colors.shadowSm }}>
        <div className="table-scroll">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
              <th style={{ padding: "11px 14px", textAlign: "left", fontSize: 11.5, color: colors.muted, fontWeight: 500 }}>Brand</th>
              <th style={{ padding: "11px 14px", textAlign: "left", fontSize: 11.5, color: colors.muted, fontWeight: 500 }}>Categories</th>
              <th style={{ padding: "11px 14px", textAlign: "right", fontSize: 11.5, color: colors.muted, fontWeight: 500 }}>Products</th>
              <th style={{ padding: "11px 14px", textAlign: "right", fontSize: 11.5, color: colors.muted, fontWeight: 500 }}>Stock</th>
              <th style={{ padding: "11px 14px", textAlign: "right", fontSize: 11.5, color: colors.muted, fontWeight: 500 }}>Value</th>
              <th style={{ padding: "11px 14px", textAlign: "right", fontSize: 11.5, color: colors.muted, fontWeight: 500 }}>Avg rating</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 32, textAlign: "center", color: colors.muted, fontSize: 13 }}>
                  No brands match "{search}".
                </td>
              </tr>
            )}
            {filtered.map((b, i) => (
              <tr
                key={b.name}
                onClick={() => navigate(`/?search=${encodeURIComponent(b.name)}`)}
                style={{ borderBottom: `1px solid ${colors.border}`, cursor: "pointer", transition: "background-color 0.1s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = colors.panel2)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: chartColors[i % chartColors.length],
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 13, color: colors.text }}>{b.name}</span>
                  </div>
                </td>
                <td style={{ padding: "10px 14px", fontSize: 12.5, color: colors.muted }}>{b.categoryCount}</td>
                <td style={{ padding: "10px 14px", fontFamily: MONO, fontSize: 13, textAlign: "right", color: colors.text }}>{b.count}</td>
                <td style={{ padding: "10px 14px", fontFamily: MONO, fontSize: 13, textAlign: "right", color: colors.text }}>
                  {b.totalStock.toLocaleString()}
                  {b.lowStock > 0 && <span style={{ color: colors.amber, marginLeft: 6, fontSize: 11 }}>{b.lowStock} low</span>}
                </td>
                <td style={{ padding: "10px 14px", fontFamily: MONO, fontSize: 13, textAlign: "right", color: colors.text }}>
                  {fmtMoney(b.totalValue, currency)}
                </td>
                <td style={{ padding: "10px 14px", fontFamily: MONO, fontSize: 13, textAlign: "right", color: colors.text }}>
                  {b.avgRating.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
