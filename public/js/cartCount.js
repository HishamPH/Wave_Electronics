

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
    if($(this).find(".heart-image").attr("src")=='/img/heart.png')
      $(this).find(".heart-image").attr("src",'/img/heart-white.png');
    else
      $(this).find(".heart-image").attr("src",'/img/heart.png');
    let id = $(this).data('path')
    updateWishlist(id);
  });
  function updateWishlist(id) {
      $.ajax({
          url: `/user/addwishlist/${id}`,
          method: 'GET',
          success: function(res) {
            if(res.status){
              Swal.fire({
                position: "bottom",
                text: 'Added to Wishlist',
                showConfirmButton: false,
                backdrop:false,
                timer:1500
              });
            }else{
              Swal.fire({
                position: "bottom",
                text: 'Removed from Wishlist',
                showConfirmButton: false,
                backdrop:false,
                timer:1500
              });
            }
            
          },
          error: function(xhr, status, error) {
            console.error("Error updating quantity:", error);
          }
      });
  }

  $('#searchInput').keyup(function(e){
    e.preventDefault()
    let q = $(this).val()
    $.ajax({
      url:'/user/search',
      method:'get',
      data:{q:q},
      success:function(res){
        updateProducts(res.product);
        
      }
    })
  })
});

// function updateProducts(products){
//   $('#searchResult').empty();
//   products.forEach((row) => {
//     const html = `<div class="col-xl-3 col-lg-4 col-md-6 ">
//     <div class="card">
//       <img src="/images/<%= ${row.images[0]}%>" class="card-img-top card-img-auto" alt="Product Image" style="object-fit: cover;">
//       <div class="card-body bg-light">
//         <a href="/user/detail/<%= ${row._id} %>">
//             <h5 class="card-title"><%= ${row.ProductName}  %></h5>
//             <p class="card-text text-danger fw-bold">Price: ₹<%= ${row.Price.toLocaleString('hi')} %></p>
//             <p class="card-text"><%= ${row.spec1} %></p>
            
//         </a>
//         <div class="d-flex justify-content-between mt-3">
//           <button data-path="<%= ${row._id}  %>" class="btn btn-primary rounded-pill shadow-sm addtocart">Add to cart</button>
//           <button data-path="<%= ${row._id} %>" class="btn rounded-circle  shadow-sm text-danger wishlist"><i class="bi bi-heart" id="wishlist"></i></button>
//         </div>
        
        
        
//       </div>
//     </div>
//   </div>`;

//   $('#searchResult').append(html);
//   });
// }

