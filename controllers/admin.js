const User = require('../models/users')

module.exports = {
  getUser:async(req,res)=>{
    const user = await User.find()
    res.render('admin/users',{user});
  },

  blockUser:async(req,res)=>{
    let id = req.params.id;
    await User.findByIdAndUpdate({_id:id},{status:true});
    res.redirect('/admin/users');
  }
}