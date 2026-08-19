import { useEffect, useState } from "react";
import { FaPalette } from "react-icons/fa";
import { FiBriefcase, FiCreditCard, FiLock } from "react-icons/fi";
import { toast } from "react-toastify";
import API from "../../api/api";
import useAuth from "../../hooks/useAuth";
import {
  brandingFieldNames,
  businessFieldNames,
  defaultSettingsForm,
  mapSettingsToForm,
  normalizeSettingsPayload,
  validateBusinessSettings,
} from "../../utils/settingsForm";
import BrandingTab from "./settings/BrandingTab";
import BusinessTab from "./settings/BusinessTab";
import PaymentsTab from "./settings/PaymentsTab";
import SecurityTab from "./settings/SecurityTab";
import SettingsHeader from "./settings/SettingsHeader";
import SettingsSidebar from "./settings/SettingsSidebar";

const SettingsSection = ({ updateCafeData, activeTab, setActiveTab }) => {
  const { cafe } = useAuth();
  const isGoogleUser = Boolean(cafe?.hasGoogleAuth);

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
    payments: {
      label: "Payments",
      description: "Connect Razorpay to receive online order payouts.",
      icon: FiCreditCard,
    },
    // Hide Security tab for Google users — they manage passwords via Google
    security: {
        label: "Security",
        description: "Password controls and account protection.",
        icon: FiLock,
      },
  };
  const [form, setForm] = useState(defaultSettingsForm);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        const res = await API.get("/auth/settings");
        if (isMounted) setForm(mapSettingsToForm(res.data));
      } catch {
        if (isMounted) toast.error("Failed to load settings");
      }
    };
    void loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
        normalizeSettingsPayload(form, fieldNames),
      );
      toast.success(res.data.message);
      updateCafeData(res.data.cafe);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="mt-1 text-gray-500">Control panel and customization</p>
      </div>

      <SettingsHeader form={form} />

      <div>

        <div className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
          {activeTab === "branding" && (
            <BrandingTab form={form} onChange={handleChange} />
          )}
          {activeTab === "business" && (
            <BusinessTab form={form} onChange={handleChange} />
          )}
          {activeTab === "payments" && <PaymentsTab />}
          {activeTab === "security" && (
            <SecurityTab isGoogleUser={isGoogleUser} email={cafe?.email} />
          )}

          {activeTab !== "security" && activeTab !== "payments" && (
            <div className="mt-8 border-t border-stone-200 pt-6">
              <button
                onClick={handleSave}
                disabled={loading}
                className="theme-primary theme-primary-hover rounded-2xl px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save changes"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;
