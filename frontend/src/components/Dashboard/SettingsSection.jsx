import { useEffect, useState } from "react";
import API from "../../api/api";
import { toast } from "react-toastify";
import FormField from "../Common/FormField";
import { FaPalette } from "react-icons/fa";
import {
  FiBriefcase,
  FiLock,
  FiShield,
  FiTable,
} from "react-icons/fi";
import {
  brandingFieldNames,
  businessFieldNames,
  defaultSettingsForm,
  mapSettingsToForm,
  normalizeSettingsPayload,
  validateBusinessSettings,
} from "../../utils/settingsForm";

const tabConfig = {
  branding: {
    label: "Branding",
    description: "Visual identity and public-facing brand details.",
    icon: FaPalette,
  },
  business: {
    label: "Business",
    description: "Operational details used across the dashboard.",
    icon: FiBriefcase,
  },
  security: {
    label: "Security",
    description: "Password controls and account protection.",
    icon: FiLock,
  },
};

const SettingsSection = ({ updateCafeData }) => {
  const [activeTab, setActiveTab] = useState("branding");
  const [form, setForm] = useState(defaultSettingsForm);
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        const res = await API.get("/auth/settings");

        if (!isMounted) return;

        setForm(mapSettingsToForm(res.data));
      } catch {
        if (!isMounted) return;
        toast.error("Failed to load settings");
      }
    };

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      if (activeTab === "business") {
        const validationError = validateBusinessSettings(form);

        if (validationError) {
          toast.error(validationError);
          return;
        }
      }

      setLoading(true);

      const fieldNames =
        activeTab === "branding" ? brandingFieldNames : businessFieldNames;
      const res = await API.put(
        "/auth/settings",
        normalizeSettingsPayload(form, fieldNames)
      );

      toast.success(res.data.message);
      updateCafeData(res.data.cafe);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save settings");
    } finally {
      setLoading(false);
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
      toast.error(err.response?.data?.error || "Failed to update password");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="mt-1 text-gray-500">Control panel and customization</p>
      </div>

      <section className="overflow-hidden rounded-[32px] border border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
        <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1.2fr)_320px]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Workspace settings
            </p>
            <h3 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Configure the operational identity of your cafe.
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Use one place to manage your visual branding, business details, and account
              security without leaving the dashboard flow.
            </p>
          </div>

          <div className="rounded-[28px] border border-stone-200 bg-stone-50 p-5">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-[22px] bg-white shadow-sm ring-1 ring-black/5">
                {form.logo ? (
                  <img
                    src={form.logo}
                    alt="Cafe logo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="theme-primary flex h-full w-full items-center justify-center text-xl font-semibold text-white">
                    {form.name?.charAt(0)?.toUpperCase() || "C"}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Brand preview
                </p>
                <h4 className="mt-2 truncate text-xl font-semibold text-slate-950">
                  {form.name || "Cafe Name"}
                </h4>
                <p className="mt-1 text-sm text-slate-500">
                  {form.category || "Cafe"} . {form.ownerName || "Owner not added"}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/80 bg-white px-3 py-3">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <FiTable />
                  Tables
                </div>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {form.totalTables || 0}
                </p>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white px-3 py-3">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <FiShield />
                  Theme
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className="h-4 w-4 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: form.themeColor || "#14532d" }}
                  />
                  <p className="text-sm font-semibold text-slate-950">
                    {form.themeColor || "#14532d"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="rounded-[32px] border border-white/70 bg-white/85 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
            <h3 className="px-2 pb-3 pt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Preferences
            </h3>

            <div className="space-y-2">
              {Object.entries(tabConfig).map(([key, item]) => {
                const Icon = item.icon;

                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex w-full items-start gap-3 rounded-[24px] px-4 py-4 text-left transition ${
                      activeTab === key
                        ? "theme-primary theme-primary-elevated theme-primary-hover text-white"
                        : "hover:bg-stone-100"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl ${
                        activeTab === key
                          ? "bg-white/12 text-white"
                          : "bg-white text-slate-700 shadow-sm"
                      }`}
                    >
                      <Icon size={16} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p
                        className={`mt-1 text-xs leading-5 ${
                          activeTab === key ? "text-white/70" : "text-slate-500"
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/85 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
            <h3 className="text-sm font-semibold text-slate-950">Admin notes</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Keep names concise, make descriptions useful, and avoid storing temporary
              operational details in branding fields.
            </p>
          </div>
        </aside>

        <div className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
          {activeTab === "branding" && (
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Branding
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  Manage your public-facing brand
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Update the identity customers and staff recognize across the dashboard.
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
                <div className="space-y-5">
                  <FormField
                    label="Logo URL"
                    type="text"
                    name="logo"
                    placeholder="https://your-logo-url"
                    value={form.logo}
                    onChange={handleChange}
                  />

                  <FormField
                    label="Brand name"
                    type="text"
                    name="name"
                    placeholder="Cafe Name"
                    value={form.name}
                    onChange={handleChange}
                  />

                  <FormField
                    label="Description"
                    textarea
                    type="text"
                    name="description"
                    placeholder="Short description for your cafe"
                    value={form.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="rounded-[28px] border border-stone-200 bg-stone-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Theme accent</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Store a primary color for future branding and dashboard extensions.
                  </p>

                  <div className="mt-4 overflow-hidden rounded-[24px] border border-stone-200 bg-white p-4">
                    <div
                      className="h-24 rounded-[18px]"
                      style={{ backgroundColor: form.themeColor || "#14532d" }}
                    />

                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Theme color
                      </label>

                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          name="themeColor"
                          value={form.themeColor}
                          onChange={handleChange}
                          className="h-11 w-14 cursor-pointer rounded-xl border border-stone-200 bg-white p-1"
                        />

                        <input
                          type="text"
                          name="themeColor"
                          value={form.themeColor}
                          onChange={handleChange}
                          className="w-full rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "business" && (
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Business
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  Maintain business details
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Keep operational information complete so the dashboard always reflects the
                  right business profile.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  label="Owner name"
                  type="text"
                  name="ownerName"
                  placeholder="Owner Name"
                  value={form.ownerName}
                  onChange={handleChange}
                  required
                />

                <FormField
                  label="Mobile"
                  type="text"
                  name="phone"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  hint="Used as the primary billing contact number."
                />

                <FormField
                  label="Category"
                  type="text"
                  name="category"
                  placeholder="Cafe"
                  value={form.category}
                  onChange={handleChange}
                />

                <FormField
                  label="Total tables"
                  type="number"
                  name="totalTables"
                  placeholder="10"
                  value={form.totalTables}
                  onChange={handleChange}
                />
              </div>

              <div className="rounded-[28px] border border-stone-200 bg-stone-50 p-5">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">Billing profile</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Keep invoice-ready information complete for tax and payment records.
                  </p>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <FormField
                    label="Legal business name"
                    type="text"
                    name="legalBusinessName"
                    placeholder="Registered business name"
                    value={form.legalBusinessName}
                    onChange={handleChange}
                    required
                  />

                  <FormField
                    label="Billing email"
                    type="email"
                    name="billingEmail"
                    placeholder="billing@example.com"
                    value={form.billingEmail}
                    onChange={handleChange}
                    required
                  />

                  <FormField
                    label="GST number"
                    type="text"
                    name="gstNumber"
                    placeholder="22AAAAA0000A1Z5"
                    value={form.gstNumber}
                    onChange={handleChange}
                    required
                    hint="Use the registered 15-character GSTIN."
                  />

                  <FormField
                    label="Country"
                    type="text"
                    name="country"
                    placeholder="India"
                    value={form.country}
                    onChange={handleChange}
                    required
                  />

                  <div className="md:col-span-2">
                    <FormField
                      label="Address"
                      textarea
                      name="address"
                      placeholder="Street address, area, and landmark"
                      value={form.address}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <FormField
                    label="City"
                    type="text"
                    name="city"
                    placeholder="City"
                    value={form.city}
                    onChange={handleChange}
                    required
                  />

                  <FormField
                    label="State"
                    type="text"
                    name="state"
                    placeholder="State"
                    value={form.state}
                    onChange={handleChange}
                    required
                  />

                  <FormField
                    label="Postal code"
                    type="text"
                    name="postalCode"
                    placeholder="Postal code"
                    value={form.postalCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Security
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  Protect admin access
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Update your password regularly and avoid sharing access across staff.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Length</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Use at least 6 characters.
                  </p>
                </div>

                <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Uniqueness</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Avoid obvious or reused passwords.
                  </p>
                </div>

                <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Access</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Keep credentials private to admins only.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  label="Current password"
                  type={showPasswords ? "text" : "password"}
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />

                <FormField
                  label="New password"
                  type={showPasswords ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                <div className="md:col-span-2">
                  <FormField
                    label="Confirm password"
                    type={showPasswords ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleChangePassword}
                  className="theme-primary theme-primary-hover rounded-2xl px-5 py-3 text-sm font-semibold text-white"
                >
                  Update Password
                </button>

                <button
                  onClick={() => setShowPasswords((prevShow) => !prevShow)}
                  className="rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-stone-50"
                >
                  {showPasswords ? "Hide" : "Show"} Passwords
                </button>
              </div>
            </div>
          )}

          {activeTab !== "security" && (
            <div className="mt-8 border-t border-stone-200 pt-6">
              <button
                onClick={handleSave}
                disabled={loading}
                className="theme-primary theme-primary-hover rounded-2xl px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;
