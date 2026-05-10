import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeading from "../components/PageHeading";
import OverviewItem from "../components/OverviewItem";
import SearchBar from "../components/SearchBar";
import FilterDropDown from "../components/FilterDropDown";
import CustomButton from "../components/CustomButton";
import CustomTable from "../components/CustomTable";
import DonutChart from "../components/DonutChart";
import LineChartCard from "../components/LineChartCard";
import TotalTicket from "../assets/TotalTicket.svg";
import ticketInProgress from "../assets/ticketInProgress.svg";
import totalOpenTicket from "../assets/totalOpenTicket.svg";
import totalTicketResolve from "../assets/totalTicketResolve.svg";
import { STATIC_BATCH_ROWS } from "./BatchMonitoringPage";

const DATE_FILTERS = [
    { id: 7, name: "Last 7 days" },
    { id: 30, name: "Last 1 month" },
    { id: 90, name: "Last 3 months" },
    { id: 180, name: "Last 6 months" },
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

function statusLabel(key) {
    return key.charAt(0).toUpperCase() + key.slice(1);
}

/** Static trend — periods 1–12 */
const DECISION_RATE_LINES = [
    { key: "approvalRate", color: "#991B1B", label: "Approval Rate %" },
    { key: "rejectionRate", color: "#F9A8D4", label: "Rejection Rate %" },
];

const DECISION_RATE_DATA = [
    { name: "1", approvalRate: 71, rejectionRate: 29 },
    { name: "2", approvalRate: 73, rejectionRate: 27 },
    { name: "3", approvalRate: 76, rejectionRate: 24 },
    { name: "4", approvalRate: 74, rejectionRate: 26 },
    { name: "5", approvalRate: 78, rejectionRate: 22 },
    { name: "6", approvalRate: 80, rejectionRate: 20 },
    { name: "7", approvalRate: 79, rejectionRate: 21 },
    { name: "8", approvalRate: 81, rejectionRate: 19 },
    { name: "9", approvalRate: 77, rejectionRate: 23 },
    { name: "10", approvalRate: 82, rejectionRate: 18 },
    { name: "11", approvalRate: 84, rejectionRate: 16 },
    { name: "12", approvalRate: 83, rejectionRate: 17 },
];

export default function ScoreDashboard() {
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

    function exportTableCSV() {
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
        a.download = `score_dashboard_batches_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function exportOverviewCSV() {
        const headers = ["Metric", "Value"];
        const rows = [
            ["Total Batches Today", "100"],
            ["Pending QA Reviews", "8"],
            ["Approved Batch", "18"],
            ["Rejected Batch", "120"],
            ["Correction Required", "15"],
            ["Avg Quality Score", "80"],
        ];
        const csv = [headers, ...rows]
            .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
            .join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `score_dashboard_overview_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function exportDecisionLineCSV() {
        const headers = ["Period", "Approval Rate %", "Rejection Rate %"];
        const rows = DECISION_RATE_DATA.map((d) => [d.name, d.approvalRate, d.rejectionRate]);
        const csv = [headers, ...rows]
            .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
            .join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `batch_decision_rate_${new Date().toISOString().split("T")[0]}.csv`;
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

    const lineChartHeaderRight = (
        <div className="flex items-center gap-2 shrink-0">
            <CustomButton
                title="Export"
                type="unfilled-red"
                rounded={false}
                length="med"
                handleSubmit={exportDecisionLineCSV}
            />
            <div
                className="w-5 h-5 bg-orange-400 text-white text-xs flex items-center justify-center rounded-full cursor-default"
                title="Info"
            >
                i
            </div>
        </div>
    );

    return (
        <section>
            <PageHeading title={"Score Dashboard"} />

            <div className="flex justify-between items-center px-4 mb-4">
                <div className="text-[#27272E] text-2xl font-medium">Overview</div>
                <div className="flex items-center gap-4">
                    <FilterDropDown primarySelected={true} dropDownList={DATE_FILTERS} onChange={() => {}} />
                    <CustomButton type="unfilled-red" title={"Export"} handleSubmit={exportOverviewCSV} />
                </div>
            </div>
            <div className="flex gap-4 px-4 flex-wrap pb-6">
                <OverviewItem Icon={TotalTicket} title="Total Batches Today" value={100} bgColor="#F11518" />
                <OverviewItem Icon={ticketInProgress} title="Pending QA Reviews" value={8} bgColor="#FFC72C" />
                <OverviewItem Icon={totalTicketResolve} title="Approved Batch" value={18} bgColor="#4C6FFF" />
                <OverviewItem Icon={totalOpenTicket} title="Rejected Batch" value={120} bgColor="#FF7E30" />
                <OverviewItem Icon={totalOpenTicket} title="Correction Required" value={15} bgColor="#9CA3AF" />
                <OverviewItem Icon={TotalTicket} title="Avg Quality Score" value={80} bgColor="#92400E" />
            </div>

            <div className="px-4 pb-6">
                <div className="w-full p-4 rounded-md border border-[#E8E8E8] shadow-sm bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
                            <SearchBar search={search} setSearch={setSearch} />
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

            <div className="flex justify-between items-center px-4 mb-4">
                <div className="text-[#27272E] text-2xl font-medium">Analytics Snapshot</div>
            </div>
            <div className="px-4 flex flex-wrap gap-6 pb-8 items-stretch">
                <DonutChart value1={700} value2={200} label1="Approval" label2="Reject" />
                <div className="flex-1 min-w-[min(100%,480px)]">
                    <LineChartCard
                        title="Batch Decision Rate"
                        data={DECISION_RATE_DATA}
                        lines={DECISION_RATE_LINES}
                        headerRight={lineChartHeaderRight}
                    />
                </div>
            </div>
        </section>
    );
}
