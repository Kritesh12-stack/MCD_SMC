import { useState } from "react";
import LoginInput from "../components/LoginInput";
import MC_Login from "../assets/MC_Login.jpg"

export default function LoginPage() {
  const [loginCred,setLoginCred] = useState({
    email : "",
    password : ""
  })
  return (
    <div className="text-xl h-screen grid grid-cols-2 bg-red-500 p-8 gap-4">
      <div className="">
        <img className="rounded-2xl w-[60%]" src={MC_Login} alt="Image" />
      </div>
      <div className="bg-white rounded-md p-4 flex flex-col gap-4">
        <LoginInput type={"email"} title={"Email"} value={loginCred.email}  placeholder={"Enter Your Email"} />
        <LoginInput type={"password"} title={"Password"} value={loginCred.password}  placeholder={"Enter Your Password"} />
      </div>
    </div>
  )
}