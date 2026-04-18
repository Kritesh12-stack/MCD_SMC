import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeading from "../components/PageHeading";
import SearchBar from "../components/SearchBar";
import FilterDropDown from "../components/FilterDropDown";
import { getNotifications, markNotificationRead } from "../api/complaintsApi";

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

const TYPE_CONFIG = {
    ComplaintCreated:  { icon: "!", iconBg: "bg-yellow-400", textColor: "text-yellow-500" },
    ComplaintUpdated:  { icon: "✔", iconBg: "bg-blue-500",   textColor: "text-blue-500"   },
    SLABreached:       { icon: "!", iconBg: "bg-red-500",    textColor: "text-red-500"     },
};

function getConfig(type = "") {
    return TYPE_CONFIG[type] || { icon: "•", iconBg: "bg-gray-400", textColor: "text-gray-500" };
}

const ROUTE_MAP = {
    complaint: (id) => `/complaint/${id}`,
    recall: (id) => `/voluntary-recall/${id}`,
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState(7);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const res = await getNotifications({ search, created_at_after: getDateFrom(filter) });
                setNotifications(res.data?.data || []);
            } catch (err) {
                console.error("Failed to fetch notifications:", err);
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
        <div>
            <PageHeading title="Notifications" />
            <div className="px-4">
                <div className="flex justify-between items-center mb-4 w-[70%]">
                    <SearchBar search={search} setSearch={setSearch} />
                    <FilterDropDown primarySelected={true} dropDownList={DATE_FILTERS} onChange={setFilter} />
                </div>
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">No notifications found</div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {notifications.map((item) => (
                            <NotificationCard key={item.id} item={item} onClick={() => handleClick(item)} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function NotificationCard({ item, onClick }) {
    const config = getConfig(item.type);
    return (
        <div className={`w-[70%] border rounded-xl bg-white px-5 py-4 border-[#E8E8E8]`}>
            <div className="flex justify-between items-start">
                <p className="font-semibold text-sm text-[#27272E]">{item.title}</p>
                <p className="text-xs text-[#888] shrink-0 ml-4">
                    {item.created_at ? new Date(item.created_at).toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short", year: "numeric" }) : "—"}
                </p>
            </div>
            <p className="text-xs text-[#888] mt-0.5">{item.message}</p>
            <div className="flex justify-between items-center mt-3">
                <p className="text-xs text-[#888]">{item.sender || "—"}</p>
                    <div className="flex items-center gap-1.5">
                        <span className={`w-5 h-5 rounded-full ${config.iconBg} text-white text-xs flex items-center justify-center font-bold shrink-0`}>{config.icon}</span>
                        <span className={`text-sm font-medium ${config.textColor}`}>{item.type}</span>
                    </div>
                    <button
                        onClick={onClick}
                        className="px-5 py-1.5 rounded-full bg-[#F11518] text-white text-sm font-medium hover:bg-[#d41315] cursor-pointer"
                    >
                        View
                    </button>
                </div>
        </div>
    );
}
