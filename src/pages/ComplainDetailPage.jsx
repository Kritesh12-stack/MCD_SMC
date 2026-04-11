import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PageHeading from "../components/PageHeading";
import CustomButton from "../components/CustomButton";
import CustomDropdown from "../components/CustomDropdown";
import { getComplaintById, addComment } from "../api/complaintsApi";

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

    useEffect(() => {
        async function fetchDetail() {
            try {
                const res = await getComplaintById(id);
                setComplaint(res.data?.data || res.data);
            } catch (err) {
                console.error("Failed to fetch complaint:", err);
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchDetail();
    }, [id]);

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
                </div>

                {/* Right Panel */}
                <div className="w-[35%] border border-[#E8E8E8] rounded-xl p-4 bg-white flex flex-col gap-3">
                    <div className="flex justify-between items-center gap-2">
                        <p className="font-normal text-xs">Response Sheet Preview</p>
                        <div className="flex gap-2">
                            <CustomButton title="Export" type="unfilled-red" />
                            <CustomButton title="Share" type="filled" />
                        </div>
                    </div>
                    <div className="border border-[#E8E8E8] rounded-md h-fit text-sm text-[#aaa] flex items-center justify-center min-h-[400px]">
                        <span className="text-gray-400">Response sheet preview</span>
                    </div>
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
