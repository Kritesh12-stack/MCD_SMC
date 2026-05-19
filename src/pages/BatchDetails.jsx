import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import PageHeading from "../components/PageHeading";
import Docs from "../assets/Docs.svg";
import TickCircle from "../assets/TickCircle.svg";
import HorizontalBarChartCard from "../components/HorizontalBarChartCard";
import QualityMetricsComparison from "../components/QualityMetricsComparison";
import SensoryRadarChart, { DEFAULT_SENSORY_AXES } from "../components/SensoryRadarChart";
import {
    addBatchComment,
    addBatchSubmission,
    getBatch,
    getBatchCharts,
    marketReviewBatch,
    regionalReviewBatch,
    submitBatch,
} from "../api/batchesApi";
import {
    exportScorecardReport,
    generateScorecardReport,
    getScorecardReport,
} from "../api/scorecardsApi";
import { useUser } from "../contexts/UserContext";

const FALLBACK_BATCH = {
    batch_number: "12345/12/A12",
    product_name: "American Cheese Slices",
    supplier_name: "Salamonca",
    sku: "American Cheese Slices",
    quantity: 10,
    production_date: "2025-02-19",
    created_at: "2025-02-19T17:34:00Z",
    status: "Approved",
    risk_level: "Low",
    description:
        "Batch meets all quality parameters. Color uniform, texture consistent, slices intact, no visible defects. Score above acceptance threshold. Production sheet verified and compliant.",
    overall_score: "4.48",
    scorecard: {
        batch_overall_score: "4.48",
        target_score: "5.00",
        deviation_category: "Accept",
        evaluator_email: "mike.chen@example.com",
        sample_ids: ["SMPL-0003-A", "SMPL-0003-B"],
    },
    sensory_attribute_data: [
        {
            section: "Appearance",
            attributes: [
                {
                    attribute_id: "color",
                    attribute_name: "Color Uniformity",
                    data: [{ sample_id: "SAMPLE_001", score: 5, percentage: 100, degree_of_difference: 0 }],
                },
                {
                    attribute_id: "surface",
                    attribute_name: "Surface Sheen",
                    data: [{ sample_id: "SAMPLE_001", score: 4, percentage: 85, degree_of_difference: 1 }],
                },
            ],
        },
    ],
};

function display(value, fallback = "-") {
    return value === null || value === undefined || value === "" ? fallback : value;
}

function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function average(numbers) {
    const vals = numbers.filter((n) => typeof n === "number" && !Number.isNaN(n));
    if (!vals.length) return null;
    return vals.reduce((sum, n) => sum + n, 0) / vals.length;
}

function formatNumber(value, digits = 1) {
    const num = Number(value);
    if (Number.isNaN(num)) return "-";
    return num.toFixed(digits).replace(/\.0$/, "");
}

