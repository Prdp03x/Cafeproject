# Razorpay Route integration — what's done, what you need to do

## What the code does

**Customer side (Menu → Cart):**
1. Customer taps "Pay & Place Order".
2. Backend recalculates the total server-side, creates a Razorpay Order with a
   `transfers` split — the café's share goes to their linked account, your
   commission stays with your main account.
3. Razorpay Checkout opens in the browser (UPI/cards/wallets).
4. On success, the signature is verified server-side (`/api/payments/verify`)
   before the order is marked "pending" and pushed to the kitchen queue over
   socket.io. Nothing reaches the kitchen until payment is confirmed.
5. A webhook (`/api/payments/webhook`) is a safety net in case the browser
   closes right after paying, before step 4 finishes.

**Café side (Dashboard → Settings → Payments):**
- A new "Payments" tab lets the café owner submit bank account details.
- This creates a Razorpay **Linked Account** for that café and stores its
  `accountId` — this is what receives the split via Route.
- Status shows as "Pending review" until Razorpay approves it, then "Active".

## What you need to do on the Razorpay side (not code)

1. **Enable Route** on your main Razorpay account — this is a feature Razorpay
   turns on for you, usually via a request from your Dashboard or their
   support team. Route isn't self-serve by default.
2. **KYC review**: every café's Linked Account goes through Razorpay's review
   before it can receive transfers. This can take a few business days, and
   they may request documents beyond what's in this onboarding form (business
   proof, address proof, etc.) — some may need to be submitted via the
   Razorpay Dashboard rather than the API.
3. Decide your **commission split** — right now it defaults to 5% per café
   (`cafe.razorpay.commissionPercent`), stored per café in case you want
   different rates for different clients.
4. Set environment variables in `backend/.env`:
   ```
   RAZORPAY_KEY_ID=
   RAZORPAY_KEY_SECRET=
   RAZORPAY_WEBHOOK_SECRET=
   ```
   Get the webhook secret when you configure the webhook URL
   (`https://yourdomain.com/api/payments/webhook`) in the Razorpay Dashboard,
   subscribed to the `payment.captured` event.
5. Run `npm install` in `backend/` — added `razorpay` and `axios` to
   `package.json`.

## Testing before going live

Use Razorpay's **test mode** keys first — test card/UPI details are in their
docs. You'll still need at least one Linked Account created (test mode has
its own simplified activation) to test the full transfer split end-to-end.

## Notes / things worth knowing

- Full bank account numbers are never stored in your database — only the
  last 4 digits, for display.
- Business type is now a dropdown on the Payments tab (individual,
  proprietorship, partnership, private/public limited, LLP, trust, society,
  NGO) instead of a hardcoded value — each café picks their own.
- Orders now only get created after payment is verified (`status:
  "awaiting_payment"` → `"pending"`), so the old direct `POST /api/orders`
  endpoint was removed — everything goes through `/api/payments/*`.
