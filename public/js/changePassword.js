$(document).ready(function() {
 
  $("#passwordForm").submit(function(e) {
      e.preventDefault()
      let id = $(this).data('path')
      var formData = $(this).serialize();
      changePassword(id,formData);

  });
  function changePassword(id,formData) {
      $.ajax({
          url: `/user/userprofile/changepassword/${id}`,
          method: 'POST',
          data:formData,
          success: function(res) {
            if(res.message)
              $("#message").text(res.message);
            else{
              alert('password changed successfully')
              location.href= '/user/userprofile'
              
            }
            
          },
          error: function(xhr, status, error) {
            console.error("Error updating quantity:", error);
          }
      });
  }
});




function validatePassword(input) {
  const passwordError = document.getElementById('passwordError');
  passwordError.textContent = '';

  if (input.value.trim().length < 8) {
    passwordError.textContent = 'Password must be at least 8 characters.';
  } else if (/\s/.test(input.value)) {
    passwordError.textContent = 'Password cannot contain spaces.';
  }
}





function validateForm() {
  const inputs = document.querySelectorAll('form input[required]');
  
  for (const input of inputs) {
    input.dispatchEvent(new Event('input'));
    if (input.nextElementSibling.textContent) {
      return false;
    }
   
  }

  return true;
}