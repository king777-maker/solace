import React, { useMemo, useState, useEffect } from "react";

/**
 * Analytics.jsx
 * - Mood trend lines (mocked with simple SVG sparkline)
 * - "Emotional Footprint": simple correlation explorer between mood & (screen time / locations / app usage)
 * - No external libs; fully client-side with mock data providers.
 */

const MOCK_MOODS = [
  { date: "2025-01-01", mood: 3, screentimeMin: 180, app: "Social", location: "Dorm" },
  { date: "2025-01-02", mood: 5, screentimeMin: 60, app: "Study", location: "Library" },
  { date: "2025-01-03", mood: 2, screentimeMin: 240, app: "Games", location: "Dorm" },
  { date: "2025-01-04", mood: 4, screentimeMin: 90, app: "Maps", location: "Gym" },
  { date: "2025-01-05", mood: 1, screentimeMin: 300, app: "Social", location: "Dorm" },
  { date: "2025-01-06", mood: 4, screentimeMin: 120, app: "Study", location: "Cafe" },
  { date: "2025-01-07", mood: 5, screentimeMin: 30, app: "Study", location: "Library" },
];

function toPoints(values, w = 240, h = 60, maxY = 5) {
  if (!values.length) return "";
  const step = w / (values.length - 1 || 1);
  return values
    .map((v, i) => {
      const x = i * step;
      const y = h - (v / maxY) * h;
      return `${x},${y}`;
    })
    .join(" ");
}

function correlation(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n === 0) return 0;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0,
    dx = 0,
    dy = 0;
  for (let i = 0; i < n; i++) {
    const ax = xs[i] - mx;
    const ay = ys[i] - my;
    num += ax * ay;
    dx += ax * ax;
    dy += ay * ay;
  }
  const den = Math.sqrt(dx * dy) || 1;
  return +(num / den).toFixed(3);
}

const Chip = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      padding: "6px 10px",
      margin: 4,
      borderRadius: 999,
      border: "1px solid #ccc",
      background: active ? "#eef" : "#fff",
      cursor: "pointer",
      fontSize: 12,
    }}
  >
    {children}
  </button>
);

export default function Analytics() {
  const [data, setData] = useState(MOCK_MOODS);
  const [filterApp, setFilterApp] = useState("All");
  const [filterLoc, setFilterLoc] = useState("All");

  useEffect(() => {
    // In a real app, fetch analytics from secure storage here.
    // setData(await api.getAnalytics());
  }, []);

  const filtered = useMemo(() => {
    return data.filter(
      d =>
        (filterApp === "All" || d.app === filterApp) &&
        (filterLoc === "All" || d.location === filterLoc)
    );
  }, [data, filterApp, filterLoc]);

  const moods = filtered.map(d => d.mood);
  const screens = filtered.map(d => d.screentimeMin);

  const r = useMemo(() => correlation(moods, screens), [moods, screens]);

  const unique = useMemo(() => ({
    apps: Array.from(new Set(data.map(d => d.app))),
    locs: Array.from(new Set(data.map(d => d.location))),
  }), [data]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Analytics & Emotional Footprint</h2>

      <section style={{ margin: "12px 0" }}>
        <h3>Trend (Mood)</h3>
        <svg width="260" height="70" style={{ border: "1px solid #eee" }}>
          <polyline
            fill="none"
            stroke="#333"
            strokeWidth="2"
            points={toPoints(moods)}
          />
        </svg>
        <div style={{ fontSize: 12, color: "#666" }}>
          Days: {filtered.length} • Avg mood:{" "}
          {moods.length ? (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(2) : "–"}
        </div>
      </section>

      <section>
        <h3>Emotional Footprint</h3>
        <p style={{ maxWidth: 560 }}>
          Explore correlations between your mood and digital/physical context (screen time,
          most-used apps, and locations). This is local and private to you.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, marginRight: 6 }}>App:</span>
          <Chip active={filterApp === "All"} onClick={() => setFilterApp("All")}>All</Chip>
          {unique.apps.map(app => (
            <Chip key={app} active={filterApp === app} onClick={() => setFilterApp(app)}>{app}</Chip>
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", marginTop: 6 }}>
          <span style={{ fontSize: 12, marginRight: 6 }}>Location:</span>
          <Chip active={filterLoc === "All"} onClick={() => setFilterLoc("All")}>All</Chip>
          {unique.locs.map(loc => (
            <Chip key={loc} active={filterLoc === loc} onClick={() => setFilterLoc(loc)}>{loc}</Chip>
          ))}
        </div>

        <div style={{ marginTop: 12, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
          <div style={{ fontWeight: 600 }}>Correlation: Mood ↔ Screen Time</div>
          <div style={{ fontSize: 48, lineHeight: 1.2 }}>{r}</div>
          <div style={{ fontSize: 12, color: "#666" }}>
            -1 strong negative, 0 none, +1 strong positive. Above 0.3 can hint that
            more screen time relates to higher mood (for you); below -0.3 the opposite.
          </div>
        </div>
      </section>

      <section style={{ marginTop: 16 }}>
        <h3>Top Contexts on High-Mood Days</h3>
        {(() => {
          const highs = filtered.filter(d => d.mood >= 4);
          const commonApp = highs.length
            ? highs.reduce((map, d) => (map[d.app] = (map[d.app] || 0) + 1, map), {})
            : {};
          const commonLoc = highs.length
            ? highs.reduce((map, d) => (map[d.location] = (map[d.location] || 0) + 1, map), {})
            : {};
          const bestApp = Object.entries(commonApp).sort((a,b)=>b[1]-a[1])[0]?.[0] || "—";
          const bestLoc = Object.entries(commonLoc).sort((a,b)=>b[1]-a[1])[0]?.[0] || "—";
          return (
            <ul>
              <li>Often-used app: <b>{bestApp}</b></li>
              <li>Often location: <b>{bestLoc}</b></li>
            </ul>
          );
        })()}
      </section>
    </div>
  );
}
