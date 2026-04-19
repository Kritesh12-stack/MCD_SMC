import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BatchTable from "../components/BatchTable";
import OverviewItem from "../components/OverviewItem";
import PageHeading from "../components/PageHeading";
import TotalTicket from "../assets/TotalTicket.svg";
import ticketInProgress from "../assets/ticketInProgress.svg";
import totalOpenTicket from "../assets/totalOpenTicket.svg";
import totalTicketResolve from "../assets/totalTicketResolve.svg";
import FilterDropDown from "../components/FilterDropDown";
import CustomButton from "../components/CustomButton";
import DonutChart from "../components/DonutChart";
import LineChartCard from "../components/LineChartCard";
import MultiDonutChart from "../components/MultiDonutChart";
import HorizontalBarChartCard from "../components/HorizontalBarChartCard";
import { getDashboardOverview, getDashboardAnalytics, getComplaints, getComplaintById } from "../api/complaintsApi";
import { useUser } from "../contexts/UserContext";
import { getStatusLabel, getStatusColor } from "../utils/statusUtils";

const DATE_FILTERS = [
    { id: 7,   name: "Last 7 days" },
    { id: 30,  name: "Last 1 month" },
    { id: 90,  name: "Last 3 months" },
    { id: 180, name: "Last 6 months" },
];

const lines = [
    { key: "count", color: "#EF4444", label: "Complaints" },
];

