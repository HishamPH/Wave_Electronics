const User = require("../models/users");

const Products = require('../models/product')
// const Coupon = require('../models/coupon')
const Cart = require('../models/cart')

module.exports = {
  addToCart:async(req,res)=>{
    try{
      let cart;
      let id = req.params.id
      let email = req.session.user.username;
      let user = await User.findOne({email:email});
      let pd = await Products.findById(id)
      cart = await Cart.findOne({userId:user._id})
      let x = pd.stock;
      if(cart===null&&pd.stock>0){
        cart = await Cart.create({
          userId:user._id,
          items:[{productId:id,quantity:1,price:pd.Price}],
          total:1
        })
      }else if(pd.stock>0){
        const exist = cart.items.find(a=>a.productId.toString() === id)
      
        if(exist){
          if(exist.quantity<2&&((pd.stock - (exist.quantity+1))>=0))
            exist.quantity ++;
        }else{
          cart.items.push({productId:id,quantity:1,price:pd.Price})
          cart.total++;
        }
        await cart.save()
      }
      req.session.cartCount = cart.total 
      res.json({count:cart.total})
    }catch{
      res.json({msg:'There are no more stock left'})
    }
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
      let totalPrice =0,discount = 0;
      cart.items.forEach((item,index)=>{
        totalPrice += Number(item.productId.Price)*Number(item.quantity)
        discount += Number(item.productId.discount)*Number(item.quantity)
      });
      res.render('user/cart',{items,msg:false,totalPrice,total:cart.total,discount})
    }else{
      res.render('user/cart',{msg:'your cart is empty'}) 
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
    try{
      let id = req.params.id
      const { action,value } = req.body;
      let cart = await Cart.findOne({
          items:{$elemMatch:{_id:id}}
      }).populate('items.productId')
      let pdIndex = cart.items.findIndex(a => a._id.toString()=== id)
      let msg = false;
      cartQuantity = value;
      if (action === 'increment'&&cart.items[pdIndex].quantity<2) {
        if((cart.items[pdIndex].productId.stock - (cart.items[pdIndex].quantity+1))>=0)
          cart.items[pdIndex].quantity++;
        else
          msg = true;
        await cart.save();
      } else if (action === 'decrement' && cartQuantity > 1) {
        cart.items[pdIndex].quantity--;
        await cart.save();
      }
      let price = cart.items[pdIndex].productId.Price;
      let totalPrice =0,discount=0;
      cart.items.forEach((item,index)=>{
        totalPrice += Number(item.productId.Price)*Number(item.quantity)
        discount += Number(item.productId.discount)*Number(item.quantity)
      });
      res.json({ quantity:cart.items[pdIndex].quantity,count:cart.total,price,totalPrice,discount,msg});
    }catch(e){
      console.error(e)
      console.log('this is the catch block in changeQuantity in cart.js')
    }
    
  },
  getCheckout:async(req,res)=>{
    let email = req.session.user.username;
    let user = await User.findOne({email:email});
    let cart = await Cart.findOne({userId:user._id}).populate('items.productId');
    let adIndex = user.Address.findIndex(item => item.main === true);
    let address = user.Address[adIndex]??null;
    let items = cart.items;
    cart.total = cart.items.length;
    req.session.cartQuantity = cart.total;
    await cart.save()
    let totalPrice =0,discount = 0;
    cart.items.forEach((item)=>{
      totalPrice += Number(item.productId.Price)*Number(item.quantity)
      discount += Number(item.productId.discount)*Number(item.quantity)
    });
    req.session.checkout = true;
    console.log(req.session)
    console.log(cart._id)
  
    res.render('user/checkout',{cart,items,totalPrice,total:cart.total,discount,address})
  },

  changeAddress:async (req,res)=>{
    let user = await User.findOne({email:req.session.user.username})
    let id = req.params.id;
    console.log(req.body.main)
    const addressIndex = user.Address.findIndex((a) => a._id.toString() === id);
    user.Address[addressIndex].main = true;
    user.Address.forEach((item,index)=>{
      if(index!==addressIndex){
        item.main = false;
      }
    })
    await user.save()
    res.redirect('/user/checkout')
  }
}