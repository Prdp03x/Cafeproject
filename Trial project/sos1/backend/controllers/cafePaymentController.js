const { routeAPI } = require("../config/razorpay");
const Cafe = require("../models/Cafe");

// Maps Razorpay's account status values to our simplified enum.
// (Razorpay's exact status vocabulary can vary by KYC flow — anything that
// isn't a clear "activated" is treated as still pending review.)
const mapAccountStatus = (razorpayStatus) => {
  if (razorpayStatus === "activated") return "activated";
  if (razorpayStatus === "suspended" || razorpayStatus === "rejected") return "rejected";
  return "pending";
};

// GET /api/cafes/payments/status — read-through: also re-syncs from Razorpay
// so the dashboard reflects real KYC approval, not just what we last saved.
exports.getPaymentStatus = async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.cafeId);
    if (!cafe) {
      return res.status(404).json({ error: "Cafe not found" });
    }

    if (!cafe.razorpay?.accountId) {
      return res.json({ accountStatus: "not_connected" });
    }

    try {
      const { data } = await routeAPI.get(`/accounts/${cafe.razorpay.accountId}`);
      const mapped = mapAccountStatus(data.status || data.activation_status);

      if (mapped !== cafe.razorpay.accountStatus) {
        cafe.razorpay.accountStatus = mapped;
        await cafe.save();
      }
    } catch (syncErr) {
      // Non-fatal — fall back to our last known status if Razorpay's API hiccups.
      console.error("Razorpay status sync failed:", syncErr.response?.data || syncErr.message);
    }

    res.json({
      accountStatus: cafe.razorpay.accountStatus,
      bankAccountLast4: cafe.razorpay.bankAccountLast4,
      commissionPercent: cafe.razorpay.commissionPercent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/cafes/payments/onboard — creates the café's Razorpay Linked
// Account so Route can split payments to it. Requires the café's business
// profile (name, GST, address) to already be filled in under Settings.
exports.onboardPayments = async (req, res) => {
  try {
    const { beneficiaryName, accountNumber, ifsc, businessType } = req.body;

    if (!beneficiaryName || !accountNumber || !ifsc || !businessType) {
      return res.status(400).json({ error: "Bank account details and business type are required" });
    }

    const VALID_BUSINESS_TYPES = [
      "individual", "proprietorship", "partnership", "private_limited",
      "public_limited", "llp", "trust", "society", "ngo",
    ];
    if (!VALID_BUSINESS_TYPES.includes(businessType)) {
      return res.status(400).json({ error: "Invalid business type" });
    }

    const cafe = await Cafe.findById(req.cafeId);
    if (!cafe) {
      return res.status(404).json({ error: "Cafe not found" });
    }

    if (cafe.razorpay?.accountId) {
      return res.status(400).json({ error: "Payments are already connected for this cafe" });
    }

    const missingBusinessFields = [
      "legalBusinessName", "email", "phone", "address", "city", "state", "postalCode",
    ].filter((field) => !cafe[field]);

    if (missingBusinessFields.length) {
      return res.status(400).json({
        error: `Complete your Business settings first (missing: ${missingBusinessFields.join(", ")})`,
      });
    }

    const { data: account } = await routeAPI.post("/accounts", {
      email: cafe.email,
      phone: cafe.phone,
      type: "route",
      legal_business_name: cafe.legalBusinessName,
      business_type: businessType,
      contact_name: cafe.ownerName || cafe.legalBusinessName,
      profile: {
        category: "food",
        subcategory: "restaurant",
        addresses: {
          registered: {
            street1: cafe.address,
            city: cafe.city,
            state: cafe.state,
            postal_code: cafe.postalCode,
            country: "IN",
          },
        },
      },
      legal_info: {
        gst: cafe.gstNumber || undefined,
      },
    });

    // Attach bank details for settlement (separate call per Razorpay's flow).
    await routeAPI.patch(`/accounts/${account.id}/bank_account`, {
      account_holder_name: beneficiaryName,
      account_number: accountNumber,
      ifsc_code: ifsc,
    });

    cafe.razorpay.accountId = account.id;
    cafe.razorpay.accountStatus = mapAccountStatus(account.status);
    cafe.razorpay.bankAccountLast4 = accountNumber.slice(-4);
    cafe.razorpay.businessType = businessType;
    cafe.razorpay.submittedAt = new Date();
    await cafe.save();

    res.json({
      message: "Payment account submitted — Razorpay will review and activate it.",
      accountStatus: cafe.razorpay.accountStatus,
    });
  } catch (err) {
    console.error("Razorpay onboarding failed:", err.response?.data || err.message);
    res.status(500).json({
      error: err.response?.data?.error?.description || "Could not connect payments",
    });
  }
};
