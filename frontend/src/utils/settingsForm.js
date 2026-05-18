export const defaultSettingsForm = {
  name: "",
  ownerName: "",
  phone: "",
  description: "",
  category: "",
  logo: "",
  themeColor: "#14532d",
  totalTables: 10,
  legalBusinessName: "",
  billingEmail: "",
  gstNumber: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

export const brandingFieldNames = ["name", "description", "logo", "themeColor"];

export const businessFieldNames = [
  "ownerName",
  "phone",
  "category",
  "totalTables",
  "legalBusinessName",
  "billingEmail",
  "gstNumber",
  "address",
  "city",
  "state",
  "postalCode",
  "country",
];

const requiredBusinessFields = {
  ownerName: "Owner name",
  phone: "Phone number",
  legalBusinessName: "Legal business name",
  billingEmail: "Billing email",
  gstNumber: "GST number",
  address: "Address",
  city: "City",
  state: "State",
  postalCode: "Postal code",
  country: "Country",
};

const gstNumberPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+\-() ]{7,20}$/;

const trimString = (value) => (typeof value === "string" ? value.trim() : "");

export const mapSettingsToForm = (settings = {}) => ({
  ...defaultSettingsForm,
  ...settings,
  totalTables: settings.totalTables ?? defaultSettingsForm.totalTables,
  billingEmail: settings.billingEmail || "",
  gstNumber: settings.gstNumber || "",
  legalBusinessName: settings.legalBusinessName || "",
  address: settings.address || "",
  city: settings.city || "",
  state: settings.state || "",
  postalCode: settings.postalCode || "",
  country: settings.country || "India",
});

export const normalizeSettingsPayload = (form, fieldNames) =>
  fieldNames.reduce((payload, fieldName) => {
    if (fieldName === "totalTables") {
      payload[fieldName] = Number(form[fieldName]) || 0;
      return payload;
    }

    const value = trimString(form[fieldName]);

    if (fieldName === "billingEmail") {
      payload[fieldName] = value.toLowerCase();
      return payload;
    }

    if (fieldName === "gstNumber") {
      payload[fieldName] = value.toUpperCase();
      return payload;
    }

    payload[fieldName] = value;
    return payload;
  }, {});

export const validateBusinessSettings = (form) => {
  const missingFields = Object.entries(requiredBusinessFields)
    .filter(([fieldName]) => !trimString(form[fieldName]))
    .map(([, label]) => label);

  if (missingFields.length) {
    return `Missing required business fields: ${missingFields.join(", ")}`;
  }

  if (!phonePattern.test(trimString(form.phone))) {
    return "Phone number is invalid";
  }

  if (!emailPattern.test(trimString(form.billingEmail))) {
    return "Billing email is invalid";
  }

  if (!gstNumberPattern.test(trimString(form.gstNumber).toUpperCase())) {
    return "GST number is invalid";
  }

  if (!Number.isInteger(Number(form.totalTables)) || Number(form.totalTables) < 1) {
    return "Total tables must be at least 1";
  }

  return null;
};
