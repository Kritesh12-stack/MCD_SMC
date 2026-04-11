import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton";
import CustomTable from "../components/CustomTable";
import FilterDropDown from "../components/FilterDropDown";
import PageHeading from "../components/PageHeading";
import SearchBar from "../components/SearchBar";
import { getComplaints } from "../api/complaintsApi";

const STATUS_COLORS = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
    acknowledged: "bg-blue-100 text-blue-700 border-blue-300",
    justified: "bg-green-100 text-green-700 border-green-300",
    unjustified: "bg-red-100 text-red-700 border-red-300",
};

export default function ComplainListPage() {
    const [search, setSearch] = useState("");
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("Last 7 days");
    const navigate = useNavigate();

    useEffect(() => {
        fetchComplaints();
    }, [search, filter]);

    async function fetchComplaints() {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            const res = await getComplaints(params);
            setComplaints(res.data?.data?.results || res.data?.results || []);
        } catch (err) {
            console.error("Failed to fetch complaints:", err);
        } finally {
            setLoading(false);
        }
    }

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
                <button className="text-blue-600 hover:underline" onClick={() => navigate(`/complaint/${row.id}`)}>
                    View
                </button>
            ),
        },
        { key: "sla", title: "SLA", render: () => "-" },
    ];

    return (
        <div>
            <PageHeading title={"Complaint List"} />
            <div className="px-4">
                <div className="flex justify-between items-center mb-4">
                    <SearchBar search={search} setSearch={setSearch} />
                    <div className="flex items-center gap-4">
                        <FilterDropDown primarySelected={true} />
                        <CustomButton title={"Export"} type={"unfilled-red"} rounded={false} length={"med"} />
                        <CustomButton title={"Raise a ticket"} type={"filled"} rounded={false} length={"large"} handleSubmit={() => navigate("/complaints/raise")} />
                    </div>
                </div>
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading...</div>
                ) : (
                    <CustomTable columns={columns} data={complaints} maxRows={20} />
                )}
            </div>
        </div>
    );
}
