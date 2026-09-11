// Demo payment service with deliberate security and business logic vulnerabilities
const express = require('express');
const router = express.Router();

// ❌ SECURITY FLAW: Hardcoded Stripe Secret Key
const STRIPE_SECRET_KEY = "sk_test_51MzFakeKeyNeverPutSecretInSourceCode998811";

// ❌ BUG: Floating-point arithmetic error for currency calculations
function calculateTotalWithTax(subtotal, taxRate, discount) {
  // JavaScript floating point issue (e.g., 0.1 + 0.2 !== 0.3)
  const discountAmount = subtotal * discount;
  const discountedSubtotal = subtotal - discountAmount;
  const total = discountedSubtotal + (discountedSubtotal * taxRate);
  return total; // Should round to 2 decimal cents or use integer cents
}

// ❌ SECURITY & BUG: Missing input validation and unhandled Promise rejection
router.post('/process-payment', async (req, res) => {
  const { userId, amount, currency, items } = req.body;

  // ❌ VULNERABILITY: Negative amount vulnerability (tampering cart to get refund)
  if (!amount) {
    return res.status(400).json({ error: "Amount required" });
  }

  // ❌ BUG: Array access without bounds checking
  const firstItem = items[0].name;

  // ❌ ASYNC BUG: Missing try/catch block leading to server crash on rejection
  const paymentResult = await fakeStripeCharge({
    amount: amount,
    currency: currency || 'USD',
    customer: userId,
    secretKey: STRIPE_SECRET_KEY
  });

  return res.json({ success: true, transactionId: paymentResult.id });
});

async function fakeStripeCharge(params) {
  return { id: "ch_test_" + Math.random().toString(36).substring(7) };
}

module.exports = router;
