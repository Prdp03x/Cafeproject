import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  HiOutlineMail,
  HiOutlineChevronLeft,
  HiOutlineLockClosed,
} from "react-icons/hi";
import { forgotPassword, verifySecret } from "../api/api";

const STEP = { EMAIL: "email", QUESTION: "question", DONE: "done" };

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEP.EMAIL);
  const [email, setEmail] = useState("");
  const [secretQuestion, setSecretQuestion] = useState("");
  const [secretAnswer, setSecretAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Forgot Password | NexOp";
  }, []);

  // Step 1 — submit email, get secret question back
  const handleEmailSubmit = async () => {
    setError("");
    if (!email.trim()) return setError("Email address is required");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim()))
      return setError("Enter a valid email address");

    try {
      setLoading(true);
      const res = await forgotPassword({ email: email.trim().toLowerCase() });
      setSecretQuestion(res.data.secretQuestion);
      setStep(STEP.QUESTION);
    } catch (err) {
      const data = err.response?.data;

      if (data?.recoverySetupRequired) {
        setError(
          "Recovery options are not configured for this account yet. Please sign in and set them up from Security Settings.",
        );
      } else {
        setError(data?.error || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — verify secret answer, get reset token, go to reset page
  const handleAnswerSubmit = async () => {
    setError("");
    if (!secretAnswer.trim()) return setError("Please enter your answer");

    try {
      setLoading(true);
      await verifySecret({
        email: email.trim().toLowerCase(),
        secretAnswer: secretAnswer.trim(),
      });
      // Token is now delivered via email — never returned in the response
      setStep(STEP.DONE);
    } catch (err) {
      setError(
        err.response?.data?.error || "Incorrect answer. Please try again.",
      );
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

        <div className="relative z-10 space-y-4">
          <p className="text-3xl font-semibold text-white leading-snug tracking-tight">
            {step === STEP.EMAIL ? (
              <>
                Locked out?
                <br />
                No worries.
              </>
            ) : (
              <>
                Verify your
                <br />
                identity.
              </>
            )}
          </p>
          <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
            {step === STEP.EMAIL
              ? "Enter your email and we'll show your security question."
              : "Answer the question you set during signup to continue."}
          </p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
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

          <button
            type="button"
            onClick={() => {
              if (step === STEP.QUESTION) {
                setStep(STEP.EMAIL);
                setError("");
                setSecretAnswer("");
              } else {
                navigate("/login");
              }
            }}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition mb-8"
          >
            <HiOutlineChevronLeft size={16} />
            {step === STEP.QUESTION ? "Change email" : "Back to sign in"}
          </button>

          {/* ── Step 1: Email ── */}
          {step === STEP.EMAIL && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-slate-950 tracking-tight">
                  Forgot your password?
                </h1>
                <p className="mt-1.5 text-sm text-slate-500">
                  Enter your email to retrieve your security question.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email address
                  </label>
                  <div className="flex items-center rounded-[16px] border border-stone-200 bg-white px-4 py-3.5 focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-900/5 transition">
                    <HiOutlineMail
                      className="text-slate-400 mr-3 shrink-0"
                      size={18}
                    />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="bg-transparent outline-none w-full text-sm text-slate-800 placeholder-slate-400"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleEmailSubmit()
                      }
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-[14px] bg-red-50 border border-red-100 px-4 py-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleEmailSubmit}
                  disabled={loading}
                  className="w-full bg-slate-950 text-white py-3.5 rounded-[16px] text-sm font-semibold hover:bg-slate-800 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Checking..." : "Continue"}
                </button>

                <p className="text-center text-sm text-slate-500">
                  Remembered it?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-slate-900 font-semibold hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </>
          )}

          {/* ── Step 2: Secret Question ── */}
          {step === STEP.QUESTION && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-slate-950 tracking-tight">
                  Security question
                </h1>
                <p className="mt-1.5 text-sm text-slate-500">
                  Answer correctly to reset your password.
                </p>
              </div>

              <div className="space-y-4">
                {/* Show the question */}
                <div className="rounded-[16px] border border-stone-200 bg-stone-50 px-4 py-3.5">
                  <p className="text-xs text-slate-400 mb-1">
                    Your security question
                  </p>
                  <p className="text-sm font-medium text-slate-800">
                    {secretQuestion}
                  </p>
                </div>

                {/* Answer input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Your answer
                  </label>
                  <div className="flex items-center rounded-[16px] border border-stone-200 bg-white px-4 py-3.5 focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-900/5 transition">
                    <HiOutlineLockClosed
                      className="text-slate-400 mr-3 shrink-0"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Your answer"
                      className="bg-transparent outline-none w-full text-sm text-slate-800 placeholder-slate-400"
                      value={secretAnswer}
                      onChange={(e) => {
                        setSecretAnswer(e.target.value);
                        setError("");
                      }}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleAnswerSubmit()
                      }
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Answer is not case-sensitive.
                  </p>
                </div>

                {error && (
                  <div className="rounded-[14px] bg-red-50 border border-red-100 px-4 py-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAnswerSubmit}
                  disabled={loading}
                  className="w-full bg-slate-950 text-white py-3.5 rounded-[16px] text-sm font-semibold hover:bg-slate-800 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify & continue"}
                </button>
              </div>
            </>
          )}

          {/* ── Step 3: Email sent ── */}
          {step === STEP.DONE && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-slate-950 tracking-tight">
                  Check your email
                </h1>
                <p className="mt-1.5 text-sm text-slate-500">
                  We've sent a password reset link to{" "}
                  <span className="font-medium text-slate-800">{email}</span>.
                  The link expires in 1 hour.
                </p>
              </div>

              <div className="rounded-[16px] border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-slate-600 space-y-1">
                <p>• Check your spam folder if you don't see it.</p>
                <p>• The link in the email will take you directly to the reset page.</p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-6 w-full bg-slate-950 text-white py-3.5 rounded-[16px] text-sm font-semibold hover:bg-slate-800 active:scale-[0.98] transition"
              >
                Back to sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
