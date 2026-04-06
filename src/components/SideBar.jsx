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

export default function SideBar() {
    const [selected,setSelected] = useState("Dashboard")
    return (
        <section className="fixed top-0 left-0 h-screen w-64 bg-white shadow-lg overflow-auto flex flex-col items-center pt-11">
            <div className="w-20 h-24 rounded-md bg-amber-300 mb-4"></div>
            <SidebarItem Icon={DashboardIcon} title={"Dashboard"} setSelected={setSelected} isSelected={selected === "Dashboard"}/>
            <SidebarItem Icon={CompList} title={"Complaints List"} setSelected={setSelected} isSelected={selected === "Complaints List"}/>
            <SidebarItem Icon={mockRecall} title={"Mock Recall"} setSelected={setSelected} isSelected={selected === "Mock Recall"}/>
            <SidebarItem Icon={Sla} title={"SLA Settings"} setSelected={setSelected} isSelected={selected === "SLA Settings"}/>
            <SidebarItem Icon={voluntaryRecall} title={"Voluntary Recall"} setSelected={setSelected} isSelected={selected === "Voluntary Recall"}/>
            <SidebarItem Icon={settings} title={"Settings"} setSelected={setSelected} isSelected={selected === "Settings"}/>
            <SidebarItem Icon={notification} title={"Notifications"} setSelected={setSelected} isSelected={selected === "Notifications"}/>
            <SidebarItem Icon={account} title={"Account"} setSelected={setSelected} isSelected={selected === "Account"}/>
            <SidebarItem Icon={logout} title={"Logout"} setSelected={setSelected} isSelected={selected === "Logout"}/>
        </section>
    )
}