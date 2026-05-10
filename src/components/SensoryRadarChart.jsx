import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

/** @typedef {{ dataKey: string, name: string, values: number[], color: string, strokeWidth?: number, strokeDasharray?: string }} RadarSeries */

/** Internal key so Recharts 3 registers a radar item when `series` is empty (otherwise PolarGrid gets no radius ticks). */
const GRID_PLACEHOLDER_KEY = "__gridPlaceholder";

export const DEFAULT_SENSORY_AXES = [
  "Color",
  "Appearance Defects",
  "Separability",
  "Firmness",
  "Mouthfeel",
  "Texture Defects",
  "Cheddar Cheese",
  "Creaminess",
  "Saltiness",
  "Aroma/ Flavor Defects (Slices)",
];

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function buildData(axes, series, domain, includeGridPlaceholder) {
  const axisList = Array.isArray(axes) ? axes : [];
  const seriesList = Array.isArray(series) ? series : [];
  const d0 = domain?.[0] ?? 0;
  const d1 = domain?.[1] ?? 9;
  return axisList.map((subject, i) => {
    const row = { subject };
    for (const s of seriesList) {
      if (!s?.dataKey) continue;
      const raw = s.values?.[i];
      row[s.dataKey] =
        typeof raw === "number" && !Number.isNaN(raw) ? clamp(raw, d0, d1) : d0;
    }
    if (includeGridPlaceholder) {
      row[GRID_PLACEHOLDER_KEY] = d0;
    }
    return row;
  });
}

/**
 * Radar (spider) chart: one row per axis label; each series is a polygon from its `values` array.
 *
 * @param {object} props
 * @param {string} [props.title] — e.g. "Sample 1"
 * @param {string[]} props.axes — axis labels, clockwise from top
 * @param {RadarSeries[]} props.series — each `values.length` should match `axes.length`
 * @param {[number, number]} [props.domain] — scale, default [0, 9]
 * @param {number|string} [props.height] — chart area height
 * @param {string} [props.className]
 * @param {string} [props.backgroundColor] — panel behind chart + legend
 */
export default function SensoryRadarChart({
  title,
  axes: axesProp,
  series: seriesProp,
  domain: domainProp = [0, 9],
  height = 280,
  className = "",
  backgroundColor = "#FEFCE8",
}) {
  const axes =
    Array.isArray(axesProp) && axesProp.length > 0
      ? axesProp
      : DEFAULT_SENSORY_AXES;
  const series = Array.isArray(seriesProp) ? seriesProp : [];
  const domain =
    Array.isArray(domainProp) && domainProp.length >= 2
      ? [domainProp[0], domainProp[1]]
      : [0, 9];
  const visibleSeries = series.filter((s) => s?.dataKey);
  const needsGridPlaceholder = visibleSeries.length === 0;
  const data = buildData(axes, series, domain, needsGridPlaceholder);

  return (
    <div
      className={`rounded-xl p-1 ${className}`}
      style={{ backgroundColor }}
    >
      {title ? (
        <div className="text-start text-sm font-semibold text-[#1e40af] mb-2">
          {title}
        </div>
      ) : null}

      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            cx="50%"
            cy="52%"
            outerRadius="72%"
            data={data}
            margin={{ top: 8, right: 48, bottom: 8, left: 48 }}
          >
            <PolarGrid
              gridType="polygon"
              stroke="#64748b"
              strokeOpacity={0.65}
              strokeWidth={1}
            />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#1d4ed8", fontSize: 11 }}
              tickLine={{ stroke: "#64748b" }}
            />
            <PolarRadiusAxis
              type="number"
              angle={90}
              domain={domain}
              ticks={[domain[0], domain[1]]}
              tick={{ fill: "#64748b", fontSize: 10 }}
            />
            {visibleSeries.map((s) => (
              <Radar
                key={s.dataKey}
                name={s.name}
                dataKey={s.dataKey}
                stroke={s.color}
                strokeWidth={s.strokeWidth ?? 2}
                strokeDasharray={s.strokeDasharray}
                fill="none"
                fillOpacity={0}
                dot={false}
                isAnimationActive={false}
              />
            ))}
            {needsGridPlaceholder ? (
              <Radar
                dataKey={GRID_PLACEHOLDER_KEY}
                hide
                name=""
                stroke="none"
                strokeWidth={0}
                fill="none"
                fillOpacity={0}
                dot={false}
                isAnimationActive={false}
              />
            ) : null}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {visibleSeries.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border border-black bg-white px-4 py-2 text-sm text-[#1A1A2E]">
          {visibleSeries.map((s) => (
            <div key={s.dataKey} className="flex items-center gap-2">
              <svg width="28" height="6" className="shrink-0 overflow-visible">
                <line
                  x1="0"
                  y1="3"
                  x2="28"
                  y2="3"
                  stroke={s.color}
                  strokeWidth={s.strokeWidth ?? 3}
                  strokeLinecap="round"
                  strokeDasharray={s.strokeDasharray}
                />
              </svg>
              <span>{s.name}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
