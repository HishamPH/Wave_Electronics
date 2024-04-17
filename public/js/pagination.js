$(document).ready(function() {
  
  $('.filter').on('change',function(e){
    e.preventDefault();
    let filters = $('#filter').serialize();
    let sort = $('#sort').serialize();
    let q = $('#searchInput').serialize();
    let page = $('.page-link.active').text();
    
    
    filterProducts(filters,sort,q,page);
  });
  
  $('.page-link').click(function(e){
    e.preventDefault();
    
    let filters = $('#filter').serialize();
    let sort = $('#sort').serialize();
    let q = $('#searchInput').serialize();
    
    let page = $(this).text();
    filterProducts(filters,sort,q,page);
  })

  // $('#searchInput').keyup(function(e){
  //   e.preventDefault();
    
  //   let q = $(this).val()
  //   $.ajax({
  //     url:'/user/search',
  //     method:'get',
  //     data:{q:q},
  //     success:function(res){
  //       updateProducts(res.products);
        
  //     }
  //   })
  // })

});




function filterProducts(filters,sort,q,page) {
  $.ajax({
    url: `/user/filters?${sort}&${q}&page=${page}`,
    method: 'post',
    data:filters,
    success:function(res) {
      $('.page-link').removeClass('active');
      $('.page-link').filter(function() {
        return $(this).text().trim() === res.page;
      }).addClass('active');
      updateProducts(res.products,res.wishlist);
    },
    error: function(xhr, status, error) {
        console.error("Error updating quantity:", error);
    }
  });
}

function updateProducts(products,wishlist){
  $('#searchResult').empty();
  products.forEach((row) => {
    let wishImage = 'heart-white';
    if(wishlist.includes(row._id.toString())){
      wishImage = 'heart';
    }
    if(row.offer){
      const html = `
      <div class="col-xl-3 col-lg-4 col-md-6 ">
        <div class="card rounded-0 ">
          
            <span class="badge position-absolute  p-2  bg-danger w-auto rounded-0  " style="top: 15px; right: 15px;">
              - ${row.offer.percentage}%
            </span>
          <img src="/images/${row.images[0]}" class="card-img-top card-img-auto" alt="Product Image" style="object-fit: cover;">
          <div class="card-body bg-white" style="height: 220px;">
            <a href="/user/detail/${row._id}">
                <div class="card-title m-0 text-truncate fw-bold ">${row.ProductName}</div>
                <p class="card-text fw-bold text-dark mb-2 ">₹${row.Price.toLocaleString('hi')}</p>
                <p class="card-text text-black " style="height: 48px;">${row.spec1}</p>
                
            </a>
            <div class="d-flex justify-content-between mt-3" style="bottom:0px;">
              <button data-path="${row._id}" class="btn btn-dark rounded-pill addtocart">Add to cart</button>
              
                <button data-path="${row._id}" class="btn rounded-circle  shadow-sm text-danger wishlist"><img src="/img/${wishImage}.png" class="img-fluid heart-image" alt=""></button>
              
            </div>
          </div>
        </div>
      </div>`;

      $('#searchResult').append(html);
    }else{
      const html = `
      <div class="col-xl-3 col-lg-4 col-md-6 ">
        <div class="card rounded-0 ">
          <img src="/images/${row.images[0]}" class="card-img-top card-img-auto" alt="Product Image" style="object-fit: cover;">
          <div class="card-body bg-white" style="height: 220px;">
            <a href="/user/detail/${row._id}">
                <div class="card-title m-0 text-truncate fw-bold ">${row.ProductName}</div>
                <p class="card-text fw-bold text-dark mb-2 ">₹${row.Price.toLocaleString('hi')}</p>
                <p class="card-text text-black " style="height: 48px;">${row.spec1}</p>
                
            </a>
            <div class="d-flex justify-content-between mt-3" style="bottom:0px;">
              <button data-path="${row._id}" class="btn btn-dark rounded-pill addtocart">Add to cart</button>
              
                <button data-path="${row._id}" class="btn rounded-circle  shadow-sm text-danger wishlist"><img src="/img/${wishImage}.png" class="img-fluid heart-image" alt=""></button>
              
            </div>
            
            
            
          </div>
        </div>
      </div>`;

      $('#searchResult').append(html);
    }
    
  });
}