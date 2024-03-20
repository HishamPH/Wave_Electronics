const User = require('../models/users')

const Order = require('../models/orders')

module.exports = {
  getUser:async(req,res)=>{
    const user = await User.find()
    res.render('admin/users',{user});
  },

  blockUser:async(req,res)=>{
    let id = req.params.id;
    await User.findByIdAndUpdate(id,[{
      $set:{status:{$not:"$status"}}
    }]);
    res.redirect('/admin/users');
  },
  salesReport:async(req,res)=>{
    let date = new Date();

    let lastMonth = new Date(date);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    let orders = await Order.find({
      orderDate:{$gte:lastMonth,$lte:date},
      'items.status':'delivered'
    }).populate('userId items.productId').sort({orderDate:-1});
    let q = 0,tp= 0;
    
    orders.forEach((item)=>{
      item.items.forEach((order)=>{
        q += order.quantity;
      })
      tp += item.totalPrice;
    })
    res.render('admin/salesreport',{orders,q,tp})
  },
  customSalesReport:async(req,res)=>{
    console.log(req.query)
    let {startDate,endDate} = req.query??null;
    let range = req.params.id;
    let date = new Date()
    let lastMonth = new Date();
    if(range === 'month'){
      lastMonth = new Date(date);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
    }else if(range === 'week'){
      lastMonth = new Date(date);
      lastMonth.setDate(lastMonth.getDate() - 7);
    }else if(range === 'day'){
      lastMonth = new Date(date);
      lastMonth.setDate(lastMonth.getDate() - 1);
    }else if(range === 'custom'){
      date = endDate;
      lastMonth = startDate;
    }
    let orders = await Order.find({
      orderDate:{$gte:lastMonth,$lte:date},
      'items.status':'delivered'
    }).populate('userId items.productId').sort({orderDate:-1});
    let q = 0,tp= 0;
    
    orders.forEach((item)=>{
      item.items.forEach((order)=>{
        q += order.quantity;
      })
      tp += item.totalPrice;
    })
    res.render('admin/salesreportcustom',{orders,q,tp,range})
   
  }
}