const User = require("../models/users");

const Products = require('../models/product')
// const Coupon = require('../models/coupon')
const Cart = require('../models/cart')

module.exports = {
  addToCart:async(req,res)=>{
    let cart;
    let id = req.params.id
    let email = req.session.user.username;
    let user = await User.findOne({email:email});
    let pd = await Products.findById(id)
    cart = await Cart.findOne({userId:user._id})
    if(cart===null){
      cart = await Cart.create({
        userId:user._id,
        items:[{productId:id,quantity:1}]
      })
    }else{
      const exist = cart.items.find(a=>a.productId.toString() === id)
    
      if(exist){
        exist.quantity +=1;
      }else{
        cart.items.push({productId:id,quantity:1})
      }
      await cart.save()
    } 
  },
  getCart:async(req,res)=>{
    let email = req.session.user.username
    let user = await User.findOne({email:email})
    let cart = await Cart.findOne({userId:user._id}).populate('items.productId')
    if(cart.items.length){
      //let pd=[],q=0;
      let q =0;
      let items = cart.items
      items.forEach((item)=>{
        // pd.push(item.productId)
        q+=item.quantity
      })
      // let pdt = await Products.find({
      //   _id:{$in:pd}
      // })
      res.render('user/cart',{items,q})
    }else{
      res.render('user/cart',{message:'your cart is empty'}) 
    }
    
  },
  deleteFromCart:async(req,res)=>{
    console.log('hello world')
    let id = req.params.id;
    console.log(id)
    let cart =await Cart.findOne({
      items:{$elemMatch:{_id:id}}
    })
    console.log(cart.items)
    let pdIndex = cart.items.findIndex(a => a._id.toString()=== id)

    cart.items.splice(pdIndex,1);
    await cart.save()
    res.redirect('/user/cart')
  },
  changeQuantity:async(req,res)=>{
    let id = req.params.id;
    let cart = await Cart.findOne({
      items:{$elemMatch:{_id:id}}
    })
    let pdIndex = cart.items.findIndex(a => a._id.toString()=== id)
    console.log('extreme-ownership')
    cart.items[pdIndex].quantity++;
    await cart.save();
    let q = cart.items[pdIndex].quantity
    res.send({response:q})
  }
}