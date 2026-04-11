import {
    LineChart,
    Line,
    XAxis,
    Tooltip,
    ResponsiveContainer,
  } from "recharts";
  
  const LineChartCard = ({
    title,
    data,
    lines,
  }) => {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm w-full">
  
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-blue-600">{title}</h2>
        </div>
  
        {/* Legend */}
        <div className="flex gap-6 mb-4">
          {lines.map((line) => (
            <div key={line.key} className="flex items-center gap-2 text-sm">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: line.color }}
              ></span>
              {line.label}
            </div>
          ))}
        </div>
  
        {/* Chart */}
        <div className="w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="name" />
              <Tooltip />
  
              {lines.map((line) => (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  stroke={line.color}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };
  
  export default LineChartCard;