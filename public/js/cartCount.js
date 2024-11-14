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

  $(".addtocart").click(function () {
    let id = $(this).data("path");
    updateQuantity(id);
  });
  function updateQuantity(id) {
    $.ajax({
      url: `/user/addtocart/${id}`,
      method: "GET",
      success: function (res) {
        if (!res.status) {
          $("#cartCount").text(res.count);
        } else {
          console.log("hello");
          location.href = "/user/login";
        }
      },
      error: function (xhr, status, error) {
        console.error("Error updating quantity:", error);
      },
    });
  }

  $(".wishlist").click(function () {
    if ($(this).find(".heart-image").attr("src") == "/img/heart.png")
      $(this).find(".heart-image").attr("src", "/img/heart-white.png");
    else $(this).find(".heart-image").attr("src", "/img/heart.png");
    let id = $(this).data("path");
    updateWishlist(id);
  });
  function updateWishlist(id) {
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
          });
        } else {
          Swal.fire({
            position: "bottom",
            text: "Removed from Wishlist",
            showConfirmButton: false,
            backdrop: false,
            timer: 1500,
          });
        }
      },
      error: function (xhr, status, error) {
        console.error("Error updating quantity:", error);
      },
    });
  }
});

// function updateProducts(products){
//   $('#searchResult').empty();
//   products.forEach((row) => {
//     const html = `<div class="col-xl-3 col-lg-4 col-md-6 ">
//     <div class="card">
//       <img src="/images/${row.images[0]}" class="card-img-top card-img-auto" alt="Product Image" style="object-fit: cover;">
//       <div class="card-body bg-light">
//         <a href="/user/detail/${row._id}">
//             <h5 class="card-title">${row.ProductName}</h5>
//             <p class="card-text text-danger fw-bold">Price: ₹${row.Price.toLocaleString('hi')}</p>
//             <p class="card-text">${row.spec1} </p>

//         </a>
//         <div class="d-flex justify-content-between mt-3">
//           <button data-path="${row._id}" class="btn btn-primary rounded-pill shadow-sm addtocart">Add to cart</button>
//           <button data-path="${row._id}" class="btn rounded-circle  shadow-sm text-danger wishlist"><i class="bi bi-heart" id="wishlist"></i></button>
//         </div>

//       </div>
//     </div>
//   </div>`;

//   $('#searchResult').append(html);
//   });
// }
