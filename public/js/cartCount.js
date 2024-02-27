// $(document).ready(function() {
 
//   $("#addtocart").click(function() {
//       updateQuantity();
//   });
//   function updateQuantity() {
//       var currentQuantity = parseInt($("#cartCount").text());
//       $.ajax({
//           url: `/user/cart/${id}`,
//           method: 'POST',
//           success: function(res) {
//               $("#cartCount").text(res.count);
//           },
//           error: function(xhr, status, error) {
//               console.error("Error updating quantity:", error);
//           }
//       });
//   }
// });
