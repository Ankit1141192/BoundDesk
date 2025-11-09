import { useState, useRef } from "react";
import { Container, Card } from "../components/styles";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { api } from "../utils/api";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const passwordError = useRef(null);

  const validatePassword = () => {
    if (!password.trim()) {
      passwordError.current.textContent = "Password is required";
      return false;
    }
    if (password.length < 6) {
      passwordError.current.textContent = "Min 6 characters";
      return false;
    }
    if (password !== confirmPassword) {
      passwordError.current.textContent = "Passwords do not match";
      return false;
    }
    passwordError.current.textContent = "";
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    try {
      setLoading(true);
      const res = await axios.post(`${api}/auth/reset-password`, {
        token,
        newPassword: password,
      });
      setMsg(res.data.msg);
      setLoading(false);

      setTimeout(() => navigate("/"), 1500);
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
            Reset Password
          </h2>
          <p className="text-sm text-gray-500 italic">Enter a new password</p>
        </div>

        {msg && <p className="text-center text-sm text-[#4caf50] mb-4">{msg}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* New Password */}
          <div>
            <div className="relative bg-[#e0e5ec] rounded-xl shadow-[inset_8px_8px_16px_#bec3cf,inset_-8px_-8px_16px_#ffffff]">
              <input
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                className="peer w-full p-5 bg-transparent outline-none text-[#3d4468]"
              />
              <label className={labelStyle}>New Password</label>
              <span
                className="absolute right-6 top-1/2 -translate-y-1/2 cursor-pointer"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? "🙈" : "👁"}
              </span>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <div className="relative bg-[#e0e5ec] rounded-xl shadow-[inset_8px_8px_16px_#bec3cf,inset_-8px_-8px_16px_#ffffff]">
              <input
                type={confirmPasswordVisible ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder=" "
                className="peer w-full p-5 bg-transparent outline-none text-[#3d4468]"
              />
              <label className={labelStyle}>Confirm Password</label>
              <span
                className="absolute right-6 top-1/2 -translate-y-1/2 cursor-pointer"
                onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              >
                {confirmPasswordVisible ? "🙈" : "👁"}
              </span>
            </div>
            <span ref={passwordError} className="text-xs text-[#ff3b5c]"></span>
          </div>

          <button
            className={`cursor-pointer w-full py-4 rounded-xl bg-[#e0e5ec] text-[#3d4468] font-semibold shadow-[8px_8px_20px_#bec3cf,-8px_-8px_20px_#ffffff] disabled:opacity-60 disabled:cursor-not-allowed ${
              loading && "opacity-60 pointer-events-none"
            }`}
          >
            {!loading ? "Reset Password" : "Resetting..."}
          </button>
        </form>
      </Card>
    </Container>
  );
}
