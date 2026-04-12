import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeading from "../components/PageHeading";
import { getProducts, getSuppliers, getFacilities, createVoluntaryRecall } from "../api/complaintsApi";

export default function VoluntaryRecallFormPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [form, setForm] = useState({
    product: "", batch_number: "", quantity: "", unit: "Lt",
    distribution_centre: "", vendor: "", supplier: "", reason: "", image: null,
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
    if (!form.product || !form.supplier) return setError("Product and Supplier are required");
    setSubmitting(true);
    setError("");
    try {
      await createVoluntaryRecall({
        product: form.product, supplier: form.supplier,
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
      <div className="px-6 py-6 max-w-3xl">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product */}
          <Field label="Product">
            <select value={form.product} onChange={e => update("product", e.target.value)} className="input-style">
              <option value="">Select Product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>

          {/* Batch Number */}
          <Field label="Batch Number">
            <input type="text" value={form.batch_number} onChange={e => update("batch_number", e.target.value)}
              placeholder="Enter Batch Number" className="input-style" />
          </Field>

          {/* Quantity + Distribution Centre */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Quantity">
              <div className="flex">
                <input type="number" value={form.quantity} onChange={e => update("quantity", e.target.value)}
                  placeholder="0" className="flex-1 border border-[#E8E8E8] rounded-l-md px-4 py-3 text-sm text-[#425466]" />
                <select value={form.unit} onChange={e => update("unit", e.target.value)}
                  className="border border-l-0 border-[#E8E8E8] rounded-r-md px-3 py-3 text-sm text-[#425466] bg-white">
                  <option>Lt</option><option>Kg</option><option>Units</option><option>Pcs</option>
                </select>
              </div>
            </Field>
            <Field label="Distribution Centre">
              <select value={form.distribution_centre} onChange={e => update("distribution_centre", e.target.value)} className="input-style">
                <option value="">Select Manager</option>
                {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </Field>
          </div>

          {/* Vendor + Supplier */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Vendor">
              <select value={form.vendor} onChange={e => update("vendor", e.target.value)} className="input-style">
                <option value="">Select Vendor</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Supplier">
              <select value={form.supplier} onChange={e => update("supplier", e.target.value)} className="input-style">
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
          </div>

          {/* Description + Profile Picture */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Description">
              <textarea value={form.reason} onChange={e => update("reason", e.target.value)}
                placeholder="Write Your Message" rows={4} className="input-style resize-none" />
            </Field>
            <Field label="Profile Picture">
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
            </Field>
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

      <style>{`.input-style { width: 100%; border: 1px solid #E8E8E8; border-radius: 0.375rem; padding: 0.75rem 1rem; font-size: 0.875rem; color: #425466; background: white; }`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-sm text-[#27272E] font-medium mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
