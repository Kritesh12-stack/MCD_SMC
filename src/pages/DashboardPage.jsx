import { useState, useEffect } from "react";
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
import { getDashboardOverview, getDashboardAnalytics, getComplaints } from "../api/complaintsApi";

const lines = [
    { key: "count", color: "#EF4444", label: "Complaints" },
];

export default function DashboardPage() {
    const [overview, setOverview] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [complaintsLoading, setComplaintsLoading] = useState(true);

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

    return (
        <section>
            <PageHeading title={"Dashboard"} />
            <div className="flex justify-between items-center px-4 mb-4">
                <div className="text-[#27272E] text-2xl font-medium">Tickets</div>
                <div className="flex items-center gap-4">
                    <FilterDropDown primarySelected={true} />
                    <CustomButton type="unfilled-red" title={"Export"} />
                </div>
            </div>
            <div className="flex gap-4 px-4 flex-wrap pb-4">
                <OverviewItem Icon={TotalTicket} title="Total Tickets" value={totalTickets} bgColor="#F11518" />
                <OverviewItem Icon={ticketInProgress} title="Sent To Vendor" value={inProgress} bgColor="#4C6FFF" />
                <OverviewItem Icon={totalOpenTicket} title="SLA Breached" value={slaBreached} bgColor="#FFC72C" />
                <OverviewItem Icon={totalTicketResolve} title="Resolved" value={resolved} bgColor="#FF7E30" />
            </div>

            <BatchTable data={complaints} loading={complaintsLoading} />

            <div className="flex justify-between items-center px-4 my-4">
                <div className="text-[#27272E] text-2xl font-medium">Tickets Overview</div>
                <div className="flex items-center gap-4">
                    <FilterDropDown primarySelected={true} />
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
        </section>
    );
}
