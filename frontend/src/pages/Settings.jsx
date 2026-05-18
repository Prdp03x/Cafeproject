import { useEffect, useState } from "react";
import API from "../api/api";
import { toast } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";
import useThemeColor from "../hooks/useThemeColor";
import {
  brandingFieldNames,
  businessFieldNames,
  defaultSettingsForm,
  mapSettingsToForm,
  normalizeSettingsPayload,
  validateBusinessSettings,
} from "../utils/settingsForm";

const Settings = () => {
  const [form, setForm] = useState(defaultSettingsForm);

  const [activeTab, setActiveTab] = useState("branding");
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const navigate = useNavigate();
  const { cafe, updateCafe } = useAuth();
  useThemeColor(cafe?.themeColor);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await API.get("/auth/settings");
      setForm(mapSettingsToForm(res.data));
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

  const handleSave = async (section) => {
    try {
      if (section === "business") {
        const validationError = validateBusinessSettings(form);

        if (validationError) {
          toast.error(validationError);
          return;
        }
      }

      setLoading(true);

      const fieldNames = section === "branding" ? brandingFieldNames : businessFieldNames;
      const res = await API.put(
        "/auth/settings",
        normalizeSettingsPayload(form, fieldNames)
      );

      toast.success(res.data.message);

      updateCafe(res.data.cafe);
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
                    ? "theme-primary theme-primary-elevated theme-primary-hover text-white"
                    : "hover:bg-gray-200"
                }`}
              >
                Branding
              </button>

              <button
                onClick={() => setActiveTab("business")}
                className={`w-full text-left px-4 py-3 rounded-xl transition font-medium ${
                  activeTab === "business"
                    ? "theme-primary theme-primary-elevated theme-primary-hover text-white"
                    : "hover:bg-gray-200"
                }`}
              >
                Business Details
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={`w-full text-left px-4 py-3 rounded-xl transition font-medium ${
                  activeTab === "security"
                    ? "theme-primary theme-primary-elevated theme-primary-hover text-white"
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

                <div className="rounded-2xl border bg-gray-50 p-4">
                  <div
                    className="h-20 rounded-xl border"
                    style={{ backgroundColor: form.themeColor || "#14532d" }}
                  />

                  <div className="mt-4 flex items-center gap-3">
                    <input
                      type="color"
                      name="themeColor"
                      value={form.themeColor}
                      onChange={handleChange}
                      className="h-11 w-14 cursor-pointer rounded-xl border bg-white p-1"
                    />

                    <input
                      type="text"
                      name="themeColor"
                      placeholder="#14532d"
                      value={form.themeColor}
                      onChange={handleChange}
                      className="w-full border rounded-xl p-3"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleSave("branding")}
                  disabled={loading}
                  className="theme-primary theme-primary-hover rounded-xl px-6 py-3 text-white"
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
                  required
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

                <input
                  type="text"
                  name="legalBusinessName"
                  placeholder="Legal Business Name"
                  value={form.legalBusinessName}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-xl p-3"
                />

                <input
                  type="email"
                  name="billingEmail"
                  placeholder="Billing Email"
                  value={form.billingEmail}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-xl p-3"
                />

                <input
                  type="text"
                  name="gstNumber"
                  placeholder="GST Number"
                  value={form.gstNumber}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-xl p-3"
                />

                <textarea
                  name="address"
                  placeholder="Billing Address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-xl p-3 min-h-[120px]"
                />

                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-xl p-3"
                />

                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={form.state}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-xl p-3"
                />

                <input
                  type="text"
                  name="postalCode"
                  placeholder="Postal Code"
                  value={form.postalCode}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-xl p-3"
                />

                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={form.country}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-xl p-3"
                />

                <button
                  onClick={() => handleSave("business")}
                  disabled={loading}
                  className="theme-primary theme-primary-hover rounded-xl px-6 py-3 text-white"
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
                    className="theme-primary theme-primary-hover rounded-xl px-6 py-3 text-white"
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
