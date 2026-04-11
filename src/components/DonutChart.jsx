const DonutChart = ({
    value1,
    value2,
    label1,
    label2,
  }) => {
    const total = value1 + value2;
  
    const percent1 = Math.round((value1 / total) * 100);
    const percent2 = 100 - percent1;
  
    const angle1 = (percent1 / 100) * 360;
  
    return (
      <div className="bg-white p-6 rounded-xl shadow w-[350px]">
        
        {/* Title */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-medium text-gray-700">
            {label1} vs {label2}
          </h2>
          <div className="w-5 h-5 bg-orange-400 text-white text-xs flex items-center justify-center rounded-full">
            i
          </div>
        </div>
  
        {/* Donut */}
        <div className="flex justify-center mb-6">
          <div
            className="w-40 h-40 rounded-full relative"
            style={{
              background: `conic-gradient(
                #4F6BED 0deg ${angle1}deg,
                #EF4444 ${angle1}deg 360deg
              )`,
            }}
          >
            {/* Inner white circle */}
            <div className="absolute inset-6 bg-white rounded-full"></div>
          </div>
        </div>
  
        {/* Legend */}
        <div className="flex justify-between text-sm">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              {label1}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              {label2}
            </div>
          </div>
  
          <div className="text-right">
            <div className="text-blue-500 font-medium">
              {value1} ({percent1}%)
            </div>
            <div className="text-gray-600">
              {value2} ({percent2}%)
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default DonutChart;