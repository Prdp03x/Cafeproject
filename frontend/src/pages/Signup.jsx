import { useState } from "react";
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser } from "react-icons/hi";
import { signup } from "../api/api";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle signup
  const handleSignup = async () => {
    setError("");

    if (!form.name || !form.email || !form.password) {
      return setError("All fields are required");
    }

    try {
      setLoading(true);

      const res = await signup(form);

      // 🔥 Auto login
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("cafe", JSON.stringify(res.data.cafe));

      window.location.href = "/dashboard";

    } catch (err) {
      const message = err.response?.data?.error;

      if (message === "Email already exists") {
        setError("Account already exists. Please login.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        setError(message || "Signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-5">

        {/* Title */}
        <h2 className="text-2xl font-semibold text-center">
          Create Your Cafe
        </h2>

        {/* Name */}
        <div className="flex items-center bg-gray-100 px-4 py-3 rounded-full focus-within:ring-2 focus-within:ring-gray-300">
          <HiOutlineUser className="text-gray-500 mr-3" size={20} />
          <input
            type="text"
            name="name"
            placeholder="Cafe Name"
            onChange={handleChange}
            className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Email */}
        <div className="flex items-center bg-gray-100 px-4 py-3 rounded-full focus-within:ring-2 focus-within:ring-gray-300">
          <HiOutlineMail className="text-gray-500 mr-3" size={20} />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Password */}
        <div className="flex items-center bg-gray-100 px-4 py-3 rounded-full focus-within:ring-2 focus-within:ring-gray-300">
          <HiOutlineLockClosed className="text-gray-500 mr-3" size={20} />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm text-center">
            {error}
          </p>
        )}

        {/* Button */}
        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-full hover:bg-gray-800 transition"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        {/* Redirect */}
        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <span
            onClick={() => (window.location.href = "/login")}
            className="text-black font-medium cursor-pointer"
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
};

export default Signup;