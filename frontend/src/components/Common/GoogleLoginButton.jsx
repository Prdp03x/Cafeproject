import { FcGoogle } from "react-icons/fc";

const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google"; // your backend route
  };

  return (
    <button
      onClick={handleGoogleLogin}
    className="flex items-center justify-center gap-3 bg-gray-100 hover:bg-white border border-gray-300 w-full mt-3 h-13 px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
    >
      <FcGoogle size={22} />
      <span className="text-gray-700 font-medium">
        Continue with Google
      </span>
    </button>
  );
};

export default GoogleLoginButton;