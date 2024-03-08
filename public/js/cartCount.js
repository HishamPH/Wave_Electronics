$(document).ready(function() {
 
  $(".addtocart").click(function(e) {
      let id = $(this).data('path')
      // let ev = e.target
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
});
