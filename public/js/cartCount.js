import { Success, Failed } from "./toast.js";

$(document).ready(function () {
  $("#invoice").click(async function (e) {
    e.preventDefault();
    let company = $("#name").text();
    let address = $("#address").text();
    let zip = $("#zip").text();
    let city = $("#city").text();
    let country = $("#country").text();
    let quantity = Number($("#pdq").text());
    let description = $("#pdname").text();
    let price = Number($("#pdprice").text());
    let date = $("#date").text();
    let orderId = $("#orderId").text();
    let coupon = Number($("#coupon").text());
    var data = {
      // apiKey: "free",
      // mode: "development",
      sender: {
        company: "Wave Electronics",
        address: "NY Street 123",
        zip: "1234 AB",
        city: "Illinois",
        country: "Azerbaijan",
      },
      client: {
        company: company,
        address: address,
        zip: zip,
        city: city,
        country: country,
      },
      information: {
        number: orderId,
        date: date,
      },
      products: [
        {
          quantity: quantity,
          description: description,
          "tax-rate": -coupon,
          price: price,
        },
      ],
      "bottom-notice": "Kindly pay your invoice within 15 days.",
      settings: {
        currency: "INR",
        "tax-notation": "coupon",
        "margin-top": 25,
        "margin-right": 25,
        "margin-left": 25,
        "margin-bottom": 25,
      },
    };
    let result = await easyinvoice.createInvoice(data);
    easyinvoice.download("myInvoice.pdf", result.pdf);
  });

  $("#searchResult").on("click", ".addtocart", function () {
    const productId = $(this).data("path");
    updateQuantity(productId);
  });

  $("#searchResult").on("click", ".wishlist", function () {
    const productId = $(this).data("path");
    const divs = $(this).find("img");
    updateWishlist(productId, divs);
  });

  // $(".addtocart").click(function () {
  //   let id = $(this).data("path");
  //   updateQuantity(id);
  // });
  async function updateQuantity(id) {
    try {
      console.log(id);
      const res = await axios.get(`/user/addtocart/${id}`);
      console.log(res);
      $("#cartCount").text(res.data.count);
      Success("added to cart");
    } catch (err) {
      Failed(err.response ? err.response.data.message : err.message);
      console.log(err.message);
    }
  }

  // $(".wishlist").click(function () {
  //   const divs = $(this).find("img");
  //   let id = $(this).data("path");
  //   updateWishlist(id, divs);
  // });
  function updateWishlist(id, divs) {
    $.ajax({
      url: `/user/addwishlist/${id}`,
      method: "GET",
      success: function (res) {
        $("#wishCount").text(res.wishlist);
        if (res.status) {
          Swal.fire({
            position: "bottom",
            text: "Added to Wishlist ✅",
            showConfirmButton: false,
            backdrop: false,
            timer: 1500,
            background: "black",
            allowOutsideClick: false,
          });
          divs.attr("src", "/img/heart.png");
        } else {
          Swal.fire({
            position: "bottom",
            text: "Removed from Wishlist",
            showConfirmButton: false,
            backdrop: false,
            timer: 1500,
            allowOutsideClick: false,
          });
          divs.attr("src", "/img/heart-white.png");
        }
      },
      error: function (xhr, status, error) {
        console.error("Error updating quantity:", error);
      },
    });
  }
});
