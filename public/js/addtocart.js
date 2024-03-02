$(document).ready(function() {
  $(".hello").click(function(){
    console.log('deleted');
  });

  $(".increment").click(function() {
      let divs = $(this).parent().prev('.quantity')
      let q = parseInt(divs.text());
      updateQuantity('increment',q,divs);
  });
  $(".decrement").click(function() {
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
        success: function(res) {
            divs.text(res.quantity)
            $(`#it${id}`).text(((res.quantity)*(res.price)).toLocaleString('hi'))
            $('#items-price').text(`₹ ${res.totalPrice.toLocaleString('hi')}`)
            $('#total-price').text(`₹ ${(res.totalPrice-res.discount).toLocaleString('hi')}`)
            $('#discount').text(`– ₹${res.discount.toLocaleString('hi')}`)
        },
        error: function(xhr, status, error) {
            console.error("Error updating quantity:", error);
        }
    });
  }
});

