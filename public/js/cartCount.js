$(document).ready(function() {
 
  $(".addtocart").click(function() {
      let id = $(this).data('path')
      updateQuantity(id);
  });
  function updateQuantity(id) {
      $.ajax({
          url: `/user/addtocart/${id}`,
          method: 'GET',
          success: function(res) {
            $("#cartCount").text(res.count);
          },
          error: function(xhr, status, error) {
            console.error("Error updating quantity:", error);
          }
      });
  }


  $(".wishlist").click(function() {
    console.log('this is wishlist')
      let id = $(this).data('path')
      updateWishlist(id);
  });
  function updateWishlist(id) {
      $.ajax({
          url: `/user/addwishlist/${id}`,
          method: 'GET',
          success: function(res) {
            if(res.status)
              $("#wishlist").addClass("bg-danger");
            else
              $('#wishlist').removeClass('bg-danger')
          },
          error: function(xhr, status, error) {
            console.error("Error updating quantity:", error);
          }
      });
  }
});

