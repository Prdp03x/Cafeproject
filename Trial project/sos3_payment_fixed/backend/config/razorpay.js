const Razorpay = require("razorpay");
const axios = require("axios");

// Standard Orders/Payments SDK (used for creating orders & signature verification)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Razorpay Route (Linked Accounts) isn't wrapped by the official SDK's
// high-level helpers, so we call those endpoints directly with Basic Auth.
// NOTE: Route/Linked-Account endpoints are versioned /v2 — do NOT put /v1
// in this baseURL, that gives a generic "requested URL was not found" 404.
const routeAPI = axios.create({
  baseURL: "https://api.razorpay.com",
  auth: {
    username: process.env.RAZORPAY_KEY_ID,
    password: process.env.RAZORPAY_KEY_SECRET,
  },
});

module.exports = { razorpay, routeAPI };
