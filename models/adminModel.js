const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminschema = new mongoose.Schema({
  name: { type: String, default: "admin" },
  email: { type: String, required: true },
  phone: { type: String, required: false },
  password: { type: String, required: true },
});

// adminschema.pre("save", async () => {
//   if (this.password) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
// });

const Admin = mongoose.model("Admin", adminschema);
module.exports = Admin;
