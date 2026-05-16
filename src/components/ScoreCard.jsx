const TARGET = 5;

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

const NAME_COL_W = 104;
const SCALE_BOX_SIZE = 28;
const SCALE_GAP = 4;
const SCALE_COL_W = 9 * SCALE_BOX_SIZE + 8 * SCALE_GAP;
const SCORE_COL_W = 118;
const COLS = `${NAME_COL_W}px ${SCALE_COL_W}px repeat(4, ${SCORE_COL_W}px)`;
const GAP = "14px";
const MAX_COLS = 4;
const TABLE_W = NAME_COL_W + SCALE_COL_W + (MAX_COLS * SCORE_COL_W) + (5 * 14);

const SAMPLE_CELL_H = 34;
const SCORE_CELL_H = 34;
const SCORE_CELL_TOP_OFFSET = 12;

export default function ScoreCard({ sectionTitle, items = [], allSamples = [] }) {
    const samples = allSamples.length > 0 ? allSamples : [{ sampleId: null, items }];

    const sectionOverallPercents = samples.map((s) => {
        const scores = s.items.map((it) => Number(it.score)).filter((sc) => !isNaN(sc) && sc > 0);
        const worst = overallSectionScore(scores);
        return worst != null ? scoreToPercent(worst) : null;
    });

    return (
        <div className="flex flex-col w-full min-w-fit">
            {sectionTitle && (
                <div className="px-0 pb-4 pt-1 text-[18px] font-semibold text-[#202124]">
                    {sectionTitle}
                </div>
            )}

            {samples.length > 1 && (
                <div
                    className="grid items-center pb-4"
                    style={{ gridTemplateColumns: COLS, gap: GAP, width: `${TABLE_W}px`, maxWidth: "100%" }}
                >
                    <div />
                    <div className="text-[12px] font-semibold text-right text-[#202124] pr-1 tracking-wide">
                        SAMPLE CODES :
                    </div>
                    {Array.from({ length: MAX_COLS }).map((_, i) => (
                        <div
                            key={i}
                            className="flex justify-center items-center text-[12px] font-medium text-[#202124] bg-white rounded-md border border-[#E0E4EA] w-full"
                            style={{ height: `${SAMPLE_CELL_H}px` }}
                        >
                            {samples[i]?.sampleId || ""}
                        </div>
                    ))}
                </div>
            )}

            {items.map((item, rowIdx) => {
                const isDefect = item.scaleType === "defect";
                const targetLeftPx = 4 * SCALE_BOX_SIZE + 4 * SCALE_GAP + SCALE_BOX_SIZE / 2;

                return (
                    <div
                        key={rowIdx}
                        className="mb-3 rounded-[6px] border border-[#F3D9D7] bg-[#FFF7F6] px-2 py-2"
                        style={{ width: `${TABLE_W + 16}px`, maxWidth: "100%" }}
                    >
                        <div
                            className="grid items-center"
                            style={{ gridTemplateColumns: COLS, gap: GAP }}
                        >
                            <div className="text-[13px] font-medium text-[#494949] leading-snug">
                                {item.question}
                            </div>

                            <div className="relative mt-4" style={{ height: `${SCALE_BOX_SIZE}px` }}>
                                {isDefect ? (
                                    <>
                                        <span
                                            className="absolute text-[11px] italic font-semibold text-[#494949]"
                                            style={{ top: "-20px", left: `${targetLeftPx}px`, transform: "translateX(-50%)" }}
                                        >
                                            None
                                        </span>
                                        <span
                                            className="absolute text-[11px] italic font-semibold text-[#494949]"
                                            style={{ top: "-20px", right: 0 }}
                                        >
                                            More
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span
                                            className="absolute text-[11px] italic font-semibold text-[#494949]"
                                            style={{ top: "-20px", left: 0 }}
                                        >
                                            Light
                                        </span>
                                        <span
                                            className="absolute text-[11px] italic font-semibold text-[#494949]"
                                            style={{ top: "-20px", left: `${targetLeftPx}px`, transform: "translateX(-50%)" }}
                                        >
                                            Target
                                        </span>
                                        <span
                                            className="absolute text-[11px] italic font-semibold text-[#494949]"
                                            style={{ top: "-20px", right: 0 }}
                                        >
                                            Dark
                                        </span>
                                    </>
                                )}
                                <div className="flex" style={{ gap: `${SCALE_GAP}px` }}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
                                        const showNumber = !isDefect || n >= 5;
                                        return (
                                            <div
                                                key={n}
                                                className="rounded-[4px] border border-black bg-white flex items-center justify-center text-[16px] font-normal text-black"
                                                style={{ width: `${SCALE_BOX_SIZE}px`, height: `${SCALE_BOX_SIZE}px` }}
                                            >
                                                {showNumber ? n : ""}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {Array.from({ length: MAX_COLS }).map((_, si) => {
                                const s = samples[si];
                                const sc = s
                                    ? (s.items[rowIdx]?.score ?? (si === 0 ? item.score : null) ?? "")
                                    : "";
                                return (
                                    <div
                                        key={si}
                                        className="flex justify-center items-center bg-white rounded-md border border-[#E0E4EA] text-[13px] font-normal text-[#202124] w-full"
                                        style={{ height: `${SCORE_CELL_H}px`, marginTop: `${SCORE_CELL_TOP_OFFSET}px` }}
                                    >
                                        {sc !== "" && sc != null ? sc : ""}
                                    </div>
                                );
                            })}
                        </div>

                        {item.comments && (
                            <div
                                className="mt-3 grid items-start"
                                style={{ gridTemplateColumns: `${NAME_COL_W}px ${SCALE_COL_W + 14 + SCORE_COL_W}px`, gap: GAP }}
                            >
                                <div className="text-[13px] text-[#494949] text-right pr-2 pt-2">
                                    Comments:
                                </div>
                                <div className="px-3 py-2 border border-black rounded-[4px] bg-white text-[12px] text-[#494949] leading-relaxed">
                                    {item.comments}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {sectionTitle && (
                <div
                    className="grid items-center py-4"
                    style={{ gridTemplateColumns: COLS, gap: GAP, width: `${TABLE_W}px`, maxWidth: "100%" }}
                >
                    <div />
                    <div className="flex flex-col items-end pr-2">
                        <span className="text-[13px] font-bold text-[#202124]">
                            Overall {sectionTitle} Score
                        </span>
                        <span className="text-[11px] text-[#8A929E]">(Value furthest away from target)</span>
                    </div>
                    {Array.from({ length: MAX_COLS }).map((_, si) => {
                        const pct = sectionOverallPercents[si] ?? null;
                        return (
                            <div
                                key={si}
                                className="flex justify-center items-center w-full rounded-[6px] border-2 border-[#202124] bg-white text-[14px] font-bold text-[#202124]"
                                style={{ height: `${SCORE_CELL_H + 4}px` }}
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
