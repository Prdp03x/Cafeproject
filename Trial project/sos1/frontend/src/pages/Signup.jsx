import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineOfficeBuilding,
  HiOutlineIdentification,
  HiOutlineChevronLeft,
} from "react-icons/hi";
import { signup } from "../api/api";
import useAuth from "../hooks/useAuth";

// ─── Reusable field wrapper ───────────────────────────────────────────────────
const Field = ({ label, hint, children }) => (
  <div className="flex flex-col space-y-2">
    <label className="text-sm font-medium text-slate-700">{label}</label>
    {children}
    {hint && <p className="text-xs leading-5 text-slate-500">{hint}</p>}
  </div>
);

// ─── Input with optional left icon and right slot ────────────────────────────
const InputRow = ({ icon: Icon, rightSlot, ...props }) => (
  <div className="flex items-center rounded-[16px] border border-stone-200 bg-white px-4 py-3.5 focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-900/5 transition">
    {Icon && <Icon className="text-slate-400 mr-3 shrink-0" size={18} />}
    <input
      className="bg-transparent outline-none w-full text-sm text-slate-800 placeholder-slate-400"
      {...props}
    />
    {rightSlot}
  </div>
);

// ─── Step indicator ───────────────────────────────────────────────────────────
const StepDots = ({ current, total }) => (
  <div className="flex items-center gap-1.5">
    {[...Array(total)].map((_, i) => (
      <div
        key={i}
        className={`h-1.5 rounded-full transition-all duration-300 ${
          i < current
            ? "w-4 bg-slate-950"
            : i === current
              ? "w-6 bg-slate-950"
              : "w-1.5 bg-stone-300"
        }`}
      />
    ))}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState(0); // 0 = account, 1 = cafe details
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    // Step 1 — account
    email: "",
    password: "",
    confirmPassword: "",
    // Step 2 — cafe
    name: "", // cafe/brand name
    ownerName: "",
    phone: "",
    category: "Cafe",
    logo: "",
    legalBusinessName: "",
    billingEmail: "",
    gstNumber: "",
    fssaiNumber: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    totalTables: "",
    secretQuestion: "",
    secretAnswer: "",
  });

  useEffect(() => {
    document.title = "Create Account | NexOp";
  }, []);

  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── Step 0 validation ──
  const validateStep0 = () => {
    if (!form.email || !form.password || !form.confirmPassword) {
      return "All fields are required";
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email)) return "Enter a valid email address";
    if (form.password.length < 6)
      return "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    return null;
  };

  // ── Step 1 validation ──
  const validateStep1 = () => {
    if (!form.name || !form.ownerName || !form.phone) {
      return "Cafe name, owner name, and phone are required";
    }
    const phonePattern = /^[0-9+\-() ]{7,20}$/;
    if (!phonePattern.test(form.phone)) return "Phone number is invalid";
    if (!form.secretQuestion) return "Please select a security question";
    if (!form.secretAnswer.trim()) return "Please enter your security answer";
    return null;
  };

  const handleNext = () => {
    const err = validateStep0();
    if (err) return setError(err);
    setError("");
    setStep(1);
  };

  const handleSignup = async () => {
    const err = validateStep1();
    if (err) return setError(err);

    try {
      setLoading(true);
      setError("");

      // Build payload — only send filled optional fields
      const payload = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        name: form.name.trim(),
        ownerName: form.ownerName.trim(),
        phone: form.phone.trim(),
        category: form.category.trim() || "Cafe",
        ...(form.logo && { logo: form.logo.trim() }),
        ...(form.legalBusinessName && {
          legalBusinessName: form.legalBusinessName.trim(),
        }),
        ...(form.billingEmail && {
          billingEmail: form.billingEmail.trim().toLowerCase(),
        }),
        ...(form.gstNumber && {
          gstNumber: form.gstNumber.trim().toUpperCase(),
        }),
        ...(form.fssaiNumber && { fssaiNumber: form.fssaiNumber.trim() }),
        ...(form.address && { address: form.address.trim() }),
        ...(form.city && { city: form.city.trim() }),
        ...(form.state && { state: form.state.trim() }),
        ...(form.postalCode && { postalCode: form.postalCode.trim() }),
        country: form.country.trim() || "India",
        ...(form.totalTables && { totalTables: Number(form.totalTables) }),
        secretQuestion: form.secretQuestion,
        secretAnswer: form.secretAnswer,
      };

      const res = await signup(payload);
      login(res.data.token, res.data.cafe);
      navigate("/dashboard");
    } catch (err) {
      const message = err.response?.data?.error;
      if (message === "Email already exists") {
        setError("An account with this email already exists.");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(message || "Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between bg-slate-950 p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-[55%] bg-gradient-to-t from-slate-950 to-transparent" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-[10px] bg-white/10 flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">
              NexOp
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <p className="text-3xl font-semibold text-white leading-snug tracking-tight">
            {step === 0 ? (
              <>
                Start your
                <br />
                cafe journey.
              </>
            ) : (
              <>
                Tell us about
                <br />
                your cafe.
              </>
            )}
          </p>
          <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
            {step === 0
              ? "Create your account in seconds. Your cafe dashboard awaits."
              : "Add your business details. You can always update these later in Settings."}
          </p>

          <div className="rounded-[20px] bg-white/5 border border-white/10 p-5 space-y-3">
            {[
              "Menu & orders",
              "Billing & invoices",
              "Table management",
              "Business analytics",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-sm text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center justify-center mb-10">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-sm">
                <span className="font-semibold text-sm tracking-wide">N</span>
              </div>

              <div>
                <h1 className="text-[22px] leading-none font-semibold tracking-tight text-slate-950">
                  NexOp
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Business operations simplified
                </p>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setStep(0);
                    setError("");
                  }}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition"
                >
                  <HiOutlineChevronLeft size={16} />
                  Back
                </button>
              ) : (
                <div />
              )}
              <StepDots current={step} total={2} />
            </div>

            <h1 className="text-2xl font-semibold text-slate-950 tracking-tight">
              {step === 0 ? "Create your account" : "Set up your workspace"}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              {step === 0
                ? "Step 1 of 2 — Account credentials"
                : "Step 2 of 2 — Cafe details"}
            </p>
          </div>

          {/* ── STEP 0: Account ── */}
          {step === 0 && (
            <div className="space-y-4">
              <Field label="Email address">
                <InputRow
                  icon={HiOutlineMail}
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </Field>

              <Field label="Password">
                <InputRow
                  icon={HiOutlineLockClosed}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="ml-2 text-slate-400 hover:text-slate-600 transition shrink-0"
                    >
                      {showPassword ? (
                        <HiOutlineEyeOff size={18} />
                      ) : (
                        <HiOutlineEye size={18} />
                      )}
                    </button>
                  }
                />
              </Field>

              <Field label="Confirm password">
                <InputRow
                  icon={HiOutlineLockClosed}
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="ml-2 text-slate-400 hover:text-slate-600 transition shrink-0"
                    >
                      {showConfirm ? (
                        <HiOutlineEyeOff size={18} />
                      ) : (
                        <HiOutlineEye size={18} />
                      )}
                    </button>
                  }
                />
              </Field>

              {error && (
                <div className="rounded-[14px] bg-red-50 border border-red-100 px-4 py-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-slate-950 text-white py-3.5 rounded-[16px] text-sm font-semibold hover:bg-slate-800 active:scale-[0.98] transition"
              >
                Continue
              </button>

              <p className="text-center text-sm text-slate-500">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-slate-900 font-semibold hover:underline"
                >
                  Sign in
                </button>
              </p>
            </div>
          )}

          {/* ── STEP 1: Cafe details ── */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Basic info */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Cafe / Brand name *">
                    <InputRow
                      icon={HiOutlineOfficeBuilding}
                      type="text"
                      name="name"
                      placeholder="The Roastery"
                      value={form.name}
                      onChange={handleChange}
                    />
                  </Field>

                  <Field label="Owner name *">
                    <InputRow
                      icon={HiOutlineUser}
                      type="text"
                      name="ownerName"
                      placeholder="Your name"
                      value={form.ownerName}
                      onChange={handleChange}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Phone *">
                    <InputRow
                      icon={HiOutlinePhone}
                      type="text"
                      name="phone"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </Field>

                  <Field label="Category">
                    <InputRow
                      type="text"
                      name="category"
                      placeholder="Cafe, Restaurant…"
                      value={form.category}
                      onChange={handleChange}
                    />
                  </Field>
                </div>

                <Field
                  label="Logo URL"
                  hint="Paste a direct image link. You can update this later."
                >
                  <InputRow
                    type="text"
                    name="logo"
                    placeholder="https://your-logo-url.com/logo.png"
                    value={form.logo}
                    onChange={handleChange}
                  />
                </Field>
              </div>

              {/* Security question */}
              <div className="rounded-[20px] border border-stone-200 bg-white overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-100">
                  <p className="text-sm font-semibold text-slate-900">
                    Security Question
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Used to verify your identity if you forget your password.
                  </p>
                </div>
                <div className="p-5 space-y-4">
                  <Field label="Select a question *">
                    <div className="flex items-center rounded-[16px] border border-stone-200 bg-white px-4 py-3.5 focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-900/5 transition">
                      <select
                        name="secretQuestion"
                        value={form.secretQuestion}
                        onChange={handleChange}
                        className="bg-transparent outline-none w-full text-sm text-slate-800"
                      >
                        <option value="">— Choose a question —</option>
                        <option>What was the name of your first pet?</option>
                        <option>What is your mother's maiden name?</option>
                        <option>What was the name of your first school?</option>
                        <option>What city were you born in?</option>
                        <option>What is your oldest sibling's name?</option>
                        <option>What was the make of your first car?</option>
                        <option>What is your favourite childhood movie?</option>
                      </select>
                    </div>
                  </Field>
                  <Field
                    label="Your answer *"
                    hint="Answer is case-insensitive. Remember this — it unlocks password reset."
                  >
                    <InputRow
                      type="text"
                      name="secretAnswer"
                      placeholder="Your answer"
                      value={form.secretAnswer}
                      onChange={handleChange}
                    />
                  </Field>
                </div>
              </div>

              {/* Billing / Legal — collapsible section */}
              <div className="rounded-[20px] border border-stone-200 bg-white overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-100">
                  <p className="text-sm font-semibold text-slate-900">
                    Billing & Legal
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Optional — complete later in Settings → Business
                  </p>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Legal business name">
                      <InputRow
                        type="text"
                        name="legalBusinessName"
                        placeholder="Registered name"
                        value={form.legalBusinessName}
                        onChange={handleChange}
                      />
                    </Field>

                    <Field label="Billing email">
                      <InputRow
                        icon={HiOutlineMail}
                        type="email"
                        name="billingEmail"
                        placeholder="billing@cafe.com"
                        value={form.billingEmail}
                        onChange={handleChange}
                      />
                    </Field>

                    <Field label="GST number" hint="15-character GSTIN">
                      <InputRow
                        icon={HiOutlineIdentification}
                        type="text"
                        name="gstNumber"
                        placeholder="22AAAAA0000A1Z5"
                        value={form.gstNumber}
                        onChange={handleChange}
                      />
                    </Field>

                    <Field label="FSSAI license">
                      <InputRow
                        type="text"
                        name="fssaiNumber"
                        placeholder="10012345678901"
                        value={form.fssaiNumber}
                        onChange={handleChange}
                      />
                    </Field>
                  </div>

                  <Field label="Address">
                    <div className="rounded-[16px] border border-stone-200 bg-white px-4 py-3.5 focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-900/5 transition">
                      <div className="flex gap-3">
                        <HiOutlineLocationMarker
                          className="text-slate-400 shrink-0 mt-0.5"
                          size={18}
                        />
                        <textarea
                          name="address"
                          placeholder="Street address, area, landmark"
                          value={form.address}
                          onChange={handleChange}
                          rows={2}
                          className="bg-transparent outline-none w-full text-sm text-slate-800 placeholder-slate-400 resize-none"
                        />
                      </div>
                    </div>
                  </Field>

                  <div className="grid grid-cols-3 gap-4">
                    <Field label="City">
                      <InputRow
                        type="text"
                        name="city"
                        placeholder="City"
                        value={form.city}
                        onChange={handleChange}
                      />
                    </Field>
                    <Field label="State">
                      <InputRow
                        type="text"
                        name="state"
                        placeholder="State"
                        value={form.state}
                        onChange={handleChange}
                      />
                    </Field>
                    <Field label="Postal code">
                      <InputRow
                        type="text"
                        name="postalCode"
                        placeholder="380001"
                        value={form.postalCode}
                        onChange={handleChange}
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Country">
                      <InputRow
                        type="text"
                        name="country"
                        placeholder="India"
                        value={form.country}
                        onChange={handleChange}
                      />
                    </Field>
                    <Field label="Total tables">
                      <InputRow
                        type="number"
                        name="totalTables"
                        placeholder="10"
                        value={form.totalTables}
                        onChange={handleChange}
                      />
                    </Field>
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-[14px] bg-red-50 border border-red-100 px-4 py-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleSignup}
                disabled={loading}
                className="w-full bg-slate-950 text-white py-3.5 rounded-[16px] text-sm font-semibold hover:bg-slate-800 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Creating your cafe..." : "Create workspace"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
