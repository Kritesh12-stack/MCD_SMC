import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeading from "../components/PageHeading";
import SearchBar from "../components/SearchBar";
import FilterDropDown from "../components/FilterDropDown";
import CustomButton from "../components/CustomButton";
import CustomTable from "../components/CustomTable";
import { useBatchesList } from "../hooks/useBatchesList";

const DATE_FILTERS = [
    { id: "7d", name: "Last 7 Days" },
    { id: "30d", name: "Last 30 Days" },
    { id: "90d", name: "Last 90 Days" },
];

const PRODUCT_FILTERS = [
    { id: "all", name: "All Products" },
    { id: "cheese", name: "American Cheese Slices" },
    { id: "bun", name: "Burger Bun" },
];

const VENDOR_FILTERS = [
    { id: "all", name: "All Vendors" },
    { id: "salamonca", name: "Salamonca" },
    { id: "green", name: "Green Farms Ltd" },
    { id: "cooker", name: "Cooker Dooker" },
];

const OUTLET_FILTERS = [
    { id: "all", name: "All Outlets" },
    { id: "out1", name: "Outlet North" },
    { id: "out2", name: "Outlet South" },
];

const STATUS_FILTERS = [
    { id: "all", name: "All Status" },
    { id: "pending", name: "Pending" },
    { id: "approved", name: "Approved" },
    { id: "rejected", name: "Rejected" },
];

const TABLE_FILTER_SORT = [
    { id: "az", name: "A - Z" },
    { id: "za", name: "Z - A" },
    { id: "date", name: "Production date" },
];

const STATUS_BADGE = {
    pending: "bg-amber-100 text-amber-800 border border-amber-200",
    rejected: "bg-red-100 text-red-800 border border-red-300",
    approved: "bg-blue-100 text-blue-800 border border-blue-200",
    inprogress: "bg-purple-100 text-purple-800 border border-purple-200",
};

const STATUS_LABEL = {
    pending: "Pending",
    rejected: "Rejected",
    approved: "Approved",
    inprogress: "In Progress",
};

const RISK_CLASS = {
    High: "text-red-700 font-medium",
    Medium: "text-amber-700 font-medium",
    Low: "text-emerald-700 font-medium",
};

function statusLabel(key) {
    return STATUS_LABEL[key] ?? (key.charAt(0).toUpperCase() + key.slice(1));
}

export default function BatchMonitoringPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const { rows, loading, error, notice, fromApi, meta } = useBatchesList();

    const filteredRows = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter(
            (r) =>
                String(r.batchId).toLowerCase().includes(q) ||
                String(r.supplier).toLowerCase().includes(q) ||
                String(r.productType).toLowerCase().includes(q) ||
                String(r.sku).toLowerCase().includes(q)
        );
    }, [search, rows]);

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
                    className="text-blue-600 hover:underline"
                    onClick={() => navigate("/batch-details")}
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
        <div>
            <PageHeading title={"Batch Monitoring Table"} />
            <div className="px-4 pb-6">
                <div className="w-full rounded-md bg-white">
                    {error ? (
                        <p className="text-sm text-red-600 mb-3 px-1">
                            {error} (showing sample rows)
                        </p>
                    ) : null}
                    {notice ? (
                        <p className="text-sm text-[#6C757D] mb-3 px-1">
                            {notice}
                            {meta?.total != null ? ` API total: ${meta.total}.` : ""}
                        </p>
                    ) : null}
                    {fromApi && meta?.total != null ? (
                        <p className="text-xs text-[#888] mb-2 px-1">
                            Loaded {rows.length} batch{rows.length !== 1 ? "es" : ""} (page {meta.page ?? 1} of{" "}
                            {meta.total_pages ?? 1}).
                        </p>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-3 mb-4 justify-between">
                        <div className="flex flex-wrap items-center gap-3">
                            <FilterDropDown
                                primarySelected={true}
                                dropDownList={DATE_FILTERS}
                                onChange={() => {}}
                            />
                            <FilterDropDown
                                primarySelected={true}
                                dropDownList={PRODUCT_FILTERS}
                                onChange={() => {}}
                            />
                            <FilterDropDown
                                primarySelected={true}
                                dropDownList={VENDOR_FILTERS}
                                onChange={() => {}}
                            />
                            <FilterDropDown
                                primarySelected={true}
                                dropDownList={OUTLET_FILTERS}
                                onChange={() => {}}
                            />
                            <FilterDropDown
                                primarySelected={true}
                                dropDownList={STATUS_FILTERS}
                                onChange={() => {}}
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
                                onChange={() => {}}
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
                    ) : (
                        <CustomTable columns={columns} data={filteredRows} maxRows={15} />
                    )}
                </div>
            </div>
        </div>
    );
}
