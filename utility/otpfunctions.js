const OTP = require('../models/otp')
const nodemailer = require('nodemailer');

module.exports = {
  generateOTP:()=>{
    return Math.floor(1000+Math.random()*9000);
  },
  sendOTP :async(req,res,email,otpval)=>{
    let config = {
      service: 'gmail',
      auth:{
        user:'hishamnarakkal@gmail.com',
        pass:'qeem tafp nslt mxwx'
      }
    }
    const duration = 60 * 1000;
    
    const createdAt = Date.now();
    const expiresAt = createdAt + duration;

    const newOTP = new OTP({
        Email: email,
        otp: otpval,
        createdAt: createdAt,
        expiresAt: expiresAt
    });
    const createdOTPRecord = await newOTP.save();
    let transporter = nodemailer.createTransport(config);
    let message = 'Enter this OTP for verification:'
    let mail ={
      from :'hishamnarakkal@gmail.com',
      to:email,
      subject:'OTP verification',
      html:`<p>${message}</p> <p style="color: tomato; font-size: 25px; letter-spacing: 2px;"><b>${otpval}</b></p><p>This Code <b>expires in <b>${duration / 1000} seconds</b>.</p></p>`
    }
   
    transporter.sendMail(mail).then(()=>{
      console.log('otp has been send')
    }).catch((error)=>{
      console.log('otp was not send')
      res.redirect('/user/signup')
    })
  },
  // resendOTP:(req,res)=>{
  //   let config = {
  //     service: 'gmail',
  //     auth:{
  //       user:'hishamnarakkal@gmail.com',
  //       pass:'qeem tafp nslt mxwx'
  //     }
  //   }
  //   let a;
  //   let otp = async(max)=>{
  //     a =  Math.floor(Math.random() * max)
  //   };
   
  //   otp(10000);
  //   let transporter = nodemailer.createTransport(config);
  
  //   let message ={
  //     from :'hishamnarakkal@gmail.com',
  //     to:'hishamnarakkal@gmail.com',
  //     subject:'OTP verification',
  //     html:`<p>helloworld  ${a}</p>`
  //   }
  //   console.log(a);
  //   req.session.otp = a;
  //   transporter.sendMail(message).then(()=>{
  //     return res.status(201).json({
  //       msg:'you should receive an email'
  //     })
  //   }).catch((error)=>{
  //     return res.status(500).json({error})
  //   })
  // }
}

