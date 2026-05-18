export default function CustomButton({ title = "Click", type = "unfilled", rounded = false, length = "med", handleSubmit, disabled = false }) {
    return (
        <button onClick={handleSubmit} disabled={disabled} className={`h-10 cursor-pointer font-semibold flex justify-center items-center disabled:cursor-not-allowed disabled:opacity-60 ${type === "filled" ? "bg-[#F11518] text-white" : type ==="unfilled-red" ? "text-black border border-[#F11518]" : "border"} ${rounded ? "rounded-full" : "rounded-md"} ${length === "extra" ? "w-96" : length === "large" ? "w-45" : "w-20"}`}>
            {title}
        </button>
    )
}
