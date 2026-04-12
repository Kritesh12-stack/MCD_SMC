import { useRef } from "react";
import html2pdf from "html2pdf.js";
import letterhead from "../assets/letterhead.jpg";

export default function ResponseSheetPreview({ complaint, onExport }) {
  const sheetRef = useRef();

  const handleExport = () => {
    html2pdf().set({
      margin: 0, filename: `${complaint.ticket_id}-response.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 }, jsPDF: { unit: "mm", format: "a4" },
    }).from(sheetRef.current).save();
  };

  if (!complaint) return null;

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <p className="font-normal text-xs">Response Sheet Preview</p>
        <div className="flex gap-2">
          <button onClick={handleExport} className="border border-[#F11518] text-[#F11518] px-3 py-1 rounded-md text-xs font-medium cursor-pointer hover:bg-red-50">Export</button>
          <button className="bg-[#F11518] text-white px-3 py-1 rounded-md text-xs font-medium cursor-pointer hover:bg-[#d41315]">Share</button>
        </div>
      </div>

      <div ref={sheetRef} className="border border-[#E8E8E8] rounded-md bg-white text-[10px] leading-tight overflow-hidden" style={{ fontFamily: "Arial, sans-serif" }}>
        {/* Header */}
        <div className="flex justify-between items-start px-4 pt-3 pb-2 border-b border-[#ccc]">
          <div className="flex items-center gap-2">
            <img src={letterhead} alt="Logo" className="h-8" />
          </div>
          <div className="text-right text-[8px] text-[#555]">
            <p className="font-bold text-[10px]">CUSTOMER COMPLAINT RESPONSE FORM</p>
            <p>Document No: QA-FR-007</p>
            <p>Version: 3.2</p>
            <p>Classification: Confidential</p>
          </div>
        </div>

        <div className="px-4 py-2">
          {/* Complaint Details */}
          <p className="font-bold text-[10px] mb-1.5 bg-[#f0f0f0] px-1 py-0.5">COMPLAINT DETAILS</p>
          <table className="w-full border-collapse mb-2">
            <tbody>
              <Row l1="Date of Complaint" v1={fmt(complaint.created_at)} l2="Ticket ID" v2={complaint.ticket_id} />
              <Row l1="Product SAP Code" v1={complaint.wrin || "—"} l2="Supplier" v2={complaint.supplier_name || "—"} />
              <Row l1="Product Name" v1={complaint.product_name || "—"} l2="Category" v2={complaint.complaint_category_name || "—"} />
              <Row l1="Batch / Code" v1={complaint.batch_number || "—"} l2="Sub Category" v2={complaint.complaint_sub_category_name || "—"} />
              <Row l1="Production Date" v1={fmt(complaint.production_date)} l2="Severity" v2={complaint.severity || "—"} />
              <Row l1="Quantity Affected" v1={complaint.quantity ? `${complaint.quantity} ${complaint.quantity_unit || ""}` : "—"} l2="Status" v2={complaint.status || "—"} />
              <Row l1="Incident Date" v1={fmt(complaint.incident_date)} l2="Facility" v2={complaint.facility_name || "—"} />
            </tbody>
          </table>

          {/* Description */}
          <p className="font-bold text-[10px] mb-1 bg-[#f0f0f0] px-1 py-0.5">DETAILS OF THE COMPLAINT</p>
          <p className="px-1 py-1 mb-2 text-[9px] text-[#333] min-h-[30px]">{complaint.description || "No description provided."}</p>

          {/* Attached Pictures */}
          {complaint.attachments?.length > 0 && (
            <>
              <p className="font-bold text-[10px] mb-1 bg-[#f0f0f0] px-1 py-0.5">ATTACHED PICTURES</p>
              <div className="flex flex-wrap gap-2 px-1 py-1 mb-2">
                {complaint.attachments.map((a) => (
                  <img key={a.id} src={a.file} alt={a.filename} className="w-20 h-20 object-cover rounded border border-[#ddd]" crossOrigin="anonymous" />
                ))}
              </div>
            </>
          )}

          {/* Investigation / Vendor Response */}
          <p className="font-bold text-[10px] mb-1 bg-[#f0f0f0] px-1 py-0.5">DETAILS OF THE INVESTIGATION</p>
          <div className="px-1 py-1 mb-2 min-h-[40px]">
            {complaint.vendor_response ? (
              <p className="text-[9px] text-[#333]">{complaint.vendor_response}</p>
            ) : (
              <p className="text-[9px] text-[#999] italic">Pending vendor response...</p>
            )}
          </div>

          {/* Root Cause / Corrective / Preventive */}
          <table className="w-full border-collapse mb-2">
            <tbody>
              <SectionRow label="Root Cause" value={complaint.root_cause || "—"} />
              <SectionRow label="Corrective Action" value={complaint.corrective_action || "—"} />
              <SectionRow label="Preventive Action" value={complaint.preventive_action || "—"} />
              <SectionRow label="Conclusion" value={complaint.conclusion || "—"} />
            </tbody>
          </table>

          {/* Footer */}
          <div className="border-t border-[#ccc] pt-2 mt-1">
            <table className="w-full border-collapse">
              <tbody>
                <Row l1="Complaint Justified" v1={complaint.recall_recovery || "—"} l2="Date of Response" v2={fmt(complaint.updated_at)} />
                <Row l1="Created By" v1={complaint.created_by_email || "—"} l2="Assigned To" v2={complaint.assigned_to_email || "—"} />
              </tbody>
            </table>
            <p className="text-[7px] text-[#999] mt-2 text-center italic pb-2">
              *The complaint is considered 'CLOSED' when the customer either expresses their satisfaction with the resolution or remains unresponsive for more than 5 working days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ l1, v1, l2, v2 }) {
  return (
    <tr>
      <td className="text-[#888] py-0.5 w-[25%] pr-1 break-words">{l1}</td>
      <td className="font-medium text-[#333] py-0.5 w-[25%] break-words">{v1}</td>
      <td className="text-[#888] py-0.5 w-[25%] pr-1 break-words">{l2}</td>
      <td className="font-medium text-[#333] py-0.5 w-[25%] break-words">{v2}</td>
    </tr>
  );
}

function SectionRow({ label, value }) {
  return (
    <tr>
      <td className="text-[#888] py-1 w-[25%] pr-1 align-top">{label}</td>
      <td colSpan={3} className="text-[9px] text-[#333] py-1">{value}</td>
    </tr>
  );
}
