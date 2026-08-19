import { useState } from "react";
import { useNavigate } from "react-router";
import API from "../../api/api";
import { toast } from "react-toastify";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import useAuth from "../../hooks/useAuth";

const ChangePasswordModal = ({ onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    try {
      setLoading(true);

      const res = await API.put("/auth/password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      toast.success(res.data.message);
      logout();
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[90%] max-w-md rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Change Password</h2>

        {/* Current Password */}
        <div className="relative">
          <input
            type={showCurrent ? "text" : "password"}
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 pr-12 outline-none"
          />

          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showCurrent ? (
              <HiOutlineEyeOff size={20} />
            ) : (
              <HiOutlineEye size={20} />
            )}
          </button>
        </div>
        {/* New Password */}
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 pr-12 outline-none"
          />

          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showNew ? (
              <HiOutlineEyeOff size={20} />
            ) : (
              <HiOutlineEye size={20} />
            )}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 pr-12 outline-none"
          />

          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showConfirm ? (
              <HiOutlineEyeOff size={20} />
            ) : (
              <HiOutlineEye size={20} />
            )}
          </button>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={handleChangePassword}
            disabled={loading}
            className="theme-primary theme-primary-hover px-4 py-2 rounded-lg text-white"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
