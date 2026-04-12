import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeading from "../components/PageHeading";
import { getVoluntaryRecallById } from "../api/complaintsApi";

const STATUS_CONFIG = {
    accepted: { icon: "✔", iconBg: "bg-blue-500", textColor: "text-blue-500", label: "Accepted" },
    rejected: { icon: "!", iconBg: "bg-yellow-400", textColor: "text-yellow-500", label: "Rejected" },
    initiated: { icon: "!", iconBg: "bg-yellow-400", textColor: "text-yellow-500", label: "Initiated" },
};

function getStatusConfig(status = "") {
    const key = status.toLowerCase();
    if (key.includes("accept")) return STATUS_CONFIG.accepted;
    if (key.includes("reject")) return STATUS_CONFIG.rejected;
    return STATUS_CONFIG.initiated;
}

function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short", year: "numeric" });
}

export default function VoluntaryRecallDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recall, setRecall] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRecall() {
            setLoading(true);
            try {
                const res = await getVoluntaryRecallById(id);
                setRecall(res.data?.data || res.data);
            } catch (err) {
                console.error("Failed to fetch recall:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchRecall();
    }, [id]);

    if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;
    if (!recall) return <div className="text-center py-20 text-gray-400">Recall not found</div>;

    const config = getStatusConfig(recall.status);

    return (
        <div>
            <PageHeading title="Voluntary Recall" />
            <div className="px-4">
                <button onClick={() => navigate("/voluntary-recall")} className="text-sm text-[#888] hover:text-[#27272E] mb-4 flex items-center gap-1">
                    ← Back to list
                </button>
                <div className="border border-[#E8E8E8] rounded-xl bg-white p-6 max-w-2xl">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-lg font-semibold text-[#27272E]">{recall.product_name}</p>
                            <p className="text-xs text-[#888] mt-0.5">{recall.supplier_name || "Vendor/Supplier"}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-5 h-5 rounded-full ${config.iconBg} text-white text-xs flex items-center justify-center font-bold`}>
                                {config.icon}
                            </span>
                            <span className={`text-sm font-medium ${config.textColor}`}>{config.label}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5 text-sm">
                        <DetailRow label="Regulatory Ref" value={recall.regulatory_ref} />
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
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value }) {
    return (
        <div>
            <p className="text-xs text-[#888]">{label}</p>
            <p className="font-semibold text-sm mt-0.5 text-[#27272E]">{value || "—"}</p>
        </div>
    );
}
