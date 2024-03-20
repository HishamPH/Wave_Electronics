$(document).ready(function() {
 
  $("#paymentway").submit(function(e) {
    e.preventDefault();
    let id = $(this).data('path');
    let method = $(this).serialize()
    newOrder(id,method);
  });
  function newOrder(id,method) {
      $.ajax({
          url: `/user/placeorder/${id}`,
          method: 'post',
          data:method,
          success: function(res) {
            if(res.status){
              location.href = '/user/userprofile/orders'
            }else if(res.wallet){
              alert('Not enough balance in wallet')
            }else{
              paymentConfirm(res.or,res.order)
            }
          },
          error: function(xhr, status, error) {
            console.error("Error updating quantity:", error);
          }
      });
  }
});
function paymentConfirm(or,order){
  var options = {
    "key": "rzp_test_ZCCSyrCe5ZqrEH",
    "amount": or.amount,
    "currency": "INR",
    "name": "Wave Electronics",
    "description": "Test Transaction",
   // "image": "",
    "order_id": or.id,
    "handler": function(res){
        // alert(res.razorpay_payment_id);
        // alert(res.razorpay_order_id);
        // alert(res.razorpay_signature)
        //alert('payment was successful')
        paymentSuccess(order);
    },
    "prefill": {
        "name": 'Hisham',
        "email": "hishamnarakkal@gmail.com", 
        "contact": '9999999999' 
    },
    "notes": {
        "address": "Razorpay Corporate Office"
    },
    "theme": {
        "color": "#3399cc"
    }
  };
  var rzp1 = new Razorpay(options);
  rzp1.on('payment.failed', function (res){
    
    alert(res.error.code);
    alert('there has been a payment failure')
    // paymentFailure(order);
    //location.href = '/user/checkout'
  });
  rzp1.open();
}


function paymentFailure(order){
  $.ajax({
    url: `/user/paymentfailed/${order._id}`,
    method: 'get',
    data:method,
    success:function(res){
      if(res.status)
        location.href='/user/checkout'
    }
  })
}


function paymentSuccess(order){
  console.log(order)
  let data = JSON.stringify(order)
  // console.log(data)
  $.ajax({
    url: `/user/paymentsuccess`,
    method: 'post',
    contentType:'application/json',
    data:data,
    success:function(res){
      location.href='/user/userprofile/orders'
    }
  })
}