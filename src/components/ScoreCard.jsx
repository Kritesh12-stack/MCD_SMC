const TARGET = 5;

const SCORE_BG = ["#EA3323","#EA3323","#FFFF54","#FFFF54","#52976A","#FFFF54","#FFFF54","#EA3323","#EA3323"];
const SCORE_FG = ["#FFF","#FFF","#000","#000","#FFF","#000","#000","#FFF","#FFF"];

const SCORE_PERCENT = { 1: 0, 2: 25, 3: 60, 4: 85, 5: 100, 6: 85, 7: 60, 8: 25, 9: 0 };

function scoreToPercent(score) {
    return SCORE_PERCENT[score] ?? null;
}

function overallSectionScore(scores) {
    const valid = scores.filter((s) => s != null && s !== "");
    if (!valid.length) return null;
    return valid.reduce((worst, s) =>
        Math.abs(s - TARGET) > Math.abs(worst - TARGET) ? s : worst
    );
}

// Fixed column widths so the scale never stretches on wide screens.
// Total: 180 + 280 + 4×100 + 5×16 gap = 940px.
const COLS = "180px 280px repeat(4, 100px)";
const GAP = "16px";

const MAX_COLS = 4;

export default function ScoreCard({ sectionTitle, items = [], allSamples = [] }) {
    const samples = allSamples.length > 0 ? allSamples : [{ sampleId: null, items }];

    const sectionOverallPercents = samples.map((s) => {
        const scores = s.items.map((it) => Number(it.score)).filter((sc) => !isNaN(sc) && sc > 0);
        const worst = overallSectionScore(scores);
        return worst != null ? scoreToPercent(worst) : null;
    });

    return (
        <div className="flex flex-col w-fit min-w-full max-w-[960px]">
            {/* Section title */}
            {sectionTitle && (
                <div className="px-2 py-3 text-[13px] font-semibold text-[#202124]">
                    {sectionTitle}
                </div>
            )}

            {/* Sample ID header row */}
            {samples.length > 1 && (
                <div
                    className="grid items-center px-4 py-2"
                    style={{ gridTemplateColumns: COLS, gap: GAP }}
                >
                    <div />
                    <div />
                    {Array.from({ length: MAX_COLS }).map((_, i) => (
                        <div key={i} className="flex justify-center text-[11px] font-semibold text-[#6C757D]">
                            {samples[i]?.sampleId || ""}
                        </div>
                    ))}
                </div>
            )}

            {/* Attribute rows */}
            {items.map((item, rowIdx) => (
                <div
                    key={rowIdx}
                    className="grid items-center p-4 mb-3 border border-[#F3D9D7] rounded-lg bg-[#FFF7F6]"
                    style={{ gridTemplateColumns: COLS, gap: GAP }}
                >
                    {/* Attribute name */}
                    <div className="text-[12px] font-medium text-[#202124]">{item.question}</div>

                    {/* Scale: labels + colored boxes, fixed 280px */}
                    <div className="flex flex-col gap-1">
                        {/* Labels */}
                        <div className="flex justify-between text-[11px] text-[#6F7785]">
                            <span>Light</span>
                            <span>Target</span>
                            <span>Dark</span>
                        </div>
                        {/* Boxes */}
                        <div className="flex justify-between">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                                <div
                                    key={n}
                                    style={{ backgroundColor: SCORE_BG[n - 1], color: SCORE_FG[n - 1] }}
                                    className="w-7 h-7 rounded text-[12px] font-semibold flex justify-center items-center border border-[#CBD3DF] shrink-0"
                                >
                                    {n}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sample score cells */}
                    {Array.from({ length: MAX_COLS }).map((_, si) => {
                        const s = samples[si];
                        const sc = s
                            ? (s.items[rowIdx]?.score ?? (si === 0 ? item.score : null) ?? "")
                            : "";
                        return (
                            <div
                                key={si}
                                className="flex justify-center items-center text-sm bg-white h-10 w-full rounded border border-[#E6E9EE]"
                            >
                                {sc !== "" && sc != null ? sc : ""}
                            </div>
                        );
                    })}
                </div>
            ))}

            {/* Overall section score row */}
            {sectionTitle && (
                <div
                    className="grid items-center px-4 py-3"
                    style={{ gridTemplateColumns: COLS, gap: GAP }}
                >
                    <div />
                    <div className="flex flex-col items-end pr-2">
                        <span className="text-[13px] font-semibold text-[#202124]">
                            Overall {sectionTitle} Score
                        </span>
                        <span className="text-xs text-[#6C757D]">(Value furthest away from target)</span>
                    </div>
                    {Array.from({ length: MAX_COLS }).map((_, si) => {
                        const pct = sectionOverallPercents[si] ?? null;
                        return (
                            <div
                                key={si}
                                className="flex justify-center items-center h-10 w-full rounded border-2 border-[#202124] bg-white text-sm font-bold text-[#202124]"
                            >
                                {pct != null ? <>{pct}&thinsp;<span>%</span></> : ""}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
