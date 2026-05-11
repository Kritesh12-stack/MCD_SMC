import PageHeading from "../components/PageHeading";
import ScoreMarker from "../components/ScoreMarker";
import DownIcon from "../assets/DownIcon.svg"
import { useState, useEffect } from "react";
import ScoreCard from "../components/ScoreCard";
import CustomButton from "../components/CustomButton";
import EvidenceDocumentation from "../components/EvidenceDocumentation";
import { getProducts } from "../api/productsApi";
import { getScorecardMappings } from "../api/scorecardsApi";
import { generateIds } from "../api/batchesApi";

/** Normalize flat mappings array → { [section]: { subTitle, list: [{ question, subtitle, id, attributeId }] } } */
function normalizeMappings(mappings) {
    const result = {};
    // page_size=20 default — collect all pages if needed, but work with what we have
    mappings.forEach((m) => {
        const section = m.attribute_section;
        if (!result[section]) result[section] = { subTitle: section, list: [] };
        // avoid duplicate question_text under same attribute
        const exists = result[section].list.some(
            (q) => q.id === m.question && q.attributeId === m.attribute
        );
        if (!exists) {
            result[section].list.push({
                id: m.question,
                attributeId: m.attribute,
                question: m.attribute_name.trim(),
                subtitle: m.question_text,
            });
        }
    });
    return result;
}

