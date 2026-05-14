const TARGET = 5;

function scoreToPercent(score) {
    const map = { 1: 0, 2: 25, 3: 60, 4: 85, 5: 100, 6: 85, 7: 60, 8: 25, 9: 0 };
    return map[score] ?? null;
}

function riskFromScore(score) {
    if ([1, 2, 8, 9].includes(score)) return { label: "High", color: "#EF4444" };
    if ([3, 7].includes(score)) return { label: "Medium", color: "#F59E0B" };
    if ([4, 5, 6].includes(score)) return { label: "Low", color: "#16A34A" };
    return null;
}

function overallSectionScore(scores) {
    const valid = scores.filter((s) => s != null && s !== "");
    if (!valid.length) return null;
    return valid.reduce((worst, s) =>
        Math.abs(s - TARGET) > Math.abs(worst - TARGET) ? s : worst
    );
}

export default function ScoreCard({ sectionTitle, items = [], allSamples = [] }) {
    // allSamples: [{ sampleId, items: [{question, score}] }]
    // Falls back to items array for single-sample display
    const samples = allSamples.length > 0 ? allSamples : [{ sampleId: null, items }];
    const maxCols = 4;

    const sectionOveralls = samples.map((s) => {
        const scores = s.items.map((it) => Number(it.score)).filter((sc) => !isNaN(sc) && sc > 0);
        return overallSectionScore(scores);
    });

    return (
        <div className="flex flex-col">
            {sectionTitle && (
                <div className="px-2 py-3 text-[13px] font-semibold text-[#202124]">
                    {sectionTitle}
                </div>
            )}
            <div className="flex flex-col gap-4">
                {/* Sample ID header row when multiple samples */}
                {samples.length > 1 && (
                    <div className="flex items-center gap-4 px-4">
                        <div className="w-[15%]" />
                        <div className="w-[35%]" />
                        <div className="flex-1 flex justify-between">
                            {samples.slice(0, maxCols).map((s, i) => (
                                <div key={i} className="flex justify-center items-center text-[11px] font-semibold text-[#6C757D] w-[100px]">
                                    {s.sampleId || `Sample ${i + 1}`}
                                </div>
                            ))}
                            {Array.from({ length: Math.max(0, maxCols - samples.length) }).map((_, i) => (
                                <div key={`ph-hdr-${i}`} className="w-[100px]" />
                            ))}
                        </div>
                    </div>
                )}

                {/* Attribute rows */}
                {items.map((item, rowIdx) => (
                    <div key={rowIdx} className="flex items-center gap-4 rounded-lg border border-[#F3D9D7] bg-[#FFF7F6] p-4 text-[#494949]">
                        <div className="w-[15%] text-[12px] font-medium text-[#202124]">{item.question}</div>
                        <div className="w-[35%] flex flex-col gap-2">
                            <div className="flex justify-between items-center text-[11px] text-[#6F7785]">
                                <div>Light</div>
                                <div>Target</div>
                                <div>Dark</div>
                            </div>
                            <div className="flex justify-between">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                    <div key={n} className="border border-[#CBD3DF] bg-white text-[12px] font-medium w-[28px] h-[28px] rounded flex justify-center items-center">{n}</div>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 flex justify-between min-h-[52px] items-start">
                            {samples.slice(0, maxCols).map((s, si) => {
                                const sc = s.items[rowIdx]?.score ?? (si === 0 ? item.score : null) ?? "";
                                const pct = sc !== "" && sc != null ? scoreToPercent(Number(sc)) : null;
                                return (
                                    <div key={si} className="flex flex-col items-center gap-1">
                                        <div className="flex justify-center items-center text-xs bg-white h-[30px] w-[100px] rounded border border-[#E6E9EE]">
                                            {sc !== "" && sc != null ? sc : ""}
                                        </div>
                                        {pct != null && (
                                            <div className="text-[10px] text-[#6C757D]">{pct}%</div>
                                        )}
                                    </div>
                                );
                            })}
                            {Array.from({ length: Math.max(0, maxCols - samples.length) }).map((_, i) => (
                                <div key={`ph-row-${i}`} className="flex justify-center items-center text-xs bg-white h-[30px] w-[100px] rounded border border-[#E6E9EE]" />
                            ))}
                        </div>
                    </div>
                ))}

                {/* Overall section score row */}
                {sectionTitle && (
                    <div className="flex items-center gap-4 p-4 border-t border-[#E6E9EE]">
                        <div className="flex-1 flex flex-col items-end pr-4">
                            <div className="text-[13px] font-semibold text-[#202124]">Overall {sectionTitle} Score</div>
                            <div className="text-xs text-[#6C757D]">(Value furthest away from target)</div>
                        </div>
                        <div className="flex justify-between min-w-[452px]">
                            {samples.slice(0, maxCols).map((_, si) => {
                                const sc = sectionOveralls[si];
                                const risk = sc != null ? riskFromScore(sc) : null;
                                return (
                                    <div key={si} className="flex flex-col items-center gap-1">
                                        <div className="flex justify-center items-center text-xs font-semibold bg-white h-[30px] w-[100px] rounded border border-[#E6E9EE]">
                                            {sc ?? ""}
                                        </div>
                                        {risk && (
                                            <div className="text-[10px] font-semibold" style={{ color: risk.color }}>
                                                {risk.label}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {Array.from({ length: Math.max(0, maxCols - samples.length) }).map((_, i) => (
                                <div key={`ph-ov-${i}`} className="flex justify-center items-center text-xs font-semibold bg-white h-[30px] w-[100px] rounded border border-[#E6E9EE]" />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
