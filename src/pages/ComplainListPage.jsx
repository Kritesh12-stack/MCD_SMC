import { useState } from "react";
import CustomButton from "../components/CustomButton";
import CustomTable from "../components/CustomTable";
import FilterDropDown from "../components/FilterDropDown";
import PageHeading from "../components/PageHeading";
import SearchBar from "../components/SearchBar";
import { useNavigate } from "react-router-dom";
export default function ComplainListPage() {
    const [search, setSearch] = useState("");
    const navigate = useNavigate()

    const columns = [
        { key: "ticketId", title: "Ticket Id" },
        { key: "productName", title: "Product Name" },
        { key: "category", title: "Category" },
        { key: "quantity", title: "Quantity" },
        { key: "vendor", title: "Vendor" },
    ]
    const data = [
        { ticketId: "1", productName: "Product 1", category: "Category 1", quantity: 1, vendor: "Vendor 1" },
        { ticketId: "2", productName: "Product 2", category: "Category 2", quantity: 2, vendor: "Vendor 2" },
        { ticketId: "3", productName: "Product 3", category: "Category 3", quantity: 3, vendor: "Vendor 3" },
    ]

    const raiseTicket = () => {
        console.log("Raised a ticket");
        navigate("/complaints/raise")
    }

    return (
        <div>
            <PageHeading title={"Complaints List"} />
            <div className="px-4"> 
                <div className="flex">
                    <SearchBar search={search} setSearch={setSearch} />
                    <FilterDropDown primarySelected={true} />
                    <CustomButton title={"Export"} type={"unfilled-red"} rounded={false} length={"med"} handleSubmit={() => console.log("Clicked")} />
                    <CustomButton title={"Raise a ticket"} type={"filled"} rounded={false} length={"large"} handleSubmit={raiseTicket} />
                </div>
                <CustomTable columns={columns} data={data} />
            </div>
        </div>
    )
}