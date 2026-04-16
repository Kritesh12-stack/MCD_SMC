import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeading from "../components/PageHeading";
import CustomDropdown from "../components/CustomDropdown";
import CustomInput from "../components/CustomInput";
import { getProducts, getSuppliers, getFacilities, createVoluntaryRecall } from "../api/complaintsApi";

export default function VoluntaryRecallFormPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [form, setForm] = useState({
    product: {}, batch_number: "", quantity: "", unit: { id: "Lt", name: "Lt" },
    distribution_centre: {}, vendor: {}, supplier: "", reason: "", image: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getProducts(), getSuppliers(), getFacilities()]).then(([pRes, sRes, fRes]) => {
      setProducts(pRes.data?.data || pRes.data || []);
      setSuppliers(sRes.data?.data || sRes.data || []);
      setFacilities(fRes.data?.data || fRes.data || []);
    }).catch(console.error);
  }, []);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.product?.id || !form.vendor?.id) return setError("Product and Vendor are required");
    setSubmitting(true);
    setError("");
    try {
      await createVoluntaryRecall({
        product: form.product.id, supplier: form.vendor.id,
        reason: form.reason, status: "Initiated",
        regulatory_ref: form.batch_number,
      });
      navigate("/voluntary-recall");
    } catch (e) {
      setError(e.message || "Failed to create recall");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeading title="Voluntary Recall Form" />
      <div className="px-6 py-6 w-full">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product */}
          <CustomDropdown
            title="Product"
            options={products}
            selected={form.product}
            setSelected={val => update("product", val)}
            placeholder="Select Product"
          />

          {/* Batch Number */}
          <CustomInput title="Batch Number" value={form.batch_number} onChange={e => update("batch_number", e.target.value)} placeholder="Enter Batch Number" />

          {/* Quantity + Distribution Centre */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-medium text-[#494949] text-sm mb-2">Quantity</div>
              <div className="flex gap-2">
                <input type="number" value={form.quantity} onChange={e => update("quantity", e.target.value)}
                  placeholder="0" className="flex-1 border border-[#E8E8E8] rounded-md p-4 outline-0 text-sm text-[#666666]" />
                <div className="w-28">
                  <CustomDropdown
                    options={[{ id: "Lt", name: "Lt" }, { id: "Kg", name: "Kg" }, { id: "Units", name: "Units" }, { id: "Pcs", name: "Pcs" }]}
                    selected={form.unit}
                    setSelected={val => update("unit", val)}
                    placeholder="Unit"
                  />
                </div>
              </div>
            </div>
            <CustomDropdown
              title="Distribution Centre"
              options={facilities}
              selected={form.distribution_centre}
              setSelected={val => update("distribution_centre", val)}
              placeholder="Select Manager"
            />
          </div>

          {/* Vendor + Supplier */}
          <div className="grid grid-cols-2 gap-4">
            <CustomDropdown
              title="Vendor"
              options={suppliers}
              selected={form.vendor}
              setSelected={val => update("vendor", val)}
              placeholder="Select Vendor"
            />
          </div>

          {/* Description + Profile Picture */}
          <div className="grid grid-cols-2 gap-4">
            <CustomInput title="Description" value={form.reason} onChange={e => update("reason", e.target.value)} placeholder="Write Your Message" textArea />
            <div>
              <div className="font-medium text-[#494949] text-sm mb-2">Profile Picture</div>
              <label className="flex flex-col items-center justify-center border border-dashed border-[#E8E8E8] rounded-md py-6 cursor-pointer hover:bg-gray-50">
                <svg width="24" height="24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm text-[#F11518] font-medium mt-1">Click to upload</span>
                <span className="text-xs text-[#888]"> or drag & drop</span>
                <span className="text-xs text-[#888] mt-0.5">JPEG (max. 500kb)</span>
                <input type="file" accept="image/jpeg" className="hidden"
                  onChange={e => update("image", e.target.files[0])} />
              </label>
              {form.image && <p className="text-xs text-green-600 mt-1">{form.image.name}</p>}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => navigate("/voluntary-recall")}
              className="px-6 py-2.5 rounded-md border border-[#E8E8E8] text-sm font-semibold text-[#425466] cursor-pointer hover:bg-gray-50">
              Export
            </button>
            <button type="submit" disabled={submitting}
              className="bg-[#F11518] text-white px-6 py-2.5 rounded-md text-sm font-semibold cursor-pointer hover:bg-[#d41315] disabled:opacity-50">
              {submitting ? "Submitting..." : "Submit Complaint"}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
