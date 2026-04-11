const HorizontalBarChartCard = ({ title, data }) => {
    const maxValue = Math.max(...data.map((item) => item.value));
  
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-200 w-full">
  
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-medium text-gray-700">{title}</h2>
          <div className="w-5 h-5 bg-orange-400 text-white text-xs flex items-center justify-center rounded-full">
            i
          </div>
        </div>
  
        {/* Chart Area */}
        <div className="relative mb-6">
  
          {/* Grid Lines */}
          <div className="absolute left-[140px] right-0 top-0 bottom-0 flex justify-between pointer-events-none">
            {[0, 1, 2, 3, 4].map((_, i) => (
              <div
                key={i}
                className="border-r border-dashed border-gray-200 h-full"
              />
            ))}
          </div>
  
          {/* Bars */}
          <div className="flex flex-col gap-6">
            {data.map((item) => {
              const widthPercent = (item.value / maxValue) * 100;
  
              return (
                <div key={item.label} className="flex items-center gap-4">
  
                  {/* Label */}
                  <div className="w-[140px] text-xs text-gray-500">
                    {item.label}
                  </div>
  
                  {/* Bar Container */}
                  <div className="flex-1 h-6 bg-gray-100 rounded-md overflow-hidden">
                    <div
                      className="h-full rounded-md transition-all duration-700"
                      style={{
                        width: `${widthPercent}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
  
                </div>
              );
            })}
          </div>
        </div>
  
        {/* Bottom Chips */}
        <div className="flex flex-wrap gap-2">
          {data.map((item) => (
            <div
              key={item.label}
              className="px-3 py-1 text-xs rounded-full bg-[#F6EFE7]"
            >
              <span style={{ color: item.color }}>
                {item.label}: {item.value}
              </span>
            </div>
          ))}
        </div>
  
      </div>
    );
  };
  
  export default HorizontalBarChartCard;