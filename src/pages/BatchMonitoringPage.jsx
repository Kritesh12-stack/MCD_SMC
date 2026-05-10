import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeading from "../components/PageHeading";
import SearchBar from "../components/SearchBar";
import FilterDropDown from "../components/FilterDropDown";
import CustomButton from "../components/CustomButton";
import CustomTable from "../components/CustomTable";

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
};

const RISK_CLASS = {
    High: "text-red-700 font-medium",
    Medium: "text-amber-700 font-medium",
    Low: "text-emerald-700 font-medium",
};

/** Static mock rows — replace with API later */
export const STATIC_BATCH_ROWS = [
    {
        id: "1",
        batchId: "COM-2025-0012",
        supplier: "Salamonca",
        productType: "American Cheese Slices",
        sku: "BB-21",
        productionDate: "18 Feb 2026",
        status: "pending",
        riskFlag: "Medium",
    },
    {
        id: "2",
        batchId: "COM-2025-0015",
        supplier: "Green Farms Ltd",
        productType: "Burger Bun",
        sku: "YG-11",
        productionDate: "18 Feb 2026",
        status: "approved",
        riskFlag: "Low",
    },
    {
        id: "3",
        batchId: "COM-2025-0018",
        supplier: "Cooker Dooker",
        productType: "FC Chicken Patty",
        sku: "YG-07",
        productionDate: "17 Feb 2026",
        status: "rejected",
        riskFlag: "High",
    },
    {
        id: "4",
        batchId: "COM-2025-0020",
        supplier: "Salamonca",
        productType: "Bun Potato",
        sku: "BB-25",
        productionDate: "16 Feb 2026",
        status: "pending",
        riskFlag: "Low",
    },
    {
        id: "5",
        batchId: "COM-2025-0021",
        supplier: "Green Farms Ltd",
        productType: "American Cheese Slices",
        sku: "BB-21",
        productionDate: "15 Feb 2026",
        status: "approved",
        riskFlag: "Medium",
    },
    {
        id: "6",
        batchId: "COM-2025-0024",
        supplier: "Cooker Dooker",
        productType: "Burger Bun",
        sku: "YG-11",
        productionDate: "14 Feb 2026",
        status: "pending",
        riskFlag: "High",
    },
    {
        id: "7",
        batchId: "COM-2025-0028",
        supplier: "Salamonca",
        productType: "FC Chicken Patty",
        sku: "YG-07",
        productionDate: "13 Feb 2026",
        status: "rejected",
        riskFlag: "Medium",
    },
    {
        id: "8",
        batchId: "COM-2025-0030",
        supplier: "Green Farms Ltd",
        productType: "Bun Potato",
        sku: "BB-25",
        productionDate: "12 Feb 2026",
        status: "approved",
        riskFlag: "Low",
    },
];

function statusLabel(key) {
    return key.charAt(0).toUpperCase() + key.slice(1);
}

export default function BatchMonitoringPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");

    const filteredRows = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return STATIC_BATCH_ROWS;
        return STATIC_BATCH_ROWS.filter(
            (r) =>
                r.batchId.toLowerCase().includes(q) ||
                r.supplier.toLowerCase().includes(q) ||
                r.productType.toLowerCase().includes(q) ||
                r.sku.toLowerCase().includes(q)
        );
    }, [search]);

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

                    <CustomTable columns={columns} data={filteredRows} maxRows={15} />
                </div>
            </div>
        </div>
    );
}
