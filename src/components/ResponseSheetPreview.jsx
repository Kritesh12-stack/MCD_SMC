import { useRef } from "react";
import html2pdf from "html2pdf.js";
import letterhead from "../assets/letterhead.jpg";

export default function ResponseSheetPreview({ complaint }) {
  const sheetRef = useRef();

  const handleExport = () => {
    html2pdf().set({
      margin: [10, 10, 10, 10],
      filename: `${complaint.ticket_id}-response.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4" },
    }).from(sheetRef.current).save();
  };

  if (!complaint) return null;

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, ".") : "—";
  const vr = complaint.vendor_response;

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <p className="font-normal text-xs">Response Sheet Preview</p>
        <div className="flex gap-2">
          <button onClick={handleExport} className="border border-[#F11518] text-[#F11518] px-3 py-1 rounded-md text-xs font-medium cursor-pointer hover:bg-red-50">Export</button>
          {/* <button className="bg-[#F11518] text-white px-3 py-1 rounded-md text-xs font-medium cursor-pointer hover:bg-[#d41315]">Share</button> */}
        </div>
      </div>

      <div ref={sheetRef} style={{ fontFamily: "Arial, sans-serif", fontSize: "9px", border: "1px solid #000", background: "#fff", maxWidth: "100%", overflowX: "hidden" }}>

        {/* Header */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ width: "15%", border: "1px solid #000", padding: "6px", textAlign: "center" }}>
                <img src={letterhead} alt="Logo" style={{ height: "48px", objectFit: "contain" }} />
              </td>
              <td style={{ width: "45%", border: "1px solid #000", padding: "6px", textAlign: "center", fontWeight: "bold", fontSize: "12px" }}>
                CUSTOMER COMPLAINT RESPONSE FORM
              </td>
              <td style={{ width: "40%", border: "1px solid #000", padding: "6px", fontSize: "8px" }}>
                <div>Document No: QA-FR-007</div>
                <div>Document Version No: 3.2</div>
                <div>Document Effective Date: 25OCT2023</div>
                <div>Document Classification: Confidential</div>
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ border: "1px solid #000" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td style={{ width: "50%", border: "1px solid #000", padding: "3px 6px", textAlign: "center" }}>Document Owner</td>
                      <td style={{ width: "50%", border: "1px solid #000", padding: "3px 6px", textAlign: "center" }}>Authorized by</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "center" }}>FSQA</td>
                      <td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "center" }}>FSQA Manager</td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "center", fontWeight: "bold" }}>Page 1 of 2</td>
            </tr>
          </tbody>
        </table>

        {/* Complaint Details */}
        <SectionHeader title="COMPLAINT DETAILS" />
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <TR l1="Date of Complaint" v1={fmt(complaint.created_at)} l2="Customer Name" v2={complaint.facility_name || "—"} />
            <TR l1="Product SAP Code" v1={complaint.wrin || "—"} l2="Brand Name" v2="McDonalds" />
            <TR l1="Product Name" v1={complaint.product_name || "—"} l2="Email From" v2={complaint.created_by_email || "—"} />
            <TR l1="Batch / Code" v1={complaint.batch_number || "—"} l2="Store Location" v2={complaint.facility_name || "—"} />
            <TR l1="Production Date" v1={fmt(complaint.production_date)} l2="Store Manager Name" v2="—" />
            <TR l1="Expiry Date" v1="—" l2="Verbal / Written" v2="Written" />
            <tr>
              <td style={lStyle}>Complete Complaint Information Received (Date)</td>
              <td colSpan={3} style={vStyle}>{fmt(complaint.created_at)}</td>
            </tr>
            <tr>
              <td style={lStyle}>Origin of Complaint</td>
              <td colSpan={3} style={vStyle}></td>
            </tr>
            <TR l1="Store" v1="Yes" l2="DC" v2="No" />
            <TR l1="Consumer" v1="Yes" l2="Other" v2="No" />
            <TR l1="Food Safety Issue" v1="No" l2="Quality Issue" v2="No" />
            <TR l1="Foreign Body (Product Related)" v1="Yes" l2="Foreign Body (Non-Product Related)" v2="No" />
            <TR l1="Complaint Product Received" v1="Yes" l2="Quantity Affected" v2={complaint.quantity ? `${complaint.quantity} ${complaint.quantity_unit || ""}` : "—"} />
            <tr>
              <td style={lStyle}>Details of the Complaint</td>
              <td colSpan={3} style={{ ...vStyle, whiteSpace: "pre-wrap" }}>{complaint.description || "—"}</td>
            </tr>
            {complaint.attachments?.length > 0 && (
              <tr>
                <td style={{ ...lStyle, verticalAlign: "top" }}>Attach Reference Pictures of the Complaint</td>
                <td colSpan={3} style={{ border: "1px solid #000", padding: "4px" }}>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {complaint.attachments.map(a => (
                      <img key={a.id} src={a.file} alt={a.filename} crossOrigin="anonymous"
                        style={{ width: "80px", height: "80px", objectFit: "cover", border: "1px solid #ccc" }} />
                    ))}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Investigation */}
        <SectionHeader title="DETAILS OF THE INVESTIGATION" />
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ ...lStyle, fontWeight: "bold" }}>QIR Ref No</td>
              <td colSpan={3} style={vStyle}>{vr?.qir_reference || "—"}</td>
            </tr>
            <tr>
              <td style={{ ...lStyle, fontWeight: "bold", verticalAlign: "top" }}>Internal Investigation</td>
              <td colSpan={3} style={{ ...vStyle, whiteSpace: "pre-wrap", minHeight: "60px" }}>{vr?.internal_investigation || "Pending vendor response..."}</td>
            </tr>
            <tr>
              <td style={{ ...lStyle, fontWeight: "bold", verticalAlign: "top" }}>Root Cause</td>
              <td colSpan={3} style={{ ...vStyle, whiteSpace: "pre-wrap" }}>{vr?.root_cause || "—"}</td>
            </tr>
            <tr>
              <td style={{ ...lStyle, fontWeight: "bold", verticalAlign: "top" }}>Corrective Actions</td>
              <td colSpan={3} style={{ ...vStyle, whiteSpace: "pre-wrap" }}>{vr?.corrective_actions || "—"}</td>
            </tr>
            <tr>
              <td style={{ ...lStyle, fontWeight: "bold", verticalAlign: "top" }}>Preventive Actions</td>
              <td colSpan={3} style={{ ...vStyle, whiteSpace: "pre-wrap" }}>{vr?.preventive_actions || "—"}</td>
            </tr>
            <tr>
              <td style={{ ...lStyle, fontWeight: "bold", verticalAlign: "top" }}>Conclusion</td>
              <td colSpan={3} style={{ ...vStyle, whiteSpace: "pre-wrap" }}>{vr?.conclusion || "—"}</td>
            </tr>
            <TR l1="Complaint Justified" v1={vr?.is_justified ? "Yes" : "No"} l2="Date of Response" v2={fmt(vr?.date_of_response)} />
            <TR l1="Created By" v1={complaint.created_by_email || "—"} l2="Assigned To" v2={complaint.assigned_to_email || "—"} />
          </tbody>
        </table>

        <div style={{ fontSize: "7px", color: "#888", textAlign: "center", padding: "4px", fontStyle: "italic" }}>
          *The complaint is considered 'CLOSED' when the customer either expresses their satisfaction with the resolution or remains unresponsive for more than 5 working days
        </div>
      </div>
    </div>
  );
}

const lStyle = { border: "1px solid #000", padding: "3px 6px", width: "25%", color: "#333", verticalAlign: "middle" };
const vStyle = { border: "1px solid #000", padding: "3px 6px", fontWeight: "bold", color: "#111", verticalAlign: "middle" };

function TR({ l1, v1, l2, v2 }) {
  return (
    <tr>
      <td style={lStyle}>{l1}</td>
      <td style={{ ...vStyle, width: "25%" }}>{v1}</td>
      <td style={lStyle}>{l2}</td>
      <td style={{ ...vStyle, width: "25%" }}>{v2}</td>
    </tr>
  );
}

function SectionHeader({ title }) {
  return (
    <div style={{ background: "#d9e1f2", fontWeight: "bold", fontSize: "9px", padding: "3px 6px", border: "1px solid #000", borderTop: "none" }}>
      {title}
    </div>
  );
}
