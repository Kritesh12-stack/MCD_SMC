const TARGET = 5;

const SCORE_BG = ["#EA3323","#EA3323","#FFFF54","#FFFF54","#52976A","#FFFF54","#FFFF54","#EA3323","#EA3323"];
const SCORE_FG = ["#FFF","#FFF","#000","#000","#FFF","#000","#000","#FFF","#FFF"];

function scoreToPercent(score) {
    const map = { 1: 0, 2: 25, 3: 60, 4: 85, 5: 100, 6: 85, 7: 60, 8: 25, 9: 0 };
    return map[score] ?? null;
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

    const sectionOverallPercents = samples.map((s) => {
        const scores = s.items.map((it) => Number(it.score)).filter((sc) => !isNaN(sc) && sc > 0);
        const worst = overallSectionScore(scores);
        return worst != null ? scoreToPercent(worst) : null;
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
                                    <div
                                        key={n}
                                        style={{ backgroundColor: SCORE_BG[n - 1], color: SCORE_FG[n - 1] }}
                                        className="text-[12px] font-medium w-[28px] h-[28px] rounded flex justify-center items-center border border-[#CBD3DF]"
                                    >{n}</div>
                                ))}
                            </div>
                        </div>
                        {Array.from({ length: maxCols }).map((_, si) => {
                            const s = samples[si];
                            const sc = s ? (s.items[rowIdx]?.score ?? (si === 0 ? item.score : null) ?? "") : "";
                            return (
                                <div key={si} className="flex justify-center items-center text-xs bg-white h-[30px] w-full rounded border border-[#E6E9EE]">
                                    {sc !== "" && sc != null ? sc : ""}
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
                            <div className="text-xs text-[#6C757D]">(Value furthest away from target)</div>
                        </div>
                        {Array.from({ length: maxCols }).map((_, si) => {
                            const pct = sectionOverallPercents[si] ?? null;
                            return (
                                <div key={si} className="flex justify-center items-center gap-1 h-[40px] w-full rounded border-2 border-[#202124] bg-white text-sm font-bold text-[#202124]">
                                    {pct != null ? <>{pct}&nbsp;<span className="font-bold">%</span></> : ""}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
