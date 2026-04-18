export default function CustomInput({ title, value, placeholder, onChange, type, error, textArea = false, disabled = false }) {
    const isDate = type === "date";
    return (
        <div className="w-full flex flex-col gap-2">
            <div className="font-medium text-[#494949] text-sm">{title}</div>
            {textArea ? (
                <textarea value={value} onChange={onChange} placeholder={placeholder} className="border border-[#E8E8E8] rounded-md p-4 outline-0 text-sm text-[#666666]" />
            ) : isDate ? (
                <div className="relative border border-[#E8E8E8] rounded-md overflow-hidden">
                    <input
                        type="date"
                        value={value}
                        onChange={onChange}
                        className="w-full p-4 outline-0 text-sm text-[#666666] appearance-none bg-white cursor-pointer"
                    />
                </div>
            ) : (
                <input type={type || "text"} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} className={`border border-[#E8E8E8] rounded-md p-4 outline-0 text-sm text-[#666666] ${disabled ? "bg-gray-100 cursor-not-allowed text-[#999]" : "bg-white"}`} />
            )}
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    );
}
