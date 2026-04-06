import Email from "../assets/Email.svg"
import Password from "../assets/Password.svg"
export default function LoginInput({ title, value, placeholder, onChange , type }) {
    return (
        <div className="relative w-full">
            <div className="bg-white absolute -top-3 left-4 px-2 text-[#124077] font-normal text-base">{title}</div>
            <div className="border border-[#BCBCBC] rounded-md w-full p-4 flex gap-4">
                <img src={type === "email" ? Email : Password} alt="Image" />
                <input value={value} onChange={onChange} className="text-base" type={type} placeholder={placeholder} />
            </div>
        </div>
    )
}