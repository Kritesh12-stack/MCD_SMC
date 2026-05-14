import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeading from "../components/PageHeading";
import SearchBar from "../components/SearchBar";
import FilterDropDown from "../components/FilterDropDown";
import { getNotifications, markNotificationRead } from "../api/complaintsApi";

const DATE_FILTERS = [
    { id: "all", name: "All notifications" },
    { id: 7,   name: "Last 7 days" },
    { id: 30,  name: "Last 1 month" },
    { id: 90,  name: "Last 3 months" },
    { id: 180, name: "Last 6 months" },
];

function getDateFrom(days) {
    if (days === "all") return null;
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split("T")[0];
}

const TYPE_CONFIG = {
    ComplaintCreated:  { icon: "!", iconBg: "bg-[#EFA52A]", textColor: "text-[#E89806]" },
    ComplaintUpdated:  { icon: "!", iconBg: "bg-[#EFA52A]", textColor: "text-[#E89806]" },
    SLABreached:       { icon: "!", iconBg: "bg-[#EFA52A]", textColor: "text-[#E89806]" },
    StatusChanged:     { icon: "!", iconBg: "bg-[#EFA52A]", textColor: "text-[#E89806]" },
    VendorResponse:    { icon: "!", iconBg: "bg-[#EFA52A]", textColor: "text-[#E89806]" },
    RecallInitiated:   { icon: "!", iconBg: "bg-[#EFA52A]", textColor: "text-[#E89806]" },
    BatchSubmitted:    { icon: "!", iconBg: "bg-[#EFA52A]", textColor: "text-[#E89806]" },
    BatchReview:       { icon: "!", iconBg: "bg-[#EFA52A]", textColor: "text-[#E89806]" },
    BatchFeedback:     { icon: "!", iconBg: "bg-[#EFA52A]", textColor: "text-[#E89806]" },
    BatchEscalated:    { icon: "!", iconBg: "bg-[#EFA52A]", textColor: "text-[#E89806]" },
    BatchRisk:         { icon: "!", iconBg: "bg-[#EFA52A]", textColor: "text-[#E89806]" },
};

function getConfig(type = "") {
    return TYPE_CONFIG[type] || { icon: "!", iconBg: "bg-[#EFA52A]", textColor: "text-[#E89806]" };
}

const ROUTE_MAP = {
    complaint: (id) => `/complaint/${id}`,
    recall: (id) => `/voluntary-recall/${id}`,
    batch: (id) => `/batch-details/${id}`,
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError("");
            try {
                const createdAfter = getDateFrom(filter);
                const params = {
                    ...(search.trim() ? { search: search.trim() } : {}),
                    ...(createdAfter ? { created_at_after: createdAfter } : {}),
                };
                const res = await getNotifications(params);
                setNotifications(res.data?.data || []);
            } catch (err) {
                setNotifications([]);
                setError(err?.message || "Failed to fetch notifications.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [search, filter]);

    async function handleClick(item) {
        if (!item.is_read) {
            try {
                await markNotificationRead(item.id);
                setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, is_read: true } : n));
            } catch (err) {
                console.error("Failed to mark as read:", err);
            }
        }
        const type = item.related_object_type?.toLowerCase();
        const route = ROUTE_MAP[type];
        if (route && item.related_object_id) navigate(route(item.related_object_id));
    }

    return (
        <div className="pb-10">
            <PageHeading title="Notification" />
            <div className="px-6 pt-10">
                <div className="rounded-xl border border-[#E6E9EE] bg-white px-6 py-5">
                    <div className="mb-4 flex w-full max-w-[820px] items-center gap-6">
                        <SearchBar search={search} setSearch={setSearch} />
                        <FilterDropDown primarySelected={true} dropDownList={DATE_FILTERS} value={filter} onChange={setFilter} />
                    </div>
                    {loading ? (
                        <div className="max-w-[820px] rounded-lg bg-white py-10 text-center text-sm text-[#6F7785]">Loading...</div>
                    ) : error ? (
                        <div className="max-w-[820px] rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="max-w-[820px] rounded-lg border border-[#E6E9EE] bg-white px-4 py-10 text-center text-sm text-[#6F7785]">
                            No notifications found for this account.
                        </div>
                    ) : (
                        <div className="flex max-w-[820px] flex-col gap-4">
                            {notifications.map((item) => (
                                <NotificationCard key={item.id} item={item} onClick={() => handleClick(item)} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function formatTime(value) {
    if (!value) return "—";
    return new Date(value).toLocaleString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function readableType(type = "") {
    return String(type)
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/^Batch /, "")
        .trim() || "Notification";
}

function sourceLabel(item) {
    const type = item.related_object_type ? `${item.related_object_type.charAt(0).toUpperCase()}${item.related_object_type.slice(1)}` : "Market QA";
    const id = item.related_object_id ? String(item.related_object_id).slice(0, 8) : item.id ? String(item.id).slice(0, 8) : "";
    return id ? `${type} ${id}` : type;
}

function NotificationCard({ item, onClick }) {
    const config = getConfig(item.type);
    return (
        <div className="rounded-xl border border-[#E8E8E8] bg-white px-6 py-4 shadow-[0_8px_18px_rgba(17,24,39,0.12)]">
            <div className="grid grid-cols-[minmax(0,1fr)_220px_88px] items-center gap-5">
                <div className="min-w-0">
                    <p className="truncate text-[15px] font-bold text-[#494949]">{item.title}</p>
                    <p className="mt-1 truncate text-[14px] text-[#494949]">{item.message}</p>
                    <p className="mt-3 truncate text-[15px] text-[#888888]">{sourceLabel(item)}</p>
                </div>
                <div className="min-w-0">
                    <p className="mb-8 text-right text-[15px] text-[#888888]">{formatTime(item.created_at)}</p>
                    <div className="flex items-center gap-2">
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${config.iconBg} text-sm font-bold text-white`}>
                            {config.icon}
                        </span>
                        <span className={`truncate text-[15px] font-medium ${config.textColor}`}>{readableType(item.type)}</span>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClick}
                    className="h-11 rounded-full bg-[#E5322D] px-6 text-[15px] font-semibold text-white hover:bg-[#C82420]"
                >
                    View
                </button>
            </div>
        </div>
    );
}
