import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from "recharts";

function SampleRadarCard({ sample }) {
    const attrs = sample.attributes || [];
    const data = attrs.map((a) => ({
        subject: a.name,
        groupScore: Number(a.score) || 0,
        targetScore: Number(a.target) || 5,
        mcdScore: Number(a.mcd_score ?? a.target) || 5,
    }));

    return (
        <div
            className="rounded-xl border border-[#E6E9EE] p-4 flex flex-col"
            style={{ backgroundColor: "#FFFDF3" }}
        >
            <div className="mb-2 text-base font-bold text-[#202124]">
                {sample.sample_code}
            </div>

            <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
                        <PolarGrid
                            gridType="polygon"
                            stroke="#ccc"
                            strokeWidth={1}
                        />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: "#1d4ed8", fontSize: 11, fontWeight: 500 }}
                            tickLine={{ stroke: "#9ca3af" }}
                        />
                        <PolarRadiusAxis
                            angle={90}
                            domain={[0, 9]}
                            ticks={[0, 9]}
                            tick={{ fill: "#6b7280", fontSize: 10 }}
                        />
                        {/* Target Score — green filled */}
                        <Radar
                            name="Target Score"
                            dataKey="targetScore"
                            stroke="#16a34a"
                            strokeWidth={2.5}
                            fill="#16a34a"
                            fillOpacity={0.15}
                            dot={false}
                            isAnimationActive={false}
                        />
                        {/* McDonald's Scores — blue solid */}
                        <Radar
                            name="McDonald's Scores"
                            dataKey="mcdScore"
                            stroke="#2563eb"
                            strokeWidth={2}
                            fill="none"
                            fillOpacity={0}
                            dot={false}
                            isAnimationActive={false}
                        />
                        {/* Group Score — red dashed */}
                        <Radar
                            name="Group Score"
                            dataKey="groupScore"
                            stroke="#dc2626"
                            strokeWidth={2}
                            strokeDasharray="6 3"
                            fill="none"
                            fillOpacity={0}
                            dot={false}
                            isAnimationActive={false}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Per-card legend */}
            <div className="mt-3 flex items-center justify-center gap-6 rounded-lg border border-[#E6E9EE] bg-white px-3 py-2 text-xs text-[#374151]">
                <LegendItem color="#dc2626" dashed label="Group Score" />
                <LegendItem color="#16a34a" label="Target Score" />
                <LegendItem color="#2563eb" label="McDonald's Scores" />
            </div>
        </div>
    );
}

function LegendItem({ color, dashed = false, label }) {
    return (
        <div className="flex items-center gap-1.5">
            <svg width="28" height="6" className="shrink-0 overflow-visible">
                <line
                    x1="0" y1="3" x2="28" y2="3"
                    stroke={color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={dashed ? "5 3" : undefined}
                />
            </svg>
            <span>{label}</span>
        </div>
    );
}

export default function RadarChartSection({ spiderCharts = [] }) {
    if (!spiderCharts.length) return null;

    return (
        <section className="mt-6">
            <div className="mb-4 flex items-center justify-between">
                <div className="text-[18px] font-bold text-[#202124]">Spiderplots data</div>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-400 text-xs font-bold text-white">
                    i
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {spiderCharts.map((sample, i) => (
                    <SampleRadarCard key={sample.sample_code || i} sample={sample} />
                ))}
            </div>
        </section>
    );
}
