import PageHeading from "../components/PageHeading";
import ScoreMarker from "../components/ScoreMarker";
import DownIcon from "../assets/DownIcon.svg"
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ScoreCard from "../components/ScoreCard";
import CustomButton from "../components/CustomButton";
import EvidenceDocumentation from "../components/EvidenceDocumentation";
import { getProducts } from "../api/productsApi";
import { getScorecardMappings } from "../api/scorecardsApi";
import { createReport, generateIds } from "../api/batchesApi";
import { uploadScorecardAttachment } from "../api/scorecardsApi";
import { useUser } from "../contexts/UserContext";

function normalizeMappings(mappings) {
    const result = {};
    mappings.forEach((m) => {
        const section = m.attribute_section || "Sensory Attributes";
        const attributeId = m.attribute;
        const rowId = m.question || attributeId;
        if (!result[section]) result[section] = { subTitle: section, list: [] };
        const exists = result[section].list.some(
            (q) => q.id === rowId && q.attributeId === attributeId
        );
        if (!exists) {
            result[section].list.push({
                id: rowId,
                attributeId,
                question: (m.attribute_name || "").trim(),
                subtitle: m.question_text || "",
            });
        }
    });
    return result;
}

const SCORE_PERCENT = { 1: 0, 2: 25, 3: 60, 4: 85, 5: 100, 6: 85, 7: 60, 8: 25, 9: 0 };
const TARGET = 5;

function calcQualityScore(scores) {
    const vals = Object.values(scores).flatMap(s => Object.values(s)).filter(s => s != null && s !== "");
    if (!vals.length) return null;
    const total = vals.reduce((sum, s) => sum + (SCORE_PERCENT[s] ?? 0), 0);
    return Math.round(total / vals.length);
}

function calcRiskFlag(scores) {
    const vals = Object.values(scores).flatMap(s => Object.values(s)).filter(s => s != null && s !== "");
    if (!vals.length) return null;
    const worst = vals.reduce((w, s) => Math.abs(s - TARGET) > Math.abs(w - TARGET) ? s : w);
    if ([1, 2, 8, 9].includes(worst)) return { label: "High", color: "#EF4444" };
    if ([3, 7].includes(worst)) return { label: "Medium", color: "#F59E0B" };
    return { label: "Low", color: "#16A34A" };
}

