import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginInput from "../components/LoginInput";
import MC_Login from "../assets/MC_Login.jpg"
import { useUser } from "../contexts/UserContext";

export default function LoginPage() {
  const { login } = useUser();
  const navigate = useNavigate();
  const [loginCred, setLoginCred] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  function handleChange(field) {
    return (e) => setLoginCred((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function validate() {
    const errs = {};
    if (!loginCred.email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(loginCred.email)) errs.email = "Invalid email";
    if (!loginCred.password) errs.password = "Password is required";
    else if (loginCred.password.length < 8) errs.password = "Min 8 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleLogin() {
    if (!validate()) return;
    // there will be a api call to login
    login({ name: "John Doe", role: "admin" });
    localStorage.setItem("user", JSON.stringify({ name: "John Doe", role: "admin" }));
    navigate("/dashboard");
  }

  return (
    <div className="text-xl h-screen grid grid-cols-2 place-items-center bg-red-500 p-8">
      <div className="w-[70%]">
        <img className="rounded-2xl " src={MC_Login} alt="Image" />
      </div>
      <div className="w-fit bg-white rounded-4xl px-10 py-4 flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-4">
            <div className="text-[#163151] text-[40px] font-semibold">Log in</div>
            <div className="text-[#999999] text-[24px] font-normal">Register</div>
          </div>
          <div className="text-[18px] text-[#124077A3] font-normal">Please enter your log in details </div>
        </div>
        <div className="min-w-125 flex flex-col gap-7 py-4">
          <LoginInput type={"email"} title={"Email"} value={loginCred.email} placeholder={"Enter Your Email"} onChange={handleChange("email")} error={errors.email} />
          <LoginInput type={"password"} title={"Password"} value={loginCred.password} placeholder={"Enter Your Password"} onChange={handleChange("password")} error={errors.password} />
        </div>
        <div className="w-full flex justify-between items-center pb-4">
          <div className="flex flex-col font-normal text-sm text-[#7A7A7A]">
            <div>Password must be- minimum 8 characters</div>
            <div>( 1 uppercase, 1 lowercase, 1 special character & 1 digit)</div>
          </div>
          <div className="text-[#FF0000] font-normal text-sm">forget password?</div>
        </div>
        <div>
        <button onClick={handleLogin} className="w-full p-4 bg-[#DB0006] rounded-md cursor-pointer text-white font-normal text-base">Log in</button>
        <div className="text-[#6D6E71] text-base w-full text-center p-4">Or</div>
        <button className="w-full pt-2 pb-4 text-[#DB0006] rounded-md cursor-pointer bg-white font-normal text-base">Login with OTP</button>
        </div>
        <div className="text-center w-full px-8 font-normal text-[#7C7C7C] text-base pb-4">by logging in, i agree with McDonald’s <br /> privacy policy and terms of service</div>
      </div>
      
    </div>
  )
}