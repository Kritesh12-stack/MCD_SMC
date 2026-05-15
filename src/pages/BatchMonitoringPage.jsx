import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageHeading from "../components/PageHeading";
import SearchBar from "../components/SearchBar";
import FilterDropDown from "../components/FilterDropDown";
import CustomButton from "../components/CustomButton";
import CustomTable from "../components/CustomTable";
import { useBatchesList } from "../hooks/useBatchesList";

const DATE_FILTERS = [
    { id: "all", name: "All Dates" },
    { id: "7", name: "Last 7 Days" },
    { id: "30", name: "Last 30 Days" },
    { id: "90", name: "Last 90 Days" },
];

const TABLE_FILTER_SORT = [
    { id: "newest", name: "Newest" },
    { id: "az", name: "A - Z" },
    { id: "za", name: "Z - A" },
    { id: "date", name: "Production date" },
];

const STATUS_BADGE = {
    pending:               "bg-amber-100 text-amber-800 border border-amber-200",
    rejected:              "bg-red-100 text-red-800 border border-red-300",
    approved:              "bg-blue-100 text-blue-800 border border-blue-200",
    inprogress:            "bg-amber-100 text-amber-800 border border-amber-200",
    submitted:             "bg-indigo-100 text-indigo-800 border border-indigo-200",
    correctionrequired:    "bg-orange-100 text-orange-800 border border-orange-200",
    escalated:             "bg-rose-100 text-rose-800 border border-rose-200",
    underregionalqareview: "bg-cyan-100 text-cyan-800 border border-cyan-200",
    undermarketqareview:   "bg-cyan-100 text-cyan-800 border border-cyan-200",
    draft:                 "bg-gray-100 text-gray-700 border border-gray-200",
};

const STATUS_LABEL = {
    pending:               "Pending",
    rejected:              "Rejected",
    approved:              "Approved",
    inprogress:            "Pending",
    submitted:             "Submitted",
    correctionrequired:    "Correction Required",
    escalated:             "Escalated",
    underregionalqareview: "Under Regional QA Review",
    undermarketqareview:   "Under Market QA Review",
    draft:                 "Draft",
};

const RISK_CLASS = {
    High: "text-red-700 font-medium",
    Medium: "text-amber-700 font-medium",
    Low: "text-emerald-700 font-medium",
};

function statusLabel(key) {
    return STATUS_LABEL[key] ?? (key.charAt(0).toUpperCase() + key.slice(1));
}

function optionize(rows, key, allLabel) {
    const values = [...new Set(rows.map((row) => row[key]).filter((value) => value && value !== "—"))];
    return [{ id: "all", name: allLabel }, ...values.map((value) => ({ id: value, name: value }))];
}

function statusOptions(rows) {
    const values = [...new Set(rows.map((row) => row.status).filter(Boolean))];
    return [{ id: "all", name: "All Status" }, ...values.map((value) => ({ id: value, name: statusLabel(value) }))];
}

function parseRowDate(row) {
    const raw = row?._raw?.production_date || row?._raw?.created_at || row?.productionDate;
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date;
}

