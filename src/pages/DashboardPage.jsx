import BatchTable from "../components/BatchTable";
import OverviewItem from "../components/OverviewItem";
import PageHeading from "../components/PageHeading";
import TotalTicket from "../assets/TotalTicket.svg"
import ticketInProgress from "../assets/ticketInProgress.svg"
import totalOpenTicket from "../assets/totalOpenTicket.svg"
import totalTicketResolve from "../assets/totalTicketResolve.svg"
import FilterDropDown from "../components/FilterDropDown";
import CustomButton from "../components/CustomButton";
import DonutChart from "../components/DonutChart";
import LineChartCard from "../components/LineChartCard";
import MultiDonutChart from "../components/MultiDonutChart";
import HorizontalBarChartCard from "../components/HorizontalBarChartCard";


export default function DashboardPage() {
    const data = [
        { name: "1", open: 1, resolved: 2.6 },
        { name: "2", open: 1.5, resolved: 2.2 },
        { name: "3", open: 3.5, resolved: 1.5 },
        { name: "4", open: 4, resolved: 1.2 },
        { name: "5", open: 3.8, resolved: 1.2 },
        { name: "6", open: 3.7, resolved: 2.2 },
        { name: "7", open: 4, resolved: 1.8 },
        { name: "8", open: 5, resolved: 1.5 },
        { name: "9", open: 5.2, resolved: 1.8 },
        { name: "10", open: 4.8, resolved: 1.6 },
        { name: "11", open: 5.1, resolved: 1.2 },
        { name: "12", open: 5.3, resolved: 2.2 },
    ];

    const lines = [
        { key: "open", color: "#EF4444", label: "Open" },
        { key: "resolved", color: "#FB7185", label: "Resolved" },
    ];

    const MultiDonutChartData = [
        { label: "Resolved", value: 780, color: "#4F6BED" },
        { label: "Inprogress", value: 4, color: "#F59E0B" },
        { label: "Total", value: 900, color: "#16A34A" },
        { label: "Open", value: 120, color: "#EF4444" },
    ];

    const HorizontalBarChartData = [
        { label: "Foreign Body", value: 400, color: "#4F6BED" },
        { label: "Packaging", value: 98, color: "#FBBF24" },
        { label: "Quality Integrity", value: 180, color: "#16A34A" },
        { label: "Food Safety Integrity", value: 126, color: "#EF4444" },
    ];

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
                <OverviewItem Icon={TotalTicket} title="Total Tickets" value={10} bgColor="#F11518" />
                <OverviewItem Icon={ticketInProgress} title="Ticket In Progress" value={10} bgColor="#4C6FFF" />
                <OverviewItem Icon={totalOpenTicket} title="Total Open Ticket" value={10} bgColor="#FFC72C" />
                <OverviewItem Icon={totalTicketResolve} title="Total Tickets" value={10} bgColor="#FF7E30" />
            </div>
            <BatchTable />
            <div className="flex justify-between items-center px-4 my-4">
                <div className="text-[#27272E] text-2xl font-medium">Tickets Overview</div>
                <div className="flex items-center gap-4">
                    <FilterDropDown primarySelected={true} />
                    <CustomButton type="unfilled-red" title={"Export"} />
                </div>
            </div>
            <div className="px-4 flex items-center gap-8 flex-wrap">
                <DonutChart
                    value1={700}
                    value2={200}
                    label1="SLA Met"
                    label2="SLA Breached"
                />
                <div className="">
                    <HorizontalBarChartCard
                        title="Categories most frequently selected by the customer"
                        data={HorizontalBarChartData}
                    />
                </div>
                <MultiDonutChart
                    title="Complaints Overview"
                    data={MultiDonutChartData}
                />
                <div className="w-1/2">
                    <LineChartCard
                        title="Complaints Report"
                        data={data}
                        lines={lines}
                    />
                </div>
                


            </div>
        </section>
    )
}