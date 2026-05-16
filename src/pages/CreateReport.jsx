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
                scaleType: m.scale_type || "standard",
                comments: m.comments_text || null,
            });
        }
    });
    return result;
}

const SCORE_PERCENT = { 1: 0, 2: 25, 3: 60, 4: 85, 5: 100, 6: 85, 7: 60, 8: 25, 9: 0 };
const SCORECARD_REVIEW_GRID = "minmax(104px, 120px) 338px repeat(4, minmax(108px, 1fr))";
const SCORECARD_REVIEW_GAP = "clamp(10px, 1.2vw, 18px)";
const SCORE_LEGEND = [
    { scale: "1", percentage: "0", remark: "NOT McD Quality", bgColor: "#EA3323", color: "#FFF" },
    { scale: "2", percentage: "25", remark: "Significant Difference", bgColor: "#EA3323", color: "#FFF" },
    { scale: "3", percentage: "60", remark: "Marginal", bgColor: "#FFFF54", color: "#000000" },
    { scale: "4", percentage: "85", remark: "Slight Difference", bgColor: "#FFFF54", color: "#000000" },
    { scale: "5", percentage: "100", remark: "Equal to TARGET", bgColor: "#52976A", color: "#FFFFFF" },
    { scale: "6", percentage: "85", remark: "Slight Difference", bgColor: "#FFFF54", color: "#000000" },
    { scale: "7", percentage: "60", remark: "Marginal", bgColor: "#FFFF54", color: "#000000" },
    { scale: "8", percentage: "25", remark: "Significant Difference", bgColor: "#EA3323", color: "#FFF" },
    { scale: "9", percentage: "0", remark: "NOT McD Quality", bgColor: "#EA3323", color: "#FFF" },
];

const APPEARANCE_GUIDANCE = `Fully baked soft roll that has a uniform deep medium brown color with a slight sheen (same target crown color as BB Big Mac). Bun is uniformly round and symmetrically straight wallels. Crowns are uniformly covered with white opaque sesame seeds of uniform size and black poppy seeds of uniform size. Heel is 19 mm in thickness, the internal texture is an open, slightly irregular grain and uniformly smooth across the surface. The integrity of toasted bun is maintained after toasting.
Internal appearance of both crown and heel are caramelized to a medium brown color with the heel having the potential to be darker toast than the crown. Minimal defects such as dents, wrinkles, crow feet are acceptable before and after toasting.`;

