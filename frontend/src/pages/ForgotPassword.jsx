import { useState, useRef } from "react";
import { Container, Card } from "../components/styles";
import { Link } from "react-router-dom";
import axios from "axios";
import { api } from "../utils/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const emailError = useRef(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    try {
      setLoading(true);
      const res = await axios.post(
        `${api}/auth/forgot-password`,
        { email }
      );
      setMsg(res.data.msg);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setMsg(err.response?.data?.msg || "Something went wrong");
    }
  };

  const labelStyle = `absolute left-6 text-[#7b7f9a] pointer-events-none transition-all
    top-1/2 -translate-y-1/2
    peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:scale-75
    peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:-translate-y-0 peer-not-placeholder-shown:scale-75`;

  return (
    <Container>
      <Card className="bg-[#fff9ed] shadow-[8px_8px_20px_#e2d8c8,-8px_-8px_20px_#ffffff]">
        <div className="text-center mb-10">
          <h2 className="text-[#3d4468] text-xl mt-4 font-semibold tracking-wide">
            Forgot Password
          </h2>
          <p className="text-sm text-gray-500 italic">Enter your email to reset password</p>
        </div>

        {msg && <p className="text-center text-sm text-[#4caf50] mb-4">{msg}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="relative bg-[#e0e5ec] rounded-xl shadow-[inset_8px_8px_16px_#bec3cf,inset_-8px_-8px_16px_#ffffff]">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                className="peer w-full p-5 bg-transparent outline-none text-[#3d4468]"
              />
              <label className={labelStyle}>Email Address</label>
            </div>
            <span ref={emailError} className="text-xs text-[#ff3b5c]"></span>
          </div>

          <button
            className={`cursor-pointer w-full py-4 rounded-xl bg-[#e0e5ec] text-[#3d4468] font-semibold shadow-[8px_8px_20px_#bec3cf,-8px_-8px_20px_#ffffff] disabled:opacity-60 disabled:cursor-not-allowed ${
              loading && "opacity-60 pointer-events-none"
            }`}
          >
            {!loading ? "Send Reset Link" : "Sending..."}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-[#6F73FF] text-sm underline">
            Back to Login
          </Link>
        </div>
      </Card>
    </Container>
  );
}
