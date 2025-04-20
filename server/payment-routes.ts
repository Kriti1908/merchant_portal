import { Express } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: "rzp_test_ciCYcw2lcazrdl",
  key_secret: "gFELJkNKRsIYo7iH7z890Dfq",
});

export function setupPaymentRoutes(app: Express) {
  // Create new order
  app.post("/api/create-order", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { amount, currency, receipt, notes } = req.body;

      const options = {
        amount: Math.round(parseFloat(amount) * 100), // Amount in paise
        currency: currency || "INR",
        receipt,
        notes: {
          ...notes,
          userId: req.user._id,
        },
      };

      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ 
        message: "Failed to create order",
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Verify payment signature
  app.post("/api/verify-payment", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      // Create signature verification data
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      
      // Create an HMAC SHA256 hash
      const expectedSignature = crypto
        .createHmac("sha256", razorpay.key_secret)
        .update(body)
        .digest("hex");
      
      // Compare signatures
      const isAuthentic = expectedSignature === razorpay_signature;
      
      if (isAuthentic) {
        // Payment verification successful
        // You can store payment details in your database here if needed
        res.json({ status: "ok" });
      } else {
        // Payment verification failed
        res.status(400).json({ status: "verification_failed" });
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Error verifying payment",
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Get payment details (optional)
  app.get("/api/payment/:paymentId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { paymentId } = req.params;
      const payment = await razorpay.payments.fetch(paymentId);
      res.json(payment);
    } catch (error) {
      console.error("Error fetching payment:", error);
      res.status(500).json({ 
        message: "Failed to fetch payment details",
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
}