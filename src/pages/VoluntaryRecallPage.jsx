import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeading from "../components/PageHeading";
import { getVoluntaryRecalls } from "../api/complaintsApi";
import { useUser } from "../contexts/UserContext";

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

export default function VoluntaryRecallPage() {
    const [recalls, setRecalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useUser();
    const isVendor = user?.role?.toLowerCase() === "vendor";

    useEffect(() => {
        async function fetchRecalls() {
            setLoading(true);
            try {
                const res = await getVoluntaryRecalls();
                setRecalls(res.data?.data || []);
            } catch (err) {
                console.error("Failed to fetch voluntary recalls:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchRecalls();
    }, []);

    return (
        <div>
            <PageHeading title="Voluntary Recall" />
            <div className="px-4 w-[70%]">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-sm font-semibold text-[#27272E]">Voluntary Recall Status</p>
                    {isVendor && (
                        <button
                            onClick={() => navigate("/voluntary-recall/new")}
                            className="bg-[#F11518] text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-[#d41315] cursor-pointer"
                        >
                            Start a Voluntary Recall
                        </button>
                    )}
                </div>
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading...</div>
                ) : recalls.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">No recalls found</div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {recalls.map((item) => (
                            <RecallCard key={item.id} item={item} onView={() => navigate(`/voluntary-recall/${item.id}`)} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function RecallCard({ item, onView }) {
    const config = getStatusConfig(item.status);

    return (
        <div className="border border-[#E8E8E8] rounded-xl bg-white px-5 py-4">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-semibold text-sm text-[#27272E]">{item.product_name}</p>
                    <p className="text-xs text-[#888] mt-0.5">{item.regulatory_ref || "—"}</p>
                </div>
                <p className="text-xs text-[#888]">{item.created_at ? new Date(item.created_at).toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short", year: "numeric" }) : "—"}</p>
            </div>
            <div className="flex justify-between items-center mt-3">
                <p className="text-xs text-[#888]">{item.supplier_name || "Vendor/Supplier"}</p>
                {/* <div className="flex items-center gap-4"> */}
                    <div className="flex items-center gap-1.5">
                        <span className={`w-5 h-5 rounded-full ${config.iconBg} text-white text-xs flex items-center justify-center font-bold`}>
                            {config.icon}
                        </span>
                        <span className={`text-sm font-medium ${config.textColor}`}>{config.label}</span>
                    </div>
                    <button
                        onClick={onView}
                        className="px-5 py-1.5 rounded-full border border-[#27272E] text-sm font-medium text-[#27272E] hover:bg-gray-50"
                    >
                        View
                    </button>
                {/* </div> */}
            </div>
        </div>
    );
}
