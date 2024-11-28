const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userschema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  status: { type: Boolean, default: true },
  Address: [
    {
      name: { type: String },
      street: { type: String },
      city: { type: String },
      pincode: { type: Number },
      state: { type: String },
      mobile: { type: Number },
      main: { type: Boolean, default: false },
    },
  ],
  Wishlist: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
        required: true,
      },
      color: { type: String, required: true },
      storage: { type: String, default: null },
      image: { type: String, required: true },
    },
  ],
});

// userschema.pre("save", async () => {
//   if (this.password) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
// });

const User = mongoose.model("User", userschema);
module.exports = User;
