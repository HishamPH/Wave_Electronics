const Products = require('../models/product')
// const Coupon = require('../models/coupon')
const Cart = require('../models/cart')

const Order = require('../models/orders')
const User = require("../models/users");
module.exports = {
  placeOrder:async(req,res)=>{
    let id = req.params.id
    
    let cart = await Cart.findById(id).populate('items.productId')
    let price = 0,discount = 0;
    cart.items.forEach(async(item)=>{
      price += Number(item.productId.Price)*Number(item.quantity)
      discount += Number(item.productId.discount)*Number(item.quantity)
      let pd = await Products.findById(item.productId._id);
      pd.stock -=  item.quantity;
      await pd.save()
    });
    let totalPrice = price - discount;
    let user = await User.findById(cart.userId)
    let adIndex = user.Address.findIndex((item)=>item.main === true)
    let address = user.Address[adIndex]
    let date = new Date()
    console.log(date)
    const order = new Order({
      userId:cart.userId,
      items:cart.items,
      paymentMethod:'COD',
      orderDate:date,
      Address:address,
      totalPrice:totalPrice
    })
    cart.items = [];
    cart.total = 0;
    req.session.cartCount = 0;
   
    await cart.save()
    await order.save()
    res.redirect('/user/userprofile/orders')
  },
  getUserOrders:async(req,res)=>{
    let user = await User.findOne({email:req.session.user.username})
    let cart = await Cart.findOne({userId:user._id})
    let orders = await Order.find({userId:user._id}).populate('items.productId userId')
    let q = cart.total??0;
    if(orders)
      res.render('user/orders',{orders,q})
    else
      res.render('user/orders',{q})
  },
  cancelOrders:async(req,res)=>{
    let id = req.params.id;
    let order = await Order.findById(id);
    console.log(order.status)
    order.items.forEach(async(item)=>{
      let pd = await Products.findById(item.productId._id);
      pd.stock +=  item.quantity;
      await pd.save()
    });
    order.status = 'cancelled';
    await order.save()
    res.redirect('/user/userprofile/orders')
  },
  getAdminOrders:async(req,res)=>{
    let orders = await Order.find().populate('items.productId userId')
    if(orders)
      res.render('admin/orders',{orders})
    else
      res.render('admin/orders')
  },
  changeStatus:async(req,res)=>{
    let id = req.params.id;
    let order = await Order.findById(id);
    console.log(req.body)
    order.status = req.body.status
    await order.save()
    res.redirect('/admin/orders')
  },
  adminOrderDetails:async(req,res)=>{
    let id = req.params.id;
    let order = await Order.findById(id).populate('items.productId');
    let items = order.items;
    res.render('admin/orderdetail',{items})
  }
}
