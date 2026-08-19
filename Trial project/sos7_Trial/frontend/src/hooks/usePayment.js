import { useCallback, useRef } from "react";
import API from "../api/api";

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const usePayment = () => {
  // 🔥 FIX #2: Prevent duplicate payment submissions
  const paymentInProgressRef = useRef(false);

  // Runs the whole online-payment flow and resolves with the confirmed
  // order once Razorpay Checkout succeeds and our backend verifies it.
  const payAndPlaceOrder = useCallback(
    async ({ cart, tableNumber, cafeId, sessionId, cafeName, themeColor }) => {
      // 🔥 FIX #2: Block duplicate submissions
      if (paymentInProgressRef.current) {
        throw new Error("Payment already in progress");
      }

      paymentInProgressRef.current = true;

      try {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error("Could not load the payment gateway. Check your connection and try again.");
        }

        const { data } = await API.post("/payments/create-order", {
          items: cart,
          tableNumber,
          sessionId,
          cafeId,
        });

        // 🔥 FIX #10: Remove sensitive logging in production
        // if (process.env.NODE_ENV === 'development') {
        //   console.log("Razorpay Order ID:", data.razorpayOrderId);
        // }

        return new Promise((resolve, reject) => {
          const razorpayCheckout = new window.Razorpay({
            key: data.keyId,
            amount: data.amount,
            currency: data.currency,
            order_id: data.razorpayOrderId,
            name: cafeName || "Order Payment",
            description: `Table ${tableNumber}`,
            theme: { color: themeColor || "#14532d" },
            // config: {
            //   display: {
            //     blocks: {
            //       upi: {
            //         name: "Pay via UPI",
            //         instruments: [{ method: "upi" }],
            //       },
            //     },
            //     sequence: ["block.upi"],
            //     preferences: { show_default_blocks: false },
            //   },
            // },
            handler: async (response) => {
              try {
                const verifyRes = await API.post("/payments/verify", {
                  internalOrderId: data.internalOrderId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });
                resolve(verifyRes.data.order);
              } catch (err) {
                reject(new Error("Payment succeeded but confirmation failed. Contact the cafe with your payment ID.",err));
              } finally {
                paymentInProgressRef.current = false;
              }
            },
            modal: {
              ondismiss: () => {
                paymentInProgressRef.current = false;
                reject(new Error("Payment cancelled"));
              },
            },
          });

          // 🔥 FIX #5: Track payment failures
          razorpayCheckout.on("payment.failed", async (response) => {
            paymentInProgressRef.current = false;

            // Log failure to backend for analytics
            try {
              await API.post("/payments/mark-failed", {
                internalOrderId: data.internalOrderId,
                razorpayOrderId: data.razorpayOrderId,
                errorCode: response.error?.code,
                errorDescription: response.error?.description,
              });
            } catch (err) {
              console.error("Failed to log payment failure:", err);
            }

            reject(new Error("Payment failed. Please try again."));
          });

          razorpayCheckout.open();
        });
      } catch (err) {
        paymentInProgressRef.current = false;
        throw err;
      }
    },
    []
  );

  return { payAndPlaceOrder };
};

export default usePayment;
