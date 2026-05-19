import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import Tooltip from "./Tooltip";

export default function HorizontalBarChartCard({ title = "Samples Score Graph", data = [] }) {
    const chartData = data.map((item) => ({ name: item.label, value: item.value }));

    return (
        <div className="rounded-[16px] border border-[#DDE2EA] bg-white p-6 shadow-sm m-4">
            <div className="mb-5 flex items-center justify-between">
                <span className="text-[20px] font-semibold leading-none text-[#202124]">{title}</span>
                <Tooltip 
                    text={"A Samples Comparison graph visually compares different product samples based on selected evaluation criteria or scores. It helps identify which sample performed better across defined quality parameters."}
                />
            </div>
            <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 4, right: 12, left: -4, bottom: 8 }}>
                        <CartesianGrid vertical={false} stroke="#DDE2EA" strokeWidth={1.5} />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: "#7A8392", fontSize: 15 }}
                            axisLine={{ stroke: "#DDE2EA", strokeWidth: 1.5 }}
                            tickLine={false}
                            dy={6}
                        />
                        <YAxis
                            domain={[0, 10]}
                            ticks={[0, 5, 10]}
                            tick={{ fill: "#7A8392", fontSize: 15 }}
                            axisLine={false}
                            tickLine={false}
                            width={34}
                        />
                        <Bar
                            dataKey="value"
                            fill="#D95B51"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={66}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
