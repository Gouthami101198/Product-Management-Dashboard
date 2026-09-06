import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { fetchAllProducts, createProduct } from "../services/productsApi";

const ProductsContext = createContext(null);
const MIN_REFRESH_MS = 550; // keep the spinner visible long enough to register as "it did something"
const SIMULATED_MESSAGE = "Simulated 503 Service Unavailable: Remote API cluster connection timed out.";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // blocking failure — swaps the main view for an error state
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(null); // refresh-specific failure, non-blocking
  const [lastUpdated, setLastUpdated] = useState(null);
  const [simulateError, setSimulateError] = useState(false);

  // DummyJSON's /products/add doesn't actually persist new products server-side,
  // so a plain refetch would silently wipe anything added locally in this session.
  // Track locally-added products here and re-merge them after every refresh.
  const localAdditionsRef = useRef([]);
  const simulateErrorRef = useRef(false);

  const load = useCallback(async ({ silent } = {}) => {
    const started = Date.now();
    if (silent) {
      setRefreshing(true);
      setRefreshError(null);
    } else {
      setLoading(true);
    }
    try {
      if (simulateErrorRef.current) {
        throw new Error(SIMULATED_MESSAGE);
      }
      const data = await fetchAllProducts();
      if (silent) {
        // enforce a minimum visible duration so the action always reads as "it worked"
        const elapsed = Date.now() - started;
        if (elapsed < MIN_REFRESH_MS) await wait(MIN_REFRESH_MS - elapsed);
      }
      setProducts([...localAdditionsRef.current, ...data]);
      setError(null);
      setLastUpdated(new Date());
    } catch (e) {
      const simulated = e.message === SIMULATED_MESSAGE;
      if (simulated) {
        // A simulated failure is meant to be dramatic and visible, so it always
        // takes over the main view — whether it happened on load or on refresh.
        setError(e.message);
      } else if (silent) {
        setRefreshError("Couldn't refresh — check your connection and try again.");
      } else {
        setError("Couldn't load product data.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => load({ silent: true }), [load]);

  const toggleSimulateError = useCallback(() => {
    const next = !simulateErrorRef.current;
    simulateErrorRef.current = next;
    setSimulateError(next);
    load({ silent: false });
  }, [load]);

  const resetDemoData = useCallback(() => {
    simulateErrorRef.current = false;
    setSimulateError(false);
    localAdditionsRef.current = [];
    load({ silent: false });
  }, [load]);

  const addProduct = useCallback(async (payload) => {
    const created = await createProduct(payload);
    const withId = {
      ...payload,
      ...created,
      id: created.id ?? Date.now(),
    };
    localAdditionsRef.current = [withId, ...localAdditionsRef.current];
    setProducts((prev) => [withId, ...prev]);
    return withId;
  }, []);

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        error,
        refreshing,
        refreshError,
        lastUpdated,
        simulateError,
        refresh,
        addProduct,
        toggleSimulateError,
        resetDemoData,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProductsContext() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProductsContext must be used within a ProductsProvider");
  return ctx;
}
