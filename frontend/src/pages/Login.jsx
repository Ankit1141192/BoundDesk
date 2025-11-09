import { useState, useRef } from "react";
import { Container, Card } from "../components/styles";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/authSlice";
import Loader from "../components/Loader";
import {api} from "../utils/api"
export default function Login() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const emailError = useRef(null);
  const passwordError = useRef(null);
  const loginForm = useRef(null);

  const validateEmail = () => {
    if (!email.trim()) {
      emailError.current.textContent = "Email is required";
      return false;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      emailError.current.textContent = "Enter a valid email";
      return false;
    }
    emailError.current.textContent = "";
    return true;
  };

  const validatePassword = () => {
    if (!password.trim()) {
      passwordError.current.textContent = "Password is required";
      return false;
    }
    if (password.length < 6) {
      passwordError.current.textContent = "Min 6 characters";
      return false;
    }
    passwordError.current.textContent = "";
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail() || !validatePassword()) return;

    try {
      setLoading(true);

      const res = await axios.post(`${api}/auth/login`, {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      dispatch(loginSuccess(res.data.user));

      setLoading(false);
      setShowSuccess(true);
      loginForm.current.style.display = "none";

      // Redirect to dashboard after short delay
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      setLoading(false);
      if (err.response?.data?.msg) {
        passwordError.current.textContent = err.response.data.msg;
      } else {
        passwordError.current.textContent = "Something went wrong";
      }
    }
  };

  const labelStyle = `
    absolute left-6 text-[#7b7f9a] pointer-events-none transition-all
    top-1/2 -translate-y-1/2
    peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:scale-75
    peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:-translate-y-0 peer-not-placeholder-shown:scale-75
  `;

  return (
    <Container>
      <Card className="bg-[#fff9ed] shadow-[8px_8px_20px_#e2d8c8,-8px_-8px_20px_#ffffff]">

        {!showSuccess && (
          <>
            <div className="text-center mb-10">
              <div className="w-20 h-20 mx-auto rounded-full bg-[#e0e5ec] flex items-center justify-center shadow-[8px_8px_20px_#bec3cf,-8px_-8px_20px_#ffffff]">
                <div className="w-10 h-10 text-[#6c7293]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              </div>

              <h2 className="text-[#3d4468] text-xl mt-4 font-semibold tracking-wide">
                Welcome To <span className="text-[#6F73FF] font-bold">BoundDesk</span>
              </h2>
              <p className="text-sm text-gray-500 italic">
                “Lead smart. Work better. Grow faster.”
              </p>
            </div>

            <form ref={loginForm} onSubmit={handleSubmit} className="space-y-6">

              {/* EMAIL */}
              <div>
                <div className="relative bg-[#e0e5ec] rounded-xl shadow-[inset_8px_8px_16px_#bec3cf,inset_-8px_-8px_16px_#ffffff]">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=" "
                    autoComplete="off"
                    className="peer w-full p-5 bg-transparent outline-none text-[#3d4468]"
                  />
                  <label className={labelStyle}>Email Address</label>
                </div>
                <span ref={emailError} className="text-xs text-[#ff3b5c]"></span>
              </div>

              {/* PASSWORD */}
              <div>
                <div className="relative bg-[#e0e5ec] rounded-xl shadow-[inset_8px_8px_16px_#bec3cf,inset_-8px_-8px_16px_#ffffff]">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=" "
                    autoComplete="off"
                    className="peer w-full p-5 bg-transparent outline-none text-[#3d4468]"
                  />
                  <label className={labelStyle}>Password</label>

                  <span
                    className="absolute right-6 top-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? "🙈" : "👁"}
                  </span>
                </div>
                <span ref={passwordError} className="text-xs text-[#ff3b5c]"></span>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                className={`cursor-pointer w-full py-4 rounded-xl bg-[#e0e5ec] text-[#3d4468] font-semibold shadow-[8px_8px_20px_#bec3cf,-8px_-8px_20px_#ffffff] disabled:opacity-60 disabled:cursor-not-allowed ${
                  loading && "opacity-60 pointer-events-none"
                }`}
              >
                {!loading ? "Sign In" : "Logging in..."}
              </button>
            </form>

            <div className="mt-6 flex justify-between">
              <Link to="/forgot" className="text-[#6F73FF] text-sm underline">Forgot Password?</Link>
              <Link to="/signup" className="text-[#6F73FF] text-sm underline">Create Account</Link>
            </div>
          </>
        )}

        {showSuccess && (
          <div className="text-center py-6">
            <h3 className="text-[#3d4468] text-lg font-semibold">Login Successful</h3>
            <Loader />
          </div>
        )}

      </Card>
    </Container>
  );
}
