import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { MONO, stockStatus, fmtMoney } from "../constants";
import { useProducts } from "../hooks/useProducts";
import { useSettings } from "../context/SettingsContext";

function Row({ label, value, colors }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "9px 0", borderBottom: `1px solid ${colors.border}` }}>
      <span style={{ color: colors.muted }}>{label}</span>
      <span style={{ color: colors.text, textAlign: "right", maxWidth: 320 }}>{value ?? "—"}</span>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { lowStockThreshold, colors, currency } = useSettings();

  const backBtnStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "transparent",
    border: "none",
    color: colors.muted,
    fontSize: 13,
    cursor: "pointer",
    padding: "6px 0",
  };

  if (loading) {
    return <div style={{ padding: 32, textAlign: "center", color: colors.muted, fontSize: 13 }}>Loading product…</div>;
  }

  const product = products.find((p) => String(p.id) === id);

  if (!product) {
    return (
      <div>
        <button onClick={() => navigate(-1)} style={backBtnStyle}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ marginTop: 20, color: colors.muted, fontSize: 13 }}>Product not found.</div>
      </div>
    );
  }

  const status = stockStatus(colors, product.stock, lowStockThreshold);
  const finalPrice = product.price * (1 - product.discountPercentage / 100);

  const metricBoxStyle = { background: colors.panel2, borderRadius: 6, padding: "10px 12px" };

  return (
    <div>
      <button onClick={() => navigate(-1)} style={backBtnStyle}>
        <ArrowLeft size={14} /> Back
      </button>

      <div className="product-detail-grid" style={{ marginTop: 16, alignItems: "flex-start" }}>
        <div>
          <img
            src={product.thumbnail}
            alt={product.title}
            style={{ width: "100%", height: 260, objectFit: "cover", borderRadius: 8, border: `1px solid ${colors.border}` }}
          />
          {product.images && product.images.length > 1 && (
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              {product.images.slice(0, 5).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 5, border: `1px solid ${colors.border}` }}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <div style={{ fontSize: 11, color: colors.muted, fontFamily: MONO, marginBottom: 6 }}>{product.sku}</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: colors.text, marginBottom: 4 }}>{product.title}</div>
          <div style={{ fontSize: 13.5, color: colors.muted, marginBottom: 18, textTransform: "capitalize" }}>
            {product.brand || "—"} · {product.category.replace(/-/g, " ")}
          </div>

          <div className="stat-grid" style={{ marginBottom: 20 }}>
            <div style={metricBoxStyle}>
              <div style={{ fontSize: 11, color: colors.muted, marginBottom: 3 }}>Price</div>
              <div style={{ fontFamily: MONO, fontSize: 16, color: colors.text }}>{fmtMoney(finalPrice, currency)}</div>
              {product.discountPercentage > 0 && (
                <div style={{ fontSize: 11, color: colors.amber, marginTop: 2 }}>{product.discountPercentage.toFixed(1)}% off</div>
              )}
            </div>
            <div style={metricBoxStyle}>
              <div style={{ fontSize: 11, color: colors.muted, marginBottom: 3 }}>Stock status</div>
              <div style={{ fontFamily: MONO, fontSize: 16, color: status.color, textTransform: "capitalize" }}>{status.label}</div>
              <div style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{product.stock} units</div>
            </div>
            <div style={metricBoxStyle}>
              <div style={{ fontSize: 11, color: colors.muted, marginBottom: 3 }}>Rating</div>
              <div style={{ fontFamily: MONO, fontSize: 16, color: colors.text }}>{product.rating?.toFixed(2)}</div>
              <div style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{product.reviews?.length || 0} reviews</div>
            </div>
            <div style={metricBoxStyle}>
              <div style={{ fontSize: 11, color: colors.muted, marginBottom: 3 }}>Inventory value</div>
              <div style={{ fontFamily: MONO, fontSize: 16, color: colors.text }}>{fmtMoney(finalPrice * product.stock, currency)}</div>
            </div>
          </div>

          <div style={{ fontSize: 13.5, color: colors.muted, lineHeight: 1.7, marginBottom: 20 }}>{product.description}</div>

          <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "4px 16px", boxShadow: colors.shadowSm }}>
            <Row label="Warranty" value={product.warrantyInformation} colors={colors} />
            <Row label="Shipping" value={product.shippingInformation} colors={colors} />
            <Row label="Return policy" value={product.returnPolicy} colors={colors} />
            <Row label="Minimum order quantity" value={product.minimumOrderQuantity} colors={colors} />
            <Row label="Availability" value={product.availabilityStatus} colors={colors} />
            <Row label="Weight" value={product.weight ? `${product.weight} oz` : undefined} colors={colors} />
            <Row
              label="Dimensions"
              value={
                product.dimensions
                  ? `${product.dimensions.width} × ${product.dimensions.height} × ${product.dimensions.depth}`
                  : undefined
              }
              colors={colors}
            />
          </div>

          {product.reviews && product.reviews.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: colors.text }}>Recent reviews</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {product.reviews.slice(0, 3).map((r, i) => (
                  <div key={i} style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 6, padding: "10px 12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12.5, color: colors.text, fontWeight: 500 }}>{r.reviewerName}</span>
                      <span style={{ fontFamily: MONO, fontSize: 12, color: colors.muted }}>{r.rating.toFixed(1)}</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: colors.muted, lineHeight: 1.5 }}>{r.comment}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
