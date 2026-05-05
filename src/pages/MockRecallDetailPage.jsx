import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeading from "../components/PageHeading";
import MockWatermark from "../components/MockWatermark";
import { getMockRecallById, acceptMockRecall, rejectMockRecall } from "../api/complaintsApi";

const STATUS_CONFIG = {
    accepted:  { icon: "✔", iconBg: "bg-green-500", textColor: "text-green-500", label: "Accepted" },
    rejected:  { icon: "!", iconBg: "bg-red-400",   textColor: "text-red-500",   label: "Rejected" },
    inprocess: { icon: "…", iconBg: "bg-yellow-400", textColor: "text-yellow-500", label: "In Process" },
};

function getStatusConfig(status = "") {
    const key = status.toLowerCase().replace(/\s/g, "");
    if (key.includes("accept")) return STATUS_CONFIG.accepted;
    if (key.includes("reject")) return STATUS_CONFIG.rejected;
    return STATUS_CONFIG.inprocess;
}

function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short", year: "numeric" });
}

export default function MockRecallDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recall, setRecall] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // { type: 'accept'|'reject', reason: '' }
    const [actionLoading, setActionLoading] = useState(false);

    async function fetchRecall() {
        setLoading(true);
        try {
            const res = await getMockRecallById(id);
            setRecall(res.data?.data || res.data);
        } catch (err) {
            console.error("Failed to fetch mock recall:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchRecall(); }, [id]);

    async function handleAction() {
        setActionLoading(true);
        try {
            if (modal.type === "accept") await acceptMockRecall(id, modal.reason);
            else await rejectMockRecall(id, modal.reason);
            setModal(null);
            fetchRecall();
        } catch (err) {
            console.error("Action failed:", err);
        } finally {
            setActionLoading(false);
        }
    }

    if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;
    if (!recall) return <div className="text-center py-20 text-gray-400">Mock recall not found</div>;

    const config = getStatusConfig(recall.status);

    return (
        <MockWatermark>
            <PageHeading title="Mock Recall" />
            <div className="px-4">
                <button onClick={() => navigate("/mock-recall")} className="text-sm text-[#888] hover:text-[#27272E] mb-4 flex items-center gap-1">
                    ← Back to list
                </button>
                <div className="border border-[#E8E8E8] rounded-xl bg-white p-6 max-w-2xl">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-lg font-semibold text-[#27272E]">{recall.product_name}</p>
                            <p className="text-xs text-[#888] mt-0.5">{recall.supplier_name || "Vendor/Supplier"}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <span className={`w-5 h-5 rounded-full ${config.iconBg} text-white text-xs flex items-center justify-center font-bold`}>
                                    {config.icon}
                                </span>
                                <span className={`text-sm font-medium ${config.textColor}`}>{config.label}</span>
                            </div>
                            {recall.status === "InProcess" && (
                                <div className="flex gap-2">
                                    <button onClick={() => setModal({ type: "accept", reason: "" })}
                                        className="px-4 py-1.5 rounded-md bg-green-500 text-white text-sm font-medium hover:bg-green-600 cursor-pointer">
                                        Accept
                                    </button>
                                    <button onClick={() => setModal({ type: "reject", reason: "" })}
                                        className="px-4 py-1.5 rounded-md border border-[#F11518] text-[#F11518] text-sm font-medium hover:bg-red-50 cursor-pointer">
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5 text-sm">
                        <DetailRow label="Batch Number" value={recall.batch_number} />
                        <DetailRow label="SAP Code" value={recall.sap_code} />
                        <DetailRow label="Quantity" value={recall.quantity} />
                        <DetailRow label="Status" value={recall.status} />
                        <DetailRow label="Initiated By" value={recall.initiated_by_email} />
                        <DetailRow label="Created At" value={formatDate(recall.created_at)} />
                        <DetailRow label="Updated At" value={formatDate(recall.updated_at)} />
                    </div>

                    {recall.reason && (
                        <div className="mt-5">
                            <p className="text-xs text-[#888] font-medium">Reason</p>
                            <p className="text-sm mt-1 text-[#27272E]">{recall.reason}</p>
                        </div>
                    )}

                    {recall.responses?.length > 0 && (
                        <div className="mt-5">
                            <p className="text-xs text-[#888] font-medium mb-2">Responses</p>
                            <div className="flex flex-col gap-2">
                                {recall.responses.map(r => (
                                    <div key={r.id} className="border border-[#E8E8E8] rounded-lg px-4 py-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-[#27272E]">{r.responded_by_email}</span>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.action === "Accept" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                {r.action}
                                            </span>
                                        </div>
                                        {r.reason && <p className="text-xs text-[#888] mt-1">{r.reason}</p>}
                                        <p className="text-xs text-[#aaa] mt-1">{formatDate(r.responded_at)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Accept / Reject Modal */}
            {modal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setModal(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                        <p className="font-semibold text-sm mb-4 capitalize">{modal.type} Mock Recall</p>
                        <textarea
                            value={modal.reason}
                            onChange={e => setModal(m => ({ ...m, reason: e.target.value }))}
                            placeholder="Enter reason (optional)"
                            rows={4}
                            className="w-full border border-[#E8E8E8] rounded-md p-3 text-sm outline-none resize-none"
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={() => setModal(null)} className="px-5 py-2 rounded-md border border-[#E8E8E8] text-sm text-[#425466] hover:bg-gray-50">
                                Cancel
                            </button>
                            <button onClick={handleAction} disabled={actionLoading}
                                className={`px-5 py-2 rounded-md text-white text-sm font-medium disabled:opacity-60 ${modal.type === "accept" ? "bg-green-500 hover:bg-green-600" : "bg-[#F11518] hover:bg-[#d41315]"}`}>
                                {actionLoading ? "Submitting..." : `Confirm ${modal.type}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MockWatermark>
    );
}

function DetailRow({ label, value }) {
    return (
        <div>
            <p className="text-xs text-[#888]">{label}</p>
            <p className="font-semibold text-sm mt-0.5 text-[#27272E]">{value ?? "—"}</p>
        </div>
    );
}
