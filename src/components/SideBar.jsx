import SidebarItem from "./SidebarItem";
import DashboardIcon from "../assets/DashboardIcon.svg"
import CompList from "../assets/CompList.svg"
import account from "../assets/account.svg"
import mockRecall from "../assets/mockRecall.svg"
import notification from "../assets/notification.svg"
import settings from "../assets/settings.svg"
import Sla from "../assets/Sla.svg"
import voluntaryRecall from "../assets/voluntaryRecall.svg"
import logout from "../assets/logout.svg"
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function SideBar() {
    const [selected,setSelected] = useState("Dashboard")
    const location = useLocation()
    return (
        <section className="fixed top-0 left-0 h-screen w-64 bg-white shadow-lg overflow-auto flex flex-col items-center pt-11">
            <div className="w-20 h-24 rounded-md bg-amber-300 mb-4"></div>
            <SidebarItem path="/dashboard" Icon={DashboardIcon} title={"Dashboard"} setSelected={setSelected} isSelected={selected === "Dashboard"}/>
            <SidebarItem path="/complaints" Icon={CompList} title={"Complaints List"} setSelected={setSelected} isSelected={location.pathname === "/complaints" || location.pathname === "/complaints/raise" || selected === "Complaints List"}/>
            <SidebarItem path="/mock-recall" Icon={mockRecall} title={"Mock Recall"} setSelected={setSelected} isSelected={selected === "Mock Recall"}/>
            <SidebarItem path="/sla-settings" Icon={Sla} title={"SLA Settings"} setSelected={setSelected} isSelected={selected === "SLA Settings"}/>
            <SidebarItem path="/voluntary-recall" Icon={voluntaryRecall} title={"Voluntary Recall"} setSelected={setSelected} isSelected={selected === "Voluntary Recall"}/>
            <SidebarItem path="/settings" Icon={settings} title={"Settings"} setSelected={setSelected} isSelected={selected === "Settings"}/>
            <SidebarItem path="/notifications" Icon={notification} title={"Notifications"} setSelected={setSelected} isSelected={selected === "Notifications"}/>
            <SidebarItem path="/account" Icon={account} title={"Account"} setSelected={setSelected} isSelected={selected === "Account"}/>
            <SidebarItem path="/logout" Icon={logout} title={"Logout"} setSelected={setSelected} isSelected={selected === "Logout"}/>
        </section>
    )
}