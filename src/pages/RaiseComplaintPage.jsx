import PageHeading from "../components/PageHeading";
import CustomDropdown from "../components/CustomDropdown";
import { useState } from "react";
import CustomInput from "../components/CustomInput";

export default function RaiseComplaintPage() {
    const [selected, setSelected] = useState("Select Product")
    const [batchNo, setBatchNo] = useState("")
    const [error, setError] = useState("")
    const [description,setDescription] = useState("")

    const productOptions = [
        {
            id: 1,
            name: "Beef"
        },
        {
            id: 2,
            name: "Cereal/Oats"
        },
        {
            id: 3,
            name: "Cold Beverages"
        },
        {
            id: 4,
            name: "Prepared Sandwiches/Wraps"
        }
    ]

    const categoryOptions = [
        {
            id: 1,
            name: "Food Safety Integrity"
        },
        {
            id: 2,
            name: "Non-Product Related Foreign Object"
        },
        {
            id: 3,
            name: "Product Related Foreign Object"
        },
        {
            id: 4,
            name: "Quality Integrity"
        }
    ]

    const productSubCategoryOptions = [
        {
            id: 1,
            name: "Bone"
        },
        {
            id: 2,
            name: "Fish Bone"
        },
        {
            id: 3,
            name: "Plant Ingredients"
        },
        {
            id: 4,
            name: "Gristle/Tendon"
        }
    ]

    const complaintSubCategoryOptions = [
        {
            id: 1,
            name: "Temperature abuse"
        },
        {
            id: 2,
            name: "Uncooked/Undercooked"
        },
        {
            id: 3,
            name: "Spoilage"
        },
        {
            id: 4,
            name: "Chemical"
        }
    ]

    return (
        <div className="px-4">
            <PageHeading title={"Raise a Complaint"} />
            <div className="w-full flex flex-wrap gap-y-4 justify-between">
                <div className="w-[48%]">
                    <CustomDropdown title="Product" options={productOptions} selected={selected} setSelected={setSelected} />
                </div>
                
                <div className="w-[48%]">
                    <CustomDropdown title="Product Sub-Category" options={productSubCategoryOptions} selected={selected} setSelected={setSelected} />
                </div>
                <div className="w-[48%]">
                    <CustomDropdown title="Complaint Category" options={categoryOptions} selected={selected} setSelected={setSelected} />
                </div>
                <div className="w-[48%]">
                    <CustomDropdown title="Complaint Sub Category" options={complaintSubCategoryOptions} selected={selected} setSelected={setSelected} />
                </div>
                <div className="w-[48%]">
                    <CustomInput title="Batch Number" value={batchNo} onChange={(e) => setBatchNo(e.target.value)} type="text" placeholder="Type Batch Number" error={error} textArea={false} />
                </div>
                <div className="w-[48%]">
                    <CustomDropdown title="Distribution Centre" options={complaintSubCategoryOptions} placeholder="Type or Select Distribution Centre" selected={selected} setSelected={setSelected} />
                </div>
                <div className="w-[48%]">
                    <CustomDropdown title="Distribution Centre" options={complaintSubCategoryOptions} placeholder="Type or Select Distribution Centre" selected={selected} setSelected={setSelected} />
                </div>
                <div className="w-[48%]">
                    <CustomDropdown title="Distribution Centre" options={complaintSubCategoryOptions} placeholder="Type or Select Distribution Centre" selected={selected} setSelected={setSelected} />
                </div>
                <CustomInput title="Description" value={description} onChange={(e) => setDescription(e.target.value)} type={"text"} placeholder={"Type Description"} error={error} textArea={false} />
            </div>
        </div>
    )
}