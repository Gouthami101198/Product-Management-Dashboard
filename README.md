# Product Management Dashboard

A clean, professional, multi-page inventory-control dashboard built with React
and React Router, pulling live data from the DummyJSON Products API
(https://dummyjson.com/products).

## Pages

- **Overview** (`/`) — KPI strip, search, category/status filters, sortable
  product table, pagination. Click a row to open its detail page.
- **Product detail** (`/products/:id`) — full page per product: images,
  pricing, stock status, specs, and recent reviews.
- **Categories** (`/categories`) — a card per category with item count,
  inventory value, and average rating. Click through to see that category
  filtered on Overview.
- **Analytics** (`/analytics`) — inventory value by category, stock health
  breakdown, price-vs-rating scatter plot, and a top-rated products list.
- **Alerts** (`/alerts`) — every low or out-of-stock product, worst first.
- **Settings** (`/settings`) — rows per page, low-stock threshold, and accent
  color, shared across all pages for the session.

## Structure

\`\`\`
product-dashboard/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                 entry point (router + providers)
    ├── App.jsx                  layout: sidebar + routed pages
    ├── index.css                base reset
    ├── constants.js             color tokens, fonts, shared helpers
    ├── services/
    │   └── productsApi.js       all raw fetch() calls to the DummyJSON API
    ├── hooks/
    │   └── useProducts.js       public hook pages import to read product state
    ├── context/
    │   ├── ProductsContext.jsx  calls the service once, shares data everywhere
    │   └── SettingsContext.jsx  page size, low-stock threshold, accent color
    ├── components/
    │   ├── Sidebar.jsx          left nav across all pages
    │   ├── PageHeader.jsx       page title + subtitle
    │   ├── StatCard.jsx         KPI summary card
    │   ├── SortHeader.jsx       sortable table column header
    │   └── StockBar.jsx         color-coded stock level bar
    └── pages/
        ├── Overview.jsx
        ├── ProductDetail.jsx
        ├── Categories.jsx
        ├── Analytics.jsx
        ├── Alerts.jsx
        └── Settings.jsx
\`\`\`

## Running locally

\`\`\`bash
npm install
npm run dev
\`\`\`

Then open the printed local URL in your browser.

## Building for production

\`\`\`bash
npm run build
npm run preview
\`\`\`
