function getQualityLabel(distance) {
    if (distance === 0) return "Equal to Target";
    if (distance <= 1) return "Slight Difference";
    if (distance <= 2) return "Marginal Difference";
    if (distance <= 3) return "Significant Difference";
    return "Not McD Quality";
}

export default function AttributeScoreCard({
    name,
    description = "",
    score = null,
    targetScore = 5,
    onScoreChange,
    readOnly = false,
}) {
    const distance = score !== null ? Math.abs(score - targetScore) : null;
    const deviation = score !== null ? score - targetScore : null;
    const qualityLabel = distance !== null ? getQualityLabel(distance) : null;

    const deviationText =
        deviation === null
            ? null
            : deviation === 0
            ? "Equal to target"
            : `${Math.abs(deviation)} point${Math.abs(deviation) !== 1 ? "s" : ""} ${deviation < 0 ? "below" : "above"} target`;

    return (
        <div className="w-full rounded-lg border border-[#E6E9EE] border-l-[3px] border-l-[#DB2F28] bg-[#FBFCFD] p-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-sm font-semibold text-[#202124]">{name}</div>
                    {description ? (
                        <div className="mt-0.5 text-xs text-[#6F7785]">{description}</div>
                    ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                    <div className="flex items-baseline gap-1 text-sm text-[#6C757D]">
                        Score:&nbsp;
                        <span className="text-xl font-bold text-[#DB2F28]">{score ?? "-"}</span>
                        <span>/ {targetScore}</span>
                    </div>
                    {qualityLabel ? (
                        <span className="rounded-md border border-[#BBF7D0] bg-[#F0FDF4] px-2 py-0.5 text-xs font-medium text-[#16A34A]">
                            {qualityLabel}
                        </span>
                    ) : null}
                </div>
            </div>

            {/* Score buttons */}
            <div className="mt-4 flex gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
                    const isSelected = n === score;
                    const isTarget = n === targetScore;
                    return (
                        <button
                            key={n}
                            type="button"
                            disabled={readOnly}
                            onClick={() => onScoreChange?.(n)}
                            className={[
                                "flex-1 h-10 rounded-md text-sm font-medium transition-colors",
                                isSelected
                                    ? "bg-[#E8534A] text-white border border-[#E8534A]"
                                    : isTarget
                                    ? "border-2 border-[#2563EB] bg-white text-[#202124]"
                                    : "border border-[#CBD3DF] bg-white text-[#202124]",
                                !readOnly && !isSelected ? "hover:bg-[#F8FAFC]" : "",
                                readOnly ? "cursor-default" : "cursor-pointer",
                            ].join(" ")}
                        >
                            {n}
                        </button>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between text-xs text-[#6F7785]">
                <span>Target Score: {targetScore}</span>
                {deviationText ? (
                    <span className="flex items-center gap-1">
                        <span className="text-[#2563EB]">⊙ Target</span>
                        <span className="text-[#6F7785]">↳ {deviationText}</span>
                    </span>
                ) : null}
            </div>
        </div>
    );
}
