import { Success, Failed } from "./toast.js";

$(document).ready(function () {
  $("#searchResult").on("click", ".addtocart", function () {
    const productId = $(this).data("path");
    updateQuantity(productId);
  });

  $("#searchResult").on("click", ".wishlist", function () {
    const productId = $(this).data("path");
    const divs = $(this).find("img");
    updateWishlist(productId, divs);
  });

  async function updateQuantity(id) {
    try {
      console.log(id);
      const res = await axios.post(`/user/addtocart/${id}`);
      console.log(res);
      $("#cartCount").text(res.data.count);
      Success("added to cart");
    } catch (err) {
      Failed(err.response ? err.response.data.message : err.message);
      console.log(err.message);
    }
  }

  async function updateWishlist(id, divs) {
    try {
      const res = await axios.post(`/user/update-wishlist/${id}`);
      const { isAdded, wishlist } = res.data;
      $("#wishCount").text(wishlist);
      if (isAdded) {
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
    } catch (error) {
      Failed(err.response ? err.response.data.message : err.message);
      console.log(err.message);
    }
  }
});
