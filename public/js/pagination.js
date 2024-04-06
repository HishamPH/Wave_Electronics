$(document).ready(function() {
  $('.filter').on('change',function(e){
    e.preventDefault();
    let filters = $('#filter').serialize();
    let sort = $('#sort').serialize();
    filterProducts(filters,sort);
  });
  
  function filterProducts(filters,sort) {
    $.ajax({
      url: `/user/filters?${sort}`,
      method: 'post',
      data:filters,
      success:function(res) {
        updateProducts(res.products);
      },
      error: function(xhr, status, error) {
          console.error("Error updating quantity:", error);
      }
    });
  }

  

});


function updateProducts(products){
  $('#searchResult').empty();
  products.forEach((row) => {
    const html = `<div class="col-xl-3 col-lg-4 col-md-6 ">
    <div class="card">
      <img src="/images/${row.images[0]}" class="card-img-top card-img-auto" alt="Product Image" style="object-fit: cover;">
      <div class="card-body bg-light">
        <a href="/user/detail/${row._id}">
            <h5 class="card-title">${row.ProductName}</h5>
            <p class="card-text text-danger fw-bold">Price: ₹${row.Price.toLocaleString('hi')}</p>
            <p class="card-text">${row.spec1} </p>
            
        </a>
        <div class="d-flex justify-content-between mt-3">
          <button data-path="${row._id}" class="btn btn-primary rounded-pill shadow-sm addtocart">Add to cart</button>
          <button data-path="${row._id}" class="btn rounded-circle  shadow-sm text-danger wishlist"><i class="bi bi-heart" id="wishlist"></i></button>
        </div>
        
        
        
      </div>
    </div>
  </div>`;

  $('#searchResult').append(html);
  });
}