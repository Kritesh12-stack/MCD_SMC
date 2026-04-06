export default function CustomInput({ title, value, placeholder, onChange, type, error, textArea = false }) {
    return (
        <div className="w-full flex flex-col gap-2">
            <div className=" font-medium text-[#494949] text-sm">{title}</div>
            {textArea ? <textarea value={value} onChange={onChange} placeholder={placeholder} className="border border-[#E8E8E8] rounded-md p-4 outline-0 text-sm text-[#666666]" /> : <input type="text" value={value} onChange={onChange} placeholder={placeholder} className="border border-[#E8E8E8] rounded-md p-4 outline-0 text-sm text-[#666666]" />}
        </div>
    )
}
