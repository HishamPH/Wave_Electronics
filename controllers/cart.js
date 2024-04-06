const User = require("../models/users");

const Products = require('../models/product')
// const Coupon = require('../models/coupon')
const Cart = require('../models/cart')

const Coupon = require('../models/coupon')

module.exports = {
  addToCart:async(req,res)=>{
    try{
      console.log('hello')
      let cart;
      let id = req.params.id
      let email = req.session.user.username;
      let user = await User.findOne({email:email});
      let pd = await Products.findById(id)
      cart = await Cart.findOne({userId:user._id})
      let x = pd.stock;
      let price = pd.Price - pd.discount;
      console.log(price)
      if(cart===null&&pd.stock>0){
        cart = await Cart.create({
          userId:user._id,
          items:[{productId:id,quantity:1,price:price}],
          total:1
        })
      }else if(pd.stock>0){
        const exist = cart.items.find(a=>a.productId.toString() === id)
      
        if(exist){
          if(exist.quantity<2&&((pd.stock - (exist.quantity+1))>=0))
            exist.quantity ++;
        }else{
          cart.items.push({productId:id,quantity:1,price:price})
          cart.total++;
        }
        await cart.save()
      }
      req.session.cartCount = cart.total 
      res.json({count:cart.total})
    }catch(e){
      res.json({msg:'There are no more stock left'});
      console.error(e);
    }
  },

  getCart:async(req,res)=>{
    let email = req.session.user.username??req.session.user.email
    let user = await User.findOne({email:email})
    let cart = await Cart.findOne({userId:user._id}).populate('items.productId coupon')

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
      let couponApplied = false;
      if(cart.coupon !== null)
        couponApplied = cart.coupon;
      res.render('user/cart',{items,msg:false,totalPrice,total:cart.total,discount,couponApplied})
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
      let price = cart.items[pdIndex].price;
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
    //let adIndex = user.Address.findIndex(item => item.main === true);
    let address = user.Address??null;
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
    let fullPrice = req.session.totalPrice??(totalPrice - discount);
    res.render('user/checkout',{cart,items,totalPrice,total:cart.total,discount,address,fullPrice})
  },

  addressDefault:async (req,res)=>{
    try{
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
    }catch(e){
      console.error(e)
    }

  },
  addressEdit:async(req,res)=>{
    const addressId = req.params.id;
    const email = req.session.user.username;
    const user = await User.findOne({email:email})
    const { name, street, city, pincode,state,mobile } = req.body
    const addressIndex = user.Address.findIndex((a) => a._id.toString() === addressId);
    if (addressIndex !== -1) {
        user.Address[addressIndex].name = name;
        user.Address[addressIndex].street = street;
        user.Address[addressIndex].city = city;
        user.Address[addressIndex].state = state;
        user.Address[addressIndex].pincode = pincode;
        user.Address[addressIndex].mobile = mobile;
        await user.save();
        console.log("Address updated successfully");
        res.redirect("/user/checkout");
    } else {
        console.log("Address Not Found")
        res.redirect("/user/checkout");
    }
  },
  addressDelete:async(req,res)=>{
    const email = req.session.user.username;
    const addressId = req.params.id; 
    console.log("address id is to delete", addressId)
    try {
        const user = await User.findOne({email:email});
        if (!user) {
          console.log("User not found");
          return res.redirect("/user/checkout");
        }
        const addressIndex = user.Address.findIndex(
          (a) => a._id.toString() === addressId
        );
        if (addressIndex === -1) {
            console.log("Address not found");
            return res.redirect("/user/checkout");
        }
        user.Address.splice(addressIndex, 1);
        if(user.Address.length === 1)
          user.Address[0].main = true;
        await user.save();
        console.log("Address deleted successfully");
        return res.redirect("/user/checkout");
    } catch (error) {
        console.error("Error deleting address:", error.message);
        return res.status(500).send("Internal Server Error");
    }
  },
  applyCoupon:async(req,res)=>{

    let email = req.session.user.username;
    let user = await User.findOne({email:email});
    let cart = await Cart.findOne({userId:user._id}).populate('items.productId coupon')
    let code = req.body.code;
    let price = 0;
    
    let coupon = await Coupon.findOne({code:code})
    let applied = false;
    if(coupon&&!applied){
      let discount = coupon.discount;
      cart.items.forEach((item)=>{
        price += item.quantity*(item.productId.Price - item.productId.discount);
        // item.price = Math.floor(item.price - (item.price * (discount/100)));
      });
      
      let dis = price * (discount/100);
      let fullPrice = Math.floor(price -dis)
      coupon.couponCount--;
      req.session.totalPrice = fullPrice;
      console.log(fullPrice)
      cart.coupon = coupon._id;
      await cart.save();
      await coupon.save();
      res.json({applied:true,fullPrice,discount})
    }else{
      applied = false;
      res.json({applied})
    }
  }
}