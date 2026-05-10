import { useState } from "react";
import PageHeading from "../components/PageHeading";
import Docs from "../assets/Docs.svg"
import TickCircle from "../assets/TickCircle.svg"
import SensoryRadarChart, {
    DEFAULT_SENSORY_AXES,
} from "../components/SensoryRadarChart";

/** Static scorecard blocks per sensory category (dropdown). Shape mirrors CreateReport `questions` + table data. */
const QUESTION_SCORE_SECTIONS = {
    Appearance: {
        subTitle: "Visual assessment of color, surface, edges, defects, and thickness",
        detailRows: [
            { parameter: "Color Uniformity", score: 5, remark: "Even color" },
            { parameter: "Surface Sheen", score: 5, remark: "Slightly glossy" },
            { parameter: "Slice Edges", score: 5, remark: "Clean cut" },
            { parameter: "Visible Defects", score: 5, remark: "Minor wrinkle" },
            { parameter: "Thickness Uniformity", score: 5, remark: "Consistent" },
        ],
        categoryScorePercent: "94%",
        averageRows: [
            { pqi: "85.0%", score: 4, degOfDiff: 1 },
            { pqi: "60.0%", score: 3, degOfDiff: 2 },
            { pqi: "85.0%", score: 6, degOfDiff: 1 },
            { pqi: "85.0%", score: 6, degOfDiff: 0 },
            { pqi: "85.0%", score: 6, degOfDiff: 0 },
        ],
        averageTotals: { pqi: "Total", score: 5.6, degOfDiff: 1.0 },
        rangeRows: [
            { high: 4, low: 4, range: 0 },
            { high: 3, low: 3, range: 0 },
            { high: 6, low: 6, range: 0 },
            { high: 6, low: 6, range: 0 },
            { high: 6, low: 6, range: 0 },
        ],
    },
    Outside: {
        subTitle: "Visual assessment of color, size, shape, and overall presentation",
        detailRows: [
            { parameter: "Color Uniformity", score: 6, remark: "On target" },
            { parameter: "Shape & Size", score: 5, remark: "Within limits" },
            { parameter: "Texture", score: 5, remark: "Acceptable" },
        ],
        categoryScorePercent: "88%",
        averageRows: [
            { pqi: "82.0%", score: 5, degOfDiff: 1 },
            { pqi: "78.0%", score: 4, degOfDiff: 1 },
            { pqi: "80.0%", score: 5, degOfDiff: 0 },
        ],
        averageTotals: { pqi: "Total", score: 4.7, degOfDiff: 0.7 },
        rangeRows: [
            { high: 6, low: 5, range: 1 },
            { high: 5, low: 4, range: 1 },
            { high: 5, low: 5, range: 0 },
        ],
    },
    Inside: {
        subTitle: "All attributes are to be evaluated at room temperature",
        detailRows: [
            { parameter: "Moisture Content", score: 5, remark: "Balanced" },
            { parameter: "Flavor", score: 6, remark: "Mild cheddar" },
            { parameter: "Temperature", score: 5, remark: "Room temp" },
        ],
        categoryScorePercent: "91%",
        averageRows: [
            { pqi: "88.0%", score: 5, degOfDiff: 0 },
            { pqi: "90.0%", score: 6, degOfDiff: 1 },
            { pqi: "86.0%", score: 5, degOfDiff: 1 },
        ],
        averageTotals: { pqi: "Total", score: 5.3, degOfDiff: 0.7 },
        rangeRows: [
            { high: 6, low: 5, range: 1 },
            { high: 6, low: 5, range: 1 },
            { high: 5, low: 4, range: 1 },
        ],
    },
};

const QUESTION_SCORE_KEYS = Object.keys(QUESTION_SCORE_SECTIONS);

