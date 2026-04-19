import SidebarItem from "./SidebarItem";
import DashboardIcon from "../assets/DashboardIcon.svg"
import CompList from "../assets/CompList.svg"
import account from "../assets/account.svg"
import mockRecall from "../assets/mockRecall.svg"
import notification from "../assets/notification.svg"
import settings from "../assets/settings.svg"
import Sla from "../assets/Sla.svg"
import voluntaryRecall from "../assets/voluntaryRecall.svg"
import logoutIcon from "../assets/logout.svg"
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/Logo_mcd.png"
import { getUnreadNotificationCount } from "../api/complaintsApi";
import { useUser } from "../contexts/UserContext";

export default function SideBar() {
    const [selected, setSelected] = useState("Dashboard")
    const [unreadCount, setUnreadCount] = useState(0)
    const location = useLocation()
    const navigate = useNavigate()
    const { logout } = useUser()

    const isActive = (path) => location.pathname.startsWith(path)

    async function handleLogout() {
        await logout()
        navigate("/login")
    }

    useEffect(() => {
        async function fetchUnread() {
            try {
                const res = await getUnreadNotificationCount();
                setUnreadCount(res.data?.data?.unread_count ?? res.data?.unread_count ?? 0);
            } catch {}
        }
        fetchUnread();
    }, [location.pathname]);

    return (
        <section style={{ fontFamily: "Inter, sans-serif" }} className="fixed top-0 left-0 h-screen w-56 bg-white shadow-lg overflow-auto flex flex-col items-center pt-11">
            <div className="w-20 h-24 rounded-md mb-4">
                <img src={logo} alt="Logo" />
            </div>
            <SidebarItem path="/dashboard" Icon={DashboardIcon} title={"Dashboard"} setSelected={setSelected} isSelected={isActive("/dashboard")}/>
            <SidebarItem path="/complaints" Icon={CompList} title={"Complaints List"} setSelected={setSelected} isSelected={isActive("/complaint")}/>
            <SidebarItem path="/mock-recall" Icon={mockRecall} title={"Mock Recall"} setSelected={setSelected} isSelected={isActive("/mock-recall")}/>
            <SidebarItem path="/sla-settings" Icon={Sla} title={"SLA Settings"} setSelected={setSelected} isSelected={isActive("/sla-settings")}/>
            <SidebarItem path="/voluntary-recall" Icon={voluntaryRecall} title={"Voluntary Recall"} setSelected={setSelected} isSelected={isActive("/voluntary-recall")}/>
            {/* <SidebarItem path="/settings" Icon={settings} title={"Settings"} setSelected={setSelected} isSelected={isActive("/settings")}/> */}
            <SidebarItem path="/notifications" Icon={notification} title={"Notifications"} setSelected={setSelected} isSelected={isActive("/notifications")} badge={unreadCount}/>
            {/* <SidebarItem path="/account" Icon={account} title={"Account"} setSelected={setSelected} isSelected={isActive("/account")}/> */}
            <SidebarItem path="/logout" Icon={logoutIcon} title={"Logout"} setSelected={setSelected} isSelected={false} onClick={handleLogout}/>
        </section>
    )
}