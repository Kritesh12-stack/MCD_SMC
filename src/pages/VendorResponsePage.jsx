import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeading from "../components/PageHeading";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import { getComplaintById, acceptComplaint, uploadAttachment } from "../api/complaintsApi";
import { useUser } from "../contexts/UserContext";

const EMPTY_FORM = {
    qir_reference: "",
    internal_investigation: "",
    root_cause: "",
    corrective_actions: "",
    preventive_actions: "",
    conclusion: "",
    is_justified: false,
    date_of_response: "",
    designation: "",
};

const STATUS_COLORS = {
    pending: "border-yellow-400 text-yellow-500",
    acknowledged: "border-blue-400 text-blue-500",
    justified: "border-green-400 text-green-500",
    unjustified: "border-red-400 text-red-500",
    senttovendor: "border-purple-400 text-purple-500",
};

export default function VendorResponsePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(EMPTY_FORM);
    const [images, setImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState("");

    useEffect(() => {
        async function fetchComplaint() {
            try {
                const res = await getComplaintById(id);
                setComplaint(res.data?.data || res.data);
            } catch {
                navigate("/complaints");
            } finally {
                setLoading(false);
            }
        }
        fetchComplaint();
    }, [id]);

    const setField = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

    function handleImages(e) {
        const files = Array.from(e.target.files).filter(f => f.size <= 500 * 1024);
        setImages(prev => [...prev, ...files.map(file => ({ file, preview: URL.createObjectURL(file) }))]);
        e.target.value = "";
    }

    function removeImage(i) {
        setImages(prev => { URL.revokeObjectURL(prev[i].preview); return prev.filter((_, idx) => idx !== i); });
    }

    async function handleSubmit() {
        setApiError("");
        if (!form.qir_reference.trim()) {
            setApiError("QIR Reference is required.");
            return;
        }
        setSubmitting(true);
        try {
            await acceptComplaint(id, {
                qir_reference: form.qir_reference || undefined,
                internal_investigation: form.internal_investigation || undefined,
                root_cause: form.root_cause || undefined,
                corrective_actions: form.corrective_actions || undefined,
                preventive_actions: form.preventive_actions || undefined,
                conclusion: form.conclusion || undefined,
                is_justified: form.is_justified,
                date_of_response: form.date_of_response || undefined,
                decided_by: user?.id || undefined,
                designation: form.designation || undefined,
            });
            if (images.length > 0) {
                await Promise.allSettled(images.map(({ file }) => uploadAttachment(id, file)));
            }
            navigate("/complaints");
        } catch (err) {
            setApiError(err.response?.data?.error?.message || err.message || "Failed to submit");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;
    if (!complaint) return null;

    const statusClass = STATUS_COLORS[complaint.status?.toLowerCase()] || STATUS_COLORS.pending;

    return (
        <div>
            <PageHeading title="Details" />
            <div className="px-4 pr-6 flex gap-6 pb-10">

                {/* Left — Form */}
                <div className="flex-1 flex flex-col gap-5">
                    <p className="font-semibold text-sm text-[#27272E]">Details of Investigation</p>

                    <CustomInput title="Qir Ref No." value={form.qir_reference} onChange={setField("qir_reference")} type="text" placeholder="CC-13-06-2025" />
                    <FormTextArea label="Internal Investigation" value={form.internal_investigation} onChange={setField("internal_investigation")} />
                    <FormTextArea label="Root Cause" value={form.root_cause} onChange={setField("root_cause")} />
                    <FormTextArea label="Corrective Actions" value={form.corrective_actions} onChange={setField("corrective_actions")} />
                    <FormTextArea label="Preventive Actions" value={form.preventive_actions} onChange={setField("preventive_actions")} />
                    <FormTextArea label="Conclusion" value={form.conclusion} onChange={setField("conclusion")} />

                    {/* Media Upload */}
                    <div className="flex flex-col gap-2">
                        <p className="font-medium text-[#494949] text-sm">Add media</p>
                        <label className="w-full border border-dashed border-[#C4C4C4] rounded-lg p-6 flex flex-col items-center gap-1 cursor-pointer hover:bg-gray-50">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#888]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            <p className="text-sm text-[#666]">Upload or drag and drop photos</p>
                            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
                        </label>
                        {images.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-1">
                                {images.map((img, i) => (
                                    <div key={i} className="relative w-20 h-20">
                                        <img src={img.preview} alt="" className="w-full h-full object-cover rounded-md border border-[#E8E8E8]" />
                                        <button type="button" onClick={() => removeImage(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#F11518] text-white rounded-full text-xs flex items-center justify-center">✕</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Justified + Date */}
                    <div className="flex items-end gap-6">
                        <label className="flex items-center gap-2 cursor-pointer pb-1">
                            <input
                                type="checkbox"
                                checked={form.is_justified}
                                onChange={(e) => setForm(p => ({ ...p, is_justified: e.target.checked }))}
                                className="w-4 h-4 accent-[#F11518]"
                            />
                            <span className="text-sm text-[#494949]">Compliant Justified</span>
                        </label>
                        <div className="flex-1">
                            <CustomInput title="Date of Complaint Response" value={form.date_of_response} onChange={setField("date_of_response")} type="date" />
                        </div>
                    </div>

                    {/* Decision by (read-only from user) + Designation */}
                    <div className="flex gap-4">
                        <div className="flex-1 flex flex-col gap-2">
                            <p className="font-medium text-[#494949] text-sm">Decision by</p>
                            <div className="border border-[#E8E8E8] rounded-md p-4 text-sm text-[#666] bg-gray-50">{user?.email || user?.name || "—"}</div>
                        </div>
                        <div className="flex-1">
                            <CustomInput title="Designation" value={form.designation} onChange={setField("designation")} type="text" placeholder="FSQA Manager" />
                        </div>
                    </div>

                    {apiError && <p className="text-red-500 text-sm">{apiError}</p>}

                    <div className="flex justify-end">
                        <CustomButton title={submitting ? "Submitting..." : "Save and Preview"} type="filled" length="large" handleSubmit={handleSubmit} />
                    </div>
                </div>

                {/* Right — Complaint Details */}
                <div className="w-72 shrink-0 border border-[#E8E8E8] rounded-xl p-5 bg-white h-fit flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs text-[#888]">Details of {complaint.ticket_id}</p>
                            <p className="font-semibold text-sm mt-0.5">{complaint.ticket_id}</p>
                            <span className="text-xs text-[#888] border border-[#E8E8E8] rounded px-2 py-0.5 mt-1 inline-block">{complaint.facility_name || "—"}</span>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-[#888]">{complaint.incident_date}</p>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize mt-1 inline-block ${statusClass}`}>{complaint.status}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <RightDetailRow label="Date of Complaint" value={complaint.incident_date} />
                        <RightDetailRow label="SAP Code" value={complaint.wrin || "—"} />
                        <RightDetailRow label="Batch" value={complaint.batch_number || "—"} />
                        <RightDetailRow label="Category" value={complaint.complaint_category_name} />
                        <RightDetailRow label="Volume Affected" value={complaint.quantity ? `${complaint.quantity} ${complaint.quantity_unit || ""}` : "—"} />
                        <RightDetailRow label="Issue" value={complaint.severity} />
                    </div>

                    {complaint.attachments?.length > 0 && (
                        <div>
                            <p className="text-xs text-[#888] mb-1">Attached Pictures</p>
                            <div className="flex flex-wrap gap-1">
                                {complaint.attachments.map((a) => (
                                    <a key={a.id} href={a.file_url} target="_blank" rel="noreferrer">
                                        <img src={a.file_url} alt={a.filename} className="w-14 h-14 object-cover rounded-md border border-[#E8E8E8] hover:opacity-80" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="border-t pt-3">
                        <p className="font-semibold text-sm">{complaint.product_name}</p>
                        <p className="text-xs text-[#666] mt-1">{complaint.description || "—"}</p>
                    </div>
                </div>

            </div>
        </div>
    );
}

function FormTextArea({ label, value, onChange }) {
    return (
        <div className="flex flex-col gap-2">
            <p className="font-medium text-[#494949] text-sm">{label}</p>
            <textarea
                value={value}
                onChange={onChange}
                placeholder="Write your message..."
                rows={3}
                className="w-full border border-[#E8E8E8] rounded-md p-3 text-sm text-[#666] outline-none resize-y"
            />
        </div>
    );
}

function RightDetailRow({ label, value }) {
    return (
        <div>
            <p className="text-[#888]">{label}</p>
            <p className="font-semibold mt-0.5">{value || "—"}</p>
        </div>
    );
}
