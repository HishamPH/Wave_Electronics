const { changeStatus } = require("../controllers/orders");

$(document).ready(function() {
  $("#changeStatus").click(function(e) {
    e.preventDefault();
    let id = $(this).data('path');
    let action = $(this).text()
    changeStatus(id,action);
  });
  function changeStatus(id,action) {
      $.ajax({
          url: `/admin/orders/changeStatus/${id}`,
          method: 'post',
          data:action,
          success: function(res) {
            
          },
          error: function(xhr, status, error) {
            console.error("Error updating quantity:", error);
          }
      });
  }
});