import { useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, ScatterChart, Scatter,
} from "recharts";
import { MONO, stockStatus, fmtMoney } from "../constants";
import { useProducts } from "../hooks/useProducts";
import { useSettings } from "../context/SettingsContext";
import PageHeader from "../components/PageHeader";

function ChartPanel({ title, children, height = 260, colors }) {
  return (
    <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "16px 16px 8px", boxShadow: colors.shadowSm }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 12 }}>{title}</div>
      <div style={{ width: "100%", height }}>{children}</div>
    </div>
  );
}

export default function Analytics() {
  const { products, loading } = useProducts();
  const { lowStockThreshold, colors, chartColors, accent: accentLine, currency } = useSettings();

  const tooltipStyle = {
    background: colors.panel2,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    fontSize: 12,
    color: colors.text,
  };

  const categoryValue = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      const finalPrice = p.price * (1 - p.discountPercentage / 100);
      map.set(p.category, (map.get(p.category) || 0) + finalPrice * p.stock);
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name: name.replace(/-/g, " "), value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [products]);

  const stockStatusBreakdown = useMemo(() => {
    let healthy = 0, low = 0, out = 0;
    for (const p of products) {
      const label = stockStatus(colors, p.stock, lowStockThreshold).label;
      if (label === "healthy") healthy++;
      else if (label === "low") low++;
      else out++;
    }
    return [
      { name: "Healthy", value: healthy, color: colors.green },
      { name: "Low", value: low, color: colors.amber },
      { name: "Out", value: out, color: colors.red },
    ];
  }, [products, lowStockThreshold, colors]);

  const ratingByPriceRange = useMemo(() => {
    const sym = currency === "INR" ? "₹" : "$";
    const buckets = [
      { label: `${sym}0–25`, min: 0, max: 25 },
      { label: `${sym}25–50`, min: 25, max: 50 },
      { label: `${sym}50–100`, min: 50, max: 100 },
      { label: `${sym}100–250`, min: 100, max: 250 },
      { label: `${sym}250–500`, min: 250, max: 500 },
      { label: `${sym}500+`, min: 500, max: Infinity },
    ].map((b) => ({ ...b, sum: 0, count: 0 }));

    for (const p of products) {
      const bucket = buckets.find((b) => p.price >= b.min && p.price < b.max);
      if (bucket) {
        bucket.sum += p.rating;
        bucket.count += 1;
      }
    }

    return buckets
      .filter((b) => b.count > 0)
      .map((b) => ({ name: b.label, avgRating: Number((b.sum / b.count).toFixed(2)), count: b.count }));
  }, [products, currency]);

  const topRated = useMemo(
    () => [...products].sort((a, b) => b.rating - a.rating).slice(0, 6),
    [products]
  );

  const topBrands = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      if (!p.brand) continue;
      map.set(p.brand, (map.get(p.brand) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [products]);

  const priceRatingScatter = useMemo(
    () => products.map((p) => ({ price: Math.round(p.price), rating: p.rating, name: p.title })),
    [products]
  );

  if (loading) {
    return <div style={{ padding: 32, textAlign: "center", color: colors.muted, fontSize: 13 }}>Crunching numbers…</div>;
  }

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Trends across the full product catalog" />

      <div className="chart-grid-wide" style={{ marginBottom: 12 }}>
        <ChartPanel title="Inventory value by category (top 8)" colors={colors}>
          <ResponsiveContainer>
            <BarChart data={categoryValue} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: colors.muted, fontSize: 11 }} axisLine={{ stroke: colors.border }} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fill: colors.muted, fontSize: 11 }} axisLine={{ stroke: colors.border }} tickLine={false} tickFormatter={(v) => `${currency === "INR" ? "₹" : "$"}${Math.round(v / 1000)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmtMoney(v, currency)} cursor={{ fill: colors.overlay }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {categoryValue.map((entry, i) => (
                  <Cell key={entry.name} fill={chartColors[i % chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Stock health" colors={colors}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={stockStatusBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {stockStatusBreakdown.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12, color: colors.muted }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      <div className="chart-grid-even">
        <ChartPanel title="Avg rating by price range" colors={colors}>
          <ResponsiveContainer>
            <LineChart data={ratingByPriceRange} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: colors.muted, fontSize: 11 }} axisLine={{ stroke: colors.border }} tickLine={false} />
              <YAxis domain={[0, 5]} tick={{ fill: colors.muted, fontSize: 11 }} axisLine={{ stroke: colors.border }} tickLine={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{ stroke: colors.border }}
                formatter={(v, key) => (key === "avgRating" ? [v, "Avg rating"] : [v, key])}
                labelFormatter={(label, payload) =>
                  payload && payload[0] ? `${label} · ${payload[0].payload.count} products` : label
                }
              />
              <Line
                type="monotone"
                dataKey="avgRating"
                stroke={accentLine}
                strokeWidth={2.5}
                dot={{ r: 4, fill: accentLine, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Top rated products" height="auto" colors={colors}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 8 }}>
            {topRated.map((p, i) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11, color: colors.muted, width: 14 }}>{i + 1}</span>
                <img src={p.thumbnail} alt="" style={{ width: 30, height: 30, objectFit: "cover", borderRadius: 4, border: `1px solid ${colors.border}` }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: colors.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: colors.muted, textTransform: "capitalize" }}>{p.category.replace(/-/g, " ")}</div>
                </div>
                <span style={{ fontFamily: MONO, fontSize: 12.5, color: colors.text }}>{p.rating.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </ChartPanel>
      </div>

      <div className="chart-grid-even" style={{ marginTop: 12 }}>
        <ChartPanel title="Top brands by product count" colors={colors}>
          <ResponsiveContainer>
            <BarChart data={topBrands} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: colors.muted, fontSize: 11 }} axisLine={{ stroke: colors.border }} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: colors.muted, fontSize: 11.5 }} axisLine={{ stroke: colors.border }} tickLine={false} width={110} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: colors.overlay }} formatter={(v) => [v, "Products"]} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {topBrands.map((entry, i) => (
                  <Cell key={entry.name} fill={chartColors[i % chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Price vs. rating" colors={colors}>
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis
                type="number"
                dataKey="price"
                name="Price"
                unit={currency === "INR" ? "₹" : "$"}
                tick={{ fill: colors.muted, fontSize: 11 }}
                axisLine={{ stroke: colors.border }}
                tickLine={false}
              />
              <YAxis
                type="number"
                dataKey="rating"
                name="Rating"
                domain={[0, 5]}
                tick={{ fill: colors.muted, fontSize: 11 }}
                axisLine={{ stroke: colors.border }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{ stroke: colors.border, strokeDasharray: "3 3" }}
                formatter={(v, key) => (key === "price" ? [fmtMoney(v, currency), "Price"] : [v, "Rating"])}
                labelFormatter={() => ""}
              />
              <Scatter data={priceRatingScatter} fill={accentLine} fillOpacity={0.55} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>
    </div>
  );
}
