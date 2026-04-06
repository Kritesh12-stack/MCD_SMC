import { useState } from "react";
import SearchBar from "./SearchBar";
import FilterDropDown from "./FilterDropDown";
import CustomButton from "./CustomButton";
import CustomTable from "./CustomTable";

export default function BatchTable() {
    const [searchText, setSearchText] = useState("");

    const columns = [
        { key: "ticketId", title: "Ticket Id" },
        { key: "productName", title: "Product Name" },
        { key: "category", title: "Category" },
        { key: "quantity", title: "Quantity" },
        { key: "vendor", title: "Vendor" },

        {
            key: "status",
            title: "Status",
            render: (value) => (
                <span
                    className={`px-3 py-1 text-xs font-medium rounded-md border
          ${value === "Pending"
                            ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                            : "bg-blue-100 text-blue-700 border-blue-300"
                        }`}
                >
                    {value}
                </span>
            ),
        },

        {
            key: "action",
            title: "Action",
            render: (_, row) => (
                <button
                    className="text-blue-600 hover:underline"
                    onClick={() => console.log("View:", row.ticketId)}
                >
                    View
                </button>
            ),
        },

        { key: "sla", title: "SLA" },
    ];

   const data = [
  {
    ticketId: "COM-2025-0012",
    productName: "Milk / Milk Substitutes",
    category: "Foreign Body - Product Related",
    quantity: 2,
    vendor: "Salamonca",
    status: "Pending",
    sla: "4hr left",
  },
  {
    ticketId: "COM-2025-0013",
    productName: "Fish/Seafood",
    category: "Foreign Body - Product Related",
    quantity: 67,
    vendor: "Cooker Docker",
    status: "Acknowledged",
    sla: "0hr left",
  },
  {
    ticketId: "COM-2025-0014",
    productName: "Prepared Salads",
    category: "Foreign Body - Product Related",
    quantity: 5,
    vendor: "Green Farms Ltd",
    status: "Acknowledged",
    sla: "1hr left",
  },
  {
    ticketId: "COM-2025-0015",
    productName: "Grains/Pulses/Flour",
    category: "Packaging",
    quantity: 45,
    vendor: "Salamonca",
    status: "Acknowledged",
    sla: "0hr left",
  },
  {
    ticketId: "COM-2025-0016",
    productName: "Fish/Seafood",
    category: "Foreign Body - Product Related",
    quantity: 21,
    vendor: "Salamonca",
    status: "Pending",
    sla: "2hr left",
  },
  {
    ticketId: "COM-2025-0017",
    productName: "Grains/Pulses/Flour",
    category: "Quality Integrated",
    quantity: 56,
    vendor: "Cooker Docker",
    status: "Pending",
    sla: "3hr left",
  },
  {
    ticketId: "COM-2025-0018",
    productName: "Confectionery",
    category: "Foreign Body - Non Product Related",
    quantity: 56,
    vendor: "Green Farms Ltd",
    status: "Pending",
    sla: "4hr left",
  },
  {
    ticketId: "COM-2025-0019",
    productName: "Milk / Milk Substitutes",
    category: "Foreign Body - Product Related",
    quantity: 9,
    vendor: "Cooker Docker",
    status: "Pending",
    sla: "2hr left",
  },
  {
    ticketId: "COM-2025-0020",
    productName: "Fish/Seafood",
    category: "Foreign Body - Product Related",
    quantity: 32,
    vendor: "Cooker Docker",
    status: "Pending",
    sla: "2hr left",
  },
  {
    ticketId: "COM-2025-0021",
    productName: "Fish/Seafood",
    category: "Foreign Body - Product Related",
    quantity: 56,
    vendor: "Salamonca",
    status: "Acknowledged",
    sla: "0hr left",
  },
  {
    ticketId: "COM-2025-0022",
    productName: "Bakery Items",
    category: "Packaging",
    quantity: 12,
    vendor: "Urban Bakers",
    status: "Pending",
    sla: "5hr left",
  },
  {
    ticketId: "COM-2025-0023",
    productName: "Frozen Foods",
    category: "Quality Issue",
    quantity: 18,
    vendor: "Cold Storage Inc",
    status: "Acknowledged",
    sla: "1hr left",
  },
  {
    ticketId: "COM-2025-0024",
    productName: "Beverages",
    category: "Foreign Body - Product Related",
    quantity: 30,
    vendor: "Fresh Drinks Co",
    status: "Pending",
    sla: "6hr left",
  },
  {
    ticketId: "COM-2025-0025",
    productName: "Snacks",
    category: "Packaging",
    quantity: 22,
    vendor: "Snacky Pvt Ltd",
    status: "Acknowledged",
    sla: "0hr left",
  },
];
    return (
        <section className="px-4">
            <section className="w-full p-4 rounded-md border border-[#E8E8E8] shadow">
                <div className="flex items-center gap-4 mb-4">
                    <SearchBar search={searchText} setSearch={setSearchText} />
                    <FilterDropDown primarySelected={false} />
                    {/* <FilterDropDown primarySelected={true} /> */}
                    <CustomButton title={"Raise a ticket"} type={"filled"} rounded={true} length={"large"} handleSubmit={() => console.log("Clicked")} />
                    <CustomButton title={"Export"} type={"unfilled-red"} rounded={false} length={"med"} handleSubmit={() => console.log("Clicked")} />
                </div>
                <div>
                    <CustomTable columns={columns} data={data} maxRows={10} />
                </div>
            </section>
        </section>
    )
}