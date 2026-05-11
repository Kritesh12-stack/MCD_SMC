export default function ScoreCard({ sectionTitle, items = [] }) {
    return (
        <div className="flex flex-col">
            {sectionTitle && (
                <div className="p-2 text-sm font-bold">
                    {sectionTitle}
                </div>
            )}
            <div className="flex flex-col gap-4">
                {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 text-[#494949] rounded-md bg-[#FFF5F5] border-t border-[#0000000D]">
                        <div className="w-[15%] text-xs">{item.question}</div>
                        <div className="w-[35%] flex flex-col gap-2 text-[#000000]">
                            <div className="flex justify-between items-center italic text-xs">
                                <div>Light</div>
                                <div>Target</div>
                                <div>Dark</div>
                            </div>
                            <div className="flex justify-between">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                    <div key={n} className="border border-[#000000] text-sm font-normal w-[30px] h-[30px] rounded-md flex justify-center items-center">{n}</div>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 flex justify-between min-h-[52px] items-end">
                            <div className="flex justify-center items-center text-xs bg-white h-[30px] w-[100px] rounded-md border border-[#E8E8E8]">{item.score ?? ""}</div>
                            <div className="flex justify-center items-center text-xs bg-white h-[30px] w-[100px] rounded-md border border-[#E8E8E8]"></div>
                            <div className="flex justify-center items-center text-xs bg-white h-[30px] w-[100px] rounded-md border border-[#E8E8E8]"></div>
                            <div className="flex justify-center items-center text-xs bg-white h-[30px] w-[100px] rounded-md border border-[#E8E8E8]"></div>
                        </div>
                    </div>
                ))}

                {/* Overall section score row */}
                {sectionTitle && (
                    <div className="flex items-center gap-4 p-4 border-t border-[#E8E8E8]">
                        <div className="flex-1 flex flex-col items-end pr-4">
                            <div className="text-sm font-bold text-[#494949]">Overall {sectionTitle} Score</div>
                            <div className="text-xs text-[#6C757D]">(Value furthest away from target)</div>
                        </div>
                        <div className="flex justify-between min-w-[452px]">
                            {[0, 1, 2, 3].map((_, i) => (
                                <div key={i} className="flex justify-center items-center text-xs font-semibold bg-white h-[30px] w-[100px] rounded-md border border-[#E8E8E8]"></div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}