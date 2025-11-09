import { useState } from "react";
import { Container, Card } from "../components/styles";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../utils/api";

export default function Signup() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate inputs
      if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
        setError("All fields are required");
        setLoading(false);
        return;
      }

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role, // Send role as-is, don't uppercase
      };

      const res = await fetch(`${api}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setForm({ name: "", email: "", password: "", role: "USER" });
        setTimeout(() => navigate("/"), 1500);
      } else {
        setError(data.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Network error. Please check your connection.");
      console.error("Signup error:", err);
      console.log("Make sure backend is running on http://localhost:5000");
    } finally {
      setLoading(false);
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

        <div className="text-center mb-10">
          <h2 className="text-xl font-semibold text-[#3d4468]">
            Create Your <span className="text-[#6F73FF] font-bold">BoundDesk</span>
          </h2>
          <p className="text-sm text-gray-500 italic">"Build Relations. Not Just Records."</p>
        </div>

        {success && (
          <p className="text-center text-green-600 font-semibold mb-4 animate-pulse">
            Account Created Successfully
          </p>
        )}

        {error && (
          <p className="text-center text-red-600 font-semibold mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSignup} className="space-y-6">

          {/* NAME */}
          <div className="relative bg-[#e0e5ec] rounded-xl shadow-[inset_8px_8px_16px_#bec3cf,inset_-8px_-8px_16px_#ffffff]">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder=" "
              autoComplete="off"
              required
              disabled={loading}
              className="peer w-full p-5 bg-transparent outline-none text-[#3d4468] disabled:opacity-60"
            />
            <label className={labelStyle}>Full Name</label>
          </div>

          {/* EMAIL */}
          <div className="relative bg-[#e0e5ec] rounded-xl shadow-[inset_8px_8px_16px_#bec3cf,inset_-8px_-8px_16px_#ffffff]">
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder=" "
              autoComplete="off"
              required
              disabled={loading}
              className="peer w-full p-5 bg-transparent outline-none text-[#3d4468] disabled:opacity-60"
            />
            <label className={labelStyle}>Email Address</label>
          </div>

          {/* PASSWORD */}
          <div className="relative bg-[#e0e5ec] rounded-xl shadow-[inset_8px_8px_16px_#bec3cf,inset_-8px_-8px_16px_#ffffff]">
            <input
              name="password"
              type={showPass ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder=" "
              autoComplete="off"
              required
              disabled={loading}
              className="peer w-full p-5 bg-transparent outline-none text-[#3d4468] disabled:opacity-60"
            />
            <label className={labelStyle}>Password</label>

            <span
              className="absolute right-5 top-5 cursor-pointer"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? "🙈" : "👁"}
            </span>
          </div>

          {/* ROLE */}
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            disabled={loading}
            className="w-full p-5 rounded-xl bg-[#e0e5ec] text-[#3d4468] cursor-pointer shadow-[inset_8px_8px_16px_#bec3cf,inset_-8px_-8px_16px_#ffffff] disabled:opacity-60"
          >
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="SALESEXECUTIVE">Sales Executive</option>
            <option value="USER">User</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer w-full py-4 rounded-xl bg-[#e0e5ec] text-[#3d4468] font-semibold shadow-[8px_8px_20px_#bec3cf,-8px_-8px_20px_#ffffff] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-[#6F73FF] text-sm underline">
            Already Registered? Login
          </Link>
        </div>
      </Card>
    </Container>
  );
}