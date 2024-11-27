const nodemailer = require("nodemailer");
const { EMAIL_ID, PASSCODE } = process.env;

module.exports = {
  generateOTP: () => {
    return Math.floor(1000 + Math.random() * 9000);
  },
  sendOTP: async (email, otpval) => {
    try {
      const config = {
        service: "gmail",
        auth: {
          user: EMAIL_ID,
          pass: PASSCODE,
        },
      };
      const transporter = nodemailer.createTransport(config);
      const message = "Enter this OTP for verification:";
      const mail = {
        from: EMAIL_ID,
        to: email,
        subject: "OTP verification",
        html: `<p>${message}</p> <p style="color: tomato; font-size: 25px; letter-spacing: 2px;"><b>${otpval}</b></p><p>This Code <b>expires in <b>60 seconds</b>.</p></p>`,
      };

      await transporter.sendMail(mail);
      console.log(`otp ${otpval} is send to user email`);
    } catch (error) {
      console.log(error);
    }
  },
};
