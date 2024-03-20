$(document).ready(function() {
  $(".increment").click(function(e) {
    e.preventDefault()
    let divs = $(this).parent().prev('.quantity')
    let q = parseInt(divs.text());
    if(q===2){
      Swal.fire({
        position: "bottom",
        text: 'maximum quantity for a person reached',
        showConfirmButton: false,
        backdrop:false,
        timer:1500
      });
    }
    updateQuantity('increment',q,divs);
  });
  $(".decrement").click(function(e) {
    e.preventDefault()
    let divs = $(this).parent().next('.quantity')
    let q = parseInt(divs.text());      
    updateQuantity('decrement',q,divs);
  });
  function updateQuantity(action,currentQuantity,divs) {
    let id = divs.data('path')
   
    console.log(id)
    $.ajax({
      url: `/user/cart/${id}`,
      method: 'POST',
      data: { action:action,value:currentQuantity},
      success:function(res) {
        divs.text(res.quantity)
        $(`#it${id}`).text(((res.quantity)*(res.price)).toLocaleString('hi'))
        $('#items-price').text(`₹ ${res.totalPrice.toLocaleString('hi')}`)
        $('#total-price').text(`₹ ${(res.totalPrice-res.discount).toLocaleString('hi')}`)
        $('#discount').text(`– ₹${res.discount.toLocaleString('hi')}`)
        if(res.msg)
          alert('There are no more stock available')
      },
      error: function(xhr, status, error) {
          console.error("Error updating quantity:", error);
      }
    });
  }

  

});

$(document).ready(function() {
  $('#coupon').submit(function(e){
    e.preventDefault()
    let code = $(this).serialize();
    applyCoupon(code);
  })

  function applyCoupon(code){
    $.ajax({
      url:`/user/cart/coupon`,
      method:'POST',
      data:code,
      success:function(res){
        if(res.applied){
          $('#couponname').text('Coupon')
          $('#percent').text(`-${res.discount}%`)
          $('#total-price').text(`₹ ${res.fullPrice.toLocaleString('hi')}`)
          alert('coupon applied')
        }else{
          alert('wrong coupon code')
        }
          
      }
    });
  }
});