export default function BatchDetails() {
    const [selectedScoreSection, setSelectedScoreSection] = useState("Appearance");
    const [scoreDropdownOpen, setScoreDropdownOpen] = useState(false);
    const scoreBlock = QUESTION_SCORE_SECTIONS[selectedScoreSection];

    return (
        <div>
            <PageHeading
                title={"Batch Details"}
            />
            <div className="flex gap-4 p-4">
                <div className="border p-4 bg-[#FAFAFA] border-[#E8E8E8] rounded-2xl w-2/3">
                    <div className="text-xl text-[#434343] font-semibold pb-6">Batch Details</div>
                    <div className="flex text-sm items-center justify-between w-full text-[#494949] pb-1">
                        <div className="font-bold">Batch</div>
                        <div className="font-medium">19 Feb 2025, 5:34 pm</div>
                    </div>
                    <div className="flex text-sm items-center justify-between w-full text-[#494949] pb-4">
                        <div className="font-medium">12345/12/A12</div>
                    </div>
                    <div className="flex text-sm items-center justify-between w-full text-[#494949] pb-1">
                        <div className="font-bold">Product Name</div>
                        <div className="font-bold">Supplier Name</div>
                    </div>
                    <div className="flex text-sm items-center justify-between w-full text-[#494949] pb-4">
                        <div className="font-medium">American Cheese Slices</div>
                        <div className="font-medium">Salamonca</div>
                    </div>
                    <div className="flex text-sm items-center justify-between w-full text-[#494949] pb-1">
                        <div className="font-bold">SKU</div>
                    </div>
                    <div className="flex text-sm items-center justify-between w-full text-[#494949] pb-4">
                        <div className="font-medium">American Cheese Slices</div>
                    </div>
                    <div className="flex text-sm items-center justify-between w-full text-[#494949] pb-1">
                        <div className="font-bold">Batch Quantity</div>
                        <div className="font-bold">Issue</div>
                    </div>
                    <div className="flex text-sm items-center justify-between w-full text-[#494949] pb-4">
                        <div className="font-medium">10</div>
                        <div className="font-medium">Food Quality</div>
                    </div>
                    <div className="flex text-sm items-center justify-between w-full text-[#494949] pb-1">
                        <div className="font-bold">Attached Pictures</div>
                    </div>
                    <div className="border-t border-[#E8E8E8] text-xl font-bold text-[#434343] py-2">Reason</div>
                    <div className="text-sm font-medium ">Batch meets all quality parameters. Color uniform, texture consistent, slices intact, no visible defects. Score above acceptance threshold. Production sheet verified and compliant.
                    merican cheese slices with uniform color, smooth texture, intact edges, and compliant melt behavior. Approved as per QA standards.</div>
                </div>

                <div className="border p-4 bg-[#FAFAFA] border-[#E8E8E8] rounded-2xl w-1/3">
                    <div className="flex items-center gap-1">
                        <img src={Docs} alt="" />
                        <div className="text-base font-semibold text-[#2C2C2C]">Sensory Evaluation Summary</div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="flex text-xs flex-col gap-2 items-start bg-white border border-[#E8E8E8] rounded-xl p-4 min-h-0">
                        <div>Product Quality Score</div>
                        <div className="text-[#FF5858] font-bold text-3xl">4.48</div>
                        <div>out of 5.0</div>
                    </div>
                    <div className="flex text-xs flex-col gap-2 items-start bg-white border border-[#E8E8E8] rounded-xl p-4 min-h-0">
                        <div>Quality Index (%QI)</div>
                        <div className="text-[#FF5858] font-bold text-3xl">89.95%</div>
                    </div>
                    <div className="flex text-xs flex-col gap-2 items-start bg-white border border-[#E8E8E8] rounded-xl p-4 min-h-0">
                        <div>Samples Evaluated</div>
                        <div className="text-[#FF5858] font-bold text-3xl">4</div>
                        <div>SMPL-0003-A</div>
                    </div>
                    <div className="flex text-xs flex-col gap-2 items-start bg-white border border-[#E8E8E8] rounded-xl p-4 min-h-0">
                        <div>Decision Status</div>
                        <div className="flex gap-1 items-center bg-[#FF585833] rounded-md p-1 text-[#FF5858]">
                            <img src={TickCircle} alt="" />
                            <div className="text-xs">Accept</div>
                        </div>
                        <div>SMPL-0003-B</div>
                    </div>
                    <div className="flex text-xs flex-col gap-2 items-start bg-white border border-[#E8E8E8] rounded-xl p-4 min-h-0">
                        <div>Evaluator</div>
                        <div>Mike Chen</div>
                    </div>
                    <div className="flex text-xs flex-col gap-2 items-start bg-white border border-[#E8E8E8] rounded-xl p-4 min-h-0">
                        <div>Complaint Raised</div>
                        <div className="flex gap-1 items-center bg-[#FFC72C] rounded-md p-1 text-[#2C2C2C]">
                            <div className="text-xs font-medium">No</div>
                        </div>
                    </div>
                    </div>
                </div>
                
            </div>
            <div className="px-4 pt-4">
                <div className="font-bold text-xl text-[#434343] mb-4">Select Scorecards Details</div>

                <div className="relative w-full mb-6">
                    <button
                        type="button"
                        className="w-full flex items-center justify-between gap-3 rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-left shadow-sm hover:bg-[#FAFAFA]"
                        onClick={() => setScoreDropdownOpen((o) => !o)}
                    >
                        <div>
                            <div className="text-base font-semibold text-[#1A1A2E]">{selectedScoreSection}</div>
                            <div className="text-sm text-[#6C757D] mt-0.5">{scoreBlock.subTitle}</div>
                        </div>
                        <span
                            className={`text-[#6C757D] text-xl shrink-0 transition-transform ${scoreDropdownOpen ? "rotate-180" : ""}`}
                            aria-hidden
                        >
                            ▼
                        </span>
                    </button>
                    {scoreDropdownOpen ? (
                        <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-[#E5E7EB] bg-white shadow-md overflow-hidden">
                            {QUESTION_SCORE_KEYS.map((key) => (
                                <button
                                    key={key}
                                    type="button"
                                    className="w-full px-4 py-3 text-left border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#F9FAFB]"
                                    onClick={() => {
                                        setSelectedScoreSection(key);
                                        setScoreDropdownOpen(false);
                                    }}
                                >
                                    <div className="text-base font-semibold text-[#1A1A2E]">{key}</div>
                                    <div className="text-sm text-[#6C757D]">{QUESTION_SCORE_SECTIONS[key].subTitle}</div>
                                </button>
                            ))}
                        </div>
                    ) : null}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-4">
                    {/* Appearance / detail */}
                    <div className="rounded-xl border border-[#E8E8E8] bg-white p-4 flex flex-col min-h-0">
                        <div className="text-base font-semibold text-[#2C2C2C] mb-3">{selectedScoreSection}</div>
                        <div className="rounded-lg overflow-hidden border border-[#E8E8E8] text-sm">
                            <div className="grid grid-cols-[1fr_52px_1fr] gap-0 bg-[#F3F4F6] text-[#494949] font-medium">
                                <div className="px-3 py-2 border-r border-[#E8E8E8]">Parameter</div>
                                <div className="px-2 py-2 text-center border-r border-[#E8E8E8]">Score</div>
                                <div className="px-3 py-2">Remark</div>
                            </div>
                            {scoreBlock.detailRows.map((row, i) => (
                                <div
                                    key={i}
                                    className="grid grid-cols-[1fr_52px_1fr] gap-0 border-t border-[#E8E8E8] text-[#494949]"
                                >
                                    <div className="px-3 py-2.5 border-r border-[#E8E8E8]">{row.parameter}</div>
                                    <div className="px-2 py-2.5 text-center border-r border-[#E8E8E8]">{row.score}</div>
                                    <div className="px-3 py-2.5">{row.remark}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 text-sm font-semibold text-[#2C2C2C]">
                            {selectedScoreSection} Score: {scoreBlock.categoryScorePercent}
                        </div>
                    </div>

                    {/* Average */}
                    <div className="rounded-xl border border-[#E8E8E8] bg-white p-4 flex flex-col min-h-0">
                        <div className="text-base font-semibold text-[#2C2C2C] mb-3">Average</div>
                        <div className="rounded-lg overflow-hidden border border-[#E8E8E8] text-sm">
                            <div className="grid grid-cols-[1fr_56px_72px] gap-0 bg-[#F3F4F6] text-[#494949] font-medium">
                                <div className="px-3 py-2 border-r border-[#E8E8E8]">PQ I%</div>
                                <div className="px-2 py-2 text-center border-r border-[#E8E8E8]">Score</div>
                                <div className="px-2 py-2 text-center">Deg of Diff</div>
                            </div>
                            {scoreBlock.averageRows.map((row, i) => (
                                <div
                                    key={i}
                                    className="grid grid-cols-[1fr_56px_72px] gap-0 border-t border-[#E8E8E8] text-[#494949]"
                                >
                                    <div className="px-3 py-2.5 border-r border-[#E8E8E8]">{row.pqi}</div>
                                    <div className="px-2 py-2.5 text-center border-r border-[#E8E8E8]">{row.score}</div>
                                    <div className="px-2 py-2.5 text-center">{row.degOfDiff}</div>
                                </div>
                            ))}
                            <div className="grid grid-cols-[1fr_56px_72px] gap-0 border-t-2 border-[#E8E8E8] bg-[#FAFAFA] font-semibold text-[#2C2C2C]">
                                <div className="px-3 py-2.5 border-r border-[#E8E8E8]">{scoreBlock.averageTotals.pqi}</div>
                                <div className="px-2 py-2.5 text-center border-r border-[#E8E8E8]">{scoreBlock.averageTotals.score}</div>
                                <div className="px-2 py-2.5 text-center">{scoreBlock.averageTotals.degOfDiff}</div>
                            </div>
                        </div>
                    </div>

                    {/* Range */}
                    <div className="rounded-xl border border-[#E8E8E8] bg-white p-4 flex flex-col min-h-0">
                        <div className="text-base font-semibold text-[#2C2C2C] mb-3">Range</div>
                        <div className="rounded-lg overflow-hidden border border-[#E8E8E8] text-sm">
                            <div className="grid grid-cols-3 gap-0 bg-[#F3F4F6] text-[#494949] font-medium">
                                <div className="px-3 py-2 border-r border-[#E8E8E8]">High</div>
                                <div className="px-3 py-2 text-center border-r border-[#E8E8E8]">Low</div>
                                <div className="px-3 py-2 text-center">Range</div>
                            </div>
                            {scoreBlock.rangeRows.map((row, i) => (
                                <div
                                    key={i}
                                    className="grid grid-cols-3 gap-0 border-t border-[#E8E8E8] text-[#494949]"
                                >
                                    <div className="px-3 py-2.5 border-r border-[#E8E8E8]">{row.high}</div>
                                    <div className="px-3 py-2.5 text-center border-r border-[#E8E8E8]">{row.low}</div>
                                    <div className="px-3 py-2.5 text-center">{row.range}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="font-bold text-xl p-4 text-[#434343]">Spiderplots data</div>
            <div className="p-4 flex flex-wrap justify-between space-y-4 w-full">
                <SensoryRadarChart
                    title="Sample 1"
                    axes={DEFAULT_SENSORY_AXES}
                    domain={[0, 9]}
                    series={[
                        {
                            dataKey: "target",
                            name: "Target Score",
                            values: Array(DEFAULT_SENSORY_AXES.length).fill(5),
                            color: "#16a34a",
                            strokeWidth: 3,
                        },
                        {
                            dataKey: "mcd",
                            name: "McDonald's Scores",
                            values: [6, 5, 7, 4, 8, 5, 6, 7, 5, 6],
                            color: "#2563eb",
                            strokeWidth: 3,
                        },
                        {
                            dataKey: "group",
                            name: "Group Score",
                            values: [4, 6, 5, 5, 4, 6, 5, 4, 7, 5],
                            color: "#dc2626",
                            strokeWidth: 2,
                            strokeDasharray: "6 4",
                        },
                    ]}
                />
                <SensoryRadarChart
                    title="Sample 2"
                    axes={DEFAULT_SENSORY_AXES}
                    domain={[0, 9]}
                    series={[
                        {
                            dataKey: "target",
                            name: "Target Score",
                            values: Array(DEFAULT_SENSORY_AXES.length).fill(5),
                            color: "#16a34a",
                            strokeWidth: 3,
                        },
                        {
                            dataKey: "mcd",
                            name: "McDonald's Scores",
                            values: [6, 5, 7, 4, 8, 5, 6, 7, 5, 6],
                            color: "#2563eb",
                            strokeWidth: 3,
                        },
                        {
                            dataKey: "group",
                            name: "Group Score",
                            values: [4, 6, 5, 5, 4, 6, 5, 4, 7, 5],
                            color: "#dc2626",
                            strokeWidth: 2,
                            strokeDasharray: "6 4",
                        },
                    ]}
                />
                <SensoryRadarChart
                    title="Sample 3"
                    axes={DEFAULT_SENSORY_AXES}
                    domain={[0, 9]}
                    series={[
                        {
                            dataKey: "target",
                            name: "Target Score",
                            values: Array(DEFAULT_SENSORY_AXES.length).fill(5),
                            color: "#16a34a",
                            strokeWidth: 3,
                        },
                        {
                            dataKey: "mcd",
                            name: "McDonald's Scores",
                            values: [6, 5, 7, 4, 8, 5, 6, 7, 5, 6],
                            color: "#2563eb",
                            strokeWidth: 3,
                        },
                        {
                            dataKey: "group",
                            name: "Group Score",
                            values: [4, 6, 5, 5, 4, 6, 5, 4, 7, 5],
                            color: "#dc2626",
                            strokeWidth: 2,
                            strokeDasharray: "6 4",
                        },
                    ]}
                />
                <SensoryRadarChart
                    title="Sample 4"
                    axes={DEFAULT_SENSORY_AXES}
                    domain={[0, 9]}
                    series={[
                        {
                            dataKey: "target",
                            name: "Target Score",
                            values: Array(DEFAULT_SENSORY_AXES.length).fill(5),
                            color: "#16a34a",
                            strokeWidth: 3,
                        },
                        {
                            dataKey: "mcd",
                            name: "McDonald's Scores",
                            values: [6, 5, 7, 4, 8, 5, 6, 7, 5, 6],
                            color: "#2563eb",
                            strokeWidth: 3,
                        },
                        {
                            dataKey: "group",
                            name: "Group Score",
                            values: [4, 6, 5, 5, 4, 6, 5, 4, 7, 5],
                            color: "#dc2626",
                            strokeWidth: 2,
                            strokeDasharray: "6 4",
                        },
                    ]}
                />
            </div>
        </div>
    )
}