export default function DashboardPage() {
    const [overview, setOverview] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [complaintsLoading, setComplaintsLoading] = useState(true);
    const [filter, setFilter] = useState(7);
    const [modal, setModal] = useState(null);
    const { user } = useUser();
    const isVendor = user?.role === "Vendor";
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchAll() {
            const [overviewRes, analyticsRes, complaintsRes] = await Promise.allSettled([
                getDashboardOverview(),
                getDashboardAnalytics(),
                getComplaints({ page_size: 10 }),
            ]);
            if (overviewRes.status === "fulfilled") setOverview(overviewRes.value.data?.data);
            if (analyticsRes.status === "fulfilled") setAnalytics(analyticsRes.value.data?.data);
            if (complaintsRes.status === "fulfilled") setComplaints(complaintsRes.value.data?.data || []);
            setComplaintsLoading(false);
        }
        fetchAll();
    }, []);

    // Overview cards
    const totalTickets = overview?.complaints?.total ?? 0;
    const inProgress = overview?.complaints?.by_status?.SentToVendor ?? 0;
    const slaBreached = overview?.sla?.breached_count ?? 0;
    const resolved = Object.entries(overview?.complaints?.by_status || {})
        .filter(([k]) => ["Justified", "Unjustified", "Closed"].includes(k))
        .reduce((acc, [, v]) => acc + v, 0);

    // Line chart — complaints per day
    const lineData = analytics?.complaints_per_day?.map(d => ({ name: d.day.slice(5), count: d.count })) || [];

    // Multi donut — status breakdown
    const statusColors = { SentToVendor: "#4F6BED", Justified: "#16A34A", Unjustified: "#EF4444", Pending: "#F59E0B" };
    const multiDonutData = Object.entries(analytics?.complaint_status_breakdown || {}).map(([label, value]) => ({
        label, value, color: statusColors[label] || "#888",
    }));

    // Horizontal bar — category breakdown (use batch risk as proxy)
    const riskColors = { Low: "#16A34A", Medium: "#FBBF24", High: "#EF4444", Critical: "#7C3AED" };
    const barData = Object.entries(analytics?.batch_risk_breakdown || {}).map(([label, value]) => ({
        label, value, color: riskColors[label] || "#4F6BED",
    }));

    // Donut — SLA
    const slaMet = totalTickets - slaBreached;

    async function handleView(row) {
        if (!isVendor) return navigate(`/complaint/${row.id}`);
        try {
            const res = await getComplaintById(row.id);
            setModal(res.data?.data || res.data);
        } catch {
            navigate(`/complaint/${row.id}`);
        }
    }

    function exportToCSV() {
        const headers = ["Ticket Id", "Product Name", "Category", "Quantity", "Vendor", "Status"];
        const rows = complaints.map(c => [
            c.ticket_id || "",
            c.product_name || "",
            c.complaint_category_name || "",
            c.quantity || "",
            c.supplier_name || "",
            c.status || "",
        ]);
        const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `complaints_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <section>
            <PageHeading title={"Dashboard"} />
            <div className="flex justify-between items-center px-4 mb-4">
                <div className="text-[#27272E] text-2xl font-medium">Tickets</div>
                <div className="flex items-center gap-4">
                    <FilterDropDown primarySelected={true} dropDownList={DATE_FILTERS} onChange={setFilter} />
                    <CustomButton type="unfilled-red" title={"Export"} handleSubmit={exportToCSV} />
                </div>
            </div>
            <div className="flex gap-4 px-4 flex-wrap pb-4">
                <OverviewItem Icon={TotalTicket} title="Total Tickets" value={totalTickets} bgColor="#F11518" />
                <OverviewItem Icon={ticketInProgress} title="Sent To Vendor" value={inProgress} bgColor="#4C6FFF" />
                <OverviewItem Icon={totalOpenTicket} title="SLA Breached" value={slaBreached} bgColor="#FFC72C" />
                <OverviewItem Icon={totalTicketResolve} title="Resolved" value={resolved} bgColor="#FF7E30" />
            </div>

            <BatchTable data={complaints} loading={complaintsLoading} onView={handleView} />

            <div className="flex justify-between items-center px-4 my-4">
                <div className="text-[#27272E] text-2xl font-medium">Tickets Overview</div>
                <div className="flex items-center gap-4">
                    <FilterDropDown primarySelected={true} dropDownList={DATE_FILTERS} onChange={setFilter} />
                    <CustomButton type="unfilled-red" title={"Export"} />
                </div>
            </div>
            <div className="px-4 flex items-center gap-8 flex-wrap">
                <DonutChart
                    value1={slaMet}
                    value2={slaBreached}
                    label1="SLA Met"
                    label2="SLA Breached"
                />
                {barData.length > 0 && (
                    <HorizontalBarChartCard
                        title="Batch Risk Breakdown"
                        data={barData}
                    />
                )}
                {multiDonutData.length > 0 && (
                    <MultiDonutChart
                        title="Complaints Overview"
                        data={multiDonutData}
                    />
                )}
                {lineData.length > 0 && (
                    <div className="w-1/2">
                        <LineChartCard
                            title="Complaints per Day"
                            data={lineData}
                            lines={lines}
                        />
                    </div>
                )}
            </div>
            {modal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setModal(null)}>
                <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs text-[#888]">Details of {modal.ticket_id}</p>
                                <p className="font-semibold text-sm mt-0.5">{modal.ticket_id}</p>
                                <span className="text-xs text-[#888] border border-[#E8E8E8] rounded px-2 py-0.5 mt-1 inline-block">{modal.facility_name || "—"}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-[#888]">{modal.incident_date}</p>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded border mt-1 inline-block whitespace-nowrap ${getStatusColor(modal.status)}`}>
                                    {getStatusLabel(modal.status)}
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <DetailRow label="Date of Complaint" value={modal.incident_date} />
                            <DetailRow label="SAP Code" value={modal.sap_code || "—"} />
                            <DetailRow label="Batch" value={modal.batch_number || "—"} />
                            <DetailRow label="Category" value={modal.complaint_category_name} />
                            <DetailRow label="Volume Affected" value={modal.quantity ? `${modal.quantity} ${modal.quantity_unit || ""}` : "—"} />
                            <DetailRow label="Issue" value={modal.severity} />
                        </div>
                        <p className="font-semibold mt-4 text-sm">{modal.product_name}</p>
                        <p className="text-xs text-[#666] mt-1">{modal.description || "—"}</p>
                        {modal.attachments?.length > 0 && (
                            <div className="mt-3">
                                <p className="text-xs text-[#888] mb-1.5">Attached Pictures</p>
                                <div className="flex flex-wrap gap-2">
                                    {modal.attachments.map((a) => (
                                        <a key={a.id} href={a.file} target="_blank" rel="noreferrer">
                                            <img src={a.file} alt={a.filename} className="w-16 h-16 object-cover rounded-md border border-[#E8E8E8] hover:opacity-80" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
        </section>

        
    );
}

function DetailRow({ label, value }) {
    return (
        <div>
            <p className="text-xs text-[#888]">{label}</p>
            <p className="font-semibold text-sm mt-0.5">{value || "—"}</p>
        </div>
    );
}
