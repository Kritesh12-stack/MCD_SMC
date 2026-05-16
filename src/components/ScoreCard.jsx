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

// Name 130 + Scale 210 + 4×80 score + 5×12 gap = 730px total
const COLS = "130px 210px repeat(4, 80px)";
const GAP = "12px";
const MAX_COLS = 4;

// Each scale box width: (210 - 8×2) / 9 ≈ 21.6px — small squares matching the reference
const SCALE_BOX_H = 24; // px — square-ish boxes
const SCORE_CELL_H = 36; // px — taller white cells for the actual score

export default function ScoreCard({ sectionTitle, items = [], allSamples = [] }) {
    const samples = allSamples.length > 0 ? allSamples : [{ sampleId: null, items }];

    const sectionOverallPercents = samples.map((s) => {
        const scores = s.items.map((it) => Number(it.score)).filter((sc) => !isNaN(sc) && sc > 0);
        const worst = overallSectionScore(scores);
        return worst != null ? scoreToPercent(worst) : null;
    });

    return (
        <div className="flex flex-col w-full max-w-[760px]">
            {/* Section title */}
            {sectionTitle && (
                <div className="px-2 py-3 text-[13px] font-semibold text-[#202124]">
                    {sectionTitle}
                </div>
            )}

            {/* "SAMPLE CODES :" header row — only when multiple samples */}
            {samples.length > 1 && (
                <div
                    className="grid items-center px-4 py-2"
                    style={{ gridTemplateColumns: COLS, gap: GAP }}
                >
                    {/* Span name + scale columns for the label */}
                    <div
                        className="text-[11px] font-semibold text-right text-[#6C757D] pr-2"
                        style={{ gridColumn: "1 / 3" }}
                    >
                        SAMPLE CODES :
                    </div>
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
                    className="grid items-center px-4 pb-3 pt-8 mb-2 border border-[#F3D9D7] rounded-lg bg-[#FFF7F6]"
                    style={{ gridTemplateColumns: COLS, gap: GAP }}
                >
                    {/* Attribute name */}
                    <div className="text-[12px] font-medium text-[#202124] leading-snug">
                        {item.question}
                    </div>

                    {/*
                      Scale column:
                      - Fixed height matches SCALE_BOX_H so it doesn't make the row taller than SCORE_CELL_H
                      - Labels float above inside the pt-8 (32px) row padding via absolute -top-5 (20px)
                      - CSS Grid repeat(9,1fr) with gap:2px gives uniform ~21.6px boxes — small and square-ish
                    */}
                    <div className="relative" style={{ height: `${SCALE_BOX_H}px` }}>
                        <span
                            className="absolute text-[10px] text-[#6F7785]"
                            style={{ top: "-20px", left: 0 }}
                        >
                            Light
                        </span>
                        <span
                            className="absolute text-[10px] text-[#6F7785]"
                            style={{ top: "-20px", left: "50%", transform: "translateX(-50%)" }}
                        >
                            Target
                        </span>
                        <span
                            className="absolute text-[10px] text-[#6F7785]"
                            style={{ top: "-20px", right: 0 }}
                        >
                            Dark
                        </span>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(9, 1fr)",
                                gap: "2px",
                                height: "100%",
                            }}
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                                <div
                                    key={n}
                                    style={{ backgroundColor: SCORE_BG[n - 1], color: SCORE_FG[n - 1] }}
                                    className="rounded text-[11px] font-semibold flex justify-center items-center border border-[#CBD3DF]"
                                >
                                    {n}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Score cells — wider and taller than the scale boxes */}
                    {Array.from({ length: MAX_COLS }).map((_, si) => {
                        const s = samples[si];
                        const sc = s
                            ? (s.items[rowIdx]?.score ?? (si === 0 ? item.score : null) ?? "")
                            : "";
                        return (
                            <div
                                key={si}
                                className="flex justify-center items-center text-sm bg-white w-full rounded border border-[#E6E9EE]"
                                style={{ height: `${SCORE_CELL_H}px` }}
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
                        <span className="text-[12px] font-semibold text-[#202124]">
                            Overall {sectionTitle} Score
                        </span>
                        <span className="text-[10px] text-[#6C757D]">(Value furthest away from target)</span>
                    </div>
                    {Array.from({ length: MAX_COLS }).map((_, si) => {
                        const pct = sectionOverallPercents[si] ?? null;
                        return (
                            <div
                                key={si}
                                className="flex justify-center items-center w-full rounded border-2 border-[#202124] bg-white text-sm font-bold text-[#202124]"
                                style={{ height: `${SCORE_CELL_H}px` }}
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
