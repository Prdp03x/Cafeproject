const Razorpay = require("razorpay");
const crypto   = require("crypto");

// ── Encryption (AES-256-GCM) ────────────────────────────────────────────────
// RAZORPAY_ENCRYPTION_KEY must be a 32-byte (64-char hex) secret in .env
// Generate once: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
const ALGO     = "aes-256-gcm";
const KEY      = Buffer.from(process.env.RAZORPAY_ENCRYPTION_KEY, "hex");

const encrypt = (plaintext) => {
  const iv         = crypto.randomBytes(12);               // 96-bit IV for GCM
  const cipher     = crypto.createCipheriv(ALGO, KEY, iv);
  const encrypted  = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag    = cipher.getAuthTag();
  // store as iv:authTag:ciphertext — all hex
  return [iv, authTag, encrypted].map(b => b.toString("hex")).join(":");
};

const decrypt = (stored) => {
  const [ivHex, tagHex, dataHex] = stored.split(":");
  const decipher = crypto.createDecipheriv(ALGO, KEY, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]).toString("utf8");
};

// ── Per-café Razorpay instance ───────────────────────────────────────────────
// Call this with the encrypted strings from the Cafe document.
// Throws if keys are missing or decryption fails.
const razorpayForCafe = (encryptedKeyId, encryptedKeySecret) => {
  if (!encryptedKeyId || !encryptedKeySecret) {
    throw new Error("This café has not configured its Razorpay keys yet.");
  }
  return new Razorpay({
    key_id:     decrypt(encryptedKeyId),
    key_secret: decrypt(encryptedKeySecret),
  });
};

// ── Platform-level instance (for subscriptions, NOT for customer orders) ────
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = { razorpay, razorpayForCafe, encrypt, decrypt };