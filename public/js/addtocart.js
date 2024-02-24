

$(document).ready(function(){
  $('#incr').on('click',(e)=>{
    let incr = document.getElementById('incr')
    let id = incr.dataset.path;
    e.preventDefault();
    $.ajax({
      url:`/user/cart/${id}`,
      method:'get',
      // contentType:'application/json',
      success:function(res){
        $('#item-count').html(res.response)
      }
    })
  })
})