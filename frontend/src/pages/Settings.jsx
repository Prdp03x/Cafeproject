import { useEffect, useState } from "react";
import API from "../api/api";
import { toast } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

const Settings = () => {
  const [form, setForm] = useState({
    name: "",
    ownerName: "",
    phone: "",
    description: "",
    category: "",
    logo: "",
    themeColor: "#14532d",
    totalTables: 10,
  });

  const [activeTab, setActiveTab] = useState("branding");
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await API.get("/auth/settings");

      setForm({
        name: res.data.name || "",
        ownerName: res.data.ownerName || "",
        phone: res.data.phone || "",
        description: res.data.description || "",
        category: res.data.category || "",
        logo: res.data.logo || "",
        themeColor: res.data.themeColor || "#14532d",
        totalTables: res.data.totalTables || 10,
      });
    } catch (error) {
      toast.error("Failed to load settings", error);
    }
  };

  const handleChangePassword = async () => {
    try {
      const res = await API.put("/auth/password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      toast.success(res.data.message);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change password");
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const res = await API.put("/auth/settings", form);

      toast.success(res.data.message);

      localStorage.setItem("cafe", JSON.stringify(res.data.cafe));
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-sm overflow-hidden border">
        {/* HEADER */}
        <div className="border-b px-5 md:px-8 py-5 bg-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* LEFT */}
            <div className="flex items-center gap-4">
              {/* LOGO */}
              <div className="h-16 w-16 rounded-2xl overflow-hidden border-none bg-gray-100 shadow-sm">
                {form.logo ? (
                  <img
                    src={form.logo}
                    alt="Cafe Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                    {form.name?.charAt(0) || "C"}
                  </div>
                )}
              </div>

              {/* TITLE */}
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {form.name || "Cafe Settings"}
                </h1>

                <p className="text-gray-500 text-sm mt-1">
                  Manage branding, business details and security settings
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 transition px-5 py-3 rounded-2xl font-medium"
            >
              <FaArrowLeft />
              Dashboard
            </button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row min-h-[80vh]">
          {/* SIDEBAR */}
          {/* <div className="w-full md:w-72 border-b md:border-b-0 md:border-r bg-gray-50 p-4"> */}
          <div className="w-full md:w-72 border-b md:border-b-0 md:border-r bg-gray-50/80 p-4 md:p-5">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3 px-2">
                Preferences
              </p>
              <button
                onClick={() => setActiveTab("branding")}
                className={`w-full text-left px-4 py-3 rounded-xl transition font-medium ${
                  activeTab === "branding"
                    ? "bg-black text-white shadow-lg"
                    : "hover:bg-gray-200"
                }`}
              >
                Branding
              </button>

              <button
                onClick={() => setActiveTab("business")}
                className={`w-full text-left px-4 py-3 rounded-xl transition font-medium ${
                  activeTab === "business"
                    ? "bg-black text-white shadow-lg"
                    : "hover:bg-gray-200"
                }`}
              >
                Business Details
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={`w-full text-left px-4 py-3 rounded-xl transition font-medium ${
                  activeTab === "security"
                    ? "bg-black text-white shadow-lg"
                    : "hover:bg-gray-200"
                }`}
              >
                Security
              </button>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="flex-1 p-5 md:p-8">
            {/* BRANDING */}
            {activeTab === "branding" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Branding</h2>

                  <p className="text-gray-500 mt-1">
                    Manage your cafe identity and branding.
                  </p>
                </div>

                {/* Logo Preview */}
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-2xl overflow-hidden border bg-gray-100">
                    {form.logo ? (
                      <img
                        src={form.logo}
                        alt="logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        No Logo
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      type="text"
                      name="logo"
                      placeholder="Logo URL"
                      value={form.logo}
                      onChange={handleChange}
                      className="w-full border rounded-xl p-3"
                    />
                  </div>
                </div>

                <input
                  type="text"
                  name="name"
                  placeholder="Cafe Name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-3"
                />

                <textarea
                  name="description"
                  placeholder="Cafe Description"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-3 min-h-[120px]"
                />

                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-black text-white px-6 py-3 rounded-xl"
                >
                  {loading ? "Saving..." : "Save Branding"}
                </button>
              </div>
            )}

            {/* BUSINESS */}
            {activeTab === "business" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Business Details</h2>

                  <p className="text-gray-500 mt-1">
                    Update your cafe business information.
                  </p>
                </div>

                <input
                  type="text"
                  name="ownerName"
                  placeholder="Owner Name"
                  value={form.ownerName}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-3"
                />

                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-3"
                />

                <input
                  type="text"
                  name="category"
                  placeholder="Cafe Category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-3"
                />

                <input
                  type="number"
                  name="totalTables"
                  placeholder="Total Tables"
                  value={form.totalTables}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-3"
                />

                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-black text-white px-6 py-3 rounded-xl"
                >
                  {loading ? "Saving..." : "Save Details"}
                </button>
              </div>
            )}

            {/* SECURITY */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Security</h2>

                  <p className="text-gray-500 mt-1">
                    Keep your account secure with a strong password.
                  </p>
                </div>

                {/* Instructions */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                  <h3 className="font-semibold mb-2">Password Tips</h3>

                  <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
                    <li>Use at least 6 characters</li>
                    <li>Avoid common passwords</li>
                    <li>Do not reuse old passwords</li>
                    <li>Keep your password private</li>
                  </ul>
                </div>

                {/* password */}
                <input
                  type={showPasswords ? "text" : "password"}
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border rounded-xl p-3"
                />

                <input
                  type={showPasswords ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border rounded-xl p-3"
                />

                <input
                  type={showPasswords ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border rounded-xl p-3"
                />

                <div className="flex gap-6">
                  <button
                    onClick={handleChangePassword}
                    className="bg-black text-white px-6 py-3 rounded-xl"
                  >
                    Update Password
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="text-sm text-gray-600 hover:text-black font-medium"
                  >
                    {showPasswords ? "Hide Passwords" : "Show Passwords"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
