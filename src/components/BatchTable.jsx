import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import FilterDropDown from "./FilterDropDown";
import CustomButton from "./CustomButton";
import CustomTable from "./CustomTable";

const STATUS_COLORS = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
    vendoraccepted: "bg-green-100 text-green-700 border-green-300",
    vendorrejected: "bg-red-100 text-red-700 border-red-300",
    senttovendor: "bg-purple-100 text-purple-700 border-purple-300",
};

const SORT_FILTERS = [
    { id: "az",             name: "A - Z" },
    { id: "za",             name: "Z - A" },
    { id: "pending",        name: "Pending" },
    { id: "senttovendor",   name: "Sent to Vendor" },
    { id: "vendoraccepted", name: "Vendor Accepted" },
    { id: "vendorrejected", name: "Vendor Rejected" },
];

const STATUS_KEYS = ["pending", "senttovendor", "vendoraccepted", "vendorrejected"];

export default function BatchTable({ data = [], loading = false }) {
    const [searchText, setSearchText] = useState("");
    const [sort, setSort] = useState(null);
    const navigate = useNavigate();

    let filtered = data.filter(row =>
        !searchText ||
        row.product_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        row.ticket_id?.toLowerCase().includes(searchText.toLowerCase())
    );

    if (sort === "az") filtered = [...filtered].sort((a, b) => (a.product_name || "").localeCompare(b.product_name || ""));
    else if (sort === "za") filtered = [...filtered].sort((a, b) => (b.product_name || "").localeCompare(a.product_name || ""));
    else if (STATUS_KEYS.includes(sort)) filtered = filtered.filter(r => r.status?.toLowerCase().replace(/\s/g, "") === sort);

    const columns = [
        { key: "ticket_id", title: "Ticket Id" },
        { key: "product_name", title: "Product Name" },
        { key: "complaint_category_name", title: "Category" },
        { key: "quantity", title: "Quantity", render: (v) => v || "-" },
        { key: "supplier_name", title: "Vendor" },
        {
            key: "status",
            title: "Status",
            render: (value) => (
                <span className={`px-3 py-1 text-xs font-medium rounded-md border capitalize ${STATUS_COLORS[value?.toLowerCase()] || STATUS_COLORS.pending}`}>
                    {value}
                </span>
            ),
        },
        {
            key: "action",
            title: "Action",
            render: (_, row) => (
                <button className="text-blue-600 hover:underline" onClick={() => navigate(`/complaint/${row.id}`)}>View</button>
            ),
        },
        { key: "sla", title: "SLA", render: () => "-" },
    ];

    return (
        <section className="px-4">
            <section className="w-full p-4 rounded-md border border-[#E8E8E8] shadow">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex gap-4">
                        <SearchBar search={searchText} setSearch={setSearchText} />
                        <FilterDropDown primarySelected={false} dropDownList={SORT_FILTERS} onChange={setSort} />
                    </div>
                    <CustomButton title={"Raise a ticket"} type={"filled"} rounded={true} length={"large"} handleSubmit={() => navigate("/complaints/raise")} />
                </div>
                {loading ? (
                    <div className="text-center py-6 text-gray-500">Loading...</div>
                ) : (
                    <CustomTable columns={columns} data={filtered} maxRows={10} />
                )}
            </section>
        </section>
    );
}
