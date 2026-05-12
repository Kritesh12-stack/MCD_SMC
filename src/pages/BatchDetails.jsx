import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import PageHeading from "../components/PageHeading";
import Docs from "../assets/Docs.svg";
import TickCircle from "../assets/TickCircle.svg";
import HorizontalBarChartCard from "../components/HorizontalBarChartCard";
import QualityMetricsComparison from "../components/QualityMetricsComparison";
import RadarChartSection from "../components/RadarChartSection";
import {
    addBatchComment,
    addBatchSubmission,
    getBatch,
    getBatchCharts,
    marketReviewBatch,
    regionalReviewBatch,
    sendBatchFeedback,
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

function canMarketReviewStatus(status) {
    return ["InProgress", "Submitted", "UnderMarketQAReview", "Pending", "Escalated"].includes(status);
}

function canRegionalReviewStatus(status) {
    return ["InProgress", "Submitted", "UnderRegionalQAReview"].includes(status);
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
    const [feedbackComment, setFeedbackComment] = useState("");
    const [noteText, setNoteText] = useState("");
    const [noteScope, setNoteScope] = useState("all");
    const [noteLoading, setNoteLoading] = useState(false);
    const [noteMessage, setNoteMessage] = useState("");
    const [noteError, setNoteError] = useState("");
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [feedbackError, setFeedbackError] = useState("");
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
    const canSendFeedback = Boolean(id && isMarketReviewer && ["Approved", "Rejected"].includes(batch?.status) && !batch?.feedback_sent_at);
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

    async function handleSendFeedback() {
        if (!id || feedbackLoading) return;
        setFeedbackError("");
        setFeedbackMessage("");
        setFeedbackLoading(true);
        try {
            const res = await sendBatchFeedback(id, {
                comment: feedbackComment.trim(),
            });
            const updatedBatch = res?.data?.data;
            if (updatedBatch) setBatch(updatedBatch);
            setFeedbackComment("");
            setFeedbackMessage("Final feedback sent to supplier.");
            await loadBatch({ silent: true });
        } catch (err) {
            setFeedbackError(err?.message || "Failed to send final feedback.");
        } finally {
            setFeedbackLoading(false);
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
        <div className="pb-10">
            <PageHeading title="Batch Details" />
            <div className="px-6">
                {error ? (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error} Showing sample detail layout.
                    </div>
                ) : null}

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
                    <section className="surface-panel p-5">
                        <div className="mb-5 text-[18px] font-semibold text-[#202124]">Batch Details</div>
                        <div className="grid grid-cols-1 gap-x-8 gap-y-4 text-sm text-[#494949] sm:grid-cols-2">
                            <div>
                                <div className="font-semibold text-[#202124]">Batch</div>
                                <div className="mt-1">{display(batch?.batch_number)}</div>
                                <div className="mt-1 text-xs text-[#6F7785]">{formatDate(batch?.created_at)}</div>
                            </div>
                            <div>
                                <div className="font-semibold text-[#202124]">Status</div>
                                <span className={`mt-1 inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${statusTone(batch?.status)}`}>
                                    {display(batch?.status)}
                                </span>
                            </div>
                            <div>
                                <div className="font-semibold text-[#202124]">Product Name</div>
                                <div className="mt-1">{display(batch?.product_name)}</div>
                            </div>
                            <div>
                                <div className="font-semibold text-[#202124]">Supplier Name</div>
                                <div className="mt-1">{display(batch?.supplier_name)}</div>
                            </div>
                            <div>
                                <div className="font-semibold text-[#202124]">SKU</div>
                                <div className="mt-1">{display(batch?.sku)}</div>
                            </div>
                            <div>
                                <div className="font-semibold text-[#202124]">Batch Quantity</div>
                                <div className="mt-1">{display(batch?.quantity)}</div>
                            </div>
                            <div>
                                <div className="font-semibold text-[#202124]">Production Date</div>
                                <div className="mt-1">{formatDate(batch?.production_date)}</div>
                            </div>
                            <div>
                                <div className="font-semibold text-[#202124]">Risk Flag</div>
                                <div className="mt-1">{display(batch?.risk_level)}</div>
                            </div>
                        </div>
                        <div className="mt-5 border-t border-[#E6E9EE] pt-4">
                            <div className="mb-2 text-sm font-semibold text-[#202124]">Reason</div>
                            <p className="text-sm leading-6 text-[#494949]">{display(batch?.description || batch?.notes)}</p>
                        </div>
                    </section>

                    <section className="surface-panel p-5">
                        <div className="flex items-center gap-2">
                            <img src={Docs} alt="" className="h-5 w-5" />
                            <div className="text-base font-semibold text-[#202124]">Sensory Evaluation Summary</div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <SummaryCard
                                label="Product Quality Score"
                                value={formatNumber(chartsData?.summary?.quality_score ?? scorecard.batch_overall_score ?? batch?.overall_score, 2)}
                                detail="out of 9.0"
                            />
                            <SummaryCard
                                label="Quality Index (%QI)"
                                value={chartsData?.summary?.quality_index_percent != null
                                    ? `${formatNumber(chartsData.summary.quality_index_percent, 1)}%`
                                    : avgQualityIndex === null ? "-" : `${formatNumber(avgQualityIndex, 1)}%`}
                            />
                            <SummaryCard
                                label="Samples Evaluated"
                                value={chartsData?.summary?.samples_evaluated ?? (scorecard.sample_ids || []).length || "-"}
                                detail={(scorecard.sample_ids || [])[0]}
                            />
                            <SummaryCard
                                label="Decision Status"
                                value={scorecard.deviation_category || batch?.status}
                                badge
                            />
                            <SummaryCard
                                label="Evaluator"
                                value={chartsData?.summary?.evaluator || scorecard.evaluator_email || batch?.created_by_email || "-"}
                            />
                            <SummaryCard
                                label="Complaint Raised"
                                value={chartsData?.summary?.complaint_raised ? "Yes" : "No"}
                                badge
                            />
                        </div>
                    </section>
                </div>

                <section className="mt-5">
                    <div className="mb-4 text-[18px] font-semibold text-[#202124]">Scorecard Details</div>

                    <div className="relative mb-5 w-full">
                        <button
                            type="button"
                            className="control-field flex w-full items-center justify-between gap-3 px-4 py-3 text-left shadow-sm"
                            onClick={() => setScoreDropdownOpen((open) => !open)}
                            disabled={!sectionNames.length}
                        >
                            <div>
                                <div className="text-base font-semibold text-[#202124]">{display(activeSectionName, "No scorecard data")}</div>
                                <div className="mt-0.5 text-sm text-[#6F7785]">{rows.length} sensory attribute{rows.length === 1 ? "" : "s"}</div>
                            </div>
                            <span className={`text-xl text-[#6F7785] transition-transform ${scoreDropdownOpen ? "rotate-180" : ""}`}>v</span>
                        </button>
                        {scoreDropdownOpen ? (
                            <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-[#E6E9EE] bg-white shadow-md">
                                {sectionNames.map((section) => (
                                    <button
                                        key={section}
                                        type="button"
                                        className="w-full border-b border-[#E6E9EE] px-4 py-3 text-left last:border-b-0 hover:bg-[#F8FAFC]"
                                        onClick={() => {
                                            setSelectedSection(section);
                                            setScoreDropdownOpen(false);
                                        }}
                                    >
                                        <div className="text-base font-semibold text-[#202124]">{section}</div>
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <ScoreTable
                            title={display(activeSectionName, "Attributes")}
                            columns={["Parameter", "Score", "Remark"]}
                            rows={rows.map((row) => [
                                row.name,
                                formatNumber(row.score, 1),
                                row.pqi === null ? "-" : `${formatNumber(row.pqi, 1)}% QI`,
                            ])}
                        />
                        <ScoreTable
                            title="Average"
                            columns={["PQI %", "Score", "Deg of Diff"]}
                            rows={rows.map((row) => [
                                row.pqi === null ? "-" : `${formatNumber(row.pqi, 1)}%`,
                                formatNumber(row.score, 1),
                                formatNumber(row.diff, 1),
                            ])}
                            footer={["Total", formatNumber(average(rows.map((row) => row.score)), 1), formatNumber(average(rows.map((row) => row.diff)), 1)]}
                        />
                        <ScoreTable
                            title="Range"
                            columns={["High", "Low", "Range"]}
                            rows={rows.map((row) => [
                                formatNumber(row.high, 1),
                                formatNumber(row.low, 1),
                                formatNumber(row.range, 1),
                            ])}
                        />
                    </div>
                </section>

                <QualityMetricsComparison spiderCharts={chartsData?.spider_charts || []} />

                {chartsData?.samples_graph?.length > 0 ? (
                    <section className="mt-6 max-w-sm">
                        <HorizontalBarChartCard
                            title="Samples Score Graph"
                            data={chartsData.samples_graph.map((s, i) => ({
                                label: s.sample_code || `Sample ${i + 1}`,
                                value: Number(s.overall_score) || 0,
                            }))}
                        />
                    </section>
                ) : null}

                <RadarChartSection spiderCharts={chartsData?.spider_charts || []} />

                {isMarketReviewer ? (
                    <section className="surface-panel mt-5 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="text-[18px] font-semibold text-[#202124]">Market QA Decision</div>
                                <div className="mt-1 text-sm text-[#6F7785]">
                                    Current status: <span className="font-semibold text-[#202124]">{display(batch?.status)}</span>
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
                    <section className="surface-panel mt-5 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="text-[18px] font-semibold text-[#202124]">Regional QA Review</div>
                                <div className="mt-1 text-sm text-[#6F7785]">
                                    Current status: <span className="font-semibold text-[#202124]">{display(batch?.status)}</span>
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

                {canSubmitCorrection ? (
                    <section className="surface-panel mt-5 p-5">
                        <div className="text-[18px] font-semibold text-[#202124]">
                            {batch?.status === "CorrectionRequired" ? "Correction Response" : "Submit Batch for Review"}
                        </div>
                        <div className="mt-1 text-sm text-[#6F7785]">
                            Add the supplier response details, then submit the batch back to QA.
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                            <input
                                value={correctionReason}
                                onChange={(event) => setCorrectionReason(event.target.value)}
                                placeholder="Reason or response summary"
                                className="h-11 rounded-lg border border-[#E6E9EE] bg-white px-3 text-sm text-[#202124] outline-none placeholder:text-[#9AA3B2]"
                            />
                            <input
                                value={correctionDetails}
                                onChange={(event) => setCorrectionDetails(event.target.value)}
                                placeholder="Batch details / production update"
                                className="h-11 rounded-lg border border-[#E6E9EE] bg-white px-3 text-sm text-[#202124] outline-none placeholder:text-[#9AA3B2]"
                            />
                        </div>
                        {correctionError ? <div className="mt-3 text-sm text-red-700">{correctionError}</div> : null}
                        {correctionMessage ? <div className="mt-3 text-sm text-emerald-700">{correctionMessage}</div> : null}
                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                disabled={correctionLoading}
                                onClick={handleCorrectionSubmit}
                                className="h-10 rounded-full bg-[#F11518] px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {correctionLoading ? "Submitting..." : "Submit to QA"}
                            </button>
                        </div>
                    </section>
                ) : null}

                {isMarketReviewer && ["Approved", "Rejected"].includes(batch?.status) ? (
                    <section className="surface-panel mt-5 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="text-[18px] font-semibold text-[#202124]">Supplier Feedback</div>
                                <div className="mt-1 text-sm text-[#6F7785]">
                                    {batch?.feedback_sent_at
                                        ? `Feedback sent ${formatDate(batch.feedback_sent_at)}.`
                                        : "Send the final decision to supplier users."}
                                </div>
                            </div>
                        </div>
                        {!batch?.feedback_sent_at ? (
                            <>
                                <textarea
                                    value={feedbackComment}
                                    onChange={(event) => setFeedbackComment(event.target.value)}
                                    placeholder="Add final feedback note"
                                    className="mt-4 min-h-20 w-full resize-y rounded-lg border border-[#E6E9EE] bg-white px-3 py-3 text-sm text-[#202124] outline-none placeholder:text-[#9AA3B2]"
                                />
                                {feedbackError ? <div className="mt-3 text-sm text-red-700">{feedbackError}</div> : null}
                                {feedbackMessage ? <div className="mt-3 text-sm text-emerald-700">{feedbackMessage}</div> : null}
                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="button"
                                        disabled={!canSendFeedback || feedbackLoading}
                                        onClick={handleSendFeedback}
                                        className="h-10 rounded-full bg-[#F11518] px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {feedbackLoading ? "Sending..." : "Send Feedback"}
                                    </button>
                                </div>
                            </>
                        ) : null}
                    </section>
                ) : null}

                {scorecardId ? (
                    <section className="surface-panel mt-5 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <div className="text-[18px] font-semibold text-[#202124]">Scorecard Report</div>
                                <div className="mt-1 text-sm text-[#6F7785]">
                                    Generate a scorecard snapshot or export the JSON report.
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    disabled={Boolean(reportLoading)}
                                    onClick={handleGenerateReport}
                                    className="h-10 rounded-full border border-[#E6E9EE] bg-white px-5 text-sm font-semibold text-[#202124] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {reportLoading === "generate" ? "Generating..." : "Generate Report"}
                                </button>
                                <button
                                    type="button"
                                    disabled={Boolean(reportLoading)}
                                    onClick={handleExportReport}
                                    className="h-10 rounded-full bg-[#F11518] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {reportLoading === "export" ? "Exporting..." : "Export JSON"}
                                </button>
                            </div>
                        </div>
                        {reportError ? <div className="mt-3 text-sm text-red-700">{reportError}</div> : null}
                        {reportMessage ? <div className="mt-3 text-sm text-emerald-700">{reportMessage}</div> : null}
                    </section>
                ) : null}

                {id ? (
                    <section className="surface-panel mt-5 p-5">
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
        </div>
    );
}

function SummaryCard({ label, value, detail, badge = false }) {
    return (
        <div className="min-h-[104px] rounded-lg border border-[#E6E9EE] bg-[#FBFCFD] p-4 text-xs text-[#494949]">
            <div>{label}</div>
            {badge ? (
                <div className="mt-3 inline-flex items-center gap-1 rounded-md border border-[#FFD7D5] bg-[#FFF4EA] px-2 py-1 text-[#DB2F28]">
                    <img src={TickCircle} alt="" className="h-4 w-4" />
                    <span className="text-xs font-semibold">{display(value)}</span>
                </div>
            ) : (
                <div className="mt-2 break-words text-2xl font-bold text-[#DB2F28]">{display(value)}</div>
            )}
            {detail ? <div className="mt-2 break-words text-[#6F7785]">{detail}</div> : null}
        </div>
    );
}

function ScoreTable({ title, columns, rows, footer }) {
    return (
        <div className="surface-panel flex min-h-0 flex-col p-4">
            <div className="mb-3 text-base font-semibold text-[#202124]">{title}</div>
            <div className="overflow-hidden rounded-lg border border-[#E6E9EE] text-sm">
                <div className="grid grid-cols-3 bg-[#F8FAFC] text-[#667085]">
                    {columns.map((column) => (
                        <div key={column} className="border-r border-[#E6E9EE] px-3 py-2 font-semibold last:border-r-0">
                            {column}
                        </div>
                    ))}
                </div>
                {rows.length ? rows.map((row, index) => (
                    <div key={index} className="grid grid-cols-3 border-t border-[#E6E9EE] text-[#494949]">
                        {row.map((cell, cellIndex) => (
                            <div key={cellIndex} className="border-r border-[#E6E9EE] px-3 py-2.5 last:border-r-0">
                                {cell}
                            </div>
                        ))}
                    </div>
                )) : (
                    <div className="border-t border-[#E6E9EE] px-3 py-6 text-center text-[#6F7785]">
                        No score rows available.
                    </div>
                )}
                {footer ? (
                    <div className="grid grid-cols-3 border-t-2 border-[#E6E9EE] bg-[#FBFCFD] font-semibold text-[#202124]">
                        {footer.map((cell, index) => (
                            <div key={index} className="border-r border-[#E6E9EE] px-3 py-2.5 last:border-r-0">
                                {cell}
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
