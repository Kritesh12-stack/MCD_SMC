import { useState } from "react";
import PageHeading from "../components/PageHeading";
import CustomButton from "../components/CustomButton";
import CustomDropdown from "../components/CustomDropdown";

const images = [
    "https://placehold.co/84x84",
    "https://placehold.co/84x84",
    "https://placehold.co/84x84",
];

const sendToOptions = [
    { id: 1, name: "Regional QA" },
    { id: 2, name: "Market QA" },
    { id: 3, name: "Vendor/Supplier" },
];

export default function ComplainDetailPage() {
    const [selected, setSelected] = useState(sendToOptions[0]);
    const [comment, setComment] = useState("");

    return (
        <section className="px-4 w-full mb-4">
            <PageHeading title={"Details"} />
            <div className="w-full flex justify-between gap-4 pr-4">

                {/* Left Panel */}
                <div className="w-[65%] border border-[#E8E8E8] rounded-xl p-6 flex flex-col gap-4 bg-white">
                    {/* Edit */}
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-lg font-semibold">Details of <span className="font-normal">COM-2025-0012</span></p>
                        </div>
                        <button className="flex items-center gap-1 text-sm border border-[#E8E8E8] rounded-md px-3 py-1 cursor-pointer">
                            ✎ Edit
                        </button>
                    </div>

                    {/* Meta Row */}
                    <div className="flex justify-between items-center text-sm text-[#494949]">
                        <span className="font-semibold">COM-2025-0012</span>
                        <span>19 Feb 2025, 5:34 pm</span>
                    </div>

                    {/* Status */}
                    <div>
                        <span className="border border-blue-400 text-blue-500 text-xs px-3 py-1 rounded-full">Justified</span>
                    </div>

                    {/* Grid Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-[#888] font-medium">Date of Complaint</p>
                            <p className="font-semibold">19 Feb 2025, 5:34 pm</p>
                        </div>
                        <div>
                            <p className="text-[#888] font-medium">SAP Code</p>
                            <p className="font-semibold">30021457</p>
                        </div>
                        <div>
                            <p className="text-[#888] font-medium">Batch</p>
                            <p className="font-semibold">12345/12/A12</p>
                        </div>
                        <div>
                            <p className="text-[#888] font-medium">Category</p>
                            <span className="border border-[#E8E8E8] rounded-md px-2 py-1 text-xs">Foreign Body-PR</span>
                        </div>
                        <div>
                            <p className="text-[#888] font-medium">Volume Affected</p>
                            <p className="font-semibold">Full Batch</p>
                        </div>
                        <div>
                            <p className="text-[#888] font-medium">Issue</p>
                            <p className="font-semibold">Food Quality</p>
                        </div>
                    </div>

                    {/* Attached Pictures */}
                    <div>
                        <p className="text-sm font-medium text-[#494949] mb-2">Attached Pictures</p>
                        <div className="flex gap-2 border border-dashed border-[#aaa] rounded-lg p-2">
                            {images.map((src, i) => (
                                <img key={i} src={src} alt={`attachment-${i}`} className="w-20 h-20 rounded-md object-cover" />
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex gap-3 items-start border-t pt-4">
                        {/* <img src="https://placehold.co/84x84" alt="product" className="w-20 h-20 rounded-md object-cover" /> */}
                        <div>
                            <p className="font-semibold text-sm">Food</p>
                            <p className="text-xs text-[#666] mt-1">
                                Fish Fillet Patty at McDonald's is a sandwich component made from seasoned fish fillet that is coated, shaped, and cooked to form a uniform patty. It's used in selected McDonald's menu items as a seafood option, typically offered in markets where fish is preferred, culturally suitable, or required for dietary preferences.
                            </p>
                        </div>
                    </div>

                    {/* Add a comment */}
                    <div className="border-t pt-4 flex flex-col gap-3">
                        <p className="font-semibold text-sm">Add a comment</p>
                        <div className="w-40">
                            <CustomDropdown
                                options={sendToOptions}
                                selected={selected}
                                setSelected={setSelected}
                                placeholder="Sent to all"
                            />
                        </div>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Write Your Comment"
                            className="w-full border border-[#E8E8E8] rounded-md p-3 text-sm resize-none h-24 outline-none"
                        />
                        <div className="flex justify-end">
                            <CustomButton title="Send the comment" type="filled" length="large" />
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
                    <div className="border border-[#E8E8E8] rounded-md h-fit text-sm text-[#aaa]">
                    <img src="https://placehold.co/400x500" alt="product" className="w-[400px] h-[500px] rounded-md object-cover" />
                    </div>
                </div>

            </div>
        </section>
    );
}
