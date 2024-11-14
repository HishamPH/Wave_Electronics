const OTP = require("../models/otpModel");
const nodemailer = require("nodemailer");

require("dotenv").config();

const { EMAIL_ID, PASSCODE } = process.env;

module.exports = {
  generateOTP: () => {
    return Math.floor(1000 + Math.random() * 9000);
  },
  sendOTP: async (req, res, email, otpval) => {
    let config = {
      service: "gmail",
      auth: {
        user: EMAIL_ID,
        pass: PASSCODE,
      },
    };
    const duration = 60 * 1000;

    const createdAt = Date.now();
    const expiresAt = createdAt + duration;

    const newOTP = new OTP({
      Email: email,
      otp: otpval,
      createdAt: createdAt,
      expiresAt: expiresAt,
    });
    const createdOTPRecord = await newOTP.save();
    let transporter = nodemailer.createTransport(config);
    let message = "Enter this OTP for verification:";
    let mail = {
      from: EMAIL_ID,
      to: email,
      subject: "OTP verification",
      html: `<p>${message}</p> <p style="color: tomato; font-size: 25px; letter-spacing: 2px;"><b>${otpval}</b></p><p>This Code <b>expires in <b>${
        duration / 1000
      } seconds</b>.</p></p>`,
    };

    transporter
      .sendMail(mail)
      .then(() => {
        console.log("otp has been send");
      })
      .catch((error) => {
        console.log("otp was not send");
        res.redirect("/user/signup");
      });
  },
};
