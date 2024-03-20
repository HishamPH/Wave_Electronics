const User = require("../models/users");

module.exports = {
  wishlist:async(req,res)=>{
    try{
      let id = req.params.id;
      let email = req.session.user.username;
      let user = await User.findOne({email:email}).populate('Wishlist.product');   
      let index = user.Wishlist.findIndex((a)=>a.product._id.toString() === id);
      let status = true;
      if(index == -1){
        const uuser =await User.updateOne({_id:user._id},{
          $addToSet:{Wishlist:{product:id}}
        });
      }
      else{
        user.Wishlist.splice(index, 1);
        console.log('this is the else printing')
        status = false;
        await user.save()
      }
      res.json({status})
    }catch(e){
      console.error(e)
    }
  },
  getWishlist:async(req,res)=>{
    try{
      let email = req.session.user.username;
      let user = await User.findOne({email:email}).populate('Wishlist.product');
      let wish = user.Wishlist.reverse();
      let q = req.session.cartCount
      if(wish)
        res.render('user/wishlist',{wish,q})
      else 
        res.render('user/wishlist',{wish:false,q})
    }catch(e){
      console.error(e);
      console.log('catch in wishlist 40')
    }
  },
  deleteWishlist:async(req,res)=>{
    try{
      let email = req.session.user.username;
      let user = await User.findOne({email:email});
      let id = req.params.id;
      let index = user.Wishlist.findIndex(a=>a._id.toString()===id);
      user.Wishlist.splice(index,1);
      await user.save();

      res.redirect('/user/wishlist')
    }catch(e){
      console.error(e)
      res.redirect('/user/wihslist')
      console.log('this is the catch inside wishlist 55')
    }
  }
}