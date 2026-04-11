import { useState } from "react"
import { useNavigate } from "react-router-dom"
import PageHeading from "../components/PageHeading"
import DownIcon from "../assets/DownIcon.svg"

const actionOptions = ["Market QA", "Market and Regional QA", "DC", "Vendor"]

const initialRows = [
  { type: "Critical", time: "4h", action: "Escalate to Market QA and Regional QA", options: ["Escalate to Market QA and Regional QA", ...actionOptions] },
  { type: "High", time: "3h", action: "Notification to Regional QA", options: ["Notification to Regional QA", ...actionOptions] },
  { type: "Medium", time: "2h", action: "Notification to Market QA", options: ["Notification to Market QA", ...actionOptions] },
  { type: "Low", time: "1h", action: "Notification to DC", options: ["Notification to DC", ...actionOptions] },
]

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="7" stroke="#A0AEC0" strokeWidth="1.5" />
      <path d="M8 4.5V8L10.5 10" stroke="#A0AEC0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ActionDropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      onClick={() => setOpen(prev => !prev)}
      className="flex border border-[#E8E8E8] rounded-md p-4 justify-between items-center gap-2 relative cursor-pointer bg-white"
    >
      <div className="text-sm text-[#666666] truncate">{value}</div>
      <img src={DownIcon} alt="down" className={`w-3 h-3 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`} />
      {open && (
        <div className="absolute mt-1 top-full left-0 w-full bg-white shadow-md rounded-md z-50">
          {options.map(opt => (
            <div
              key={opt}
              onClick={() => onChange(opt)}
              className="cursor-pointer hover:bg-gray-100 p-2 rounded-md text-sm"
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SLASettingsPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(initialRows)

  const updateAction = (idx, value) => {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, action: value } : r))
  }

  return (
    <section>
      <PageHeading title="SLA Settings" />
      <div className="px-8 py-6">
        

        <div className="max-w-3xl">
          <div className="grid grid-cols-[120px_130px_1fr] items-center pb-3">
            <span className="text-xs text-[#8492A6] font-medium">Type</span>
            <span className="text-xs text-[#8492A6] font-medium">Response time</span>
            <span className="text-xs text-[#8492A6] font-medium">Action</span>
          </div>

          {rows.map((row, i) => (
            <div key={row.type} className="grid grid-cols-[120px_130px_1fr] items-center py-5 border-t border-[#E8E8E8]">
              <span className="text-sm text-[#425466]">{row.type}</span>
              <span className="text-sm text-[#425466] flex items-center gap-2">
                {row.time} <ClockIcon />
              </span>
              <ActionDropdown
                value={row.action}
                options={row.options}
                onChange={val => updateAction(i, val)}
              />
            </div>
          ))}

          <div className="flex justify-end mt-8">
            <button className="bg-[#F11518] text-white px-6 py-2.5 rounded-md text-sm font-semibold cursor-pointer hover:bg-[#d41315]">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
