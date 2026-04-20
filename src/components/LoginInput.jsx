import { useState } from "react"
import Email from "../assets/Email.svg"
import Password from "../assets/Password.svg"
import Eye from "../assets/eye.svg"

export default function LoginInput({ title, value, placeholder, onChange, type, error }) {
    const [showPassword, setShowPassword] = useState(false)
    const inputType = type === "password" ? (showPassword ? "text" : "password") : type

    return (
        <div className="relative w-full">
            <div className="bg-white absolute -top-3 left-4 px-2 text-[#124077] font-normal text-base">{title}</div>
            {error && <div className="absolute -top-3 right-4 bg-white px-2 text-red-500 text-xs">{error}</div>}
            <div className={`border rounded-md w-full p-4 flex gap-4 ${error ? "border-red-500" : "border-[#BCBCBC]"}`}>
                <img src={type === "email" ? Email : Password} alt="Image" />
                <input value={value} onChange={onChange} className="text-base outline-none w-full" type={inputType} placeholder={placeholder} />
                {type === "password" && (
                    <img src={Eye} alt="toggle password" className="cursor-pointer" onClick={() => setShowPassword(p => !p)} />
                )}
            </div>
        </div>
    )
}