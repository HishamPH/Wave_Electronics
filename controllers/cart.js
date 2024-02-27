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
        items:[{productId:id,quantity:1}],
        total:1
      })
    }else{
      const exist = cart.items.find(a=>a.productId.toString() === id)
    
      if(exist){
        exist.quantity +=1;
      }else{
        cart.items.push({productId:id,quantity:1})
        cart.total++;
      }
      await cart.save()
    }
    req.session.cartCount = cart.total 
    res.redirect('/user/homepage')
    
    
  },
  getCart:async(req,res)=>{
    let email = req.session.user.username
    let user = await User.findOne({email:email})
    let cart = await Cart.findOne({userId:user._id}).populate('items.productId')

    if(cart&&cart.items.length){
      let items = cart.items
      cart.total = cart.items.length;
      req.session.cartQuantity = cart.total;
      console.log(cart.total)
      await cart.save()
      res.render('user/cart',{items})
    }else{
      res.render('user/cart',{message:'your cart is empty'}) 
    }
  },
  deleteFromCart:async(req,res)=>{
    
    let id = req.params.id;
    let cart =await Cart.findOne({
      items:{$elemMatch:{_id:id}}
    })
 
    let pdIndex = cart.items.findIndex(a => a._id.toString()=== id)

    cart.items.splice(pdIndex,1);
    cart.total--;
    await cart.save()
    req.session.cartCount = cart.total
    res.redirect('/user/cart')
  },
  changeQuantity:async(req,res)=>{
    let id = req.params.id
    const { action,value } = req.body;
    console.log(req.body)
    let cart = await Cart.findOne({
        items:{$elemMatch:{_id:id}}
    })
    let pdIndex = cart.items.findIndex(a => a._id.toString()=== id)
    let cartQuantity = value;
    if (action === 'increment') {
      cart.items[pdIndex].quantity++;
      await cart.save();
        cartQuantity++;
    } else if (action === 'decrement' && cartQuantity > 1) {
      cart.items[pdIndex].quantity--;
      await cart.save();
        cartQuantity--;
    }
    res.json({ quantity: cart.items[pdIndex].quantity,count:cart.total });
  }
}