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

// Shared column template — all rows must use the same colStyle so 1fr is identical.
// border border-transparent keeps the box model identical to bordered attribute rows.
const colStyle = { gridTemplateColumns: "180px 1fr repeat(4, 100px)", gap: "16px" };
const ROW_BASE = "grid items-start p-4 border";

export default function ScoreCard({ sectionTitle, items = [], allSamples = [] }) {
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
                {/* Sample ID header — border-transparent keeps box-model identical to attribute rows */}
                {samples.length > 1 && (
                    <div className={`${ROW_BASE} border-transparent`} style={colStyle}>
                        <div />
                        <div />
                        {Array.from({ length: maxCols }).map((_, i) => (
                            <div key={i} className="flex justify-center items-center text-[11px] font-semibold text-[#6C757D]">
                                {samples[i]?.sampleId || ""}
                            </div>
                        ))}
                    </div>
                )}

                {/* Attribute rows */}
                {items.map((item, rowIdx) => (
                    <div key={rowIdx} className={`${ROW_BASE} border-[#F3D9D7] rounded-lg bg-[#FFF7F6] text-[#494949]`} style={colStyle}>
                        <div className="text-[12px] font-medium text-[#202124] self-center">{item.question}</div>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-[11px] text-[#6F7785]">
                                <span>Light</span>
                                <span>Target</span>
                                <span>Dark</span>
                            </div>
                            <div className="flex justify-between">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                    <div key={n} className="border border-[#CBD3DF] bg-white text-[12px] font-medium w-[28px] h-[28px] rounded flex justify-center items-center">{n}</div>
                                ))}
                            </div>
                        </div>
                        {Array.from({ length: maxCols }).map((_, si) => {
                            const s = samples[si];
                            const sc = s ? (s.items[rowIdx]?.score ?? (si === 0 ? item.score : null) ?? "") : "";
                            const pct = sc !== "" && sc != null ? scoreToPercent(Number(sc)) : null;
                            return (
                                <div key={si} className="flex flex-col items-center gap-1">
                                    <div className="flex justify-center items-center text-xs bg-white h-[30px] w-full rounded border border-[#E6E9EE]">
                                        {sc !== "" && sc != null ? sc : ""}
                                    </div>
                                    {pct != null && (
                                        <div className="text-[10px] text-[#6C757D]">{pct}%</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}

                {/* Overall section score row — border-transparent keeps box-model identical */}
                {sectionTitle && (
                    <div className={`${ROW_BASE} border-transparent border-t-[#E6E9EE] items-center`} style={colStyle}>
                        <div />
                        <div className="flex flex-col items-end pr-2">
                            <div className="text-[13px] font-semibold text-[#202124]">Overall {sectionTitle} Score</div>
                            <div className="text-xs text-[#6C757D]">(Value furthest from target)</div>
                        </div>
                        {Array.from({ length: maxCols }).map((_, si) => {
                            const sc = sectionOveralls[si] ?? null;
                            const risk = sc != null ? riskFromScore(sc) : null;
                            return (
                                <div key={si} className="flex flex-col items-center gap-1">
                                    <div className="flex justify-center items-center text-xs font-semibold bg-white h-[30px] w-full rounded border border-[#E6E9EE]">
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
                    </div>
                )}
            </div>
        </div>
    );
}
