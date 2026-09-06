import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star } from "lucide-react";
import { MONO } from "../constants";
import { useProducts } from "../hooks/useProducts";
import { useSettings } from "../context/SettingsContext";
import PageHeader from "../components/PageHeader";

function Stars({ rating, colors }) {
  return (
    <div style={{ display: "flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={12}
          fill={n <= Math.round(rating) ? colors.amber : "none"}
          color={n <= Math.round(rating) ? colors.amber : colors.faint}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  const { products, loading } = useProducts();
  const { pageSize, colors } = useSettings();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [sortDir, setSortDir] = useState("recent");
  const [page, setPage] = useState(1);

  const allReviews = useMemo(() => {
    const rows = [];
    for (const p of products) {
      for (const r of p.reviews || []) {
        rows.push({
          ...r,
          productId: p.id,
          productTitle: p.title,
          productThumbnail: p.thumbnail,
          category: p.category,
        });
      }
    }
    return rows;
  }, [products]);

  const stats = useMemo(() => {
    if (allReviews.length === 0) return { avg: 0, total: 0, fiveStar: 0 };
    const sum = allReviews.reduce((s, r) => s + r.rating, 0);
    const fiveStar = allReviews.filter((r) => r.rating >= 4.5).length;
    return { avg: sum / allReviews.length, total: allReviews.length, fiveStar };
  }, [allReviews]);

  const filtered = useMemo(() => {
    let list = allReviews;
    if (minRating > 0) list = list.filter((r) => r.rating >= minRating);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          (r.comment || "").toLowerCase().includes(q) ||
          (r.reviewerName || "").toLowerCase().includes(q) ||
          r.productTitle.toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    if (sortDir === "recent") {
      sorted.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    } else if (sortDir === "highest") {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (sortDir === "lowest") {
      sorted.sort((a, b) => a.rating - b.rating);
    }
    return sorted;
  }, [allReviews, minRating, search, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return <div style={{ padding: 32, textAlign: "center", color: colors.muted, fontSize: 13 }}>Loading reviews…</div>;
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
      <PageHeader title="Reviews" subtitle={`${stats.total} reviews across ${products.length} products`} />

      <div className="stat-grid-3" style={{ marginBottom: 20 }}>
        <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "14px 16px", boxShadow: colors.shadowSm }}>
          <div style={{ fontSize: 12, color: colors.muted, marginBottom: 6 }}>Average rating</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: MONO, fontSize: 22, fontWeight: 600, color: colors.text }}>{stats.avg.toFixed(2)}</span>
            <Stars rating={stats.avg} colors={colors} />
          </div>
        </div>
        <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "14px 16px", boxShadow: colors.shadowSm }}>
          <div style={{ fontSize: 12, color: colors.muted, marginBottom: 6 }}>Total reviews</div>
          <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 600, color: colors.text }}>{stats.total.toLocaleString()}</div>
        </div>
        <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "14px 16px", boxShadow: colors.shadowSm }}>
          <div style={{ fontSize: 12, color: colors.muted, marginBottom: 6 }}>4.5★ and above</div>
          <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 600, color: colors.text }}>
            {stats.total ? Math.round((stats.fiveStar / stats.total) * 100) : 0}%
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
          <Search size={14} color={colors.muted} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search reviewer, comment, product"
            style={{ ...inputStyle, width: "100%", padding: "8px 10px 8px 32px" }}
          />
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {[0, 4, 3].map((r) => (
            <button
              key={r}
              onClick={() => {
                setMinRating(r);
                setPage(1);
              }}
              style={{
                border: `1px solid ${minRating === r ? colors.blue : colors.border}`,
                background: minRating === r ? `${colors.blue}1F` : "transparent",
                color: minRating === r ? colors.blue : colors.muted,
                borderRadius: 6,
                padding: "7px 12px",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {r === 0 ? "All ratings" : `${r}+ stars`}
            </button>
          ))}
        </div>

        <select value={sortDir} onChange={(e) => setSortDir(e.target.value)} style={{ ...inputStyle, padding: "8px 10px", fontSize: 12.5, marginLeft: "auto" }}>
          <option value="recent">Most recent</option>
          <option value="highest">Highest rated</option>
          <option value="lowest">Lowest rated</option>
        </select>
      </div>

      {pageItems.length === 0 ? (
        <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 8, padding: 32, textAlign: "center", color: colors.muted, fontSize: 13 }}>
          No reviews match these filters.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {pageItems.map((r, i) => (
            <div
              key={`${r.productId}-${i}`}
              onClick={() => navigate(`/products/${r.productId}`)}
              style={{
                display: "flex",
                gap: 12,
                background: colors.panel,
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                padding: "12px 16px",
                cursor: "pointer",
                boxShadow: colors.shadowSm,
                transition: "background-color 0.12s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = colors.panelHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = colors.panel)}
            >
              <img
                src={r.productThumbnail}
                alt=""
                style={{ width: 38, height: 38, objectFit: "cover", borderRadius: 5, border: `1px solid ${colors.border}`, flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 3 }}>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: 12.5, color: colors.text, fontWeight: 500 }}>{r.reviewerName || "Anonymous"}</span>
                    <span style={{ fontSize: 11.5, color: colors.muted }}> on </span>
                    <span style={{ fontSize: 12, color: colors.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.productTitle}
                    </span>
                  </div>
                  <Stars rating={r.rating} colors={colors} />
                </div>
                <div style={{ fontSize: 12.5, color: colors.muted, lineHeight: 1.5 }}>{r.comment}</div>
                {r.date && (
                  <div style={{ fontSize: 10.5, color: colors.faint, marginTop: 4 }}>
                    {new Date(r.date).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, fontSize: 12.5, color: colors.muted }}>
          <span>
            Page {page} of {totalPages}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                background: colors.panel,
                border: `1px solid ${colors.border}`,
                borderRadius: 5,
                padding: "6px 12px",
                color: page === 1 ? colors.faint : colors.text,
                cursor: page === 1 ? "default" : "pointer",
                fontSize: 12.5,
              }}
            >
              Previous
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{
                background: colors.panel,
                border: `1px solid ${colors.border}`,
                borderRadius: 5,
                padding: "6px 12px",
                color: page === totalPages ? colors.faint : colors.text,
                cursor: page === totalPages ? "default" : "pointer",
                fontSize: 12.5,
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
