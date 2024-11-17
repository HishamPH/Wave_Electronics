$(document).ready(function () {
  $("#paymentway").submit(function (e) {
    e.preventDefault();
    let id = $(this).data("path");
    let method = $(this).serialize();
    newOrder(id, method);
  });
  function newOrder(id, method) {
    $.ajax({
      url: `/user/placeorder/${id}`,
      method: "post",
      data: method,
      success: function (res) {
        if (res.status) {
          location.href = "/user/userprofile/orders";
        } else if (res.wallet) {
          alert("Not enough balance in wallet");
        } else {
          paymentConfirm(res.or, res.order);
        }
      },
      error: function (xhr, status, error) {
        console.error("Error updating quantity:", error);
      },
    });
  }
  $("#continuePayment").click(function (e) {
    e.preventDefault();
    let id = $(this).data("path");
    let amount = Number($("#pdprice").text());
    let orderId = $("#orderId").val();
    console.log(amount);
    continuePayment(id, amount, orderId);
  });
  function continuePayment(id, amount, orderId) {
    var options = {
      key: "your?key", //give your razorpay key here
      amount: amount * 100,
      currency: "INR",
      name: "Wave Electronics",
      description: "Test Transaction",
      order_id: orderId,
      handler: function (res) {
        continuePaymentSuccess(id, res, "success");
      },
      prefill: {
        name: "Hisham",
        email: "hishamn@gmail.com",
        contact: "9999999999",
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
      theme: {
        color: "#3399cc",
      },
    };
    var rzp1 = new Razorpay(options);
    rzp1.on("payment.failed", function (res) {
      alert(res.error.code);
      alert("there has been a payment failure");
      continuePaymentSuccess(id, res, "failed");
      //location.href = '/user/checkout'
    });
    rzp1.open();
  }
});

function continuePaymentSuccess(id, res, status) {
  $.ajax({
    url: `/user/orders/continuePayment/${id}`,
    method: "post",
    data: { status: status },
    success: function (res) {
      location.href = "/user/userprofile/orders";
    },
    error: function (xhr, status, error) {
      console.error("Error updating quantity:", error);
    },
  });
}

function paymentConfirm(or, order) {
  var options = {
    key: "your?key", //give your razorpay key here
    amount: or.amount,
    currency: "INR",
    name: "Wave Electronics",
    description: "Test Transaction",
    order_id: or.id,
    handler: function (res) {
      paymentSuccess(order, or.id);
    },
    prefill: {
      name: "Hisham",
      email: "hisham@gmail.com",
      contact: "9999999999",
    },
    notes: {
      address: "Razorpay Corporate Office",
    },
    theme: {
      color: "#3399cc",
    },
  };
  var rzp1 = new Razorpay(options);
  rzp1.on("payment.failed", function (res) {
    alert(res.error.code);
    alert("there has been a payment failure");
    paymentFailure(order, or.id);
    //location.href = '/user/checkout'
  });
  rzp1.open();
}

function paymentFailure(order, id) {
  let data = JSON.stringify(order);
  $.ajax({
    url: `/user/paymentfailed/${id}`,
    method: "post",
    contentType: "application/json",
    data: data,
    success: function (res) {
      if (res.status) location.href = "/user/userprofile/orders";
    },
  });
}

function paymentSuccess(order, id) {
  let data = JSON.stringify(order);
  // console.log(data)
  $.ajax({
    url: `/user/paymentsuccess/${id}`,
    method: "post",
    contentType: "application/json",
    data: data,
    success: function (res) {
      location.href = "/user/userprofile/orders";
    },
  });
}
