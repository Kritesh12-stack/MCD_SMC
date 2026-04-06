import { useState } from "react"
import DownIcon from "../assets/DownIcon.svg"

export default function FilterDropDown({ primarySelected = false, dropDownList = [] }) {
    const drpList = [
        {
            id: 1,
            name: "First Option"
        },
        {
            id: 2,
            name: "Second Option"
        },
        {
            id: 3,
            name: "Third Option"
        },
        {
            id: 4,
            name: "Fourth Option"
        }
    ]
    const [selected, setSelected] = useState(drpList[0].id)
    const [dropDownOpen, setDropDownOpen] = useState(false)
    
    return (
        <div onClick={() => setDropDownOpen(prev => !prev)} className={`relative flex items-center rounded-full px-4 py-1 ${primarySelected ? "" : `bg-[#FAFAFA] border border-[#E8E8E8]`} gap-2 cursor-pointer`}>
            <div className={!primarySelected ? `text-[#666666]`: "text-black"}>{primarySelected ? drpList.find(i => i.id === selected)["name"] : "Filter"}</div>
            <div className="mt-1">
                <img
                    src={DownIcon}
                    className={`w-3 h-3 transition-transform duration-200 ${dropDownOpen ? "rotate-180" : "rotate-0"
                        }`}
                    alt="down"
                />
            </div>
            {dropDownOpen && drpList.length && <div className="w-45 z-50 absolute top-full left-0 bg-white mt-2 shadow rounded-md ">
                {drpList.map((i) => (<div className={`px-4 py-3 text-base ${i.id === selected ? "font-semibold" : ""} hover:bg-gray-50`} key={i.id} onClick={()=>setSelected(i.id)}>{i.name}</div>))}
            </div>}
        </div>
    )
}