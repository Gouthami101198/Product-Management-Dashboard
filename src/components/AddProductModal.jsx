import { useState } from "react";
import { X } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

const FALLBACK_THUMB = "https://cdn.dummyjson.com/products/images/groceries/placeholder.jpg";

export default function AddProductModal({ categories, onClose, onSubmit }) {
  const { colors, accent } = useSettings();
  const [form, setForm] = useState({
    title: "",
    brand: "",
    category: categories[0] || "",
    price: "",
    stock: "",
    thumbnail: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setErr("Product title is required.");
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      await onSubmit({
        title: form.title.trim(),
        brand: form.brand.trim() || undefined,
        category: form.category || "uncategorized",
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 0,
        discountPercentage: 0,
        rating: 0,
        sku: "NEW-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
        thumbnail: form.thumbnail.trim() || FALLBACK_THUMB,
      });
      onClose();
    } catch (e2) {
      setErr("Couldn't create the product. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const fieldStyle = {
    width: "100%",
    background: colors.panel2,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    padding: "8px 10px",
    fontSize: 13,
    color: colors.text,
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = { fontSize: 12, color: colors.muted, marginBottom: 5, display: "block" };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: colors.panel,
          border: `1px solid ${colors.border}`,
          borderRadius: 10,
          padding: "20px 22px",
          width: "100%",
          maxWidth: 420,
          boxShadow: colors.shadowMd,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 15.5, fontWeight: 600, color: colors.text }}>Add product</div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: "transparent", border: "none", color: colors.muted, cursor: "pointer", padding: 4, display: "flex" }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={labelStyle}>Title</label>
            <input style={fieldStyle} value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Wireless mouse" autoFocus />
          </div>

          <div className="form-grid-2">
            <div>
              <label style={labelStyle}>Brand</label>
              <input style={fieldStyle} value={form.brand} onChange={(e) => update("brand", e.target.value)} placeholder="Optional" />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select style={fieldStyle} value={form.category} onChange={(e) => update("category", e.target.value)}>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c.replace(/-/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div>
              <label style={labelStyle}>Price ($)</label>
              <input style={fieldStyle} type="number" min="0" step="0.01" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <label style={labelStyle}>Stock</label>
              <input style={fieldStyle} type="number" min="0" value={form.stock} onChange={(e) => update("stock", e.target.value)} placeholder="0" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Thumbnail URL</label>
            <input style={fieldStyle} value={form.thumbnail} onChange={(e) => update("thumbnail", e.target.value)} placeholder="Optional" />
          </div>

          {err && <div style={{ fontSize: 12, color: colors.red }}>{err}</div>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "transparent",
                border: `1px solid ${colors.border}`,
                borderRadius: 6,
                padding: "8px 14px",
                fontSize: 13,
                color: colors.text,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: accent,
                border: "none",
                borderRadius: 6,
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 500,
                color: "#0B0D12",
                cursor: submitting ? "default" : "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Adding…" : "Add product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
