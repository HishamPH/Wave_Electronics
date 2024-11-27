import { Success, Failed } from "./toast.js";

$(document).ready(function () {
  $("#applyCoupon").click(function () {
    const code = $("#couponInput").val();
    const fullPrice = $("#final-price").data("final-price");
    const totalPrice = $("#total-price").data("total-price");
    applyCoupon(code, fullPrice, totalPrice);
  });

  async function applyCoupon(code, fullPrice, totalPrice) {
    try {
      const res = await axios.post(
        `/user/checkout/apply-coupon`,
        { code, fullPrice, totalPrice },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const { status, finalPrice, percent, ID, message } = res.data;
      if (status) {
        $("#couponname").text("Coupon");
        $("#percent").text(`-${percent}%`);
        $("#final-price").text(`₹ ${finalPrice.toLocaleString("hi")}`);
        Success(message);
      } else {
        Failed("some error occured");
      }
    } catch (err) {
      Failed(err.response ? err.response.data.message : err.message);
      console.log(err.message);
    }
  }

  $("#paymentway").submit(async function (e) {
    e.preventDefault();
    const id = $(this).data("path");
    const selectedMethod = $("input[name='method']:checked").val();
    try {
      const res = await axios.post(
        `/user/placeorder/${id}`,
        { method: selectedMethod },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const { type, key, newOrder, status } = res.data;
      if (type == "card" && status) {
        createOrder(newOrder, key);
      }
    } catch (err) {
      Failed(err.response ? err.response.data.message : err.message);
      console.log(err.message);
    }
    //newOrder(id, method);
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
      key: "rzp_test_3nb0fP5EBtY0f3",
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

function createOrder(order, key) {
  var options = {
    key: key,
    amount: order.totalPrice * 100,
    currency: "INR",
    name: "Wave Electronics",
    description: "Test Transaction",
    order_id: order.orderId,
    handler: function (res) {
      const paymentData = {
        razorpay_order_id: res.razorpay_order_id,
        razorpay_payment_id: res.razorpay_payment_id,
        razorpay_signature: res.razorpay_signature,
      };
      paymentSuccess(order, paymentData);
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
    paymentFailure(order);
  });
  rzp1.open();
}

async function paymentFailure(order) {
  try {
    const res = await axios.post(
      "/user/payment-failed",
      {
        order,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const { status, message } = res.data;
    if (status) {
      await Swal.fire({
        icon: "error",
        title: message,
        showConfirmButton: false,
        timer: 1500,
      });
      window.location.href = "/user/userprofile/orders";
    }
  } catch (err) {
    Failed(err.response ? err.response.data.message : err.message);
    console.log(err.message);
  }
}

async function paymentSuccess(order, paymentData) {
  try {
    const res = await axios.post(
      "/user/payment-success",
      {
        order,
        paymentData,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const { status, message } = res.data;
    if (status) {
      await Swal.fire({
        icon: "success",
        title: message,
        showConfirmButton: false,
        timer: 1500,
      });
      window.location.href = "/user/userprofile/orders";
    }
  } catch (err) {
    Failed(err.response ? err.response.data.message : err.message);
    console.log(err.message);
  }
}
