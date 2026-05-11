import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

export default function HorizontalBarChartCard({ title = "Samples Score Graph", data = [] }) {
    const chartData = data.map((item) => ({ name: item.label, value: item.value }));

    return (
        <div className="rounded-xl border border-[#E6E9EE] bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#202124]">{title}</span>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-400 text-xs font-bold text-white">
                    i
                </div>
            </div>
            <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                        <CartesianGrid vertical={false} stroke="#E6E9EE" />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: "#6F7785", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            domain={[0, 10]}
                            ticks={[0, 5, 10]}
                            tick={{ fill: "#6F7785", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Bar
                            dataKey="value"
                            fill="#E8534A"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={52}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
