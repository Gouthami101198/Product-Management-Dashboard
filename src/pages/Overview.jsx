import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Boxes, TrendingUp, AlertTriangle, Star, PackageX, RefreshCw, Plus, CheckCircle2 } from "lucide-react";
import { MONO, stockStatus, fmtMoney } from "../constants";
import { useProducts } from "../hooks/useProducts";
import { useSettings } from "../context/SettingsContext";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import SortHeader from "../components/SortHeader";
import StockBar from "../components/StockBar";
import AddProductModal from "../components/AddProductModal";

export default function Overview() {
  const {
    products,
    loading,
    refreshing,
    error,
    refreshError,
    lastUpdated,
    simulateError,
    refresh,
    addProduct,
    toggleSimulateError,
    resetDemoData,
  } = useProducts();
  const { pageSize, lowStockThreshold, accent, colors, currency } = useSettings();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAddModal, setShowAddModal] = useState(false);
  const [justRefreshed, setJustRefreshed] = useState(false);

  async function handleRefresh() {
    await refresh();
    setJustRefreshed(true);
    setTimeout(() => setJustRefreshed(false), 1500);
  }

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState("title");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const c = searchParams.get("category");
    if (c) setCategory(c);
    const s = searchParams.get("search");
    if (s) setSearch(s);
  }, [searchParams]);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["all", ...Array.from(set).sort()];
  }, [products]);

  const maxStock = useMemo(() => products.reduce((m, p) => Math.max(m, p.stock), 1), [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (statusFilter === "attention") {
      list = list.filter((p) => stockStatus(colors, p.stock, lowStockThreshold).label !== "healthy");
    } else if (statusFilter !== "all") {
      list = list.filter((p) => stockStatus(colors, p.stock, lowStockThreshold).label === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.brand || "").toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.sku || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, category, statusFilter, search, lowStockThreshold, colors]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (typeof av === "string") {
        av = av.toLowerCase();
        bv = bv.toLowerCase();
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageItems = sorted.slice((page - 1) * pageSize, page * pageSize);

  const stats = useMemo(() => {
    const totalStock = products.reduce((s, p) => s + p.stock, 0);
    const totalValue = products.reduce((s, p) => s + p.price * (1 - p.discountPercentage / 100) * p.stock, 0);
    const lowStock = products.filter((p) => stockStatus(colors, p.stock, lowStockThreshold).label !== "healthy").length;
    const avgRating = products.length ? products.reduce((s, p) => s + p.rating, 0) / products.length : 0;
    return { totalStock, totalValue, lowStock, avgRating };
  }, [products, lowStockThreshold, colors]);

  function applyQuickView({ status = "all", sort, dir = "desc" } = {}) {
    setSearch("");
    setStatusFilter(status);
    setCategory("all");
    setSearchParams({});
    if (sort) {
      setSortKey(sort);
      setSortDir(dir);
    }
    setPage(1);
  }

  function handleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function handleCategoryChange(c) {
    setCategory(c);
    setPage(1);
    if (c === "all") setSearchParams({});
    else setSearchParams({ category: c });
  }

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  if (error) {
    return (
      <div>
        <PageHeader title="Product management" subtitle="Live from dummyjson.com/products" showThemeToggle showApiStatus />
        <div
          style={{
            border: `1px solid ${colors.red}45`,
            background: `${colors.red}0D`,
            borderRadius: 10,
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: `${colors.red}1F`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 18px",
            }}
          >
            <PackageX size={26} color={colors.red} />
          </div>
          <div style={{ fontSize: 16.5, fontWeight: 600, color: colors.text, marginBottom: 6 }}>
            Unable to Load Products
          </div>
          <div style={{ fontSize: 13, color: colors.muted, maxWidth: 420, margin: "0 auto 18px" }}>{error}</div>

          {simulateError && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                background: `${colors.amber}18`,
                border: `1px solid ${colors.amber}55`,
                color: colors.amber,
                borderRadius: 999,
                padding: "6px 14px",
                fontSize: 12,
                marginBottom: 22,
              }}
            >
              <AlertTriangle size={13} />
              API Error Simulation Mode is currently active
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={refresh}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                background: colors.red,
                border: "none",
                color: "#fff",
                borderRadius: 6,
                padding: "9px 16px",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <RefreshCw size={13} />
              Retry request
            </button>
            {simulateError && (
              <button
                onClick={toggleSimulateError}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  background: colors.panel,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  borderRadius: 6,
                  padding: "9px 16px",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Turn off simulated error
              </button>
            )}
            <button
              onClick={resetDemoData}
              style={{
                background: "transparent",
                border: `1px solid ${colors.border}`,
                color: colors.muted,
                borderRadius: 6,
                padding: "9px 16px",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Reset demo data
            </button>
          </div>
        </div>
      </div>
    );
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

  const buttonBaseStyle = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    borderRadius: 6,
    padding: "8px 13px",
    fontSize: 12.5,
    cursor: "pointer",
  };

  return (
    <div>
      <PageHeader
        title="Product management"
        subtitle="Live from dummyjson.com/products"
        showThemeToggle
        showApiStatus
        actions={
          <>
            {lastUpdated && !loading && (
              <span style={{ fontSize: 11.5, color: colors.faint, marginRight: 2 }}>
                Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              style={{
                ...buttonBaseStyle,
                background: justRefreshed ? `${colors.green}22` : colors.panel2,
                border: `1px solid ${justRefreshed ? colors.green : colors.border}`,
                color: justRefreshed ? colors.green : colors.text,
                opacity: refreshing || loading ? 0.6 : 1,
                transition: "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease",
              }}
            >
              {justRefreshed ? (
                <CheckCircle2 size={13} />
              ) : (
                <RefreshCw size={13} style={refreshing ? { animation: "spin 0.6s linear infinite" } : undefined} />
              )}
              {justRefreshed ? "Refreshed" : refreshing ? "Refreshing…" : "Refresh"}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                ...buttonBaseStyle,
                background: accent,
                border: "none",
                color: "#0B0D12",
                fontWeight: 500,
              }}
            >
              <Plus size={13} />
              Add product
            </button>
          </>
        }
      />

      {refreshError && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: `${colors.red}14`,
            border: `1px solid ${colors.red}55`,
            color: colors.red,
            borderRadius: 6,
            padding: "8px 12px",
            fontSize: 12.5,
            marginBottom: 16,
          }}
        >
          <AlertTriangle size={13} />
          {refreshError}
        </div>
      )}

      <div className="stat-grid" style={{ marginBottom: 22 }}>
        <StatCard
          label="Total SKUs"
          value={loading ? "—" : products.length}
          accent={accent}
          icon={Boxes}
          onClick={() => applyQuickView({ status: "all", sort: "title", dir: "asc" })}
        />
        <StatCard
          label="Inventory value"
          value={loading ? "—" : fmtMoney(stats.totalValue, currency)}
          sub={loading ? "" : stats.totalStock.toLocaleString() + " units"}
          accent={colors.green}
          icon={TrendingUp}
          onClick={() => applyQuickView({ status: "all", sort: "price", dir: "desc" })}
        />
        <StatCard
          label="Needs attention"
          value={loading ? "—" : stats.lowStock}
          sub="low or out of stock"
          accent={colors.amber}
          icon={AlertTriangle}
          onClick={() => applyQuickView({ status: "attention", sort: "stock", dir: "asc" })}
        />
        <StatCard
          label="Avg rating"
          value={loading ? "—" : stats.avgRating.toFixed(2)}
          sub="out of 5.00"
          accent={accent}
          icon={Star}
          onClick={() => applyQuickView({ status: "all", sort: "rating", dir: "desc" })}
        />
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
          <Search size={14} color={colors.muted} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, brand, SKU"
            style={{ ...inputStyle, width: "100%", padding: "8px 10px 8px 32px" }}
          />
        </div>

        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          style={{ ...inputStyle, padding: "8px 10px", fontSize: 12.5, textTransform: "capitalize" }}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "All categories" : c.replace(/-/g, " ")}
            </option>
          ))}
        </select>

        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {["all", "healthy", "low", "out", "attention"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                border: `1px solid ${statusFilter === s ? accent : colors.border}`,
                background: statusFilter === s ? `${accent}1F` : "transparent",
                color: statusFilter === s ? accent : colors.muted,
                borderRadius: 6,
                padding: "7px 12px",
                fontSize: 12,
                cursor: "pointer",
                textTransform: "capitalize",
                whiteSpace: "nowrap",
              }}
            >
              {s === "attention" ? "needs attention" : s}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: "auto", fontSize: 12, color: colors.muted }}>
          {loading ? "Loading…" : `${sorted.length} of ${products.length} products`}
        </div>
      </div>

      <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 8, overflow: "hidden", boxShadow: colors.shadowSm }}>
        <div className="table-scroll">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
              <th style={{ padding: "10px 14px", width: 44 }}></th>
              <SortHeader label="Product" sortKey="title" active={sortKey === "title"} dir={sortDir} onClick={handleSort} />
              <SortHeader label="Category" sortKey="category" active={sortKey === "category"} dir={sortDir} onClick={handleSort} />
              <SortHeader label="Price" sortKey="price" active={sortKey === "price"} dir={sortDir} onClick={handleSort} align="right" />
              <SortHeader label="Stock" sortKey="stock" active={sortKey === "stock"} dir={sortDir} onClick={handleSort} />
              <SortHeader label="Rating" sortKey="rating" active={sortKey === "rating"} dir={sortDir} onClick={handleSort} align="right" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} style={{ padding: 32, textAlign: "center", color: colors.muted, fontSize: 13 }}>
                  Loading products…
                </td>
              </tr>
            )}
            {!loading && pageItems.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 32, textAlign: "center", color: colors.muted, fontSize: 13 }}>
                  No products match these filters.
                </td>
              </tr>
            )}
            {!loading &&
              pageItems.map((p) => {
                const finalPrice = p.price * (1 - p.discountPercentage / 100);
                return (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/products/${p.id}`)}
                    style={{ borderBottom: `1px solid ${colors.border}`, cursor: "pointer", transition: "background-color 0.1s ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = colors.panel2)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "8px 14px" }}>
                      <img
                        src={p.thumbnail}
                        alt=""
                        style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 4, border: `1px solid ${colors.border}` }}
                      />
                    </td>
                    <td style={{ padding: "8px 14px", maxWidth: 260 }}>
                      <div style={{ fontSize: 13, color: colors.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {p.title}
                      </div>
                      <div style={{ fontSize: 11.5, color: colors.muted }}>
                        {p.brand || "—"} · {p.sku}
                      </div>
                    </td>
                    <td style={{ padding: "8px 14px", fontSize: 12.5, color: colors.muted, textTransform: "capitalize" }}>
                      {p.category.replace(/-/g, " ")}
                    </td>
                    <td style={{ padding: "8px 14px", fontFamily: MONO, fontSize: 13, textAlign: "right", color: colors.text }}>{fmtMoney(finalPrice, currency)}</td>
                    <td style={{ padding: "8px 14px" }}>
                      <StockBar stock={p.stock} max={maxStock} threshold={lowStockThreshold} />
                    </td>
                    <td style={{ padding: "8px 14px", fontFamily: MONO, fontSize: 13, textAlign: "right", color: colors.text }}>
                      {p.rating.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        </div>
      </div>

      {!loading && sorted.length > 0 && (
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

      {showAddModal && (
        <AddProductModal
          categories={categories.filter((c) => c !== "all")}
          onClose={() => setShowAddModal(false)}
          onSubmit={addProduct}
        />
      )}
    </div>
  );
}
