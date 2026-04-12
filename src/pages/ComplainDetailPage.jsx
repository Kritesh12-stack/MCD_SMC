import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeading from "../components/PageHeading";
import CustomButton from "../components/CustomButton";
import CustomDropdown from "../components/CustomDropdown";
import CustomInput from "../components/CustomInput";
import { getComplaintById, addComment, updateComplaint, getProducts, getSuppliers, submitStockAction } from "../api/complaintsApi";
import ResponseSheetPreview from "../components/ResponseSheetPreview";
import { useUser } from "../contexts/UserContext";

const sendToOptions = [
    { id: 1, name: "Admin" },
    { id: 2, name: "MarketQA" },
    { id: 3, name: "RegionalQA" },
    { id: 4, name: "Vendor" },
    { id: 5, name: "DC" },
];

const STATUS_COLORS = {
    pending: "border-yellow-400 text-yellow-500",
    acknowledged: "border-blue-400 text-blue-500",
    justified: "border-green-400 text-green-500",
    unjustified: "border-red-400 text-red-500",
};

export default function ComplainDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const isMarketSCM = ["marketscm", "market scm", "marketqa", "market qa"].includes(user?.role?.toLowerCase());
    const [stockActionSuccess, setStockActionSuccess] = useState(false);
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(sendToOptions[0]);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [stockAction, setStockAction] = useState("");
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [recovery, setRecovery] = useState({
        product: "", recall_reference: "", quantity_recalled: "", quantity_unit: "",
        recall_date: "", recovery_location: "", disposal_method: "",
        supplier: "", supplier_location: "", supplier_contact: "", replenishment_supplier: "",
        recovery_plan: "", notes: "", media: null, start_time: "", termination_date: "",
    });
    const [recoverySubmitting, setRecoverySubmitting] = useState("");
    const [stockActionForm, setStockActionForm] = useState({
        recall_reference: "", quantity_recalled: "", quantity_unit: "",
        recall_date: "", recovery_location: "", disposal_method: "", notes: "",
    });
    const [stockActionSubmitting, setStockActionSubmitting] = useState(false);
    const [stockActionError, setStockActionError] = useState("");

    async function handleStockActionSubmit() {
        setStockActionSubmitting(true);
        setStockActionError("");
        try {
            await submitStockAction(id, {
                action: stockAction,
                ...stockActionForm,
                quantity_recalled: stockActionForm.quantity_recalled || undefined,
            });
        } catch (err) {
            setStockActionError(err.message || "Failed to submit");
        } finally {
            setStockActionSubmitting(false);
        }
    }

    useEffect(() => {
        async function fetchDetail() {
            try {
                const res = await getComplaintById(id);
                setComplaint(res.data?.data || res.data);
                setStockAction(res.data?.data?.stock_action || res.data?.stock_action || "");
            } catch (err) {
                console.error("Failed to fetch complaint:", err);
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchDetail();
    }, [id]);

    useEffect(() => {
        if (stockAction === "Recall" && products.length === 0) {
            Promise.all([getProducts(), getSuppliers()]).then(([pRes, sRes]) => {
                setProducts(pRes.data?.data || pRes.data || []);
                setSuppliers(sRes.data?.data || sRes.data || []);
            }).catch(console.error);
        }
    }, [stockAction]);

    async function handleSendComment() {
        if (!comment.trim()) return;
        setSubmitting(true);
        try {
            await addComment(id, comment, "All", [selected.name]);
            setComment("");
        } catch (err) {
            console.error("Failed to add comment:", err);
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;
    if (!complaint) return <div className="p-10 text-center text-red-500">Complaint not found</div>;

    const statusClass = STATUS_COLORS[complaint.status?.toLowerCase()] || STATUS_COLORS.pending;

    return (
        <section className="px-4 w-full mb-4">
            <PageHeading title={"Details"} />
            <div className="w-full flex justify-between gap-4 pr-4">
                {/* Left Panel */}
                <div className="w-[65%] border border-[#E8E8E8] rounded-xl p-6 flex flex-col gap-4 bg-white">
                    <div className="flex justify-between items-start">
                        <p className="text-lg font-semibold">Details of <span className="font-normal">{complaint.ticket_id}</span></p>
                        {/* <button className="flex items-center gap-1 text-sm border border-[#E8E8E8] rounded-md px-3 py-1 cursor-pointer">✎ Edit</button> */}
                    </div>

                    <div className="flex justify-between items-center text-sm text-[#494949]">
                        <span className="font-semibold">{complaint.ticket_id}</span>
                        <span>{new Date(complaint.created_at).toLocaleString()}</span>
                    </div>

                    <div>
                        <span className={`border text-xs px-3 py-1 rounded-full capitalize ${statusClass}`}>{complaint.status}</span>
                    </div>

                    {/* Stock Action */}
                    {complaint.stock_action === null && isMarketSCM && complaint.status === "VendorAccepted" && (
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <label className="text-sm text-[#888] font-medium">Stock Action</label>
                                <select value={stockAction} onChange={async (e) => {
                                    const val = e.target.value;
                                    setStockAction(val);
                                    if (val === "Release" || val === "Destroy") {
                                        setStockActionError("");
                                        try {
                                            await submitStockAction(id, { action: val });
                                        setStockActionSuccess(true);
                                        } catch (err) {
                                            const details = err.details;
                                            const msg = Array.isArray(details) ? details[0] : (err.message || "Failed to submit stock action");
                                            setStockActionError(msg);
                                            setStockAction("");
                                        }
                                    }
                                }} className="border border-[#E8E8E8] rounded-md px-3 py-1.5 text-sm text-[#425466] bg-white">
                                    <option value="">Select Action</option>
                                    <option value="Recall">Recall</option>
                                    <option value="Release">Release</option>
                                    <option value="Destroy">Destroy</option>
                                </select>
                            </div>
                            {stockActionError && <p className="text-red-500 text-sm">{stockActionError}</p>}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <DetailRow label="Date of Complaint" value={new Date(complaint.created_at).toLocaleString()} />
                        <DetailRow label="SAP Code" value={complaint.wrin || "-"} />
                        <DetailRow label="Batch" value={complaint.batch_number || "-"} />
                        <DetailRow label="Category" value={complaint.complaint_category_name} badge />
                        <DetailRow label="Volume Affected" value={complaint.quantity ? `${complaint.quantity} ${complaint.quantity_unit || ""}` : "-"} />
                        <DetailRow label="Issue" value={complaint.severity || "-"} />
                    </div>

                    {/* Product Info */}
                    <div className="flex gap-3 items-start border-t pt-4">
                        <div>
                            <p className="font-semibold text-sm">{complaint.product_name}</p>
                            <p className="text-xs text-[#666] mt-1">{complaint.description || "No description provided."}</p>
                        </div>
                    </div>

                    {/* Attachments */}
                    {complaint.attachments?.length > 0 && (
                        <div className="border-t pt-4">
                            <p className="font-semibold text-sm mb-2">Attached Pictures</p>
                            <div className="flex flex-wrap gap-2">
                                {complaint.attachments.map((a) => (
                                    <a key={a.id} href={a.file} target="_blank" rel="noreferrer">
                                        <img src={a.file} alt={a.filename} className="w-20 h-20 object-cover rounded-md border border-[#E8E8E8] hover:opacity-80" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add a comment */}
                    <div className="border-t pt-4 flex flex-col gap-3">
                        <p className="font-semibold text-sm">Add a comment</p>
                        <div className="w-40">
                            <CustomDropdown options={sendToOptions} selected={selected} setSelected={setSelected} placeholder="Notify role" />
                        </div>
                        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write Your Comment" className="w-full border border-[#E8E8E8] rounded-md p-3 text-sm resize-none h-24 outline-none" />
                        <div className="flex justify-end">
                            <CustomButton title={submitting ? "Sending..." : "Send the comment"} type="filled" length="large" handleSubmit={handleSendComment} />
                        </div>
                    </div>

                    {/* Recovery Form - shown when Recall is selected */}
                    {stockAction === "Recall" && (
                        <div className="border-t pt-4 flex flex-col gap-4">
                            <p className="font-semibold text-base">Recovery Form</p>
                            <div className="grid grid-cols-2 gap-4">
                                <CustomDropdown
                                    title="Product Name"
                                    options={products.map(p => ({ id: p.id, name: p.name }))}
                                    selected={products.find(p => p.id === recovery.product) || {}}
                                    setSelected={p => setRecovery(r => ({ ...r, product: p.id }))}
                                    placeholder="Select Product"
                                />
                                <CustomInput title="Recall Reference" value={recovery.recall_reference} placeholder="Enter recall reference" onChange={e => setRecovery(r => ({ ...r, recall_reference: e.target.value }))} />
                                <CustomInput title="Quantity Recalled" type="number" value={recovery.quantity_recalled} placeholder="Enter quantity" onChange={e => setRecovery(r => ({ ...r, quantity_recalled: e.target.value }))} />
                                <CustomInput title="Quantity Unit" value={recovery.quantity_unit} placeholder="e.g. Kg, Lt" onChange={e => setRecovery(r => ({ ...r, quantity_unit: e.target.value }))} />
                                <CustomInput title="Recall Date" type="date" value={recovery.recall_date} onChange={e => setRecovery(r => ({ ...r, recall_date: e.target.value }))} />
                                <CustomInput title="Recovery Location" value={recovery.recovery_location} placeholder="Enter recovery location" onChange={e => setRecovery(r => ({ ...r, recovery_location: e.target.value }))} />
                                <CustomInput title="Disposal Method" value={recovery.disposal_method} placeholder="Enter disposal method" onChange={e => setRecovery(r => ({ ...r, disposal_method: e.target.value }))} />
                                <CustomInput title="Notes" textArea value={recovery.notes} placeholder="Additional notes" onChange={e => setRecovery(r => ({ ...r, notes: e.target.value }))} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="font-medium text-[#494949] text-sm">Add Media</p>
                                <label className="flex flex-col items-center justify-center border border-dashed border-[#E8E8E8] rounded-md py-5 cursor-pointer hover:bg-gray-50">
                                    <svg width="20" height="20" fill="none" stroke="#9CA3AF" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    <span className="text-sm text-[#F11518] font-medium mt-1">Click to upload <span className="text-[#888] font-normal">or drag & drop</span></span>
                                    <span className="text-xs text-[#888]">JPEG (max. 500kb)</span>
                                    <input type="file" accept="image/jpeg" className="hidden" onChange={e => setRecovery(r => ({ ...r, media: e.target.files[0] }))} />
                                </label>
                                {recovery.media && <p className="text-xs text-green-600 mt-1">{recovery.media.name}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <CustomInput title="Start Time of Recovery" type="date" value={recovery.start_time} onChange={e => setRecovery(r => ({ ...r, start_time: e.target.value }))} />
                                <CustomInput title="Termination of Recovery Date" type="date" value={recovery.termination_date} onChange={e => setRecovery(r => ({ ...r, termination_date: e.target.value }))} />
                            </div>
                            {stockActionError && stockAction === "Recall" && <p className="text-red-500 text-sm">{stockActionError}</p>}
                            <div className="flex justify-end">
                                <button onClick={async () => {
                                    // Validate
                                    if (!recovery.recall_reference) return setStockActionError("Recall reference is required");
                                    if (!recovery.recovery_location) return setStockActionError("Recovery location is required");
                                    if (recovery.quantity_recalled && isNaN(Number(recovery.quantity_recalled))) return setStockActionError("Quantity recalled must be a number");
                                    setStockActionError("");
                                    setRecoverySubmitting(true);
                                    try {
                                        await submitStockAction(id, {
                                            action: "Recall",
                                            recall_reference: recovery.recall_reference,
                                            quantity_recalled: recovery.quantity_recalled || undefined,
                                            quantity_unit: recovery.quantity_unit || undefined,
                                            recall_date: recovery.recall_date || undefined,
                                            recovery_location: recovery.recovery_location,
                                            disposal_method: recovery.disposal_method || undefined,
                                            notes: recovery.notes || undefined,
                                        });
                                        setStockActionSuccess(true);
                                    } catch (err) {
                                        const details = err.details;
                                        const msg = Array.isArray(details) ? details[0] : (err.message || "Failed to submit");
                                        setStockActionError(msg);
                                    }
                                    finally { setRecoverySubmitting(false); }
                                }} disabled={recoverySubmitting} className="bg-[#F11518] text-white px-8 py-2.5 rounded-md text-sm font-semibold cursor-pointer hover:bg-[#d41315] disabled:opacity-60">
                                    {recoverySubmitting ? "Submitting..." : "Submit"}
                                </button>
                            </div>
                        </div>
                    )}
                    {/* Stock Action Form - Release or Destroy */}
                    {(stockAction === "Release" || stockAction === "Destroy") && (
                        <div className="border-t pt-4">
                            <p className="text-sm text-green-600 font-medium">✔ {stockAction} action submitted successfully.</p>
                        </div>
                    )}
                </div>
                <div className="w-[35%] border border-[#E8E8E8] rounded-xl p-4 bg-white flex flex-col gap-3 overflow-hidden min-w-0">
                    <ResponseSheetPreview complaint={complaint} />
                </div>
            </div>

            {stockActionSuccess && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-xl p-10 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-lg font-semibold">Stock action submitted successfully</p>
                        <button onClick={() => navigate("/dashboard")} className="px-6 py-2 rounded-md bg-[#F11518] text-white text-sm font-medium hover:bg-[#d41315]">
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}

function DetailRow({ label, value, badge }) {
    return (
        <div>
            <p className="text-[#888] font-medium">{label}</p>
            {badge ? (
                <span className="border border-[#E8E8E8] rounded-md px-2 py-1 text-xs">{value}</span>
            ) : (
                <p className="font-semibold">{value}</p>
            )}
        </div>
    );
}

function FormField({ label, children }) {
    return (
        <div>
            <label className="text-sm text-[#27272E] font-medium mb-1.5 block">{label}</label>
            {children}
        </div>
    );
}
