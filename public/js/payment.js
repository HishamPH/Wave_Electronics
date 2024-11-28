import { Success, Failed } from "./toast.js";
const loadingOverlay = $("#loadingOverlay");

$(document).ready(function () {
  $("#paymentway").submit(async function (e) {
    e.preventDefault();
    const id = $(this).data("path");
    const selectedMethod = $("input[name='method']:checked").val();
    console.log(selectedMethod);
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

      if (selectedMethod == "card") {
        const { type, key, newOrder, status } = res.data;
        if (status) {
          createOrder(newOrder, key);
        }
      } else if (selectedMethod == "wallet" || selectedMethod == "COD") {
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
      }
    } catch (err) {
      Failed(err.response ? err.response.data.message : err.message);
      console.log(err.message);
    }
  });
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
        const paymentData = {
          razorpay_order_id: res.razorpay_order_id,
          razorpay_payment_id: res.razorpay_payment_id,
          razorpay_signature: res.razorpay_signature,
        };
        console.log(paymentData);
        continuePaymentSuccess(id, paymentData, "success");
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
    const rzp1 = new Razorpay(options);
    rzp1.on("payment.failed", function (res) {
      console.log("hello");
      const item = $(".razorpay-container");
      item.remove();
      continuePaymentSuccess(id, null, "failed");
    });
    rzp1.open();
  }
});

async function continuePaymentSuccess(id, paymentData, paymentStatus) {
  loadingOverlay.removeClass("d-none");
  try {
    const res = await axios.post(
      `/user/orders/continue-payment/${id}`,
      { paymentStatus, paymentData },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const { status, message } = res.data;
    if (status) {
      loadingOverlay.addClass("d-none");
      await Swal.fire({
        icon: "success",
        title: message,
        showConfirmButton: false,
        timer: 1500,
      });
      window.location.reload();
    }
  } catch (err) {
    //Failed(err.response ? err.response.data.message : err.message);
    loadingOverlay.addClass("d-none");
    await Swal.fire({
      icon: "error",
      title: err.response ? err.response.data.message : err.message,
      showConfirmButton: false,
      timer: 1500,
    });
  }
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
    const item = $(".razorpay-container");
    item.remove();
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