function calcQualityScore(scores) {
    const vals = Object.values(scores).flatMap(s => Object.values(s)).filter(s => s != null && s !== "");
    if (!vals.length) return null;
    const total = vals.reduce((sum, s) => sum + (SCORE_PERCENT[s] ?? 0), 0);
    return Math.round(total / vals.length);
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
    const [reason, setReason] = useState("");

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
        setAllSamples((prev) => [...prev, { sampleId, scores, evidenceItems }]);
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
        setEvidenceItems([]);
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
                description: reason.trim() || undefined,
                samples: samplesPayload,
            });
            const batch = res?.data?.data ?? null;
            const scorecardId = batch?.scorecard?.id;
            const allEvidence = allSamples.flatMap((s) => s.evidenceItems || []);
            if (scorecardId && allEvidence.length) {
                await Promise.all(allEvidence.map((item) => uploadScorecardAttachment(scorecardId, item.file)));
                setSuccessNote(`${allEvidence.length} evidence file${allEvidence.length === 1 ? "" : "s"} attached.`);
            } else if (allEvidence.length) {
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
        items: questions[section].list.map((q) => ({ question: q.question, score: null, scaleType: q.scaleType, comments: q.comments })),
        sampleScores: allSamples.map((s) => ({
            sampleId: s.sampleId,
            items: questions[section].list.map((q) => ({
                question: q.question,
                score: s.scores[section]?.[q.id] ?? null,
            })),
        })),
    }));

    const qualityScores = allSamples.map((s) => calcQualityScore(s.scores));
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

            {!isSubmitted ? (
                <div className="px-7 pb-2 pt-5">
                    <div className="max-w-[1040px] space-y-5 text-[12px] leading-5 text-[#494949]">
                        <div className="flex items-start gap-8">
                            <div className="w-[92px] shrink-0">Instruction :</div>
                            <div>Please evaluate the sample. For each attribute, indicate whether it exhibits more than, less than, or equal to the target.</div>
                        </div>

                        <div className="flex items-start gap-8">
                            <div className="w-[92px] shrink-0 pt-7">Sensory Score :<br />%QI</div>
                            <div className="flex flex-wrap items-end gap-1.5">
                                {SCORE_LEGEND.map((data) => (
                                    <div key={data.scale} className="flex w-[76px] flex-col items-center gap-1">
                                        <div className="h-8 text-center text-[10px] leading-[11px] text-[#27272E]">{data.remark}</div>
                                        <div
                                            className="flex h-[28px] w-[62px] items-center justify-center rounded-[3px] border border-black text-[12px] font-semibold"
                                            style={{ backgroundColor: data.bgColor, color: data.color }}
                                        >
                                            {data.scale}
                                        </div>
                                        <div className="text-[10px] text-[#494949]">{data.percentage}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-start gap-8">
                            <div className="w-[92px] shrink-0 pt-6 uppercase">Appearance</div>
                            <div className="max-w-[760px] whitespace-pre-line">{APPEARANCE_GUIDANCE}</div>
                        </div>
                    </div>
                </div>
            ) : null}

            <div className="px-7 pb-10 pt-5">
                {/* ── Page 1: scoring form ── */}
                {!isSubmitted ? (
                    <div className="grid max-w-[1140px] grid-cols-1 gap-7 pb-6 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[15px] font-semibold text-[#494949]">Select Product</label>
                            <div className="relative">
                                <select
                                    className="h-9 w-full appearance-none rounded-md border border-[#DDE2EA] bg-white px-3 pr-8 text-[13px] text-[#27272E] cursor-pointer"
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

                        <div className="flex flex-col gap-2">
                            <label className="text-[15px] font-semibold text-[#494949]">Select Batch</label>
                            <div className="relative">
                                <input readOnly value={batchId} className="h-9 w-full rounded-md border border-[#DDE2EA] bg-white px-3 pr-8 text-[13px] text-[#27272E]" placeholder="Generating…" />
                                <img src={DownIcon} alt="" className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[15px] font-semibold text-[#494949]">Select Sample</label>
                            <div className="relative">
                                <input readOnly value={sampleId} className="h-9 w-full rounded-md border border-[#DDE2EA] bg-white px-3 pr-8 text-[13px] text-[#27272E]" placeholder="Generating…" />
                                <img src={DownIcon} alt="" className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[15px] font-semibold text-[#494949]">Production Date</label>
                            <input
                                type="date"
                                value={productionDate}
                                onChange={(e) => setProductionDate(e.target.value)}
                                className="h-9 w-full rounded-md border border-[#DDE2EA] bg-white px-3 text-[13px] text-[#27272E]"
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
                    <div className="max-w-[970px] rounded-lg border border-[#E6E9EE] bg-white shadow-sm">
                        <div className="relative border-b border-[#E6E9EE]">
                            <div className="flex cursor-pointer items-center gap-4 px-5 py-5" onClick={() => setIsDropdownOpen((prev) => !prev)}>
                                <img src={DownIcon} alt="toggle" className={`h-4 w-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[16px] font-semibold text-[#27272E]">{selectedSection}</span>
                                        {incompleteSections.includes(selectedSection)
                                            ? <span className="text-[13px] font-medium text-[#FF5858]">Incomplete</span>
                                            : <span className="text-[13px] font-medium text-emerald-600">Done</span>
                                        }
                                    </div>
                                    <div className="text-[12px] font-normal text-[#6F7785]">{questions[selectedSection]?.subTitle}</div>
                                </div>
                            </div>
                            {isDropdownOpen ? (
                                <div className="absolute left-5 top-full z-10 mt-2 min-w-[420px] rounded-md border border-[#D1D5DC] bg-white shadow-md">
                                    {sectionKeys.map((section) => {
                                        const incomplete = incompleteSections.includes(section);
                                        return (
                                            <div
                                                key={section}
                                                className="cursor-pointer border-b border-[#E5E7EB] px-4 py-3 last:border-b-0 hover:bg-[#F9FAFB]"
                                                onClick={() => { setSelectedSection(section); setIsDropdownOpen(false); setSectionError(""); }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="text-base font-semibold">{section}</div>
                                                    {incomplete
                                                        ? <span className="text-[11px] font-medium text-red-500">Incomplete</span>
                                                        : <span className="text-[11px] font-medium text-emerald-600">Done</span>
                                                    }
                                                </div>
                                                <div className="text-sm text-[#6C757D]">{questions[section].subTitle}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : null}
                        </div>

                        <div className="flex items-center gap-2 px-5 pb-5 pt-10">
                            <div className="relative h-4 w-4">
                                <div className="absolute inset-0 rounded-full border border-[#27272E]"></div>
                                <div className="absolute inset-1 rounded-full border border-[#27272E]"></div>
                                <div className="absolute inset-2 rounded-full border border-[#27272E]"></div>
                            </div>
                            <div className="text-[14px] font-semibold text-[#27272E]">Sensory Attributes</div>
                        </div>

                        <div key={selectedSection} className="flex flex-col gap-5 px-5 pb-5">
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

                        <EvidenceDocumentation onChange={setEvidenceItems} />
                    </div>
                ) : null}

                {!isSubmitted ? (
                    <div className="flex w-full max-w-[970px] flex-col items-end gap-2 pt-9">
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
                <div className="px-4 pb-4 pt-2">
                    <div className="mx-auto max-w-[1220px]">
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-5">
                        <div className="font-bold text-[26px] leading-tight text-[#494949]">Select the score to fill in the scorecard</div>
                        <CustomButton
                            title="Add another sample"
                            rounded={true}
                            type="filled"
                            length="large"
                            handleSubmit={handleAddAnotherSample}
                            disabled={allSamples.length >= 4}
                        />
                    </div>

                    <div className="pb-1">
                    <div
                        className="grid items-center pb-4"
                        style={{
                            gridTemplateColumns: SCORECARD_REVIEW_GRID,
                            gap: SCORECARD_REVIEW_GAP,
                        }}
                    >
                        <div />
                        <div className="pr-1 text-right text-[13px] font-bold text-[#494949] tracking-wide">
                            SAMPLE CODES :
                        </div>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex h-10 items-center justify-center rounded-md border border-[#E0E4EA] bg-white px-3 text-[14px] font-medium text-[#494949]"
                            >
                                {allSamples[i]?.sampleId || ""}
                            </div>
                        ))}
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
                    <div
                        className="grid items-center py-8"
                        style={{
                            gridTemplateColumns: SCORECARD_REVIEW_GRID,
                            gap: SCORECARD_REVIEW_GAP,
                        }}
                    >
                        <div />
                        <div className="flex flex-col items-end pr-2">
                            <div className="text-[16px] font-bold text-[#202124]">Product Quality Score</div>
                            <div className="text-[13px] text-[#8A929E]">(Value furthest away from target)</div>
                        </div>
                        {Array.from({ length: 4 }).map((_, si) => {
                            const qScore = qualityScores[si] ?? null;
                            return (
                                <div key={si} className="flex h-[52px] items-center justify-center gap-1 rounded-[8px] border-2 border-[#202124] bg-white text-[18px] font-bold text-[#202124]">
                                    {qScore != null ? (
                                        <>{qScore}&nbsp;<span className="font-bold">%</span></>
                                    ) : ""}
                                </div>
                            );
                        })}
                    </div>
                    </div>
                    </div>
                </div>
            ) : null}

            {isSubmitted ? (
                <div className="p-4">
                    <div className="mt-4">
                        <div className="text-sm font-semibold text-[#202124] mb-2">Reason</div>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Enter here"
                            className="w-full min-h-[80px] resize-y rounded-lg border border-[#D1D5DC] bg-white px-3 py-3 text-sm text-[#202124] outline-none placeholder:text-[#9AA3B2]"
                        />
                    </div>
                    {submitError ? <p className="text-sm text-red-600 text-right mb-3">{submitError}</p> : null}
                    <div className="flex justify-end mt-4">
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
