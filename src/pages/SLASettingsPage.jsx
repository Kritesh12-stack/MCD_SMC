import { useState, useEffect } from "react"
import PageHeading from "../components/PageHeading"
import DownIcon from "../assets/DownIcon.svg"
import { getSLASettings, updateSLASettings, getSLAViolations } from "../api/slaApi"

const escalationOptions = ["Market QA", "Market and Regional QA", "DC", "Vendor"]

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="7" stroke="#A0AEC0" strokeWidth="1.5" />
      <path d="M8 4.5V8L10.5 10" stroke="#A0AEC0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ActionDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      onClick={() => setOpen(p => !p)}
      className="w-93.5 flex-1 flex border border-[#E8E8E8] rounded-md p-4 justify-between items-center gap-2 relative cursor-pointer bg-white"
    >
      <div className="text-sm text-[#666666] truncate">{value}</div>
      <img src={DownIcon} alt="down" className={`w-3 h-3 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      {open && (
        <div className="absolute mt-1 top-full left-0 w-full bg-white shadow-md rounded-md z-50">
          {escalationOptions.map(opt => (
            <div key={opt} onClick={() => onChange(opt)} className="cursor-pointer hover:bg-gray-100 p-2 rounded-md text-sm">{opt}</div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SLASettingsPage() {
  const [settings, setSettings] = useState([])
  const [violations, setViolations] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [tab, setTab] = useState("settings")

  useEffect(() => {
    async function load() {
      try {
        const [settingsRes, violationsRes] = await Promise.all([getSLASettings(), getSLAViolations()])
        setSettings(settingsRes.data.data || settingsRes.data)
        setViolations(violationsRes.data.data || violationsRes.data)
      } catch (e) {
        setError(e.message || "Failed to load SLA data")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const updateField = (idx, field, value) => {
    setSettings(prev => prev.map((s, i) => i === idx ? { ...s, [field]: field.includes("hours") ? Number(value) || 0 : value } : s))
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      const payload = settings.map(({ severity, response_hours, resolution_hours, escalation_roles }) => ({
        severity, response_hours, resolution_hours, escalation_roles,
      }))
      const { data } = await updateSLASettings(payload)
      setSettings(data.data || data)
      setSuccess("SLA settings saved successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (e) {
      setError(e.message || "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <section><PageHeading title="SLA Settings" /><div className="px-8 py-6 text-gray-500">Loading...</div></section>

  return (
    <section>
      <PageHeading title="SLA Settings" />
      <div className="px-4 w-[70%]">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-md text-sm">{success}</div>}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[#E8E8E8]">
          {["settings", "violations"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`pb-2 text-sm font-medium capitalize cursor-pointer ${tab === t ? "text-[#F11518] border-b-2 border-[#F11518]" : "text-[#8492A6]"}`}
            >{t === "settings" ? "SLA Settings" : `Violations (${violations.length})`}</button>
          ))}
        </div>

        {tab === "settings" ? (
          <div className="max-w-4xl">
            <div className="flex gap-5 items-center pb-3 bg-">
             
              <div className="w-full text-[#494949] font-medium bg-[#FAFAFA] border-b border-[#E8E8E8] flex text-sm p-3">
                <div className="w-[18%]">Severity</div>
                <div className="w-[18%]">Response (hrs)</div>
                <div className="w-[60%]">Escalation Role</div>
              </div>
            </div>
            <div className="p-4 border rounded-md border-[#E8E8E8]">
            {settings.map((row, i) => (
              <div key={row.id || i} className="flex gap-5 items-center py-4 border-b border-[#E8E8E8]">
                <span className="w-[15%] text-sm text-[#425466] font-medium">{row.severity}</span>
                <div className="w-25 flex items-center justify-between border border-[#E8E8E8] rounded-md p-4">
                  <input type="number" value={row.response_hours} onChange={e => updateField(i, "response_hours", e.target.value)}
                    className="w-10 outline-0  text-sm text-[#425466]" />
                  <ClockIcon />
                </div>
                <ActionDropdown value={row.escalation_roles} onChange={val => updateField(i, "escalation_roles", val)} />
              </div>
            ))}
            </div>
            <div className="flex justify-end mt-8">
              <button onClick={handleSave} disabled={saving}
                className="bg-[#F11518] text-white px-6 py-2.5 rounded-md text-sm font-semibold cursor-pointer hover:bg-[#d41315] disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {violations.length === 0 ? (
              <p className="text-sm text-gray-500">No violations found.</p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-xs text-[#8492A6] border-b border-[#E8E8E8]">
                    {["Ticket ID", "Status", "Response Deadline", "Resolution Deadline", "Response Breached", "Resolution Breached"].map(h => (
                      <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {violations.map(v => (
                    <tr key={v.id} className="border-t border-[#E8E8E8]">
                      <td className="py-3 pr-4 text-[#425466]">{v.complaint_ticket_id}</td>
                      <td className="py-3 pr-4 text-[#425466]">{v.complaint_status}</td>
                      <td className="py-3 pr-4 text-[#425466]">{v.response_deadline ? new Date(v.response_deadline).toLocaleString() : "-"}</td>
                      <td className="py-3 pr-4 text-[#425466]">{v.resolution_deadline ? new Date(v.resolution_deadline).toLocaleString() : "-"}</td>
                      <td className="py-3 pr-4">{v.is_response_breached ? <span className="text-red-500 font-medium">Yes</span> : <span className="text-green-600">No</span>}</td>
                      <td className="py-3 pr-4">{v.is_resolution_breached ? <span className="text-red-500 font-medium">Yes</span> : <span className="text-green-600">No</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