export default function BatchMonitoringPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [search, setSearch] = useState("");
    const [dateFilter, setDateFilter] = useState("all");
    const [productFilter, setProductFilter] = useState("all");
    const [vendorFilter, setVendorFilter] = useState("all");
    const [riskFilter, setRiskFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sort, setSort] = useState("newest");
    const { rows, loading, error, meta } = useBatchesList();

    const productFilters = useMemo(() => optionize(rows, "productType", "All Products"), [rows]);
    const vendorFilters = useMemo(() => optionize(rows, "supplier", "All Vendors"), [rows]);
    const riskFilters = useMemo(() => optionize(rows, "riskFlag", "All Risk"), [rows]);
    const statusFilters = useMemo(() => statusOptions(rows), [rows]);
    const successMessage = location.state?.createdBatchNumber
        ? `Report created for batch ${location.state.createdBatchNumber}.`
        : "";

    const filteredRows = useMemo(() => {
        const q = search.trim().toLowerCase();
        const now = new Date();

        const filtered = rows.filter((r) => {
            const searchable = [
                r.batchId,
                r.supplier,
                r.productType,
                r.sku,
                r.productionDate,
                r.status,
                statusLabel(r.status || ""),
                r.riskFlag,
            ].join(" ").toLowerCase();

            if (q && !searchable.includes(q)) return false;
            if (productFilter !== "all" && r.productType !== productFilter) return false;
            if (vendorFilter !== "all" && r.supplier !== vendorFilter) return false;
            if (riskFilter !== "all" && r.riskFlag !== riskFilter) return false;
            if (statusFilter !== "all" && r.status !== statusFilter) return false;
            if (dateFilter !== "all") {
                const rowDate = parseRowDate(r);
                if (!rowDate) return false;
                const days = Number(dateFilter);
                const cutoff = new Date(now);
                cutoff.setDate(cutoff.getDate() - days);
                if (rowDate < cutoff) return false;
            }
            return true;
        });

        return [...filtered].sort((a, b) => {
            if (sort === "az") return String(a.batchId).localeCompare(String(b.batchId));
            if (sort === "za") return String(b.batchId).localeCompare(String(a.batchId));
            const aDate = parseRowDate(a)?.getTime() ?? 0;
            const bDate = parseRowDate(b)?.getTime() ?? 0;
            return bDate - aDate;
        });
    }, [search, rows, productFilter, vendorFilter, riskFilter, statusFilter, dateFilter, sort]);

    function exportToCSV() {
        const headers = [
            "Batch ID",
            "Supplier Name",
            "Product Type",
            "SKU",
            "Production Date",
            "Status",
            "Risk Flag",
        ];
        const rows = filteredRows.map((r) => [
            r.batchId,
            r.supplier,
            r.productType,
            r.sku,
            r.productionDate,
            r.status,
            r.riskFlag,
        ]);
        const csv = [headers, ...rows]
            .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
            .join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `batch_monitoring_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    const columns = [
        { key: "batchId", title: "Batch ID" },
        { key: "supplier", title: "Supplier Name" },
        { key: "productType", title: "Product Type" },
        { key: "sku", title: "SKU" },
        { key: "productionDate", title: "Production Date" },
        {
            key: "status",
            title: "Status",
            render: (value) => (
                <span
                    className={`px-3 py-1 text-xs rounded-md whitespace-nowrap capitalize ${STATUS_BADGE[value] ?? "bg-gray-100 text-gray-700 border border-gray-200"}`}
                >
                    {statusLabel(value)}
                </span>
            ),
        },
        {
            key: "action",
            title: "Action",
            render: (_, row) => (
                <button
                    type="button"
                    className="font-medium text-[#DB2F28] hover:underline"
                    onClick={() => navigate(`/batch-details/${row.id}`)}
                >
                    View
                </button>
            ),
        },
        {
            key: "riskFlag",
            title: "Risk Flag",
            render: (v) => <span className={RISK_CLASS[v] ?? ""}>{v}</span>,
        },
    ];

    return (
        <div className="pb-10">
            <PageHeading title={"Batch Monitoring Table"} />
            <div className="px-6 pb-6">
                <div className="surface-panel w-full p-5">
                    {successMessage ? (
                        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                            {successMessage}
                        </div>
                    ) : null}
                    {error ? (
                        <p className="text-sm text-red-600 mb-3 px-1">{error}</p>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-3 mb-5 justify-between border-b border-[#EEF1F5] pb-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <FilterDropDown
                                primarySelected={true}
                                dropDownList={DATE_FILTERS}
                                value={dateFilter}
                                onChange={setDateFilter}
                            />
                            <FilterDropDown
                                primarySelected={true}
                                dropDownList={productFilters}
                                value={productFilter}
                                onChange={setProductFilter}
                            />
                            <FilterDropDown
                                primarySelected={true}
                                dropDownList={vendorFilters}
                                value={vendorFilter}
                                onChange={setVendorFilter}
                            />
                            <FilterDropDown
                                primarySelected={true}
                                dropDownList={riskFilters}
                                value={riskFilter}
                                onChange={setRiskFilter}
                            />
                            <FilterDropDown
                                primarySelected={true}
                                dropDownList={statusFilters}
                                value={statusFilter}
                                onChange={setStatusFilter}
                            />
                        </div>
                        <CustomButton
                            title={"Export"}
                            type={"unfilled-red"}
                            rounded={false}
                            length={"mid"}
                            handleSubmit={exportToCSV}
                        />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
                            <div className="">
                                <SearchBar search={search} setSearch={setSearch} />
                            </div>
                            <FilterDropDown
                                primarySelected={false}
                                label={"Filter"}
                                dropDownList={TABLE_FILTER_SORT}
                                value={sort}
                                onChange={setSort}
                            />
                        </div>
                        <CustomButton
                            title={"Create Report"}
                            type={"filled"}
                            rounded={true}
                            length={"large"}
                            handleSubmit={() => navigate("/create-report")}
                        />
                    </div>

                    {loading ? (
                        <div className="text-center py-10 text-gray-500">Loading batches…</div>
                    ) : filteredRows.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">No batches match the current search and filters.</div>
                    ) : (
                        <CustomTable columns={columns} data={filteredRows} maxRows={15} />
                    )}
                </div>
            </div>
        </div>
    );
}
