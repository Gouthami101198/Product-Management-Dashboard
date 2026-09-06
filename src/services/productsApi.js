const BASE_URL = "https://dummyjson.com";

/**
 * Fetch the full product catalog (limit=0 returns everything DummyJSON has).
 * @returns {Promise<Array>} array of product objects
 */
export async function fetchAllProducts() {
  const res = await fetch(`${BASE_URL}/products?limit=0`);
  if (!res.ok) {
    throw new Error(`Failed to fetch products (status ${res.status})`);
  }
  const data = await res.json();
  return data.products || [];
}

/**
 * Fetch a single product by id.
 * @param {number|string} id
 * @returns {Promise<Object>} product object
 */
export async function fetchProductById(id) {
  const res = await fetch(`${BASE_URL}/products/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch product ${id} (status ${res.status})`);
  }
  return res.json();
}

/**
 * Fetch the list of available product categories.
 * @returns {Promise<Array>} array of category slugs
 */
export async function fetchCategories() {
  const res = await fetch(`${BASE_URL}/products/categories`);
  if (!res.ok) {
    throw new Error(`Failed to fetch categories (status ${res.status})`);
  }
  return res.json();
}

/**
 * Create a new product. DummyJSON's /products/add is a mock endpoint: it
 * validates and echoes back a created object (with a new id) but does not
 * actually persist it server-side, so the caller is responsible for adding
 * the result to local state.
 * @param {Object} payload
 * @returns {Promise<Object>} the "created" product object
 */
export async function createProduct(payload) {
  const res = await fetch(`${BASE_URL}/products/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to create product (status ${res.status})`);
  }
  return res.json();
}

/**
 * Search products by a text query.
 * @param {string} query
 * @returns {Promise<Array>} array of matching product objects
 */
export async function searchProducts(query) {
  const res = await fetch(`${BASE_URL}/products/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    throw new Error(`Failed to search products (status ${res.status})`);
  }
  const data = await res.json();
  return data.products || [];
}
