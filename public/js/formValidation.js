import { Success, Failed } from "./toast.js";

$(document).ready(function () {
  const loadingOverlay = $("#loadingOverlay");
  const otpInputs = $(".otp-field input");

  otpInputs.on("input", function (e) {
    const input = $(this);
    const value = input.val();

    if (value.length === 1) {
      input.next("input").prop("disabled", false).focus();
    } else if (value.length === 0) {
      input.prev("input").focus();
    }
  });

  otpInputs.on("keydown", function (e) {
    if (e.key === "Backspace" && $(this).val().length === 0) {
      $(this).prev("input").focus();
    }
  });

  $("#name-input").on("input", function () {
    validateName(this);
  });
  $("#email-input").on("input", function () {
    validateEmail(this);
  });
  $("#phone-input").on("input", function () {
    validatePhone(this);
  });
  $("#password-input").on("input", function () {
    validatePassword(this);
  });

  $("#login-form").submit(async function (e) {
    e.preventDefault();
    const button = $("#login-button");
    button.prop("disabled", true);
    button.html(
      `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> logging in...`
    );
    const formData = new FormData(this);
    const formObject = {};
    formData.forEach((value, key) => {
      formObject[key] = value;
    });
    console.log(formObject);
    try {
      const res = await axios.post(`/user/login`, formObject, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(res.data);
      const { status, message } = res.data;
      if (status) {
        Success(message);
        window.location.href = "/user/homepage";
      }
    } catch (err) {
      Failed(err.response ? err.response.data.message : err.message);
      console.log(err?.message);
    } finally {
      button.prop("disabled", false);
      button.html(`login`);
    }
  });
  $("#signup-form").submit(async function (e) {
    e.preventDefault();
    const button = $("#signup-button");
    button.prop("disabled", true);
    button.html(
      `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Signing Up...`
    );
    const formData = new FormData(this);
    const formObject = {};
    formData.forEach((value, key) => {
      formObject[key] = value;
    });
    try {
      const res = await axios.post(`/user/signup`, formObject, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const { status, message } = res.data;
      if (status) {
        Success(message);
        const modalElement = $("#otpModal");
        const modal = new mdb.Modal(modalElement);
        modal.show();
        // window.location.href = "/user/emailverification";
      }
    } catch (err) {
      Failed(err.response ? err.response.data.message : err.message);
      console.log(err?.message);
    } finally {
      button.prop("disabled", false);
      button.html(`sign up`);
    }
  });

  $("#otp-form").submit(async function (e) {
    e.preventDefault();
    const button = $("#otp-button");
    button.prop("disabled", true);
    button.html(
      `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> verifyting...`
    );
    const otp = otpInputs
      .map(function () {
        return $(this).val();
      })
      .get()
      .join("");
    console.log(otp, otpInputs);
    try {
      const res = await axios.post(
        "/user/email-verification",
        { otp },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const { status, message } = res.data;
      console.log(res.data);
      if (status) {
        Success(message);
        window.location.href = "/user/homepage";
      }
    } catch (err) {
      Failed(err.response ? err.response.data.message : err.message);
      console.log(err?.message);
    } finally {
      button.prop("disabled", false);
      button.html(`verify`);
    }
  });
});

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
  const emailError = $("#emailError");
  emailError.text("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(input.value.trim())) {
    emailError.text("Enter a valid email address.");
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
