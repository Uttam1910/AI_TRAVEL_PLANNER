// services/routes/paymentRoutes.js
const express = require("express");
const router = express.Router();

// Dummy Payment Endpoint: Simulates a payment process using the bookingId from the URL
router.post("/:bookingId", (req, res) => {
  const { bookingId } = req.params;
  const { amount, cardNumber, expiry, cvv } = req.body;

  // Validate required payment details
  if (!bookingId || !amount || !cardNumber || !expiry || !cvv) {
    return res.status(400).json({ error: "Missing payment details." });
  }

  // Check a dummy card number for testing
  if (cardNumber !== "4111111111111111") {
    return res.status(400).json({ error: "Invalid card number for test payment." });
  }

  // Simulate payment processing delay (1 second)
  setTimeout(() => {
    res.status(200).json({
      message: "Payment processed successfully",
      transactionId: "dummy-" + bookingId,
      amount,
    });
  }, 1000);
});

console.log("Payment routes loaded."); // This log confirms that the file is loaded

module.exports = router;
