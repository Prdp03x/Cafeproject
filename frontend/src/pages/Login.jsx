import { useState, useEffect } from "react";
import API from "../api/api";
import { useNavigate } from "react-router";
import GoogleLoginButton from "../components/Common/GoogleLoginButton";
import { HiOutlineMail, HiOutlineLockClosed } from "react-icons/hi";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      return setError("All fields are required");
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/login", {
        email,
        password,
      });

      // 🔥 Store token
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("cafe", JSON.stringify(res.data.cafe));

      navigate("/dashboard");

    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    document.title = "Login | Cafe";
  },[])

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-5">

        {/* Title */}
        <h2 className="text-2xl font-semibold text-center">
          Welcome Back
        </h2>

        {/* Email */}
        <div className="flex items-center bg-gray-100 px-4 py-3 rounded-full focus-within:ring-2 focus-within:ring-gray-300">
          <HiOutlineMail className="text-gray-500 mr-3" size={20} />
          <input
            type="email"
            placeholder="Email"
            className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="flex items-center bg-gray-100 px-4 py-3 rounded-full focus-within:ring-2 focus-within:ring-gray-300">
          <HiOutlineLockClosed className="text-gray-500 mr-3" size={20} />
          <input
            type="password"
            placeholder="Password"
            className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm text-center">
            {error}
          </p>
        )}

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-full hover:bg-gray-800 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google Login */}
        <GoogleLoginButton />

        {/* Redirect */}
        <p className="text-center text-sm text-gray-500">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-black font-medium cursor-pointer"
          >
            Sign up
          </span>
        </p>

      </div>
    </div>
  );
};

export default Login;