import { useEffect, useRef, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Menu, Boxes, AlertTriangle, CheckCircle2, X } from "lucide-react";
import Sidebar from "./components/Sidebar";
import { SANS, MONO } from "./constants";
import { useSettings } from "./context/SettingsContext";
import { useProducts } from "./hooks/useProducts";
import Overview from "./pages/Overview";
import ProductDetail from "./pages/ProductDetail";
import Categories from "./pages/Categories";
import Brands from "./pages/Brands";
import Analytics from "./pages/Analytics";
import Reviews from "./pages/Reviews";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";

export default function App() {
  const { colors, accent } = useSettings();
  const { simulateError } = useProducts();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const location = useLocation();
  const isFirstRender = useRef(true);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Surface a toast whenever the API error simulation is toggled.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setToast(
      simulateError
        ? { type: "error", title: "API Failure Simulated", message: "Next API calls will simulate a server 503 error." }
        : { type: "success", title: "Simulation turned off", message: "API calls will use live data again." }
    );
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [simulateError]);

  return (
    <div
      style={{
        background: colors.bg,
        minHeight: "100vh",
        fontFamily: SANS,
        color: colors.text,
        display: "flex",
        transition: "background-color 0.15s ease, color 0.15s ease",
      }}
    >
      <div className={`sidebar-backdrop${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div
          className="mobile-topbar"
          style={{
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            borderBottom: `1px solid ${colors.border}`,
            background: colors.panel,
            position: "sticky",
            top: 0,
            zIndex: 40,
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 6,
              background: colors.panel2,
              border: `1px solid ${colors.border}`,
              color: colors.text,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <Menu size={16} />
          </button>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Boxes size={12} color="#0B0D12" strokeWidth={2.4} />
          </div>
          <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: colors.text }}>Stockroom</span>
        </div>

        <main className="app-main" style={{ flex: 1, padding: "24px 28px", minWidth: 0 }}>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/brands" element={<Brands />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            maxWidth: 320,
            background: colors.panel,
            border: `1px solid ${toast.type === "error" ? colors.red : colors.green}55`,
            borderRadius: 8,
            padding: "12px 14px",
            boxShadow: colors.shadowMd,
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            zIndex: 200,
          }}
        >
          {toast.type === "error" ? (
            <AlertTriangle size={16} color={colors.red} style={{ flexShrink: 0, marginTop: 1 }} />
          ) : (
            <CheckCircle2 size={16} color={colors.green} style={{ flexShrink: 0, marginTop: 1 }} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 2 }}>{toast.title}</div>
            <div style={{ fontSize: 12, color: colors.muted }}>{toast.message}</div>
          </div>
          <button
            onClick={() => setToast(null)}
            aria-label="Dismiss"
            style={{ background: "transparent", border: "none", color: colors.muted, cursor: "pointer", padding: 2, flexShrink: 0 }}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
