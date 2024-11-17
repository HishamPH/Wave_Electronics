function validateName(input) {
  const nameError = document.getElementById("nameError");
  nameError.textContent = "";

  if (!input.value.trim()) {
    nameError.textContent = "Name is required.";
  } else if (/\s/.test(input.value)) {
    nameError.textContent = "Name cannot contain spaces.";
  }
}

function validateEmail(input) {
  const emailError = document.getElementById("emailError");
  emailError.textContent = "";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(input.value.trim())) {
    emailError.textContent = "Enter a valid email address.";
  }
}

function validatePhone(input) {
  const phoneError = document.getElementById("phoneError");
  phoneError.textContent = "";

  if (!/^\d{10}$/.test(input.value.trim())) {
    phoneError.textContent = "Enter a valid 10-digit phone number.";
  }
}

function validatePassword(input) {
  const passwordError = document.getElementById("passwordError");
  passwordError.textContent = "";

  if (input.value.trim().length < 8) {
    passwordError.textContent = "Password must be at least 8 characters.";
  } else if (/\s/.test(input.value)) {
    passwordError.textContent = "Password cannot contain spaces.";
  }
}

function validateForm() {
  const inputs = document.querySelectorAll("form input[required]");

  for (const input of inputs) {
    input.dispatchEvent(new Event("input"));
    if (input.nextElementSibling.textContent) {
      return false;
    }
  }

  return true;
}

//validation
