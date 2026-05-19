import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from "recharts";
import Tooltip from "./Tooltip";

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
            className="flex min-h-[460px] flex-col rounded-xl border border-[#DDE2EA] p-5"
            style={{ backgroundColor: "#FFFDF3" }}
        >
            <div className="mb-3 text-[20px] font-bold leading-none text-[#202124]">
                {sample.sample_code}
            </div>

            <div className="flex-1" style={{ width: "100%", minHeight: 330 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="52%" outerRadius="62%" data={data} margin={{ top: 24, right: 54, bottom: 16, left: 54 }}>
                        <PolarGrid
                            gridType="polygon"
                            stroke="#ccc"
                            strokeWidth={1}
                        />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: "#3157FF", fontSize: 13, fontWeight: 500 }}
                            tickLine={{ stroke: "#9ca3af" }}
                        />
                        <PolarRadiusAxis
                            angle={90}
                            domain={[0, 9]}
                            ticks={[0, 9]}
                            tick={{ fill: "#7A8392", fontSize: 11 }}
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
            <div className="mt-4 flex min-h-11 items-center justify-center gap-7 rounded-lg border border-[#DDE2EA] bg-white px-4 py-2 text-[14px] text-[#5F6877]">
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
            <svg width="34" height="8" className="shrink-0 overflow-visible">
                <line
                    x1="0" y1="4" x2="34" y2="4"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={dashed ? "6 4" : undefined}
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
                <div className="text-[20px] font-bold leading-none text-[#202124]">Spiderplots data</div>
                <Tooltip text={"A Spider Plot (Radar Chart) displays multiple performance parameters for one or more samples on a circular grid. Each axis represents a quality metric, and the connected points form a “web” shape that shows overall performance visually."}/>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {spiderCharts.map((sample, i) => (
                    <SampleRadarCard key={sample.sample_code || i} sample={sample} />
                ))}
            </div>
        </section>
    );
}
