import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginInput from "../components/LoginInput";
import MC_Login_JPG from "../assets/MC_Login.jpg";
import MC_Login_PNG from "../assets/MC_Login.png";
import MCD_LOGO from "../assets/MCD_LOGO_login.png";
import { useUser } from "../contexts/UserContext";
import { loginApi, registerApi } from "../api/authApi";

const CAROUSEL_IMAGES = [MC_Login_JPG, MC_Login_PNG];

const REGISTER_FIELDS = [
  { key: "email", label: "Email", type: "email", placeholder: "Enter Your Email" },
  { key: "username", label: "Username", type: "text", placeholder: "Enter Your Username" },
  { key: "first_name", label: "First Name", type: "text", placeholder: "Enter First Name" },
  { key: "last_name", label: "Last Name", type: "text", placeholder: "Enter Last Name" },
  { key: "phone", label: "Phone", type: "text", placeholder: "Enter Phone Number" },
  { key: "role", label: "Role", type: "text", placeholder: "Enter Role" },
  { key: "password", label: "Password", type: "password", placeholder: "Enter Password" },
  { key: "password_confirm", label: "Confirm Password", type: "password", placeholder: "Confirm Password" },
];

export default function LoginPage() {
  const { login } = useUser();
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [current, setCurrent] = useState(0);
  const [loginCred, setLoginCred] = useState({ email: "", password: "" });
  const [registerCred, setRegisterCred] = useState({
    email: "", username: "", first_name: "", last_name: "",
    phone: "", role: "", password: "", password_confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(i => (i + 1) % CAROUSEL_IMAGES.length), 3000);
    return () => clearInterval(timer);
  }, []);

  function handleLoginChange(field) {
    return (e) => setLoginCred((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleRegisterChange(field) {
    return (e) => setRegisterCred((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function validateLogin() {
    const errs = {};
    if (!loginCred.email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(loginCred.email)) errs.email = "Invalid email";
    if (!loginCred.password) errs.password = "Password is required";
    else if (loginCred.password.length < 8) errs.password = "Min 8 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateRegister() {
    const errs = {};
    REGISTER_FIELDS.forEach(({ key }) => {
      if (!registerCred[key]) errs[key] = "This field is required";
    });
    if (registerCred.password && registerCred.password_confirm &&
      registerCred.password !== registerCred.password_confirm) {
      errs.password_confirm = "Passwords do not match";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleLogin() {
    if (!validateLogin()) return;
    setApiError("");
    setLoading(true);
    try {
      const { data } = await loginApi(loginCred.email, loginCred.password);
      const { user, access, refresh } = data.data;
      login({
        username: `${user.first_name} ${user.last_name}`.trim(),
        email: user.email,
        role: user.role,
        access,
        refresh,
      });
      navigate("/dashboard");
    } catch (err) {
      setApiError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    if (!validateRegister()) return;
    setApiError("");
    setLoading(true);
    try {
      const { data } = await registerApi(registerCred);
      login({
        username: data?.data?.username || registerCred.username,
        email: data?.data?.email || registerCred.email,
        role: data?.data?.role || registerCred.role,
      });
      navigate("/dashboard");
    } catch (err) {
      if (err.details && Object.keys(err.details).length) {
        const fieldErrs = {};
        Object.entries(err.details).forEach(([k, v]) => { fieldErrs[k] = Array.isArray(v) ? v[0] : v; });
        setErrors(fieldErrs);
      }
      setApiError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="text-xl h-screen grid grid-cols-2 place-items-center bg-[#DB0006] p-8">
      <div className="w-[70%] flex flex-col items-center gap-3">
        <img src={MCD_LOGO} alt="McDonald's Logo" className="h-16 object-contain absolute top-4 left-4 mb-2" />
        <div className="text-white text-3xl tracking-wider mb-6">McDonald's</div>
        <div className="relative overflow-hidden rounded-2xl w-full">
          {CAROUSEL_IMAGES.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`slide-${i}`}
              className={`w-full h-full object-cover rounded-2xl absolute top-0 left-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"}`}
            />
          ))}
          <img src={CAROUSEL_IMAGES[0]} alt="placeholder" className="w-full rounded-2xl invisible" />
        </div>
        <div className="flex gap-2">
          {CAROUSEL_IMAGES.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${i === current ? "bg-white w-6" : "bg-white/40 w-2"}`} />
          ))}
        </div>
      </div>
      <div className="w-fit bg-white rounded-4xl px-10 py-4 flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-4">
            <div
              onClick={() => { setTab("login"); setErrors({}); setApiError(""); }}
              className={`text-[40px] font-semibold cursor-pointer ${tab === "login" ? "text-[#163151]" : "text-[#999999]"}`}
            >Log in</div>
            <div
              onClick={() => { setTab("register"); setErrors({}); setApiError(""); }}
              className={`text-[24px] font-normal cursor-pointer ${tab === "register" ? "text-[#163151]" : "text-[#999999]"}`}
            >Register</div>
          </div>
          <div className="text-[18px] text-[#124077A3] font-normal">
            {tab === "login" ? "Please enter your log in details" : "Create a new account"}
          </div>
        </div>

        {tab === "login" ? (
          <>
            <div className="min-w-125 flex flex-col gap-7 py-4">
              <LoginInput type="email" title="Email" value={loginCred.email} placeholder="Enter Your Email" onChange={handleLoginChange("email")} error={errors.email} />
              <LoginInput type="password" title="Password" value={loginCred.password} placeholder="Enter Your Password" onChange={handleLoginChange("password")} error={errors.password} />
            </div>
            <div className="w-full flex justify-between items-center pb-4">
              <div className="flex flex-col font-normal text-sm text-[#7A7A7A]">
                <div>Password must be- minimum 8 characters</div>
                <div>( 1 uppercase, 1 lowercase, 1 special character & 1 digit)</div>
              </div>
              <div className="text-[#FF0000] font-normal text-sm">forget password?</div>
            </div>
            {apiError && <p className="text-red-500 text-sm text-center">{apiError}</p>}
            <div>
              <button onClick={handleLogin} disabled={loading} className="w-full p-4 bg-[#DB0006] rounded-md cursor-pointer text-white font-normal text-base disabled:opacity-60">
                {loading ? "Logging in..." : "Log in"}
              </button>
              <div className="text-[#6D6E71] text-base w-full text-center p-4">Or</div>
              <button className="w-full pt-2 pb-4 text-[#DB0006] rounded-md cursor-pointer bg-white font-normal text-base">Login with OTP</button>
            </div>
          </>
        ) : (
          <>
            <div className="min-w-125 flex flex-col gap-4 py-2 max-h-[50vh] overflow-y-auto pr-1">
              {REGISTER_FIELDS.map(({ key, label, type, placeholder }) => (
                <LoginInput key={key} type={type} title={label} value={registerCred[key]} placeholder={placeholder} onChange={handleRegisterChange(key)} error={errors[key]} />
              ))}
            </div>
            {apiError && <p className="text-red-500 text-sm text-center">{apiError}</p>}
            <div>
              <button onClick={handleRegister} disabled={loading} className="w-full p-4 bg-[#DB0006] rounded-md cursor-pointer text-white font-normal text-base disabled:opacity-60">
                {loading ? "Registering..." : "Register"}
              </button>
            </div>
          </>
        )}

        <div className="text-center w-full px-6 font-normal text-[#7C7C7C] text-base pb-4 leading-6">
          By Logging in, I agree with McDonald's <br /> <span className="font-semibold text-[#FFA13A]">Privacy Policy</span> and <span className="font-semibold text-[#FFA13A]">Terms of Service</span>
        </div>
      </div>
    </div>
  );
}
