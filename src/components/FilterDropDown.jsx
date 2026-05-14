import { useEffect, useState } from "react"
import DownIcon from "../assets/DownIcon.svg"

export default function FilterDropDown({ primarySelected = false, label, dropDownList = [
        { id: 1, name: "First Option" },
        { id: 2, name: "Second Option" },
        { id: 3, name: "Third Option" },
        { id: 4, name: "Fourth Option" }
    ], onChange, value }) {
    const [selected, setSelected] = useState(value ?? dropDownList[0]?.id)
    const [dropDownOpen, setDropDownOpen] = useState(false)

    useEffect(() => {
        setSelected(value ?? dropDownList[0]?.id)
    }, [value, dropDownList])

    function handleSelect(id) {
        setSelected(id);
        if (onChange) onChange(id);
        setDropDownOpen(false);
    }
    
    return (
        <div className="flex items-center gap-2">
            <div onClick={() => setDropDownOpen(prev => !prev)} className={`relative flex h-[38px] items-center rounded-lg px-3 ${primarySelected ? "bg-transparent" : "bg-white border border-[#E6E9EE]"} gap-2 cursor-pointer transition-colors hover:bg-[#F6F7F9]`}>
            <div className={!primarySelected ? `text-[#556070] text-[13px] font-medium`: "text-[#202124] text-[13px] font-medium"}>{primarySelected ? (dropDownList.find(i => i.id === selected)?.name ?? dropDownList[0]?.name) : label ? label : "Filter"}</div>
            <div className="mt-1">
                <img
                    src={DownIcon}
                    className={`w-3 h-3 transition-transform duration-200 ${dropDownOpen ? "rotate-180" : "rotate-0"
                        }`}
                    alt="down"
                />
            </div>
            {dropDownOpen && dropDownList.length && <div className="w-48 z-50 absolute top-full left-0 bg-white mt-2 shadow-lg rounded-lg border border-[#E6E9EE] overflow-hidden">
                {dropDownList.map((i) => (<div className={`px-3 py-2.5 text-[13px] ${i.id === selected ? "font-semibold text-[#DB2F28] bg-[#FFF8F1]" : "text-[#344054]"} hover:bg-[#F6F7F9]`} key={i.id} onClick={(event) => { event.stopPropagation(); handleSelect(i.id); }}>{i.name}</div>))}
            </div>}
        </div>
        </div>
    )
}
