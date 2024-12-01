import { Success, Failed } from "../toast.js";

$(document).ready(function () {
  const loadingOverlay = $("#loadingOverlay");
  $("#cancelOrder").click(async function () {
    const orderId = $(this).data("cancel-id");
    try {
      const result = await Swal.fire({
        title: "Cancel Order",
        text: "Do you want to cancel this order",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Don't cancel",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "yes",
      });
      if (result.isConfirmed) {
        const res = await axios.put(`/user/order/cancel-order/${orderId}`);
        const { status, message } = res.data;
        if (status) {
          await Swal.fire({
            icon: "success",
            title: message,
            showConfirmButton: false,
            timer: 1500,
          });
          window.location.reload();
        }
      }
    } catch (err) {
      Failed(err.response ? err.response.data.message : err.message);
      console.log(err.message);
    }
  });

  //updateProgress(3);
  $("#invoice").click(async function (e) {
    e.preventDefault();
    const company = $("#name").text();
    const address = $("#address").text();
    const zip = $("#zip").text();
    const city = $("#city").text();
    const country = $("#country").text();
    const quantity = Number($("#pdq").text());
    const description = $("#pdname").text();
    const price = Number($("#pdprice").text());
    const date = $("#date").text();
    const orderId = $("#orderId").text();
    const coupon = Number($("#coupon").text());
    var data = {
      // apiKey: "free",
      // mode: "development",
      sender: {
        company: "Wave Electronics",
        address: "NY Street 123",
        zip: "1234 AB",
        city: "Illinois",
        country: "Azerbaijan",
      },
      client: {
        company: company,
        address: address,
        zip: zip,
        city: city,
        country: country,
      },
      information: {
        number: orderId,
        date: date,
      },
      products: [
        {
          quantity: quantity,
          description: description,
          "tax-rate": -coupon,
          price: price,
        },
      ],
      "bottom-notice": "Kindly pay your invoice within 15 days.",
      settings: {
        currency: "INR",
        "tax-notation": "coupon",
        "margin-top": 25,
        "margin-right": 25,
        "margin-left": 25,
        "margin-bottom": 25,
      },
    };
    let result = await easyinvoice.createInvoice(data);
    easyinvoice.download("myInvoice.pdf", result.pdf);
  });

  $("#review-form").submit(async function (e) {
    e.preventDefault();
    loadingOverlay.removeClass("d-none");
    const formData = new FormData(this);
    const orderId = $(this).data("order-id");
    const formObject = {};
    formData.forEach((value, key) => {
      formObject[key] = value;
    });
    console.log(formObject);
    try {
      const res = await axios.post(
        `/user/review-product/${orderId}`,
        { ...formObject },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const { status, message } = res.data;
      if (status) {
        loadingOverlay.addClass("d-none");
        await Swal.fire({
          icon: "success",
          title: message,
          showConfirmButton: false,
          timer: 1500,
        });
        window.location.reload();
      }
    } catch (err) {
      Failed(err.response ? err.response.data.message : err.message);
      console.log(err.message);
    }
  });
});

function updateProgress(currentStep) {
  const totalSteps = document.querySelectorAll(".step").length; // Total steps in the tracker
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 90; // Calculate progress

  // Update CSS variable for progress
  const stepsContainer = document.querySelector(".steps");
  stepsContainer.style.setProperty(
    "--progress-width",
    `${progressPercentage}%`
  );

  // Update step states
  const steps = document.querySelectorAll(".step");
  steps.forEach((step, index) => {
    if (index < currentStep) {
      step.classList.remove("incomplete");
      step.querySelector(".step-icon").textContent = "✓"; // Mark as complete
    } else {
      step.classList.add("incomplete");
      step.querySelector(".step-icon").textContent = "●"; // Mark as incomplete
    }
  });
}

// Example: Set progress to step 3
