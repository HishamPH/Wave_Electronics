$(document).ready(function() {
  $(".hello").click(function(){
    console.log('deleted');
  });

  $(".increment").click(function() {
      let divs = $(this).parent().prev('.quantity')
      let q = parseInt(divs.text());
      console.log(divs)
      let id = divs.data('path')
      console.log(id);
      updateQuantity('increment',q,id,divs);
  });
  $(".decrement").click(function() {
      let divs = $(this).parent().next('.quantity')
      console.log(divs)
      let q = parseInt(divs.text());
      let id = divs.data('path')
      console.log(id)
      updateQuantity('decrement',q,id,divs);
  });
  function updateQuantity(action,currentQuantity,id,divs) {
    //   var currentQuantity = parseInt($(".quantity").text());
    //   let id = $('.quantity').data('path')
      let div = divs;
      $.ajax({
          url: `/user/cart/${id}`,
          method: 'POST',
          data: { action:action,value:currentQuantity},
          success: function(res) {
             //$('.quantity').text(res.quantity)
             div.text(res.quantity)
          },
          error: function(xhr, status, error) {
              console.error("Error updating quantity:", error);
          }
      });
  }
});

