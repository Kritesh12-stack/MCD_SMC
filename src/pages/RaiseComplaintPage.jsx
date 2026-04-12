import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeading from "../components/PageHeading";
import CustomDropdown from "../components/CustomDropdown";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import {
    getProducts, getProductCategories, getProductSubCategories,
    getSuppliers, getComplaintCategories, getComplaintSubCategories,
    getFacilities, createComplaint, uploadAttachment,
} from "../api/complaintsApi";

const EMPTY = { id: "", name: "" };

export default function RaiseComplaintPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState("form");

    const [options, setOptions] = useState({
        products: [], productCategories: [], productSubCategories: [],
        complaintCategories: [], complaintSubCategories: [],
        suppliers: [], facilities: [],
    });

    const [form, setForm] = useState({
        product: EMPTY, product_category: EMPTY, product_sub_category: EMPTY,
        complaint_category: EMPTY, complaint_sub_category: EMPTY,
        supplier: EMPTY, facility: EMPTY,
        wrin: "", batch_number: "",
        quantity: "", quantity_unit: "Lt",
        production_date: "", incident_date: "",
        description: "", severity: "Medium",
    });

    const [images, setImages] = useState([]); // [{ file, preview }]
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchOptions() {
            const results = await Promise.allSettled([
                getProducts(), getProductCategories(), getProductSubCategories(),
                getSuppliers(), getComplaintCategories(), getComplaintSubCategories(),
                getFacilities(),
            ]);
            const [products, productCategories, productSubCategories, suppliers,
                complaintCategories, complaintSubCategories, facilities] = results.map(
                (r) => r.status === "fulfilled" ? (r.value.data?.data || r.value.data || []) : []
            );
            setOptions({ products, productCategories, productSubCategories, suppliers, complaintCategories, complaintSubCategories, facilities });
        }
        fetchOptions();
    }, []);

    const setDropdown = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));
    const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

    function handleImages(e) {
        const files = Array.from(e.target.files);
        const valid = files.filter(f => f.size <= 500 * 1024);
        setImages(prev => [...prev, ...valid.map(file => ({ file, preview: URL.createObjectURL(file) }))]);
        e.target.value = "";
    }

    function removeImage(index) {
        setImages(prev => {
            URL.revokeObjectURL(prev[index].preview);
            return prev.filter((_, i) => i !== index);
        });
    }

    function validate() {
        const errs = {};
        if (!form.product.id) errs.product = "Required";
        if (!form.product_category.id) errs.product_category = "Required";
        if (!form.complaint_category.id) errs.complaint_category = "Required";
        if (!form.description) errs.description = "Required";
        if (!form.production_date) errs.production_date = "Required";
        if (!form.quantity) errs.quantity = "Required";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    function handlePreview() {
        if (validate()) setStep("preview");
    }

    async function handleSubmit() {
        setApiError("");
        setLoading(true);
        try {
            const res = await createComplaint({
                product: form.product.id || undefined,
                product_category: form.product_category.id || undefined,
                product_sub_category: form.product_sub_category.id || undefined,
                complaint_category: form.complaint_category.id || undefined,
                complaint_sub_category: form.complaint_sub_category.id || undefined,
                supplier: form.supplier.id || undefined,
                facility: form.facility.id || undefined,
                severity: form.severity,
                wrin: form.wrin || undefined,
                batch_number: form.batch_number || undefined,
                quantity: form.quantity || undefined,
                quantity_unit: form.quantity_unit || undefined,
                production_date: form.production_date || undefined,
                incident_date: form.incident_date || undefined,
                description: form.description,
            });
            const complaintId = res.data?.data?.id || res.data?.id;
            if (complaintId && images.length > 0) {
                await Promise.allSettled(images.map(({ file }) => uploadAttachment(complaintId, file)));
            }
            navigate("/complaints");
        } catch (err) {
            setApiError(err.message || "Failed to submit complaint");
        } finally {
            setLoading(false);
        }
    }

    // Preview Step
    if (step === "preview") {
        return (
            <div className="px-4 pb-10">
                <PageHeading title={"Preview Complaint"} />
                <div className="max-w-3xl border border-[#E8E8E8] rounded-xl p-6 bg-white">
                    <h2 className="text-lg font-semibold mb-4">Review your complaint details</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <PreviewRow label="Product" value={form.product.name} />
                        <PreviewRow label="Product Category" value={form.product_category.name} />
                        <PreviewRow label="Product Sub-Category" value={form.product_sub_category.name} />
                        <PreviewRow label="Complaint Category" value={form.complaint_category.name} />
                        <PreviewRow label="Complaint Sub-Category" value={form.complaint_sub_category.name} />
                        <PreviewRow label="WRIN" value={form.wrin} />
                        <PreviewRow label="Supplier" value={form.supplier.name} />
                        <PreviewRow label="Facility" value={form.facility.name} />
                        <PreviewRow label="Production Date" value={form.production_date} />
                        <PreviewRow label="Quantity" value={`${form.quantity} ${form.quantity_unit}`} />
                        <PreviewRow label="Severity" value={form.severity} />
                    </div>
                    <div className="mt-4">
                        <p className="text-[#888] text-xs font-medium">Description</p>
                        <p className="text-sm mt-1">{form.description || "-"}</p>
                    </div>
                    {images.length > 0 && (
                        <div className="mt-4">
                            <p className="text-[#888] text-xs font-medium mb-2">Images</p>
                            <div className="flex flex-wrap gap-2">
                                {images.map((img, i) => (
                                    <img key={i} src={img.preview} alt="" className="w-20 h-20 object-cover rounded-md border border-[#E8E8E8]" />
                                ))}
                            </div>
                        </div>
                    )}
                    {apiError && <p className="text-red-500 text-sm mt-4">{apiError}</p>}
                    <div className="flex justify-end gap-3 mt-6">
                        <CustomButton title="Back to Edit" type="unfilled-red" length="large" handleSubmit={() => setStep("form")} />
                        <CustomButton title={loading ? "Submitting..." : "Submit Complaint"} type="filled" length="large" handleSubmit={handleSubmit} />
                    </div>
                </div>
            </div>
        );
    }

    // Form Step
    return (
        <div className="px-4 pb-10">
            <PageHeading title={"Raise a Ticket"} />
            <div className="pr-4 flex flex-wrap gap-y-5 justify-between">
                <div className="w-[48%]">
                    <CustomDropdown title="Product" options={options.products} selected={form.product} setSelected={setDropdown("product")} placeholder="Type or Select Product" />
                    {errors.product && <p className="text-red-500 text-xs mt-1">{errors.product}</p>}
                </div>
                <div className="w-[48%]">
                    <CustomDropdown title="Product Category" options={options.productCategories} selected={form.product_category} setSelected={setDropdown("product_category")} placeholder="Type or Select Category" />
                    {errors.product_category && <p className="text-red-500 text-xs mt-1">{errors.product_category}</p>}
                </div>
                <div className="w-[48%]">
                    <CustomDropdown title="Product Sub-Category" options={options.productSubCategories} selected={form.product_sub_category} setSelected={setDropdown("product_sub_category")} placeholder="Type or Select Sub Product" />
                </div>
                <div className="w-[48%]">
                    <CustomDropdown title="Complaint Category" options={options.complaintCategories} selected={form.complaint_category} setSelected={setDropdown("complaint_category")} placeholder="Type or Select" />
                    {errors.complaint_category && <p className="text-red-500 text-xs mt-1">{errors.complaint_category}</p>}
                </div>
                <div className="w-[48%]">
                    <CustomDropdown title="Complaint Sub Category" options={options.complaintSubCategories} selected={form.complaint_sub_category} setSelected={setDropdown("complaint_sub_category")} placeholder="Type or Select Sub-Category" />
                </div>
                <div className="w-[48%]">
                    <CustomInput title="WRIN" value={form.wrin} onChange={setField("wrin")} type="text" placeholder="Type WRIN" />
                </div>
                <div className="w-[48%]">
                    <CustomDropdown title="Supplier" options={options.suppliers} selected={form.supplier} setSelected={setDropdown("supplier")} placeholder="Type or Select Supplier" />
                </div>
                <div className="w-[48%]">
                    <CustomDropdown title="Facility" options={options.facilities} selected={form.facility} setSelected={setDropdown("facility")} placeholder="Type or Select Facility" />
                </div>
                <div className="w-[48%]">
                    <CustomInput title="Production Date" value={form.production_date} onChange={setField("production_date")} type="date" error={errors.production_date} />
                </div>
                <div className="w-[48%]">
                    <div className="flex flex-col gap-2">
                        <div className="font-medium text-[#494949] text-sm">Quantity</div>
                        <div className="flex border border-[#E8E8E8] rounded-md overflow-hidden">
                            <input type="number" value={form.quantity} onChange={setField("quantity")} placeholder="0" className="flex-1 p-4 outline-none text-sm text-[#666666]" />
                            <div className="flex items-center border-l border-[#E8E8E8] px-3 gap-1">
                                <span className="text-sm text-[#666]">{form.quantity_unit}</span>
                                <div className="flex flex-col text-[10px] text-[#666] cursor-pointer leading-none">
                                    <span onClick={() => setForm(p => ({ ...p, quantity_unit: "Lt" }))}>▲</span>
                                    <span onClick={() => setForm(p => ({ ...p, quantity_unit: "Kg" }))}>▼</span>
                                </div>
                            </div>
                        </div>
                        {errors.quantity && <p className="text-red-500 text-xs">{errors.quantity}</p>}
                    </div>
                </div>
                <div className="w-full">
                    <CustomInput title="Description" value={form.description} onChange={setField("description")} type="text" placeholder="Write Your Message" error={errors.description} textArea={true} />
                </div>
                <div className="w-full flex flex-col gap-2">
                    <div className="font-medium text-[#494949] text-sm">Images</div>
                    <label className="w-full border border-dashed border-[#C4C4C4] rounded-lg p-6 flex flex-col items-center gap-1 cursor-pointer hover:bg-gray-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#888]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        <p className="text-sm text-[#666]"><span className="text-[#F11518] font-medium">Click to upload</span> or drag & drop</p>
                        <p className="text-xs text-[#999]">JPEG (max. 500kb)</p>
                        <input type="file" accept="image/jpeg" multiple className="hidden" onChange={handleImages} />
                    </label>
                    {images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {images.map((img, i) => (
                                <div key={i} className="relative w-20 h-20">
                                    <img src={img.preview} alt="" className="w-full h-full object-cover rounded-md border border-[#E8E8E8]" />
                                    <button type="button" onClick={() => removeImage(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#F11518] text-white rounded-full text-xs flex items-center justify-center leading-none">✕</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="w-full flex justify-end gap-3 pt-2">
                    <CustomButton title="Export" type="unfilled-red" length="large" />
                    <CustomButton title="Submit Complaint" type="filled" length="large" handleSubmit={handlePreview} />
                </div>
            </div>
        </div>
    );
}

function PreviewRow({ label, value }) {
    return (
        <div>
            <p className="text-[#888] text-xs font-medium">{label}</p>
            <p className="font-semibold">{value || "-"}</p>
        </div>
    );
}
