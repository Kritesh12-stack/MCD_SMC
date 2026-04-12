import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PageHeading from "../components/PageHeading";
import CustomButton from "../components/CustomButton";
import CustomDropdown from "../components/CustomDropdown";
import { getComplaintById, addComment, updateComplaint, getProducts, getSuppliers } from "../api/complaintsApi";
import ResponseSheetPreview from "../components/ResponseSheetPreview";

const sendToOptions = [
    { id: 1, name: "Regional QA" },
    { id: 2, name: "Market QA" },
    { id: 3, name: "Vendor/Supplier" },
];

const STATUS_COLORS = {
    pending: "border-yellow-400 text-yellow-500",
    acknowledged: "border-blue-400 text-blue-500",
    justified: "border-green-400 text-green-500",
    unjustified: "border-red-400 text-red-500",
};

export default function ComplainDetailPage() {
    const { id } = useParams();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(sendToOptions[0]);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [stockAction, setStockAction] = useState("");
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [recovery, setRecovery] = useState({
        product: "", date: "", product_code_dates: "", mobile: "",
        supplier: "", supplier_location: "", supplier_contact: "", replenishment_supplier: "",
        recovery_plan: "", reason: "", media: null, start_time: "", termination_date: "",
    });
    const [recoverySubmitting, setRecoverySubmitting] = useState("");

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
            await addComment(id, { content: comment, send_to: selected.name });
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
                        <button className="flex items-center gap-1 text-sm border border-[#E8E8E8] rounded-md px-3 py-1 cursor-pointer">✎ Edit</button>
                    </div>

                    <div className="flex justify-between items-center text-sm text-[#494949]">
                        <span className="font-semibold">{complaint.ticket_id}</span>
                        <span>{new Date(complaint.created_at).toLocaleString()}</span>
                    </div>

                    <div>
                        <span className={`border text-xs px-3 py-1 rounded-full capitalize ${statusClass}`}>{complaint.status}</span>
                    </div>

                    {/* Stock Action */}
                    <div className="flex items-center gap-3">
                        <label className="text-sm text-[#888] font-medium">Stock Action</label>
                        <select value={stockAction} onChange={async (e) => {
                            const val = e.target.value;
                            setStockAction(val);
                            try { await updateComplaint(id, { stock_action: val }); } catch (err) { console.error("Failed to update stock action:", err); }
                        }} className="border border-[#E8E8E8] rounded-md px-3 py-1.5 text-sm text-[#425466] bg-white">
                            <option value="">Select Action</option>
                            <option value="Recall">Recall</option>
                            <option value="Release">Release</option>
                            <option value="Destroy">Destroy</option>
                        </select>
                    </div>

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
                            <CustomDropdown options={sendToOptions} selected={selected} setSelected={setSelected} placeholder="Sent to all" />
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
                                <FormField label="Product Name">
                                    <select value={recovery.product} onChange={e => setRecovery(r => ({ ...r, product: e.target.value }))} className="form-input">
                                        <option value="">Select Product</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </FormField>
                                <FormField label="Date">
                                    <input type="date" value={recovery.date} onChange={e => setRecovery(r => ({ ...r, date: e.target.value }))} className="form-input" />
                                </FormField>
                                <FormField label="Product Code Dates">
                                    <input type="text" value={recovery.product_code_dates} onChange={e => setRecovery(r => ({ ...r, product_code_dates: e.target.value }))} placeholder="Type Code Dates" className="form-input" />
                                </FormField>
                                <FormField label="Mobile">
                                    <input type="text" value={recovery.mobile} onChange={e => setRecovery(r => ({ ...r, mobile: e.target.value }))} placeholder="Enter Batch Number" className="form-input" />
                                </FormField>
                                <FormField label="Supplier Name">
                                    <select value={recovery.supplier} onChange={e => setRecovery(r => ({ ...r, supplier: e.target.value }))} className="form-input">
                                        <option value="">Select Vendor</option>
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </FormField>
                                <FormField label="Supplier Production Name & Location">
                                    <input type="text" value={recovery.supplier_location} onChange={e => setRecovery(r => ({ ...r, supplier_location: e.target.value }))} placeholder="Select name and location" className="form-input" />
                                </FormField>
                                <FormField label="Supplier Contact">
                                    <input type="text" value={recovery.supplier_contact} onChange={e => setRecovery(r => ({ ...r, supplier_contact: e.target.value }))} placeholder="Select supplier contact" className="form-input" />
                                </FormField>
                                <FormField label="Supplier of Replinishment Product">
                                    <select value={recovery.replenishment_supplier} onChange={e => setRecovery(r => ({ ...r, replenishment_supplier: e.target.value }))} className="form-input">
                                        <option value="">Select supplier contact</option>
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </FormField>
                                <FormField label="Recovery Plan">
                                    <select value={recovery.recovery_plan} onChange={e => setRecovery(r => ({ ...r, recovery_plan: e.target.value }))} className="form-input">
                                        <option value="">Select Recovery</option>
                                        <option value="Full Recall">Full Recall</option>
                                        <option value="Partial Recall">Partial Recall</option>
                                        <option value="Hold & Review">Hold & Review</option>
                                    </select>
                                </FormField>
                                <FormField label="Reason for Recovery">
                                    <textarea value={recovery.reason} onChange={e => setRecovery(r => ({ ...r, reason: e.target.value }))} placeholder="Write Your Message" rows={3} className="form-input resize-none" />
                                </FormField>
                            </div>
                            <FormField label="Add Media">
                                <label className="flex flex-col items-center justify-center border border-dashed border-[#E8E8E8] rounded-md py-5 cursor-pointer hover:bg-gray-50">
                                    <svg width="20" height="20" fill="none" stroke="#9CA3AF" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    <span className="text-sm text-[#F11518] font-medium mt-1">Click to upload <span className="text-[#888] font-normal">or drag & drop</span></span>
                                    <span className="text-xs text-[#888]">JPEG (max. 500kb)</span>
                                    <input type="file" accept="image/jpeg" className="hidden" onChange={e => setRecovery(r => ({ ...r, media: e.target.files[0] }))} />
                                </label>
                                {recovery.media && <p className="text-xs text-green-600 mt-1">{recovery.media.name}</p>}
                            </FormField>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Start Time of Recovery">
                                    <input type="date" value={recovery.start_time} onChange={e => setRecovery(r => ({ ...r, start_time: e.target.value }))} placeholder="Type Date" className="form-input" />
                                </FormField>
                                <FormField label="Termination of Recovery Date">
                                    <input type="date" value={recovery.termination_date} onChange={e => setRecovery(r => ({ ...r, termination_date: e.target.value }))} placeholder="Type or select date" className="form-input" />
                                </FormField>
                            </div>
                            <div className="flex justify-end">
                                <button onClick={() => { /* TODO: submit recovery */ }} className="bg-[#F11518] text-white px-8 py-2.5 rounded-md text-sm font-semibold cursor-pointer hover:bg-[#d41315]">Submit</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel */}
                <div className="w-[35%] border border-[#E8E8E8] rounded-xl p-4 bg-white flex flex-col gap-3">
                    <ResponseSheetPreview complaint={complaint} />
                </div>
            </div>
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
