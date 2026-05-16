export default function ScoreMarker({ question, subtitle, score, onScoreChange }) {
    const colours = [
        ["#EA3323", "#FFF",     "NOT McD Quality"],
        ["#EA3323", "#FFF",     "Significant Difference"],
        ["#FFFF54", "#000000",  "Marginal"],
        ["#FFFF54", "#000000",  "Slight Difference"],
        ["#52976A", "#FFFFFF",  "Equal to TARGET"],
        ["#FFFF54", "#000000",  "Slight Difference"],
        ["#FFFF54", "#000000",  "Marginal"],
        ["#EA3323", "#FFF",     "Significant Difference"],
        ["#EA3323", "#FFF",     "NOT McD Quality"],
    ]
    const selectedColour = score ? colours[score - 1] : null;

    return (
        <div className="w-full border-l-3 border-[#FF5858] bg-[#FBFCFD] px-4 py-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-[#202124] text-[15px] font-medium">{question}</div>
                    {subtitle ? <div className="mt-1 text-[12px] text-[#6F7785]">{subtitle}</div> : null}
                </div>
                <div className="flex shrink-0 items-center text-[13px] text-[#6C757D] gap-2">
                    <div>Score : </div>
                    <div className="flex items-center"><span className="text-[#DB2F28] text-[18px] font-semibold leading-none">{score}</span> / 9</div>
                </div>
            </div>
            <div className="flex justify-end">
                <div
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md"
                    style={{
                        color: selectedColour ? selectedColour[1] : "#FFC72C",
                        backgroundColor: selectedColour ? selectedColour[0] : "#FFF3CD",
                    }}
                >
                    {selectedColour ? selectedColour[2] : "-"}
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-5 pt-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                    <button
                        type="button"
                        key={i}
                        onClick={() => onScoreChange(i)}
                        style={{ backgroundColor: i == score ? colours[i - 1][0] : "", color: i == score ? colours[i - 1][1] : "" }}
                        className="h-12 w-12 shrink-0 rounded-full border border-[#CBD3DF] text-[14px] font-medium cursor-pointer flex justify-center items-center transition-transform hover:scale-105"
                    >
                        {i}
                    </button>
                ))}
            </div>
        </div>
    )
}