export default function CreateReport() {
    const navigate = useNavigate();
    const { user } = useUser();
    const submittingRef = useRef(false);
    const [selectedSection, setSelectedSection] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productsLoading, setProductsLoading] = useState(true);

    const [batchId, setBatchId] = useState("");
    const [sampleId, setSampleId] = useState("");
    const [productionDate, setProductionDate] = useState(() => new Date().toISOString().split("T")[0]);

    const [questions, setQuestions] = useState({});
    const [mappingsLoading, setMappingsLoading] = useState(false);
    const [scores, setScores] = useState({});

    // allSamples: [{ sampleId, scores }]
    const [allSamples, setAllSamples] = useState([]);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const [submitError, setSubmitError] = useState("");
    const [createdBatch, setCreatedBatch] = useState(null);
    const [successNote, setSuccessNote] = useState("");
    const [evidenceItems, setEvidenceItems] = useState([]);
    const [submitting, setSubmitting] = useState(false);

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
        setAllSamples([]);
        setIsSubmitted(false);
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

    const sectionKeys = Object.keys(questions);

    const incompleteSections = sectionKeys.filter((section) =>
        (questions[section]?.list ?? []).some(
            (q) => scores[section]?.[q.id] == null || scores[section][q.id] === ""
        )
    );
    const isSampleComplete = sectionKeys.length > 0 && incompleteSections.length === 0;

    const [sectionError, setSectionError] = useState("");

    function handleSubmit() {
        if (!isSampleComplete) {
            const first = incompleteSections[0];
            setSelectedSection(first);
            setSectionError(`Score all attributes in "${first}" before proceeding.`);
            return;
        }
        setSectionError("");
        setAllSamples((prev) => [...prev, { sampleId, scores }]);
        setIsSubmitted(true);
    }

    function buildNextSampleId(base, nextNumber) {
        // Replace trailing digits with nextNumber: "SAMPLE_001" + 2 → "SAMPLE_002"
        const match = base.match(/^(.*?)(\d+)$/);
        if (match) {
            const prefix = match[1];
            const width = match[2].length;
            return `${prefix}${String(nextNumber).padStart(width, "0")}`;
        }
        return `${base}-${nextNumber}`;
    }

    function handleAddAnotherSample() {
        // Derive next sample ID locally — API always returns SAMPLE_001 because
        // the batch doesn't exist in DB yet (created only on final submit).
        const firstSampleId = allSamples[0]?.sampleId ?? sampleId;
        // allSamples.length is the count of already-saved samples; next is length + 1
        const nextId = buildNextSampleId(firstSampleId, allSamples.length + 1);
        setSampleId(nextId);
        setScores({});
        setIsSubmitted(false);
    }

    const handleCreateReport = async () => {
        if (submittingRef.current || createdBatch) return;
        setSubmitError("");
        setCreatedBatch(null);
        setSuccessNote("");

        if (!selectedProduct) {
            setSubmitError("Select a product before creating the report.");
            return;
        }
        if (!batchId) {
            setSubmitError("Batch ID is still being generated. Try again in a moment.");
            return;
        }

        const samplesPayload = allSamples.map((s) => ({
            sample_id: s.sampleId,
            sensory_attributes: Object.keys(questions).flatMap((section) =>
                questions[section].list
                    .filter((q) => s.scores[section]?.[q.id] != null)
                    .map((q) => ({
                        attribute_id: q.attributeId,
                        score: Number(s.scores[section][q.id]),
                    }))
            ),
        }));

        if (!samplesPayload.length || samplesPayload.every((s) => !s.sensory_attributes.length)) {
            setSubmitError("Score at least one attribute before creating the report.");
            return;
        }

        submittingRef.current = true;
        setSubmitting(true);
        try {
            const res = await createReport({
                batch_id: batchId,
                product_id: selectedProduct.id,
                region: user?.region_id || undefined,
                sku: selectedProduct.sku || "",
                production_date: productionDate,
                samples: samplesPayload,
            });
            const batch = res?.data?.data ?? null;
            const scorecardId = batch?.scorecard?.id;
            if (scorecardId && evidenceItems.length) {
                await Promise.all(evidenceItems.map((item) => uploadScorecardAttachment(scorecardId, item.file)));
                setSuccessNote(`${evidenceItems.length} evidence file${evidenceItems.length === 1 ? "" : "s"} attached.`);
            } else if (evidenceItems.length) {
                setSuccessNote("Report submitted, but no scorecard ID was returned for evidence upload.");
            }
            setCreatedBatch(batch);
        } catch (err) {
            submittingRef.current = false;
            setSubmitError(err?.message || "Failed to create report.");
        } finally {
            setSubmitting(false);
        }
    };

    // Build per-section display data for ScoreCard (all samples)
    const allSectionsForDisplay = sectionKeys.map((section) => ({
        sectionTitle: section,
        items: questions[section].list.map((q) => ({ question: q.question, score: null })),
        sampleScores: allSamples.map((s) => ({
            sampleId: s.sampleId,
            items: questions[section].list.map((q) => ({
                question: q.question,
                score: s.scores[section]?.[q.id] ?? null,
            })),
        })),
    }));

    const qualityScores = allSamples.map((s) => calcQualityScore(s.scores));
    const riskFlags = allSamples.map((s) => calcRiskFlag(s.scores));

    const paramData = [
        { scale: "1", percentage: "0",   remark: "NOT McD Quality",       bgColor: "#EA3323", color: "#FFF" },
        { scale: "2", percentage: "25",  remark: "Significant Difference", bgColor: "#EA3323", color: "#FFF" },
        { scale: "3", percentage: "60",  remark: "Marginal",               bgColor: "#FFFF54", color: "#000000" },
        { scale: "4", percentage: "85",  remark: "Slight Difference",      bgColor: "#FFFF54", color: "#000000" },
        { scale: "5", percentage: "100", remark: "Equal to TARGET",        bgColor: "#52976A", color: "#000000" },
        { scale: "4", percentage: "85",  remark: "Slight Difference",      bgColor: "#FFFF54", color: "#000000" },
        { scale: "3", percentage: "60",  remark: "Marginal",               bgColor: "#FFFF54", color: "#000000" },
        { scale: "2", percentage: "25",  remark: "Significant Difference", bgColor: "#EA3323", color: "#FFF" },
        { scale: "1", percentage: "0",   remark: "NOT McD Quality",        bgColor: "#EA3323", color: "#FFF" },
    ];

    if (createdBatch) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10">
                <div className="w-full max-w-[720px] rounded-[18px] border border-[#E5E7EB] bg-white px-8 py-12 text-center shadow-[0_18px_50px_rgba(17,24,39,0.08)]">
                    <div className="mx-auto mb-8 flex h-40 w-40 items-center justify-center rounded-full bg-[#63C482]">
                        <svg aria-hidden="true" viewBox="0 0 64 64" className="h-24 w-24" fill="none">
                            <path d="M18 33.5 28 43.5 47 20.5" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h1 className="text-[38px] font-bold leading-tight text-[#111827]">Submitted successfully</h1>
                    <p className="mt-3 text-sm text-[#6B7280]">
                        Batch {createdBatch.batch_number || batchId} created — {allSamples.length} sample{allSamples.length !== 1 ? "s" : ""}.
                    </p>
                    {successNote ? <p className="mt-2 text-sm text-[#6B7280]">{successNote}</p> : null}
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="mt-8 h-12 rounded-md bg-[#E5322D] px-8 text-base font-semibold text-white transition-colors hover:bg-[#C82420]"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageHeading title={"Create a Report"} />

            <div className="text-[14px] text-[#494949] leading-6 flex flex-col gap-4 p-4">
                <div className="flex items-center">
                    <div className="w-[125px]">Instruction :</div>
                    <div>Please evaluate the sample. For each attribute, indicate whether it exhibits more than, less than, or equal to the target.</div>
                </div>
                <div className="flex items-center">
                    <div className="w-[125px]">Sensory Score :</div>
                    <div className="flex-1 flex items-center justify-between">
                        {paramData.map((data, index) => (
                            <div key={index} className="flex flex-col gap-4 justify-center items-center">
                                <div className="text-center flex items-center h-10 text-xs">{data.remark}</div>
                                <div
                                    className="w-[80px] h-[35px] rounded-md border px-6 py-2 flex justify-center items-center"
                                    style={{ backgroundColor: data.bgColor, color: data.color }}
                                >
                                    {data.scale}
                                </div>
                                <div>{data.percentage}%</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-4">
                {/* ── Page 1: scoring form ── */}
                {!isSubmitted ? (
                    <div className="py-8 flex flex-wrap gap-6">
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

                        <div className="flex flex-col gap-1">
                            <label className="text-xl font-semibold pb-2 text-[#27272E]">Batch</label>
                            <input readOnly value={batchId} className="border border-[#D1D5DC] rounded-md px-3 py-2 bg-[#F9FAFB] text-sm text-[#27272E] min-w-[180px]" placeholder="Generating…" />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xl font-semibold pb-2 text-[#27272E]">
                                {allSamples.length > 0 ? `Sample ${allSamples.length + 1}` : "Sample"}
                            </label>
                            <input readOnly value={sampleId} className="border border-[#D1D5DC] rounded-md px-3 py-2 bg-[#F9FAFB] text-sm text-[#27272E] min-w-[180px]" placeholder="Generating…" />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xl font-semibold pb-2 text-[#27272E]">Production Date</label>
                            <input
                                type="date"
                                value={productionDate}
                                onChange={(e) => setProductionDate(e.target.value)}
                                className="border border-[#D1D5DC] rounded-md px-3 py-2 bg-white text-sm text-[#27272E] min-w-[180px]"
                            />
                        </div>
                    </div>
                ) : null}

                {isSubmitted ? (
                    <div className="flex items-center gap-2 mb-4">
                        <div className="relative w-8 h-8">
                            <div className="absolute inset-0 border-2 rounded-full border-[#FF5858]"></div>
                            <div className="absolute inset-1 border-2 rounded-full border-[#FF5858]"></div>
                            <div className="absolute inset-2 border-2 rounded-full border-[#FF5858]"></div>
                            <div className="absolute inset-3 border-2 rounded-full border-[#FF5858]"></div>
                        </div>
                        <div className="font-semibold text-lg">Sensory Section Analysis</div>
                    </div>
                ) : null}

                {!isSubmitted && mappingsLoading ? (
                    <div className="px-4 py-4 text-sm text-gray-500">Loading questions…</div>
                ) : null}

                {!isSubmitted && selectedSection ? (
                    <div className="relative p-4">
                        <div className="flex gap-4 items-center cursor-pointer" onClick={() => setIsDropdownOpen((prev) => !prev)}>
                            <img src={DownIcon} alt="toggle" className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-semibold">{selectedSection}</span>
                                    {incompleteSections.includes(selectedSection)
                                        ? <span className="text-[11px] text-red-500 font-medium">Incomplete</span>
                                        : <span className="text-[11px] text-emerald-600 font-medium">✓ Done</span>
                                    }
                                </div>
                                <div className="text-sm font-normal">{questions[selectedSection]?.subTitle}</div>
                            </div>
                        </div>
                        {isDropdownOpen ? (
                            <div className="absolute left-4 top-full z-10 mt-2 min-w-[420px] bg-white border border-[#D1D5DC] rounded-md shadow-md">
                                {sectionKeys.map((section) => {
                                    const incomplete = incompleteSections.includes(section);
                                    return (
                                        <div
                                            key={section}
                                            className="px-4 py-3 hover:bg-[#F9FAFB] cursor-pointer border-b border-[#E5E7EB] last:border-b-0"
                                            onClick={() => { setSelectedSection(section); setIsDropdownOpen(false); setSectionError(""); }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="text-base font-semibold">{section}</div>
                                                {incomplete
                                                    ? <span className="text-[11px] text-red-500 font-medium">Incomplete</span>
                                                    : <span className="text-[11px] text-emerald-600 font-medium">✓ Done</span>
                                                }
                                            </div>
                                            <div className="text-sm text-[#6C757D]">{questions[section].subTitle}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>
                ) : null}

                {!isSubmitted && selectedSection ? (
                    <div className="flex items-center gap-2">
                        <div className="relative w-6 h-6">
                            <div className="absolute inset-0 border-2 rounded-full"></div>
                            <div className="absolute inset-1 border-2 rounded-full"></div>
                            <div className="absolute inset-2 border-2 rounded-full"></div>
                        </div>
                        <div className="font-semibold text-base">Sensory Attributes</div>
                    </div>
                ) : null}

                {!isSubmitted && selectedSection ? (
                    <div key={selectedSection} className="flex flex-col gap-4 p-4">
                        {questions[selectedSection]?.list.map((q) => (
                            <ScoreMarker
                                key={q.id}
                                question={q.question}
                                subtitle={q.subtitle}
                                score={scores[selectedSection]?.[q.id] ?? ""}
                                onScoreChange={(score) => handleScoreChange(selectedSection, q.id, score)}
                            />
                        ))}
                    </div>
                ) : null}

                {!isSubmitted ? <EvidenceDocumentation onChange={setEvidenceItems} /> : null}

                {!isSubmitted ? (
                    <div className="w-full flex flex-col items-end px-4 gap-2">
                        {sectionError && (
                            <p className="text-sm text-red-600">{sectionError}</p>
                        )}
                        {!isSampleComplete && sectionKeys.length > 0 && !sectionError && (
                            <p className="text-sm text-[#6C757D]">
                                Score all attributes in every section to proceed.
                                {incompleteSections.length > 0 && ` Remaining: ${incompleteSections.join(", ")}.`}
                            </p>
                        )}
                        <CustomButton
                            handleSubmit={handleSubmit}
                            title="Process the Report"
                            rounded={true}
                            type="filled"
                            length="large"
                            disabled={!isSampleComplete}
                        />
                    </div>
                ) : null}
            </div>

            {/* ── Page 2: review scorecard ── */}
            {isSubmitted ? (
                <div className="p-4">
                    <div className="flex justify-between items-center">
                        <div className="font-bold text-2xl text-[#494949]">Select the score to fill in the scorecard</div>
                        <CustomButton
                            title="Add another sample"
                            rounded={true}
                            type="filled"
                            length="large"
                            handleSubmit={handleAddAnotherSample}
                            disabled={allSamples.length >= 4}
                        />
                    </div>

                    {/* Per-sample quality + risk summary */}
                    <div className="flex flex-wrap gap-4 py-4">
                        {allSamples.map((s, i) => {
                            const qScore = qualityScores[i];
                            const risk = riskFlags[i];
                            return (
                                <div key={i} className="flex items-center gap-3 rounded-lg border border-[#E6E9EE] bg-[#FBFCFD] px-4 py-3">
                                    <div className="text-xs font-semibold text-[#202124]">{s.sampleId || `Sample ${i + 1}`}</div>
                                    {qScore != null && (
                                        <div className="text-xs text-[#6C757D]">
                                            Quality: <span className="font-bold text-[#DB2F28]">{qScore}%</span>
                                        </div>
                                    )}
                                    {risk && (
                                        <div className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ color: risk.color, backgroundColor: `${risk.color}18` }}>
                                            {risk.label} Risk
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* ScoreCard per section showing all samples */}
                    <div className="flex flex-col gap-4">
                        {allSectionsForDisplay.map((sec, i) => (
                            <ScoreCard
                                key={i}
                                sectionTitle={sec.sectionTitle}
                                items={sec.items}
                                allSamples={sec.sampleScores}
                            />
                        ))}
                    </div>

                    {/* Product Quality Score row */}
                    <div className="mt-6 grid items-center p-4 border border-transparent"
                        style={{ gridTemplateColumns: "180px 1fr repeat(4, 100px)", gap: "16px" }}>
                        <div />
                        <div className="flex flex-col items-end pr-2">
                            <div className="text-[13px] font-bold text-[#202124]">Product Quality Score</div>
                            <div className="text-xs text-[#6C757D]">(Value furthest away from target)</div>
                        </div>
                        {Array.from({ length: 4 }).map((_, si) => {
                            const qScore = qualityScores[si] ?? null;
                            return (
                                <div key={si} className="flex justify-center items-center gap-1 h-[50px] rounded-xl border-2 border-[#202124] bg-white text-sm font-medium text-[#202124]">
                                    {qScore != null ? (
                                        <>{qScore}&nbsp;<span className="font-bold">%</span></>
                                    ) : ""}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : null}

            {isSubmitted ? (
                <div className="p-4">
                    {submitError ? <p className="text-sm text-red-600 text-right mb-3">{submitError}</p> : null}
                    <div className="flex justify-end">
                        <CustomButton
                            title={submitting ? "Creating..." : "Create report and quality metrics comparison"}
                            rounded={true}
                            type="filled"
                            length="extra"
                            handleSubmit={handleCreateReport}
                            disabled={submitting || Boolean(createdBatch)}
                        />
                    </div>
                </div>
            ) : null}
        </div>
    );
}