export default function CreateReport() {
    const [selectedSection, setSelectedSection] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Product dropdown
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productsLoading, setProductsLoading] = useState(true);

    // Generated IDs
    const [batchId, setBatchId] = useState("");
    const [sampleId, setSampleId] = useState("");

    // Production date — default today
    const [productionDate, setProductionDate] = useState(() => new Date().toISOString().split("T")[0]);

    // Dynamic questions from mappings
    const [questions, setQuestions] = useState({});
    const [mappingsLoading, setMappingsLoading] = useState(false);

    // Scores: { [section]: { [questionId]: score } }
    const [scores, setScores] = useState({});

    // Submitted data for ScoreCard display
    const [submittedData, setSubmittedData] = useState([]);

    useEffect(() => {
        getProducts()
            .then((res) => setProducts(res?.data?.data ?? []))
            .catch(() => {})
            .finally(() => setProductsLoading(false));

        generateIds()
            .then((res) => {
                setBatchId(res?.data?.data?.batch_id ?? "");
                setSampleId(res?.data?.data?.sample_id ?? "");
            })
            .catch(() => {});
    }, []);

    function handleProductSelect(e) {
        const product = products.find((p) => p.id === e.target.value);
        if (!product) return;
        setSelectedProduct(product);
        setQuestions({});
        setSelectedSection(null);
        setScores({});
        setMappingsLoading(true);
        getScorecardMappings(product.id)
            .then((res) => {
                const normalized = normalizeMappings(res?.data?.data ?? []);
                setQuestions(normalized);
                setSelectedSection(Object.keys(normalized)[0] ?? null);
            })
            .catch(() => {})
            .finally(() => setMappingsLoading(false));
    }

    function handleScoreChange(section, questionId, score) {
        setScores((prev) => ({
            ...prev,
            [section]: { ...(prev[section] ?? {}), [questionId]: score },
        }));
    }

    const Parameter = ({ scale, percentage, remark, bgColor, color }) => {
        return (
            <div className="flex flex-col gap-4 justify-center items-center">
                <div className="text-center flex items-center h-10">{remark}</div>
                <div
                    className="w-[80px] h-[35px] rounded-md border px-6 py-2 flex justify-center items-center"
                    style={{ backgroundColor: bgColor, color }}
                >
                    {scale}
                </div>
                <div>{percentage}%</div>
            </div>
        )
    }



    const paramData = [
        {
            scale: "1",
            percentage: "0",
            remark: "NOT McD Quality",
            bgColor: "#EA3323",
            color: "#FFF"
        },
        {
            scale: "2",
            percentage: "25",
            remark: "Significant Difference",
            bgColor: "#EA3323",
            color: "#FFF"
        },
        {
            scale: "3",
            percentage: "60",
            remark: "Marginal",
            bgColor: "#FFFF54",
            color: "#000000"
        },
        {
            scale: "4",
            percentage: "85",
            remark: "Slight Difference",
            bgColor: "#FFFF54",
            color: "#000000"
        },
        {
            scale: "5",
            percentage: "100",
            remark: "Equal to TARGET",
            bgColor: "#52976A",
            color: "#000000"
        }, {
            scale: "4",
            percentage: "85",
            remark: "Slight Difference",
            bgColor: "#FFFF54",
            color: "#000000"
        }, {
            scale: "3",
            percentage: "60",
            remark: "Marginal",
            bgColor: "#FFFF54",
            color: "#000000"
        }, {
            scale: "2",
            percentage: "25",
            remark: "Significant Difference",
            bgColor: "#EA3323",
            color: "#FFF"
        },
        {
            scale: "1",
            percentage: "0",
            remark: "NOT McD Quality",
            bgColor: "#EA3323",
            color: "#FFF"
        },



    ]

    const sectionKeys = Object.keys(questions);

    const [isSubmitted,setIsSubmitted] = useState(false);

    const handleSubmit = () => {
        // Build submitted data: [{ sectionTitle, items: [{ question, score }] }]
        const data = Object.keys(questions).map((section) => ({
            sectionTitle: section,
            items: questions[section].list.map((q) => ({
                question: q.question,
                score: scores[section]?.[q.id] ?? null,
            })),
        }));
        setSubmittedData(data);
        setIsSubmitted(true);
    }

    return (
        <div>
            <PageHeading
                title={"Create a Report"}
            />
            
            <div className="text-[14px] text-[#494949] leading-6 flex flex-col gap-4 p-4">
                <div className="flex items-center">
                    <div className="w-[125px]">Instruction :</div>
                    <div>Please evaluate the sample. For each attribute, indicate whether it exhibits more than, less than, or equalto the target.</div>
                </div>
                <div className="flex items-center">
                    <div className="w-[125px]">Sensory Score :</div>
                    <div className="flex-1 flex items-center justify-between">
                        {paramData.map((data, index) => (
                            <Parameter
                                key={index}
                                scale={data.scale}
                                percentage={data.percentage}
                                remark={data.remark}
                                bgColor={data.bgColor}
                                color={data.color}
                            />
                        ))}
                    </div>
                </div>
                <div className="w-full flex items-center">
                    <div className="w-[65%]">APPEARANCE :</div>
                    <div>Fully baked soft rollthat has a uniform deep medium brown color with a sight sheen (same target crown color as BB Big Mac). Bun is uniformly round and symmetricalwith straight wallheels. Crowns are uniformly covered with white opaque sesame seeds of uniform size and black poppy seeds of uniform size. Heel is 19 mm in thickness, the internaltexture is an open, slightly irregular grain and uniformly smooth across the surface. The integrity of toasted bun is maintained after toasting.
                        Internalappearance of both crown and heel are caramelzed to a medium brown color with the heel having the potentialto bea darker toast than the crown. Minimaldefects such as dents, wrinkles, crow feet are acceptable before and after toasting.</div>
                </div>
            </div>
            <div className="p-4">
            {/* Top 4-column header row */}
            {!isSubmitted ? <div className=" py-8 flex flex-wrap gap-6">
                {/* Select Product */}
                <div className="flex flex-col gap-1">
                    <label className="text-xl font-semibold pb-2 text-[#27272E]">Select Product</label>
                    <div className="relative">
                        <select
                            className="appearance-none border border-[#D1D5DC] rounded-md px-3 py-2 pr-8 bg-white text-sm text-[#27272E] min-w-[200px] cursor-pointer"
                            value={selectedProduct?.id ?? ""}
                            onChange={handleProductSelect}
                            disabled={productsLoading}
                        >
                            <option value="" disabled>{productsLoading ? "Loading…" : "Select a product"}</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <img src={DownIcon} alt="" className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4" />
                    </div>
                </div>

                {/* Select Batch */}
                <div className="flex flex-col gap-1">
                    <label className="text-xl font-semibold pb-2 text-[#27272E]">Select Batch</label>
                    <div className="relative">
                        <input
                            readOnly
                            value={batchId}
                            className="border border-[#D1D5DC] rounded-md px-3 py-2 pr-8 bg-[#F9FAFB] text-sm text-[#27272E] min-w-[180px] cursor-default"
                            placeholder="Generating…"
                        />
                        {/* <img src={DownIcon} alt="" className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" /> */}
                    </div>
                </div>

                {/* Select Sample */}
                <div className="flex flex-col gap-1">
                    <label className="text-xl font-semibold pb-2 text-[#27272E]">Select Sample</label>
                    <div className="relative">
                        <input
                            readOnly
                            value={sampleId}
                            className="border border-[#D1D5DC] rounded-md px-3 py-2 pr-8 bg-[#F9FAFB] text-sm text-[#27272E] min-w-[180px] cursor-default"
                            placeholder="Generating…"
                        />
                        {/* <img src={DownIcon} alt="" className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" /> */}
                    </div>
                </div>

                {/* Production Date */}
                <div className="flex flex-col gap-1">
                    <label className="text-xl font-semibold pb-2 text-[#27272E]">Production Date</label>
                    <input
                        type="date"
                        value={productionDate}
                        onChange={(e) => setProductionDate(e.target.value)}
                        className="border border-[#D1D5DC] rounded-md px-3 py-2 bg-white text-sm text-[#27272E] min-w-[180px]"
                    />
                </div>
            </div> : null}
            {isSubmitted ? <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8">
                        <div className="absolute inset-0 border-2 rounded-full border-[#FF5858]"></div>
                        <div className="absolute inset-1 border-2 rounded-full border-[#FF5858]"></div>
                        <div className="absolute inset-2 border-2 rounded-full border-[#FF5858]"></div>
                        <div className="absolute inset-3 border-2 rounded-full border-[#FF5858]"></div>
                    </div>
                    <div className="font-semibold text-lg">Sensory Section Analysis</div>
                </div>
            </div> : null}
            {!isSubmitted && mappingsLoading ? (
                <div className="px-4 py-4 text-sm text-gray-500">Loading questions…</div>
            ) : null}
            {!isSubmitted && selectedSection ? <div className="relative p-4">
                <div
                    className="flex gap-4 items-center cursor-pointer"
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                >
                    <img
                        src={DownIcon}
                        alt="toggle section"
                        className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                    />
                    <div className="flex flex-col">
                        <div className="text-lg font-semibold">{selectedSection}</div>
                        <div className="text-sm font-normal">{questions[selectedSection]?.subTitle}</div>
                    </div>
                </div>
                <div className={`${isDropdownOpen ? "block" : "hidden"} absolute left-4 top-full z-10 mt-2 min-w-[420px] bg-white border border-[#D1D5DC] rounded-md shadow-md`}>
                    {sectionKeys.map((section) => (
                        <div
                            key={section}
                            className="px-4 py-3 hover:bg-[#F9FAFB] cursor-pointer border-b border-[#E5E7EB] last:border-b-0"
                            onClick={() => {
                                setSelectedSection(section);
                                setIsDropdownOpen(false);
                            }}
                        >
                            <div className="text-base font-semibold">{section}</div>
                            <div className="text-sm text-[#6C757D]">{questions[section].subTitle}</div>
                        </div>
                    ))}
                </div>
            </div> : null}
            {!isSubmitted && selectedSection ? <div className="flex items-center gap-2">
                    <div className="relative w-6 h-6">
                        <div className="absolute inset-0 border-2 rounded-full"></div>
                        <div className="absolute inset-1 border-2 rounded-full"></div>
                        <div className="absolute inset-2 border-2 rounded-full"></div>
                    </div>
                    <div className="font-semibold text-base">Sensory Attributes</div>
                </div> : null}
            {!isSubmitted && selectedSection ? <div key={selectedSection} className="flex flex-col gap-4 p-4">
            {questions[selectedSection]?.list.map((q) => (
                <ScoreMarker
                    key={q.id}
                    question={q.question}
                    subtitle={q.subtitle}
                    score={scores[selectedSection]?.[q.id] ?? ""}
                    onScoreChange={(score) => handleScoreChange(selectedSection, q.id, score)}
                />
            ))}
            </div> : null}
            {!isSubmitted ? <EvidenceDocumentation/> : null}
            {!isSubmitted ? <div className="w-full flex justify-end px-4"><CustomButton handleSubmit={handleSubmit} title="Process the Report" rounded={true} type={"filled"} length="large"/></div> : null}
            </div>
           {isSubmitted ? <div className="p-4">
            <div className="flex justify-between items-center">
                <div className="font-bold text-2xl text-[#494949]">Select the score to fill in the scorecard</div>
                <CustomButton title="Add another sample" rounded={true} type="filled" length="large" />
            </div>
            <div className="flex-1 flex justify-end py-4 gap-6 items-center">
                <div className="font-bold text-[#494949]">SAMPLE CODE:</div>
                <div className="flex justify-center items-center text-xs bg-white h-[30px] w-[100px] rounded-md border border-[#E8E8E8]">{sampleId}</div>
            </div>
            <div className="flex flex-col gap-4">
                {submittedData.map((section, i) => (
                    <ScoreCard key={i} sectionTitle={section.sectionTitle} items={section.items} />
                ))}
            </div>
            </div> : null}
            {isSubmitted ? <div className="p-4 flex justify-end"><CustomButton title="Create report and quality metrics comparison" rounded={true} type="filled" length="extra" /></div> : null}
            


        </div>
    )
}