export default function CustomButton({ title = "Click", type = "unfilled", rounded = false, length = "med", handleSubmit }) {
    return (
        <button onClick={handleSubmit} className={`h-9 cursor-pointer font-semibold flex justify-center items-center ${type === "filled" ? "bg-[#F11518] text-white" : type ==="unfilled-red" ? "text-black border border-[#F11518]" : "border"} ${rounded ? "rounded-full" : "rounded-md"} ${length === "large" ? "w-45" : "w-20"}`}>
            {title}
        </button>
    )
}