import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from "recharts";

function SampleCard({ sample }) {
    const attrs = sample.attributes || [];
    const data = attrs.map((a) => ({
        subject: a.name,
        targetScore: Number(a.target) || 0,
        groupScore: Number(a.score) || 0,
    }));

    const avgTarget = attrs.length
        ? (attrs.reduce((s, a) => s + (Number(a.target) || 0), 0) / attrs.length).toFixed(1)
        : "-";
    const avgGroup = attrs.length
        ? (attrs.reduce((s, a) => s + (Number(a.score) || 0), 0) / attrs.length).toFixed(1)
        : "-";

    return (
        <div
            className="flex min-w-[160px] flex-1 flex-col rounded-xl border border-[#E6E9EE] overflow-hidden"
            style={{ backgroundColor: "#FFF5F4" }}
        >
            <div className="px-3 pt-3 text-sm font-semibold text-[#202124]">{sample.sample_code}</div>

            <div style={{ width: "100%", height: 190 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="62%" data={data}>
                        <PolarGrid gridType="polygon" stroke="#d1d5db" strokeWidth={1} />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: "#1d4ed8", fontSize: 9, fontWeight: 500 }}
                            tickLine={false}
                        />
                        <PolarRadiusAxis
                            angle={90}
                            domain={[0, 9]}
                            ticks={[0, 9]}
                            tick={false}
                            axisLine={false}
                        />
                        <Radar
                            name="Target Score"
                            dataKey="targetScore"
                            stroke="#16a34a"
                            strokeWidth={2}
                            fill="none"
                            fillOpacity={0}
                            dot={false}
                            isAnimationActive={false}
                        />
                        <Radar
                            name="Group Score"
                            dataKey="groupScore"
                            stroke="#dc2626"
                            strokeWidth={1.5}
                            strokeDasharray="5 3"
                            fill="none"
                            fillOpacity={0}
                            dot={false}
                            isAnimationActive={false}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <div className="flex justify-between px-3 pb-3 text-xs">
                <div>
                    <div className="text-[#6F7785]">Avg Target</div>
                    <div className="text-base font-bold text-[#16a34a]">{avgTarget}</div>
                </div>
                <div className="text-right">
                    <div className="text-[#6F7785]">Avg Group</div>
                    <div className="text-base font-bold text-[#dc2626]">{avgGroup}</div>
                </div>
            </div>
        </div>
    );
}

function LegendLine({ color, dashed = false, label }) {
    return (
        <div className="flex items-center gap-1.5 text-xs text-[#374151]">
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

export default function QualityMetricsComparison({ spiderCharts = [] }) {
    if (!spiderCharts.length) return null;

    return (
        <section className="mt-6 rounded-xl border border-[#E6E9EE] bg-white p-4">
            <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-lg leading-none">★</span>
                    <span className="text-base font-bold text-[#202124]">Quality Metrics Comparison</span>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-400 text-xs font-bold text-white">
                    i
                </div>
            </div>
            <div className="mb-4 text-xs text-[#6F7785]">Target scores vs group scores across all samples</div>

            <div className="flex gap-3 overflow-x-auto pb-1">
                {spiderCharts.map((sample, i) => (
                    <SampleCard key={sample.sample_code || i} sample={sample} />
                ))}
            </div>

            <div className="mt-4 flex items-center justify-center gap-8 border-t border-[#E6E9EE] pt-3">
                <LegendLine color="#16a34a" label="Target Score" />
                <LegendLine color="#dc2626" dashed label="Group Score" />
            </div>
        </section>
    );
}
