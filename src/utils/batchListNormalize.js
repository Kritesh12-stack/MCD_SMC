/**
 * Pull list payload from various API wrapper shapes.
 * @param {import("axios").AxiosResponse} res
 * @returns {unknown[]}
 */
export function extractBatchesFromResponse(res) {
    const body = res?.data;
    if (body && body.success === false) {
        const msg = body.error?.message || "Batches request failed";
        const err = new Error(msg);
        err.apiEnvelope = body;
        throw err;
    }
    const payload = body?.data !== undefined && body?.data !== null ? body.data : body;
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.results)) return payload.results;
    if (payload && Array.isArray(payload.items)) return payload.items;
    if (Array.isArray(body?.results)) return body.results;
    return [];
}

/**
 * Pagination from batches list response (when present).
 * @param {import("axios").AxiosResponse} res
 * @returns {{ total?: number, page?: number, page_size?: number, total_pages?: number } | null}
 */
export function extractBatchesMeta(res) {
    const m = res?.data?.meta;
    if (!m || typeof m !== "object") return null;
    return {
        total: m.total,
        page: m.page,
        page_size: m.page_size,
        total_pages: m.total_pages,
    };
}

function formatDisplayDate(val) {
    if (val == null || val === "") return "—";
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return String(val);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Map one API batch object → table row used by BatchMonitoringPage / ScoreDashboard.
 * Field names are guesses until a successful 200 is captured — extend as needed.
 * @param {Record<string, unknown>} b
 * @param {number} index
 */
export function mapApiBatchToTableRow(b, index) {
    const rawStatus = (b.status ?? b.batch_status ?? b.qa_status ?? "").toString().toLowerCase().replace(/\s+/g, "");
    let status = "pending";
    if (rawStatus.includes("approv")) status = "approved";
    else if (rawStatus.includes("reject")) status = "rejected";
    else if (rawStatus.includes("inprogress") || rawStatus.includes("in_progress")) status = "pending";
    else if (rawStatus) status = rawStatus.replace(/[^a-z]/g, "") || "pending";

    const riskRaw = b.risk_flag ?? b.risk ?? b.risk_level ?? "";
    const riskStr = typeof riskRaw === "string" ? riskRaw : String(riskRaw || "");
    const riskNorm =
        ["High", "Medium", "Low"].find((x) => x.toLowerCase() === riskStr.toLowerCase()) ||
        (riskStr ? riskStr : "—");

    const prodDate = b.production_date ?? b.production_at ?? b.created_at ?? b.submitted_at;

    return {
        id: String(b.id ?? b.uuid ?? `batch-${index}`),
        batchId:
            b.batch_id ??
            b.batch_number ??
            b.batch_code ??
            b.com_number ??
            b.ticket_id ??
            "—",
        supplier: b.supplier_name ?? b.supplier?.name ?? b.vendor_name ?? "—",
        productType: b.product_type ?? b.product_name ?? b.product?.name ?? "—",
        sku: b.sku || b.product_sku || "—",
        productionDate: formatDisplayDate(prodDate),
        status,
        riskFlag: riskNorm,
        _raw: b,
    };
}
