const DonutChart = ({
    value1,
    value2,
    value3,
    label1,
    label2,
    label3,
}) => {
    const total = (value1 || 0) + (value2 || 0) + (value3 || 0);
    const pct1 = total ? (value1 / total) * 100 : 0;
    const pct2 = total ? (value2 / total) * 100 : 0;
    const pct3 = total ? (value3 / total) * 100 : 0;

    const angle1 = (pct1 / 100) * 360;
    const angle2 = angle1 + (pct2 / 100) * 360;

    const gradient = label3
        ? `conic-gradient(#4F6BED 0deg ${angle1}deg, #EF4444 ${angle1}deg ${angle2}deg, #F59E0B ${angle2}deg 360deg)`
        : `conic-gradient(#4F6BED 0deg ${angle1}deg, #EF4444 ${angle1}deg 360deg)`;

    return (
        <div className="bg-white p-6 rounded-xl shadow w-[350px]">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-medium text-gray-700">
                    {label3 ? `${label1} / ${label2} / ${label3}` : `${label1} vs ${label2}`}
                </h2>
                <div className="relative group inline-block">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-400 text-xs font-bold text-white cursor-pointer">
                        i
                    </div>

                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                hidden group-hover:block 
                w-72 text-center
                whitespace-normal break-words
                rounded bg-white px-3 py-2 text-xs text-black shadow-lg leading-5">
  Supplier Submitted Batch refers to the total number of product batches that a supplier has submitted for inspection, approval, or quality evaluation within a selected time period.
</div>
                </div>
            </div>

            <div className="flex justify-center mb-6">
                <div
                    className="w-40 h-40 rounded-full relative"
                    style={{ background: gradient }}
                >
                    <div className="absolute inset-6 bg-white rounded-full"></div>
                </div>
            </div>

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
                    {label3 && (
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-amber-400 rounded-full"></span>
                            {label3}
                        </div>
                    )}
                </div>

                <div className="text-right flex flex-col gap-2">
                    <div className="text-blue-500 font-medium">
                        {value1} ({Math.round(pct1)}%)
                    </div>
                    <div className="text-red-500 font-medium">
                        {value2} ({Math.round(pct2)}%)
                    </div>
                    {label3 && (
                        <div className="text-amber-500 font-medium">
                            {value3} ({Math.round(pct3)}%)
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DonutChart;
