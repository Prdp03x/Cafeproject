export const GST_RATE = 0.05; // SGST 2.5% + CGST 2.5%

export const withGST = (basePrice) =>
  Math.round(basePrice * (1 + GST_RATE) * 100) / 100;

export const formatPrice = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);