const Razorpay = require("razorpay");
const crypto = require("crypto");
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

module.exports = {
  createOrder: async (amount) => {
    try {
      const options = {
        amount: amount * 100,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      };
      const order = await razorpay.orders.create(options);
      return { order, key: RAZORPAY_KEY_ID };
    } catch (err) {
      console.log(err);
      return { order: null, key: null };
    }
  },
  verifyPayment: async (paymentData) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        paymentData;
      const secret = RAZORPAY_KEY_SECRET;
      const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
      if (generatedSignature === razorpay_signature) return true;
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
};
