import BatchTable from "../components/BatchTable";
import OverviewItem from "../components/OverviewItem";
import PageHeading from "../components/PageHeading";
import TotalTicket from "../assets/TotalTicket.svg"
import ticketInProgress from "../assets/ticketInProgress.svg"
import totalOpenTicket from "../assets/totalOpenTicket.svg"
import totalTicketResolve from "../assets/totalTicketResolve.svg"


export default function DashboardPage(){
    return(
        <section>
            <PageHeading title={"Dashboard"} />
            <div className="flex gap-4 px-4 flex-wrap pb-4">
                <OverviewItem Icon={TotalTicket} title="Total Tickets" value={10} bgColor="#F11518" />
                <OverviewItem Icon={ticketInProgress}  title="Ticket In Progress" value={10} bgColor="#4C6FFF" />
                <OverviewItem Icon={totalOpenTicket} title="Total Open Ticket" value={10} bgColor="#FFC72C" />
                <OverviewItem Icon={totalTicketResolve} title="Total Tickets" value={10} bgColor="#FF7E30" />
            </div>
            <BatchTable/>
        </section>
    )
}