function statusTone(status) {
    const raw = String(status || "").toLowerCase();
    if (raw.includes("approv") || raw.includes("accept")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (raw.includes("reject")) return "bg-red-50 text-red-700 border-red-200";
    if (raw.includes("correction")) return "bg-amber-50 text-amber-800 border-amber-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
}

const BATCH_STATUS_LABEL = {
    Pending:               "Pending",
    Draft:                 "Draft",
    Submitted:             "Submitted",
    UnderMarketQAReview:   "Under Market QA Review",
    UnderRegionalQAReview: "Under Regional QA Review",
    Escalated:             "Escalated",
    CorrectionRequired:    "Correction Required",
    Approved:              "Approved",
    Rejected:              "Rejected",
};

function batchStatusLabel(status) {
    return BATCH_STATUS_LABEL[status] ?? status ?? "-";
}

function canMarketReviewStatus(status) {
    return ["Pending", "Submitted", "UnderMarketQAReview", "Escalated"].includes(status);
}

function canRegionalReviewStatus(status) {
    return ["Pending", "Submitted", "UnderRegionalQAReview"].includes(status);
}

function canSubmitCorrectionStatus(status) {
    return ["Draft", "Pending", "CorrectionRequired"].includes(status);
}

function buildSectionRows(section) {
    return (section?.attributes || []).map((attribute) => {
        const samples = attribute.data || [];
        const scores = samples.map((item) => Number(item.score));
        const percentages = samples.map((item) => Number(item.percentage));
        const differences = samples.map((item) => Number(item.degree_of_difference));
        const high = scores.length ? Math.max(...scores) : null;
        const low = scores.length ? Math.min(...scores) : null;

        return {
            name: attribute.attribute_name,
            score: average(scores),
            pqi: average(percentages),
            diff: average(differences),
            high,
            low,
            range: high !== null && low !== null ? high - low : null,
        };
    });
}


export default function BatchDetails() {
    const { id } = useParams();
    const { user } = useUser();
    const [batch, setBatch] = useState(id ? null : FALLBACK_BATCH);
    const [chartsData, setChartsData] = useState(null);
    const [loading, setLoading] = useState(Boolean(id));
    const [error, setError] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [scoreDropdownOpen, setScoreDropdownOpen] = useState(false);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewLoading, setReviewLoading] = useState("");
    const [reviewMessage, setReviewMessage] = useState("");
    const [reviewError, setReviewError] = useState("");
    const [regionalComment, setRegionalComment] = useState("");
    const [regionalLoading, setRegionalLoading] = useState("");
    const [regionalMessage, setRegionalMessage] = useState("");
    const [regionalError, setRegionalError] = useState("");
    const [correctionReason, setCorrectionReason] = useState("");
    const [correctionDetails, setCorrectionDetails] = useState("");
    const [correctionLoading, setCorrectionLoading] = useState(false);
    const [correctionMessage, setCorrectionMessage] = useState("");
    const [correctionError, setCorrectionError] = useState("");
    const [noteText, setNoteText] = useState("");
    const [noteScope, setNoteScope] = useState("all");
    const [noteLoading, setNoteLoading] = useState(false);
    const [noteMessage, setNoteMessage] = useState("");
    const [noteError, setNoteError] = useState("");
    const [reportLoading, setReportLoading] = useState("");
    const [reportMessage, setReportMessage] = useState("");
    const [reportError, setReportError] = useState("");

    const loadBatch = useCallback(async ({ silent = false } = {}) => {
        if (!id) return;
        if (!silent) setLoading(true);
        setError("");
        const [batchRes, chartsRes] = await Promise.allSettled([getBatch(id), getBatchCharts(id)]);
        const nextBatch = batchRes.status === "fulfilled" ? batchRes.value?.data?.data : null;
        setBatch(nextBatch || FALLBACK_BATCH);
        if (chartsRes.status === "fulfilled") setChartsData(chartsRes.value?.data?.data || null);
        if (!silent) setLoading(false);
    }, [id]);

    useEffect(() => {
        if (!id) return;
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError("");
            try {
                const [batchRes, chartsRes] = await Promise.allSettled([getBatch(id), getBatchCharts(id)]);
                if (cancelled) return;
                const nextBatch = batchRes.status === "fulfilled" ? batchRes.value?.data?.data : null;
                if (!nextBatch && batchRes.status === "rejected") {
                    setError(batchRes.reason?.message || "Failed to load batch details.");
                }
                setBatch(nextBatch || FALLBACK_BATCH);
                if (chartsRes.status === "fulfilled") setChartsData(chartsRes.value?.data?.data || null);
            } catch (err) {
                if (cancelled) return;
                setError(err?.message || "Failed to load batch details.");
                setBatch(FALLBACK_BATCH);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [id]);

    const sections = useMemo(() => batch?.sensory_attribute_data || [], [batch]);
    const sectionNames = sections.map((section) => section.section);
    const activeSectionName = selectedSection || sectionNames[0] || "";
    const activeSection = sections.find((section) => section.section === activeSectionName) || sections[0];
    const rows = useMemo(() => buildSectionRows(activeSection), [activeSection]);
    const scorecard = batch?.scorecard || {};
    const avgQualityIndex = average(rows.map((row) => row.pqi));
    const isMarketReviewer = ["MarketQA", "Admin"].includes(user?.role);
    const isRegionalReviewer = ["RegionalQA", "Admin"].includes(user?.role);
    const canSubmitCorrection = ["Vendor", "DC", "MarketQA", "Admin"].includes(user?.role) && canSubmitCorrectionStatus(batch?.status);
    const canMarketReview = Boolean(id && isMarketReviewer && canMarketReviewStatus(batch?.status));
    const canRegionalReview = Boolean(id && isRegionalReviewer && canRegionalReviewStatus(batch?.status));
    const scorecardId = scorecard?.id;

    async function handleMarketReview(action) {
        if (!id || reviewLoading) return;
        setReviewError("");
        setReviewMessage("");
        setReviewLoading(action);
        try {
            const res = await marketReviewBatch(id, {
                action,
                comment: reviewComment.trim(),
            });
            const updatedBatch = res?.data?.data;
            if (updatedBatch) setBatch(updatedBatch);
            setReviewComment("");
            setReviewMessage(`Batch ${action.replace("_", " ")} completed successfully.`);
            await loadBatch({ silent: true });
        } catch (err) {
            setReviewError(err?.message || "Failed to update batch status.");
        } finally {
            setReviewLoading("");
        }
    }

    async function handleRegionalReview(action) {
        if (!id || regionalLoading) return;
        setRegionalError("");
        setRegionalMessage("");
        setRegionalLoading(action);
        try {
            const res = await regionalReviewBatch(id, {
                action,
                comment: regionalComment.trim(),
            });
            const updatedBatch = res?.data?.data;
            if (updatedBatch) setBatch(updatedBatch);
            setRegionalComment("");
            setRegionalMessage(`Regional QA ${action.replace("_", " ")} completed successfully.`);
            await loadBatch({ silent: true });
        } catch (err) {
            setRegionalError(err?.message || "Failed to update regional review.");
        } finally {
            setRegionalLoading("");
        }
    }

    async function handleCorrectionSubmit() {
        if (!id || correctionLoading) return;
        setCorrectionError("");
        setCorrectionMessage("");
        setCorrectionLoading(true);
        try {
            await addBatchSubmission(id, {
                submission_type: batch?.status === "CorrectionRequired" ? "CorrectionResponse" : "SupplierSheet",
                batch_details: correctionDetails.trim(),
                production_date: batch?.production_date || null,
                sku: batch?.sku || "",
                quantity: batch?.quantity || null,
                reason: correctionReason.trim(),
                evidence_metadata: [],
            });
            const res = await submitBatch(id, {
                comment: correctionReason.trim() || "Submitted for QA review.",
            });
            const updatedBatch = res?.data?.data;
            if (updatedBatch) setBatch(updatedBatch);
            setCorrectionReason("");
            setCorrectionDetails("");
            setCorrectionMessage("Batch submitted back to QA review.");
            await loadBatch({ silent: true });
        } catch (err) {
            setCorrectionError(err?.message || "Failed to submit correction response.");
        } finally {
            setCorrectionLoading(false);
        }
    }

    async function handleGenerateReport() {
        if (!scorecardId || reportLoading) return;
        setReportError("");
        setReportMessage("");
        setReportLoading("generate");
        try {
            await generateScorecardReport(scorecardId);
            setReportMessage("Scorecard report generated.");
        } catch (err) {
            setReportError(err?.message || "Failed to generate scorecard report.");
        } finally {
            setReportLoading("");
        }
    }

    async function handleExportReport() {
        if (!scorecardId || reportLoading) return;
        setReportError("");
        setReportMessage("");
        setReportLoading("export");
        try {
            let reportId = scorecard?.report?.id;
            if (!reportId) {
                const res = await getScorecardReport(scorecardId).catch(() => generateScorecardReport(scorecardId));
                reportId = res?.data?.data?.id;
            }
            if (!reportId) throw new Error("Report ID was not returned.");
            const res = await exportScorecardReport(reportId);
            const url = URL.createObjectURL(res.data);
            const a = document.createElement("a");
            a.href = url;
            a.download = `scorecard_report_${batch?.batch_number || scorecardId}.json`;
            a.click();
            URL.revokeObjectURL(url);
            setReportMessage("Scorecard report exported.");
        } catch (err) {
            setReportError(err?.message || "Failed to export scorecard report.");
        } finally {
            setReportLoading("");
        }
    }

    async function handleAddNote() {
        if (!id || !noteText.trim() || noteLoading) return;
        setNoteError("");
        setNoteMessage("");
        setNoteLoading(true);
        try {
            await addBatchComment(id, { comment: noteText.trim(), scope: noteScope });
            setNoteText("");
            setNoteMessage("Comment sent.");
        } catch (err) {
            setNoteError(err?.message || "Failed to send comment.");
        } finally {
            setNoteLoading(false);
        }
    }

    useEffect(() => {
        if (!selectedSection && sectionNames[0]) setSelectedSection(sectionNames[0]);
    }, [selectedSection, sectionNames]);

    if (loading && !batch) {
        return (
            <div>
                <PageHeading title="Batch Details" />
                <div className="px-6 py-10 text-sm text-[#6F7785]">Loading batch details...</div>
            </div>
        );
    }

    return (
        <div>
            <PageHeading title="Batch Details" />
            <div className="flex gap-4 p-4">
                <div className="border p-4 bg-[#FAFAFA] border-[#E8E8E8] rounded-2xl w-2/3">
                    <div className="text-xl text-[#434343] font-semibold pb-6">Batch Details</div>
                    <div className="flex text-sm items-center justify-between w-full text-[#494949] pb-1">
                        <div className="font-bold">Batch</div>
                        <div className="font-medium">{formatDate(batch?.created_at)}</div>
                    </div>
                    <div className="flex text-sm items-center justify-between w-full text-[#494949] pb-4">
                        <div className="font-medium">{display(batch?.batch_number)}</div>
                    </div>
                    <div className="flex text-sm items-center justify-between w-full text-[#494949] pb-1">
                        <div className="font-bold">Product Name</div>
                        <div className="font-bold">Supplier Name</div>
                    </div>
                    <div className="flex text-sm items-center justify-between w-full text-[#494949] pb-4">
                        <div className="font-medium">{display(batch?.product_name)}</div>
                        <div className="font-medium">{display(batch?.supplier_name)}</div>
                    </div>
                    <div className="flex text-sm items-center justify-between w-full text-[#494949] pb-1">
                        <div className="font-bold">SKU</div>
                        <div className="font-bold">Status</div>
                    </div>
                    <div className="flex text-sm items-center justify-between w-full text-[#494949] pb-4">
                        <div className="font-medium">{display(batch?.sku)}</div>
                        <span className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${statusTone(batch?.status)}`}>
                            {batchStatusLabel(batch?.status)}
                        </span>
                    </div>
                    <div className="flex text-sm items-center justify-between w-full text-[#494949] pb-1">
                        <div className="font-bold">Batch Quantity</div>
                        <div className="font-bold">Risk Flag</div>
                    </div>
                    <div className="flex text-sm items-center justify-between w-full text-[#494949] pb-4">
                        <div className="font-medium">{display(batch?.quantity)}</div>
                        <div className="font-medium">{display(batch?.risk_level)}</div>
                    </div>
                    <div className="flex text-sm items-center justify-between w-full text-[#494949] pb-1">
                        <div className="font-bold">Attached Pictures</div>
                    </div>
                    {(() => {
                        const attachments = (batch?.scorecard?.media || []).map((item) => ({ key: item.id, url: item.url, label: item.filename }));
                        const rawUrls = (batch?.media_urls || []).map((url, i) => ({ key: `raw-${i}`, url, label: null }));
                        const allMedia = [...attachments, ...rawUrls];
                        return allMedia.length === 0 ? (
                            <p className="text-sm text-[#9AA3B2] pb-4">No images uploaded.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2 pb-4">
                                {allMedia.map((item) => (
                                    <a key={item.key} href={item.url} target="_blank" rel="noopener noreferrer"
                                        className="group overflow-hidden rounded-lg border border-[#E6E9EE] bg-[#F8FAFC]">
                                        <img src={item.url} alt={item.label || "evidence"}
                                            className="h-24 w-24 object-cover transition-transform group-hover:scale-105"
                                            onError={(e) => { e.currentTarget.style.display = "none"; }} />
                                    </a>
                                ))}
                            </div>
                        );
                    })()}
                    <div className="border-t border-[#E8E8E8] text-xl font-bold text-[#434343] py-2">Reason</div>
                    <div className="text-sm font-medium">{display(batch?.description || batch?.notes)}</div>
                </div>

                <div className="border p-4 bg-[#FAFAFA] border-[#E8E8E8] rounded-2xl w-1/3">
                    <div className="flex items-center gap-1">
                        <img src={Docs} alt="" />
                        <div className="text-base font-semibold text-[#2C2C2C]">Sensory Evaluation Summary</div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="flex text-xs flex-col gap-2 items-start bg-white border border-[#E8E8E8] rounded-xl p-4 min-h-0">
                            <div>Product Quality Score</div>
                            <div className="text-[#FF5858] font-bold text-3xl">{formatNumber(chartsData?.summary?.quality_score ?? scorecard.batch_overall_score ?? batch?.overall_score, 2)}</div>
                            <div>out of 9.0</div>
                        </div>
                        <div className="flex text-xs flex-col gap-2 items-start bg-white border border-[#E8E8E8] rounded-xl p-4 min-h-0">
                            <div>Quality Index (%QI)</div>
                            <div className="text-[#FF5858] font-bold text-3xl">
                                {chartsData?.summary?.quality_index_percent != null
                                    ? `${formatNumber(chartsData.summary.quality_index_percent, 1)}%`
                                    : avgQualityIndex === null ? "-" : `${formatNumber(avgQualityIndex, 1)}%`}
                            </div>
                        </div>
                        <div className="flex text-xs flex-col gap-2 items-start bg-white border border-[#E8E8E8] rounded-xl p-4 min-h-0">
                            <div>Samples Evaluated</div>
                            <div className="text-[#FF5858] font-bold text-3xl">{chartsData?.summary?.samples_evaluated ?? ((scorecard.sample_ids || []).length || "-")}</div>
                            <div>{(scorecard.sample_ids || [])[0]}</div>
                        </div>
                        <div className="flex text-xs flex-col gap-2 items-start bg-white border border-[#E8E8E8] rounded-xl p-4 min-h-0">
                            <div>Decision Status</div>
                            <div className="flex gap-1 items-center bg-[#FF585833] rounded-md p-1 text-[#FF5858]">
                                <img src={TickCircle} alt="" />
                                <div className="text-xs">{display(scorecard.deviation_category || batch?.status)}</div>
                            </div>
                            <div>{(scorecard.sample_ids || [])[1]}</div>
                        </div>
                        <div className="flex text-xs flex-col gap-2 items-start bg-white border border-[#E8E8E8] rounded-xl p-4 min-h-0">
                            <div>Evaluator</div>
                            <div>{chartsData?.summary?.evaluator || scorecard.evaluator_email || batch?.created_by_email || "-"}</div>
                        </div>
                        <div className="flex text-xs flex-col gap-2 items-start bg-white border border-[#E8E8E8] rounded-xl p-4 min-h-0">
                            <div>Complaint Raised</div>
                            <div className="flex gap-1 items-center bg-[#FFC72C] rounded-md p-1 text-[#2C2C2C]">
                                <div className="text-xs font-medium">{chartsData?.summary?.complaint_raised ? "Yes" : "No"}</div>
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
                        onClick={() => setScoreDropdownOpen((open) => !open)}
                        disabled={!sectionNames.length}
                    >
                        <div>
                            <div className="text-base font-semibold text-[#1A1A2E]">{display(activeSectionName, "No scorecard data")}</div>
                            <div className="text-sm text-[#6C757D] mt-0.5">{rows.length} sensory attribute{rows.length === 1 ? "" : "s"}</div>
                        </div>
                        <span className={`text-[#6C757D] text-xl shrink-0 transition-transform ${scoreDropdownOpen ? "rotate-180" : ""}`} aria-hidden>v</span>
                    </button>
                    {scoreDropdownOpen ? (
                        <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-[#E5E7EB] bg-white shadow-md overflow-hidden">
                            {sectionNames.map((section) => (
                                <button
                                    key={section}
                                    type="button"
                                    className="w-full px-4 py-3 text-left border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#F9FAFB]"
                                    onClick={() => { setSelectedSection(section); setScoreDropdownOpen(false); }}
                                >
                                    <div className="text-base font-semibold text-[#1A1A2E]">{section}</div>
                                </button>
                            ))}
                        </div>
                    ) : null}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-4">
                    <div className="rounded-xl border border-[#E8E8E8] bg-white p-4 flex flex-col min-h-0">
                        <div className="text-base font-semibold text-[#2C2C2C] mb-3">{display(activeSectionName, "Attributes")}</div>
                        <div className="rounded-lg overflow-hidden border border-[#E8E8E8] text-sm">
                            <div className="grid grid-cols-[1fr_52px_1fr] gap-0 bg-[#F3F4F6] text-[#494949] font-medium">
                                <div className="px-3 py-2 border-r border-[#E8E8E8]">Parameter</div>
                                <div className="px-2 py-2 text-center border-r border-[#E8E8E8]">Score</div>
                                <div className="px-3 py-2">Remark</div>
                            </div>
                            {rows.length ? rows.map((row, i) => (
                                <div key={i} className="grid grid-cols-[1fr_52px_1fr] gap-0 border-t border-[#E8E8E8] text-[#494949]">
                                    <div className="px-3 py-2.5 border-r border-[#E8E8E8]">{row.name}</div>
                                    <div className="px-2 py-2.5 text-center border-r border-[#E8E8E8]">{formatNumber(row.score, 1)}</div>
                                    <div className="px-3 py-2.5">{row.pqi === null ? "-" : `${formatNumber(row.pqi, 1)}% QI`}</div>
                                </div>
                            )) : (
                                <div className="border-t border-[#E8E8E8] px-3 py-6 text-center text-[#6F7785]">No score rows available.</div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-[#E8E8E8] bg-white p-4 flex flex-col min-h-0">
                        <div className="text-base font-semibold text-[#2C2C2C] mb-3">Average</div>
                        <div className="rounded-lg overflow-hidden border border-[#E8E8E8] text-sm">
                            <div className="grid grid-cols-[1fr_56px_72px] gap-0 bg-[#F3F4F6] text-[#494949] font-medium">
                                <div className="px-3 py-2 border-r border-[#E8E8E8]">PQ I%</div>
                                <div className="px-2 py-2 text-center border-r border-[#E8E8E8]">Score</div>
                                <div className="px-2 py-2 text-center">Deg of Diff</div>
                            </div>
                            {rows.length ? rows.map((row, i) => (
                                <div key={i} className="grid grid-cols-[1fr_56px_72px] gap-0 border-t border-[#E8E8E8] text-[#494949]">
                                    <div className="px-3 py-2.5 border-r border-[#E8E8E8]">{row.pqi === null ? "-" : `${formatNumber(row.pqi, 1)}%`}</div>
                                    <div className="px-2 py-2.5 text-center border-r border-[#E8E8E8]">{formatNumber(row.score, 1)}</div>
                                    <div className="px-2 py-2.5 text-center">{formatNumber(row.diff, 1)}</div>
                                </div>
                            )) : (
                                <div className="border-t border-[#E8E8E8] px-3 py-6 text-center text-[#6F7785]">No score rows available.</div>
                            )}
                            <div className="grid grid-cols-[1fr_56px_72px] gap-0 border-t-2 border-[#E8E8E8] bg-[#FAFAFA] font-semibold text-[#2C2C2C]">
                                <div className="px-3 py-2.5 border-r border-[#E8E8E8]">Total</div>
                                <div className="px-2 py-2.5 text-center border-r border-[#E8E8E8]">{formatNumber(average(rows.map((row) => row.score)), 1)}</div>
                                <div className="px-2 py-2.5 text-center">{formatNumber(scorecard.target_score ?? batch?.scorecard?.target_score ?? 5, 1)}</div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-[#E8E8E8] bg-white p-4 flex flex-col min-h-0">
                        <div className="text-base font-semibold text-[#2C2C2C] mb-3">Range</div>
                        <div className="rounded-lg overflow-hidden border border-[#E8E8E8] text-sm">
                            <div className="grid grid-cols-3 gap-0 bg-[#F3F4F6] text-[#494949] font-medium">
                                <div className="px-3 py-2 border-r border-[#E8E8E8]">High</div>
                                <div className="px-3 py-2 text-center border-r border-[#E8E8E8]">Low</div>
                                <div className="px-3 py-2 text-center">Range</div>
                            </div>
                            {rows.length ? rows.map((row, i) => (
                                <div key={i} className="grid grid-cols-3 gap-0 border-t border-[#E8E8E8] text-[#494949]">
                                    <div className="px-3 py-2.5 border-r border-[#E8E8E8]">{formatNumber(row.high, 1)}</div>
                                    <div className="px-3 py-2.5 text-center border-r border-[#E8E8E8]">{formatNumber(row.low, 1)}</div>
                                    <div className="px-3 py-2.5 text-center">{formatNumber(row.range, 1)}</div>
                                </div>
                            )) : (
                                <div className="border-t border-[#E8E8E8] px-3 py-6 text-center text-[#6F7785]">No score rows available.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

                <QualityMetricsComparison spiderCharts={chartsData?.spider_charts || []} />

                {chartsData?.samples_graph?.length > 0 ? (
                    <section className="mt-6 max-w-[560px]">
                        <HorizontalBarChartCard
                            title="Samples Score Graph"
                            data={chartsData.samples_graph.map((s, i) => ({
                                label: s.sample_code || `Sample ${i + 1}`,
                                value: Number(s.overall_score) || 0,
                            }))}
                        />
                    </section>
                ) : null}

                <div className="font-bold text-xl p-4 text-[#434343]">Spiderplots data</div>
                <div className="p-4 flex flex-wrap justify-between space-y-4 w-full">
                    {(chartsData?.spider_charts || []).map((sample, i) => {
                        const attrs = sample.attributes || [];
                        return (
                            <SensoryRadarChart
                                key={sample.sample_code || i}
                                title={sample.sample_code || `Sample ${i + 1}`}
                                axes={attrs.map((a) => a.name)}
                                domain={[0, 9]}
                                series={[
                                    {
                                        dataKey: "target",
                                        name: "Target Score",
                                        values: attrs.map((a) => Number(a.target) || 5),
                                        color: "#16a34a",
                                        strokeWidth: 3,
                                    },
                                    {
                                        dataKey: "mcd",
                                        name: "McDonald's Scores",
                                        values: attrs.map((a) => Number(a.mcd_score ?? a.target) || 5),
                                        color: "#2563eb",
                                        strokeWidth: 3,
                                    },
                                    {
                                        dataKey: "group",
                                        name: "Group Score",
                                        values: attrs.map((a) => Number(a.score) || 0),
                                        color: "#dc2626",
                                        strokeWidth: 2,
                                        strokeDasharray: "6 4",
                                    },
                                ]}
                            />
                        );
                    })}
                </div>

                {isMarketReviewer ? (
                    <section className="border p-4 bg-[#FAFAFA] border-[#E8E8E8] rounded-2xl mt-4">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="text-[18px] font-semibold text-[#202124]">Market QA Decision</div>
                                <div className="mt-1 text-sm text-[#6F7785]">
                                    Current status: <span className="font-semibold text-[#202124]">{batchStatusLabel(batch?.status)}</span>
                                </div>
                            </div>
                            {!canMarketReview ? (
                                <div className="rounded-lg border border-[#E6E9EE] bg-[#FBFCFD] px-3 py-2 text-sm text-[#6F7785]">
                                    No Market QA action is available for this status.
                                </div>
                            ) : null}
                        </div>
                        {canMarketReview ? (
                            <>
                                <textarea
                                    value={reviewComment}
                                    onChange={(event) => setReviewComment(event.target.value)}
                                    placeholder="Add decision note"
                                    className="mt-4 min-h-24 w-full resize-y rounded-lg border border-[#E6E9EE] bg-white px-3 py-3 text-sm text-[#202124] outline-none placeholder:text-[#9AA3B2]"
                                />
                                {reviewError ? <div className="mt-3 text-sm text-red-700">{reviewError}</div> : null}
                                {reviewMessage ? <div className="mt-3 text-sm text-emerald-700">{reviewMessage}</div> : null}
                                <div className="mt-4 flex flex-wrap justify-end gap-3">
                                    <button
                                        type="button"
                                        disabled={Boolean(reviewLoading)}
                                        onClick={() => handleMarketReview("request_correction")}
                                        className="h-10 rounded-full border border-amber-300 bg-amber-50 px-5 text-sm font-semibold text-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {reviewLoading === "request_correction" ? "Requesting..." : "Request Correction"}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={Boolean(reviewLoading)}
                                        onClick={() => handleMarketReview("reject")}
                                        className="h-10 rounded-full border border-red-200 bg-red-50 px-5 text-sm font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {reviewLoading === "reject" ? "Rejecting..." : "Reject"}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={Boolean(reviewLoading)}
                                        onClick={() => handleMarketReview("approve")}
                                        className="h-10 rounded-full bg-[#F11518] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {reviewLoading === "approve" ? "Approving..." : "Approve"}
                                    </button>
                                </div>
                            </>
                        ) : null}
                    </section>
                ) : null}

                {isRegionalReviewer ? (
                    <section className="border p-4 bg-[#FAFAFA] border-[#E8E8E8] rounded-2xl mt-4">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="text-[18px] font-semibold text-[#202124]">Regional QA Review</div>
                                <div className="mt-1 text-sm text-[#6F7785]">
                                    Current status: <span className="font-semibold text-[#202124]">{batchStatusLabel(batch?.status)}</span>
                                </div>
                            </div>
                            {!canRegionalReview ? (
                                <div className="rounded-lg border border-[#E6E9EE] bg-[#FBFCFD] px-3 py-2 text-sm text-[#6F7785]">
                                    No Regional QA action is available for this status.
                                </div>
                            ) : null}
                        </div>
                        {canRegionalReview ? (
                            <>
                                <textarea
                                    value={regionalComment}
                                    onChange={(event) => setRegionalComment(event.target.value)}
                                    placeholder="Add regional review note"
                                    className="mt-4 min-h-24 w-full resize-y rounded-lg border border-[#E6E9EE] bg-white px-3 py-3 text-sm text-[#202124] outline-none placeholder:text-[#9AA3B2]"
                                />
                                {regionalError ? <div className="mt-3 text-sm text-red-700">{regionalError}</div> : null}
                                {regionalMessage ? <div className="mt-3 text-sm text-emerald-700">{regionalMessage}</div> : null}
                                <div className="mt-4 flex flex-wrap justify-end gap-3">
                                    <button
                                        type="button"
                                        disabled={Boolean(regionalLoading)}
                                        onClick={() => handleRegionalReview("start_review")}
                                        className="h-10 rounded-full border border-sky-200 bg-sky-50 px-5 text-sm font-semibold text-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {regionalLoading === "start_review" ? "Starting..." : "Start Review"}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={Boolean(regionalLoading)}
                                        onClick={() => handleRegionalReview("escalate")}
                                        className="h-10 rounded-full border border-amber-300 bg-amber-50 px-5 text-sm font-semibold text-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {regionalLoading === "escalate" ? "Escalating..." : "Escalate to Market QA"}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={Boolean(regionalLoading)}
                                        onClick={() => handleRegionalReview("reject")}
                                        className="h-10 rounded-full border border-red-200 bg-red-50 px-5 text-sm font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {regionalLoading === "reject" ? "Rejecting..." : "Reject"}
                                    </button>
                                </div>
                            </>
                        ) : null}
                    </section>
                ) : null}


                {id ? (
                    <section className="border p-4 bg-[#FAFAFA] border-[#E8E8E8] rounded-2xl mt-4">
                        <div className="mb-4 text-lg font-bold text-[#202124]">Add a comment</div>
                        <select
                            value={noteScope}
                            onChange={(e) => setNoteScope(e.target.value)}
                            className="mb-3 h-9 rounded-lg border border-[#E6E9EE] bg-white px-3 text-sm text-[#202124] outline-none"
                        >
                            <option value="all">Sent to all</option>
                            <option value="market_qa">Market QA</option>
                            <option value="regional_qa">Regional QA</option>
                        </select>
                        <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Write Your Comment"
                            className="min-h-24 w-full resize-y rounded-lg border border-[#E6E9EE] bg-white px-3 py-3 text-sm text-[#202124] outline-none placeholder:text-[#9AA3B2]"
                        />
                        {noteError ? <div className="mt-2 text-sm text-red-700">{noteError}</div> : null}
                        {noteMessage ? <div className="mt-2 text-sm text-emerald-700">{noteMessage}</div> : null}
                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                disabled={noteLoading || !noteText.trim()}
                                onClick={handleAddNote}
                                className="h-10 rounded-full bg-[#F11518] px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {noteLoading ? "Sending..." : "Send for review"}
                            </button>
                        </div>
                    </section>
                ) : null}
        </div>
    );
}
