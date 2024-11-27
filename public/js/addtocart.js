import { Success, Failed } from "./toast.js";

$(document).ready(function () {
  $(".increment").click(function (e) {
    e.preventDefault();
    const divs = $(this).parent().prev(".quantity");
    const quantity = parseInt(divs.text());
    const productId = divs.data("quantity-id");
    if (quantity >= 2) {
      Swal.fire({
        position: "top",
        text: "maximum quantity for a person reached",
        showConfirmButton: false,
        backdrop: false,
        timer: 1500,
        allowOutsideClick: false,
      });
      return;
    }
    updateQuantity("increment", quantity, productId);
  });
  $(".decrement").click(function (e) {
    e.preventDefault();
    const divs = $(this).parent().next(".quantity");
    const quantity = parseInt(divs.text());
    const productId = divs.data("quantity-id");
    if (quantity <= 1) return;
    updateQuantity("decrement", quantity, productId);
  });
  async function updateQuantity(action, currentQuantity, id) {
    try {
      const res = await axios.post(
        `/user/cart/update-quantity/${id}`,
        { action, value: currentQuantity },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const { quantity, price, totalPrice, totalDiscount } = res.data;
      const decr = $(`#decr-${id}`);
      if (quantity > 1) {
        decr.prop("disabled", false);
      } else {
        decr.prop("disabled", true);
      }

      $(`#pd-${id}`).text(quantity);
      $(`#it${id}`).text((quantity * price).toLocaleString("hi"));
      $("#total-price").text(`₹ ${totalPrice.toLocaleString("hi")}`);
      $("#final-price").text(
        `₹ ${(totalPrice - totalDiscount).toLocaleString("hi")}`
      );
      $("#discount").text(`– ₹${totalDiscount.toLocaleString("hi")}`);
      $("#couponname").text("");
      $("#percent").text("");
      Success("quantity updated");
    } catch (err) {
      Failed(err.response ? err.response.data.message : err.message);
      console.log(err?.message);
    }
  }
});

$(document).ready(function () {
  $(".applyCoupon").click(function (e) {
    e.preventDefault();
    let id = $(this).data("path");
    applyCoupon(id);
  });

  async function applyCoupon(id) {
    try {
      //const res = await axios.post(`/user/cart/coupon/${id}`);
    } catch (err) {
      Failed(err.response ? err.response.data.message : err.message);
      console.log(err?.message);
    }

    $.ajax({
      url: `/user/cart/coupon/${id}`,
      method: "POST",
      success: function (res) {
        if (res.limit) {
          if (res.limit == "max") alert("coupon purchase limit exceeded");
          else alert("minimum coupon purchase have not met");
        } else if (res.exist) {
          alert("You can only apply one coupon at a time");
        } else if (res.applied) {
          $("#couponname").text("Coupon");
          $("#percent").text(`-${res.discount}%`);
          $("#final-price").text(`₹ ${res.fullPrice.toLocaleString("hi")}`);
          $(`#applyCoupon${res.ID}`).addClass("d-none");
          $(`#removeCoupon${res.ID}`).removeClass("d-none");
          alert("coupon applied");
        } else {
          $("#couponname").text("");
          $("#percent").text("");
          $("#final-price").text(`₹ ${res.fullPrice.toLocaleString("hi")}`);
          $(`#applyCoupon${res.ID}`).removeClass("d-none");
          $(`#removeCoupon${res.ID}`).addClass("d-none");
          alert("Coupon removed");
        }
      },
    });
  }
});

$(document).ready(function () {
  $(".delete").click(function (e) {
    e.preventDefault();
    let id = $(this).data("delete");
    console.log(id);
    deleteQuantity(id);
  });
  async function deleteQuantity(productId) {
    try {
      const result = await Swal.fire({
        title: "Remove Item",
        text: "Do you want to remove this item from cart",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Remove",
      });
      if (result.isConfirmed) {
        const res = await axios.delete(`/user/cart/delete/${productId}`);
        const { status, message, totalPrice, totalDiscount, count } = res.data;
        if (!count) {
          $("#empty-cart").removeClass("d-none");
          $("#cart-section").remove();
          Success(message);
          return;
        }
        console.log(totalPrice, totalDiscount);
        const row = $(`tr[data-product-id="${productId}"]`);
        if (row.length > 0) {
          row.remove();
          $("#items-count").text(`price(${count} items)`);
          $("#total-price").text(`₹ ${totalPrice.toLocaleString("hi")}`);
          $("#final-price").text(
            `₹ ${(totalPrice - totalDiscount).toLocaleString("hi")}`
          );
          $("#discount").text(`– ₹${totalDiscount.toLocaleString("hi")}`);
          Success(message);
        } else {
          console.error("Row with the given productId not found.");
          Failed("some error occured");
        }
      }
    } catch (err) {
      Failed(err.response ? err.response.data.message : err.message);
      console.log(err?.message);
    }
  }
});
