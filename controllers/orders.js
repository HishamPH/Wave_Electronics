const Products = require('../models/product')
// const Coupon = require('../models/coupon')
const Cart = require('../models/cart')

const Order = require('../models/orders')
const User = require("../models/users");

const Wallet = require('../models/wallet')

require('dotenv').config()
const Razorpay = require('razorpay');
const {RAZORPAY_ID_KEY,RAZORPAY_SECRET_KEY} = process.env
var instance = new Razorpay({
  key_id : RAZORPAY_ID_KEY,
  key_secret : RAZORPAY_SECRET_KEY,
});


module.exports = {

  placeOrder:async (req,res)=>{
    try{
      let id = req.params.id
      let cart = await Cart.findById(id).populate('items.productId coupon')
      let price = 0,discount = 0;
      console.log(req.body.method)
      cart.items.forEach(async(item)=>{
        price += Number(item.productId.Price)*Number(item.quantity)
        discount += Number(item.productId.discount)*Number(item.quantity)
      });
      let coupon = cart.coupon??null;
      console.log('hello')
      let totalPrice = req.session.totalPrice??(price-discount);
      let user = await User.findById(cart.userId)
      let adIndex = user.Address.findIndex((item)=>item.main === true)
      let address = user.Address[adIndex]
      let date = new Date()
      const order = new Order({
        userId:cart.userId,
        items:cart.items,
        paymentMethod:'COD',
        orderDate:date,
        Address:address,
        totalPrice:totalPrice,
        coupon:coupon
      })
      
      console.log(order._id);
      cart.items = [];
      cart.total = 0;
      cart.coupon = null;
      let status = true;
      if(req.body.method === 'card'){
        var options = {
          amount: order.totalPrice*100,
          currency: "INR",
          receipt: order._id
        }
        let or = await new Promise((resolve, reject) => {
          instance.orders.create(options, (err,order) => {
              if (err) {
                reject(err);
              } else {
                resolve(order);
              }
          });
        });
        console.log(or.id)
        status = false;
        res.json({status,or,order})
      }else{
        if(req.body.method === 'wallet')
        {
          let wallet = await Wallet.findOne({userId:user._id});
          if(wallet.balance >= totalPrice){
            wallet.transactions.push({
              type:'purchase',
              amount:totalPrice,
              date:Date.now()
            })
          }else{
            res.json({wallet:true});
            return;
          }
          wallet.balance -= totalPrice;
          await wallet.save();
          order.paymentStatus = 'success';
          order.paymentMethod = 'Wallet'
        }
        order.items.forEach(async(item)=>{
          let pd = await Products.findById(item.productId._id);
          console.log(pd.stock)
          pd.stock -=  item.quantity;
          if(pd.stock === 0)
          pd.Status = 'Out of stock';
          await pd.save();
        });
        req.session.cartCount = 0;
        req.session.totalPrice = null;
        await cart.save()
        await order.save();
        res.json({status})
      }

      
    }catch(e){
      console.error(e)
      console.log('this is the catch for placeOrder in order.js');
      res.redirect('/user/checkout')
    }
    
  },
  paymentSuccess:async(req,res)=>{
    let or = req.body
    let cart = await Cart.findOne({userId:or.userId}).populate('items.productId');
    console.log(cart.items)
    let order = new Order({
      userId:or.userId,
      items:or.items,
      paymentMethod:'razorpay',
      orderDate:or.orderDate,
      totalPrice:or.totalPrice,
      Address:or.Address,
      coupon:cart.coupon,
      paymentStatus:'success'
    });
    order.items.forEach(async(item)=>{
      let pd = await Products.findById(item.productId._id);
      console.log(pd.stock)
      pd.stock -=  item.quantity;
      if(pd.stock === 0)
        pd.Status = 'Out of stock';
      await pd.save();
    });
    await order.save();
    cart.items = [];
    cart.total = 0;
    req.session.cartCount = 0;
    await cart.save();
    res.json({status:true})
  },
  paymentFailed:async(req,res)=>{
    try{
      let id = req.params.id;
      let order = await Order.findById(id);
      let cart = await Card.findById(order.userId);
      cart.items = order.items;
      cart.total = order.items.length;
      await cart.save();
      await Order.findByIdAndDelete(id);

    }catch(e){
      console.log('this is the catch of payment failed')
      console.error(e)

    }
  },

  getUserOrders:async(req,res)=>{
    try{
      let email = req.session.user.username??req.session.user.email;
      let user = await User.findOne({email:email})
      let cart = await Cart.findOne({userId:user._id})
      let orders = await Order.find({userId:user._id}).populate('items.productId userId').sort({orderDate:-1})
      let q = 0;
      if(cart!==null)
        q = cart.total??0;
      let status = true;
      res.render('user/orders',{orders,q})
    }catch(e){
      console.error(e)
      console.log('this is the catch for getUserOrders')
      res.redirect('/user/userprofile')
    }
  },
  getAdminOrders:async(req,res)=>{
    let orders = await Order.find().populate('items.productId userId').sort({orderDate:-1})
    if(orders)
      res.render('admin/orders',{orders})
    else
      res.render('admin/orders')
  },
  changeStatus:async(req,res)=>{
    let id = req.params.id;
    let order = await Order.findOne({
      'items._id':id
    });
    let index = order.items.findIndex(a=>a._id.toString() === id);
    order.items[index].status = req.body.status;
    if(req.body.status === 'delivered'){
      console.log('DELIVERED');
      order.items[index].deliveryDate = new Date();
    }
    order.paymentStatus = 'success';
    await order.save()
    console.log(req.body)
    res.redirect(`/admin/orderdetails/${order._id}`)
  },
  adminOrderDetails:async(req,res)=>{
    let id = req.params.id;
    let order = await Order.findById(id).populate('items.productId');
    let address = order.Address;
    let items = order.items;
    let tp = order.totalPrice;
    res.render('admin/orderdetail',{items,address,tp})
  },
  userOrderDetails:async(req,res)=>{
    try{
      let id = req.params.id;
      let order = await Order.findOne({
        'items._id':id
      }).populate('items.productId coupon')
      let address = order.Address
      let index = order.items.findIndex(a=>a._id.toString() === id);
      let pd= order.items[index];
      let q = req.session.cartCount;
      let orderDate = order.orderDate.toLocaleString('en-US', { dateStyle: 'long' })

      let date = order.items[index].deliveryDate;
      let checkDate = false;
      if(date){
        checkDate = new Date(date.getTime() + (3600 * 1000));
      }
      console.log(checkDate);
      console.log(orderDate);
      let coupon = 0;
      if(order.coupon)
        coupon = order.coupon.discount;
      res.render('user/orderdetail',{pd,address,q,orderDate,checkDate,coupon})
      
    }catch(e){
      res.redirect('/user/userprofile/orders')
      console.error(e)
    }
    
  },
  cancelOrders:async(req,res)=>{
    let id = req.params.id;
    let order = await Order.findOne({
      'items._id':id
    }).populate('items.productId')
    let index = order.items.findIndex(a=>a._id.toString() === id);
    
    let pd = await Products.findById(order.items[index].productId._id);
    pd.stock +=  order.items[index].quantity;
    await pd.save()
   
    if(order.items[index].status === 'Order Placed')
      order.items[index].status = 'cancelled';
    await order.save();
    console.log(order.items[index].productId.ProductName+' was cancelled')
    res.redirect(`/user/orderdetails/${id}`)
  },
  returnOrder:async(req,res)=>{
    let reason = req.body.return;
    let id = req.params.id;
    let email = req.session.user.username;
    let user = await User.findOne({email:email});
    let order = await Order.findOne({
      userId:user._id,
      'items._id':id
    })
    let index = order.items.findIndex(a=>a._id.toString() === id);
  
    order.items[index].status = 'return request';
    order.items[index].returnReason = reason;
    await order.save();
    res.redirect(`/user/orderdetails/${id}`)
  },
  returnApprove:async(req,res)=>{
    console.log(req.body)
    let id = req.params.id;

    let order = await Order.findOne({
      'items._id':id
    })
    let index = order.items.findIndex(a=>a._id.toString() === id);
    if(req.body.approve){
      let pd = await Products.findById(order.items[index].productId._id);
      pd.stock +=  order.items[index].quantity;
      await pd.save()
  
      order.items[index].status = 'returned';
      let wallet = await Wallet.findOneAndUpdate({userId:order.userId},{
        $push:{
          transactions:{
            type:'refund',
            amount:order.items[index].price,
            date:Date.now()
          }
        }
      });
      wallet.balance += order.items[index].price;
      order.items[index].returnDate = Date.now();
      await order.save()
      await wallet.save();
    }else{
      order.items[index].status = 'return rejected';
      await order.save()
      
    }
   
    res.redirect(`/admin/orderdetails/${order._id}`)
  }
}
