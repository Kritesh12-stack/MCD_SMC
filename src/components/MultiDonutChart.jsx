const MultiDonutChart = ({ title, data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
  
    // Build conic-gradient dynamically
    let currentAngle = 0;
  
    const gradient = data
      .map((item) => {
        const angle = (item.value / total) * 360;
        const segment = `${item.color} ${currentAngle}deg ${currentAngle + angle}deg`;
        currentAngle += angle;
        return segment;
      })
      .join(", ");
  
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm w-[350px]">
  
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
          <div className="w-5 h-5 bg-orange-400 text-white text-xs flex items-center justify-center rounded-full">
            i
          </div>
        </div>
  
        <div className="flex items-center justify-between">
  
          {/* Left Legend */}
          <div className="flex flex-col gap-4">
            {data.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></span>
                <div>
                  <div className="text-sm font-medium">{item.value}</div>
                  <div className="text-xs text-gray-500">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
  
          {/* Donut */}
          <div className="relative">
            <div
              className="w-40 h-40 rounded-full"
              style={{
                background: `conic-gradient(${gradient})`,
              }}
            >
              {/* Inner Circle */}
              <div className="absolute inset-6 bg-white rounded-full flex items-center justify-center">
                <span className="text-xl font-semibold text-gray-800">
                  {total}
                </span>
              </div>
            </div>
          </div>
  
        </div>
      </div>
    );
  };
  
  export default MultiDonutChart;