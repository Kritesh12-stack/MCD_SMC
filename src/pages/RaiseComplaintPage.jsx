import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeading from "../components/PageHeading";
import CustomDropdown from "../components/CustomDropdown";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import {
    getProducts, getProductCategories, getProductSubCategories,
    getSuppliers, getComplaintCategories, getComplaintSubCategories,
    getFacilities, createComplaint,
} from "../api/complaintsApi";

const EMPTY = { id: "", name: "" };

export default function RaiseComplaintPage() {
    const navigate = useNavigate();

    // Dropdown options from API
    const [options, setOptions] = useState({
        products: [], productCategories: [], productSubCategories: [],
        complaintCategories: [], complaintSubCategories: [],
        suppliers: [], facilities: [],
    });

    // Form state
    const [form, setForm] = useState({
        product: EMPTY, product_category: EMPTY, product_sub_category: EMPTY,
        complaint_category: EMPTY, complaint_sub_category: EMPTY,
        supplier: EMPTY, facility: EMPTY,
        wrin: "", facility_name: "", batch_number: "",
        quantity: "", quantity_unit: "Lt",
        production_date: "", incident_date: "",
        description: "", severity: "Medium",
    });

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
            console.log(results)
            const [products, productCategories, productSubCategories, suppliers,
                complaintCategories, complaintSubCategories, facilities] = results.map(
                (r) => r.status === "fulfilled" ? (r.value.data?.data || []) : []
            );
            setOptions({ products, productCategories, productSubCategories, suppliers, complaintCategories, complaintSubCategories, facilities });
        }
        fetchOptions();
    }, []);

    function setDropdown(key) {
        return (val) => setForm((prev) => ({ ...prev, [key]: val }));
    }

    function setField(key) {
        return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
    }

    function validate() {
        const errs = {};
        if (!form.product.id) errs.product = "Required";
        if (!form.complaint_category.id) errs.complaint_category = "Required";
        if (!form.description) errs.description = "Required";
        if (!form.production_date) errs.production_date = "Required";
        if (!form.quantity) errs.quantity = "Required";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    async function handleSubmit() {
        if (!validate()) return;
        setApiError("");
        setLoading(true);
        try {
            await createComplaint({
                product: form.product.id || undefined,
                product_category: form.product_category.id || undefined,
                product_sub_category: form.product_sub_category.id || undefined,
                complaint_category: form.complaint_category.id || undefined,
                complaint_sub_category: form.complaint_sub_category.id || undefined,
                supplier: form.supplier.id || undefined,
                facility: form.facility.id || undefined,
                facility_name: form.facility_name || undefined,
                severity: form.severity,
                wrin: form.wrin || undefined,
                batch_number: form.batch_number || undefined,
                quantity: form.quantity || undefined,
                quantity_unit: form.quantity_unit || undefined,
                production_date: form.production_date || undefined,
                incident_date: form.incident_date || undefined,
                description: form.description,
            });
            navigate("/complaints");
        } catch (err) {
            setApiError(err.message || "Failed to submit complaint");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="px-4 pb-10">
            <PageHeading title={"Raise a Ticket"} />

            <div className="pr-4 flex flex-wrap gap-y-5 justify-between">

                {/* Row 1 */}
                <div className="w-[48%]">
                    <CustomDropdown title="Product" options={options.products} selected={form.product} setSelected={setDropdown("product")} placeholder="Type or Select Product" />
                    {errors.product && <p className="text-red-500 text-xs mt-1">{errors.product}</p>}
                </div>
                <div className="w-[48%]">
                    <CustomDropdown title="Product Sub-Category" options={options.productSubCategories} selected={form.product_sub_category} setSelected={setDropdown("product_sub_category")} placeholder="Type or Select Sub Product" />
                </div>

                {/* Row 2 */}
                <div className="w-[48%]">
                    <CustomDropdown title="Complaint Category" options={options.complaintCategories} selected={form.complaint_category} setSelected={setDropdown("complaint_category")} placeholder="Type or Select" />
                    {errors.complaint_category && <p className="text-red-500 text-xs mt-1">{errors.complaint_category}</p>}
                </div>
                <div className="w-[48%]">
                    <CustomDropdown title="Complaint Sub Category" options={options.complaintSubCategories} selected={form.complaint_sub_category} setSelected={setDropdown("complaint_sub_category")} placeholder="Type or Select Sub-Category" />
                </div>

                {/* Row 3 */}
                <div className="w-[48%]">
                    <CustomInput title="WRIN" value={form.wrin} onChange={setField("wrin")} type="text" placeholder="Type WRIN" />
                </div>
                <div className="w-[48%]">
                    <CustomDropdown title="Distribution Centre" options={options.facilities} selected={form.facility} setSelected={setDropdown("facility")} placeholder="Type or Select Distribution Centre" />
                </div>

                {/* Row 4 */}
                <div className="w-[48%]">
                    <CustomDropdown title="Facility" options={options.facilities} selected={form.facility} setSelected={setDropdown("facility")} placeholder="Type or Select Facility" />
                </div>
                <div className="w-[48%]">
                    <CustomDropdown title="Supplier" options={options.suppliers} selected={form.supplier} setSelected={setDropdown("supplier")} placeholder="Type or Select Supplier" />
                </div>

                {/* Row 5 */}
                <div className="w-[48%]">
                    <CustomInput title="Production Date" value={form.production_date} onChange={setField("production_date")} type="date" placeholder="Select or type the production date" error={errors.production_date} />
                </div>
                <div className="w-[48%]">
                    <div className="flex flex-col gap-2">
                        <div className="font-medium text-[#494949] text-sm">Quantity</div>
                        <div className="flex border border-[#E8E8E8] rounded-md overflow-hidden">
                            <input
                                type="number"
                                value={form.quantity}
                                onChange={setField("quantity")}
                                placeholder="0"
                                className="flex-1 p-4 outline-none text-sm text-[#666666]"
                            />
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

                {/* Description */}
                <div className="w-full">
                    <CustomInput title="Description" value={form.description} onChange={setField("description")} type="text" placeholder="Write Your Message" error={errors.description} textArea={true} />
                </div>

                {/* File Upload */}
                <div className="w-full flex flex-col gap-2">
                    <div className="font-medium text-[#494949] text-sm">Profile Picture</div>
                    <label className="w-full border border-dashed border-[#C4C4C4] rounded-lg p-6 flex flex-col items-center gap-1 cursor-pointer hover:bg-gray-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#888]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        <p className="text-sm text-[#666]">
                            <span className="text-[#F11518] font-medium">Click to upload</span> or drag & drop
                        </p>
                        <p className="text-xs text-[#999]">JPEG (max. 500kb)</p>
                        <input type="file" accept="image/jpeg" className="hidden" />
                    </label>
                </div>

                {/* Error */}
                {apiError && <p className="w-full text-red-500 text-sm text-center">{apiError}</p>}

                {/* Actions */}
                <div className="w-full flex justify-end gap-3 pt-2">
                    <CustomButton title="Export" type="unfilled-red" length="large" />
                    <CustomButton title="Submit Complaint" type="filled" length="large" handleSubmit={handleSubmit} />
                </div>
            </div>
        </div>
    );
}
