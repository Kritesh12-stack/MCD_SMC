import { useState } from "react"
import DownIcon from "../assets/DownIcon.svg"
export default function CustomDropdown({ title, options, selected, setSelected , placeholder = "Select" }) {
    const [open, setOpen] = useState(false)
    
    return (
        <div className="w-full flex flex-col gap-2">
            <div className=" font-medium text-[#494949] text-sm">{title}</div>
            <div onClick={() => setOpen(prev => !prev)} className="flex border border-[#E8E8E8] rounded-md p-4 justify-between items-center gap-2 relative cursor-pointer">
                <div className="text-sm text-[#666666]">{selected.name ? selected.name : placeholder}</div>
                <div>
                    <img src={DownIcon} alt="down" className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`} />
                </div>
                {open && <div className="absolute mt-1 top-full left-0 w-full bg-white shadow-md rounded-md z-50">
                    {options.map((option) => (
                        <div key={option.id} onClick={() => setSelected(option)} className="cursor-pointer hover:bg-gray-100 p-2 rounded-md text-sm">{option.name}</div>
                    ))}
                </div>}
            </div>
        </div>
    )
}