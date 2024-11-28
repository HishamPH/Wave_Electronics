import { Success, Failed } from "./toast.js";
const loadingOverlay = $("#loadingOverlay");

$(document).ready(function () {
  let full_price;
  let total_price;
  $("#coupon-container").on("click", ".applyCoupon", function () {
    const code = $(".couponInput").val();
    const fullPrice = $("#final-price").data("final-price");
    const totalPrice = $("#total-price").data("total-price");
    full_price = fullPrice;
    applyCoupon(code, fullPrice, totalPrice);
  });

  $("#coupon-container").on("click", ".removeCoupon", async function () {
    const couponId = $(this).data("coupon-id");
    try {
      const res = await axios.put(
        `/user/checkout/remove-coupon`,
        { finalPrice: full_price },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const { status, message } = res.data;
      if (status) {
        const container = $("#coupon-container");
        container.empty();
        container.html(`<div class="col-auto">
                  <button
                    class="btn btn-primary applyCoupon"
                    type="button"
                  >
                    Apply
                  </button>
                </div>
                <!-- Input -->
                <div class="col">
                  <input
                    type="text"
                    class="form-control couponInput"
                    placeholder="Enter coupon code"
                    aria-label="Coupon Code"
                  />
                </div>`);
        $("#couponname").text("");
        $("#percent").text(``);
        $("#final-price").text(`₹ ${full_price.toLocaleString("hi")}`);
        loadingOverlay.addClass("d-none");
        Success(message);
      }
    } catch (error) {
      loadingOverlay.addClass("d-none");
      Failed(err.response ? err.response.data.message : err.message);
      console.log(err.message);
    }
    full_price = fullPrice;
    applyCoupon(code, fullPrice, totalPrice);
  });

  async function applyCoupon(code, fullPrice, totalPrice) {
    try {
      loadingOverlay.removeClass("d-none");
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
        const container = $("#coupon-container");
        container.empty();
        container.html(`<button class="btn btn-primary removeCoupon" data-coupon-id="${ID}">
    Remove Coupon
  </button>`);
        $("#couponname").text("Coupon");
        $("#percent").text(`-${percent}%`);
        $("#final-price").text(`₹ ${finalPrice.toLocaleString("hi")}`);
        loadingOverlay.addClass("d-none");
        Success(message);
      } else {
        Failed("some error occured");
      }
    } catch (err) {
      loadingOverlay.addClass("d-none");
      Failed(err.response ? err.response.data.message : err.message);
      console.log(err.message);
    }
  }
});
