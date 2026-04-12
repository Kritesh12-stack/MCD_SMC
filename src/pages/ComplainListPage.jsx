import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton";
import CustomTable from "../components/CustomTable";
import FilterDropDown from "../components/FilterDropDown";
import PageHeading from "../components/PageHeading";
import SearchBar from "../components/SearchBar";
import { getComplaints, getComplaintById, acceptComplaint, rejectComplaint } from "../api/complaintsApi";
import { useUser } from "../contexts/UserContext";

const DATE_FILTERS = [
    { id: 7,   name: "Last 7 days" },
    { id: 30,  name: "Last 1 month" },
    { id: 90,  name: "Last 3 months" },
    { id: 180, name: "Last 6 months" },
];

function getDateFrom(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split("T")[0];
}

const STATUS_COLORS = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
    acknowledged: "bg-blue-100 text-blue-700 border-blue-300",
    justified: "bg-green-100 text-green-700 border-green-300",
    unjustified: "bg-red-100 text-red-700 border-red-300",
    senttovendor: "bg-purple-100 text-purple-700 border-purple-300",
};

export default function ComplainListPage() {
    const [search, setSearch] = useState("");
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(7);
    const [modal, setModal] = useState(null); // { step: 'details'|'reject'|'success', complaint, rejectionReason, notifiedRoles }
    const [actionLoading, setActionLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useUser();
    const isVendor = user?.role === "Vendor";

    useEffect(() => {
        fetchComplaints();
    }, [search, filter]);

    async function fetchComplaints() {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            params.incident_date_after = getDateFrom(filter);
            const res = await getComplaints(params);
            setComplaints(res.data?.data || res.data?.results || []);
        } catch (err) {
            console.error("Failed to fetch complaints:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleViewClick(row) {
        if (!isVendor) return navigate(`/complaint/${row.id}`);
        try {
            const res = await getComplaintById(row.id);
            const complaint = res.data?.data || res.data;
            setModal({ step: "details", complaint, rejectionReason: "", notifiedRoles: [] });
        } catch {
            navigate(`/complaint/${row.id}`);
        }
    }

    async function handleAccept() {
        setActionLoading(true);
        try {
            await acceptComplaint(modal.complaint.id);
            setModal((m) => ({ ...m, step: "success" }));
            fetchComplaints();
        } finally {
            setActionLoading(false);
        }
    }

    async function handleRejectSubmit() {
        setActionLoading(true);
        try {
            await rejectComplaint(modal.complaint.id, modal.rejectionReason, modal.notifiedRoles);
            setModal((m) => ({ ...m, step: "success" }));
            fetchComplaints();
        } finally {
            setActionLoading(false);
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
                <button className="text-blue-600 hover:underline" onClick={() => handleViewClick(row)}>
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
                        <FilterDropDown primarySelected={true} dropDownList={DATE_FILTERS} onChange={setFilter} />
                        <CustomButton title={"Export"} type={"unfilled-red"} rounded={false} length={"med"} />
                        {!isVendor && <CustomButton title={"Raise a ticket"} type={"filled"} rounded={false} length={"large"} handleSubmit={() => navigate("/complaints/raise")} />}
                    </div>
                </div>
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading...</div>
                ) : (
                    <CustomTable columns={columns} data={complaints} maxRows={20} />
                )}
            </div>

            {modal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => modal.step !== "success" && setModal(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>

                        {modal.step === "details" && (
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-xs text-[#888]">Details of {modal.complaint.ticket_id}</p>
                                        <p className="font-semibold text-sm mt-0.5">{modal.complaint.ticket_id}</p>
                                        <span className="text-xs text-[#888] border border-[#E8E8E8] rounded px-2 py-0.5 mt-1 inline-block">{modal.complaint.facility_name || "—"}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-[#888]">{modal.complaint.incident_date}</p>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded border capitalize mt-1 inline-block ${STATUS_COLORS[modal.complaint.status?.toLowerCase()] || STATUS_COLORS.pending}`}>
                                            {modal.complaint.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <DetailRow label="Date of Complaint" value={modal.complaint.incident_date} />
                                    <DetailRow label="SAP Code" value={modal.complaint.sap_code || "—"} />
                                    <DetailRow label="Batch" value={modal.complaint.batch_number || "—"} />
                                    <DetailRow label="Category" value={modal.complaint.complaint_category_name} />
                                    <DetailRow label="Volume Affected" value={modal.complaint.quantity ? `${modal.complaint.quantity} ${modal.complaint.quantity_unit || ""}` : "—"} />
                                    <DetailRow label="Issue" value={modal.complaint.severity} />
                                </div>
                                <p className="font-semibold mt-4 text-sm">{modal.complaint.product_name}</p>
                                <p className="text-xs text-[#666] mt-1">{modal.complaint.description || "—"}</p>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button onClick={() => setModal((m) => ({ ...m, step: "reject" }))} className="px-5 py-2 rounded-md border border-[#F11518] text-[#F11518] text-sm font-medium hover:bg-red-50">
                                        Reject
                                    </button>
                                    <button onClick={() => { setModal(null); navigate(`/complaint/${modal.complaint.id}/vendor-response`); }} className="px-5 py-2 rounded-md bg-[#F11518] text-white text-sm font-medium hover:bg-red-600">
                                        Accept
                                    </button>
                                </div>
                            </div>
                        )}

                        {modal.step === "reject" && (
                            <div className="p-6">
                                <p className="font-semibold text-sm mb-4">Reason of rejection</p>
                                <div className="flex flex-wrap gap-3 mb-3">
                                    {["Admin", "MarketQA", "Vendor", "RegionalQA", "DC"].map(role => (
                                        <label key={role} className="flex items-center gap-1.5 text-sm cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={modal.notifiedRoles.includes(role)}
                                                onChange={(e) => setModal(m => ({
                                                    ...m,
                                                    notifiedRoles: e.target.checked
                                                        ? [...m.notifiedRoles, role]
                                                        : m.notifiedRoles.filter(r => r !== role)
                                                }))}
                                            />
                                            {role}
                                        </label>
                                    ))}
                                </div>
                                <textarea
                                    value={modal.rejectionReason}
                                    onChange={(e) => setModal((m) => ({ ...m, rejectionReason: e.target.value }))}
                                    placeholder="Write Your Comment"
                                    rows={5}
                                    className="w-full border border-[#E8E8E8] rounded-md p-3 text-sm text-[#666] outline-none resize-none"
                                />
                                <div className="flex justify-end mt-4">
                                    <button onClick={handleRejectSubmit} disabled={actionLoading} className="px-5 py-2 rounded-md bg-[#F11518] text-white text-sm font-medium hover:bg-red-600 disabled:opacity-60">
                                        {actionLoading ? "Sending..." : "Send the comment"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {modal.step === "success" && (
                            <div className="p-10 flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-lg font-semibold">Sent successfully</p>
                                <button onClick={() => setModal(null)} className="px-6 py-2 rounded-md bg-[#F11518] text-white text-sm font-medium hover:bg-red-600">
                                    Return to complaints
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
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
