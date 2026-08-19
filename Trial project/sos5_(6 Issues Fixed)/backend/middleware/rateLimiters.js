const rateLimit = require("express-rate-limit");

// Global Rate Limiter

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: {
    error: "Too Many Requests, Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 105,
  message: { error: "Too many login attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordChangeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: "Too many password change attempts.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute

  max: 100,

  message: {
    error: "Too many orders. Please wait a moment.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

// 🔥 FIX #8: Stricter rate limiter for payment endpoints to prevent abuse
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 payment attempts per 15 minutes per IP
  message: {
    error: "Too many payment attempts. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many payment attempts. Please try again in 15 minutes.",
    });
  },
});

module.exports = {
  globalLimiter,
  loginLimiter,
  passwordChangeLimiter,
  orderLimiter,
  paymentLimiter,
};
