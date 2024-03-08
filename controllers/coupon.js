let Coupon = require('../models/coupon')

module.exports = {
  getCoupon:async(req,res)=>{
    try{
      let coupon = await Coupon.findOne({})
      res.render('admin/coupon')
    }catch{
      console.log('catch in getCoupon of coupon.js')
      res.json({message:'some king of server error'})
    }
    
  }
}