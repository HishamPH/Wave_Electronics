$(document).ready(() => {});

let cropper;
let currentPreviewId;
function openCropper(input, previewId) {
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      //edit
      console.log(previewId);
      let cropperImage;
      if (
        previewId === "imagePreview1" ||
        previewId === "imagePreview2" ||
        previewId === "imagePreview3"
      ) {
        $("#croppingSection").show();
        cropperImage = document.getElementById("cropperImage");
      } else {
        $("#croppingSection2").show();
        cropperImage = document.getElementById("cropperImage2");
      }

      cropperImage.src = e.target.result;
      currentPreviewId = previewId;

      //edit;
      // const cropperModal = new bootstrap.Modal(
      //   document.getElementById("cropperModal")
      // );
      // cropperModal.show();
      // cropperModal._element.addEventListener("shown.bs.modal", function () {
      if (cropper) {
        cropper.destroy();
      }
      cropper = new Cropper(cropperImage, {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 1,
      });
      //});
    };
    reader.readAsDataURL(file);
  }
}

function cropImage() {
  if (cropper) {
    const canvas = cropper.getCroppedCanvas({
      width: 300,
      height: 300,
    });

    const croppedImageURL = canvas.toDataURL("image/jpeg");
    const preview = document.getElementById(currentPreviewId);
    preview.src = croppedImageURL;
    preview.style.display = "block";
    const placeholder = document
      .querySelector(`#${currentPreviewId}`)
      .parentElement.querySelector(".placeholder-text");
    placeholder.style.display = "none";
    const fileInput = document.querySelector(
      `input#${currentPreviewId.replace("Preview", "")}`
    );
    const blob = dataURLToBlob(croppedImageURL);
    const croppedFile = new File([blob], "cropped-image.jpg", {
      type: "image/jpeg",
    });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(croppedFile);
    fileInput.files = dataTransfer.files;
    // const cropperModal = bootstrap.Modal.getInstance(
    //   document.getElementById("cropperModal")
    // );
    // cropperModal.hide();

    $("#croppingSection").hide();
    $("#croppingSection2").hide();
  }
}

//edit
function cancelCropping() {
  // Hide the cropping section
  $("#croppingSection").hide();
  $("#croppingSection2").hide();

  // Reset cropper state if necessary
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
}

//edit

function dataURLToBlob(dataURL) {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

//===============================================================================================================================

$(document).ready(function () {
  let colorVariants = [];
  let storageVariants = [];
  $("#addColorVariant").click(function () {
    const image1 = $("#image1")[0].files[0];
    const image2 = $("#image2")[0].files[0];
    const image3 = $("#image3")[0].files[0];
    const images = [image1, image2, image3];
    const name = $("#colorName").val();
    const price = $("#colorPrice").val();
    let isDefault = $("#colorDefault").prop("checked");
    const stock = $("#colorStock").val();
    if (name) {
      if (isDefault) colorVariants.forEach((v) => (v.isDefault = false));

      if (colorVariants.length === 0) isDefault = true;

      colorVariants.push({ name, price, isDefault, stock, images });
      updateColorVariantsDisplay();
      const modal = $("#colorModal");
      const modalInstance = mdb.Modal.getInstance(modal[0]);
      modalInstance.hide();
      $("#colorForm")[0].reset();
      $(".imagePreview").each(function () {
        $(this).attr("src", "").hide();
      });
      $(".placeholder-text").show();
    }
  });

  $("#addStorageVariant").click(function () {
    const image4 = $("#image4")[0].files[0];
    const image5 = $("#image5")[0].files[0];
    const image6 = $("#image6")[0].files[0];
    const images = [image4, image5, image6];
    const name = $("#storageName").val();
    const price = $("#storagePrice").val();
    let isDefault = $("#storageDefault").prop("checked");
    const stock = $("#storageStock").val();
    if (name) {
      if (isDefault) storageVariants.forEach((v) => (v.isDefault = false));
      if (storageVariants.length === 0) isDefault = true;
      storageVariants.push({ name, price, isDefault, stock, images });
      updateStorageVariantsDisplay();
      const modal = $("#storageModal");
      const modalInstance = mdb.Modal.getInstance(modal[0]);
      modalInstance.hide();
      $("#storageForm")[0].reset();
      $(".imagePreview").each(function () {
        $(this).attr("src", "").hide();
      });
      $(".placeholder-text").show();
    }
  });

  function updateColorVariantsDisplay() {
    const container = $("#colorVariants");
    container.empty();
    colorVariants.forEach((variant, index) => {
      let variantHTML = `
        <div class="variant-item">
          <div class="form-check mb-0">
            <input class="form-check-input" type="radio" name="colorVariant" id="color${index}" ${
        variant.isDefault ? "checked" : ""
      } onchange="updateColorDefault(${index})">
            <label class="form-check-label" for="color${index}">
              ${variant.name} ${variant.price > 0 ? `(+₹${variant.price})` : ""}
            </label>
          </div>
          <i class="fas fa-times delete-variant" onclick="deleteColorVariant(${index})"></i>
        </div>
      `;
      //================================================================

      variant.images.forEach((image, imageIndex) => {
        variantHTML += `
      <input type="file" name="color[${index}][images][${imageIndex}]" class="d-none" id="colorImage${index}_${imageIndex}">
    `;
        // Set the input's file object programmatically
        const hiddenFileInput = document.createElement("input");
        hiddenFileInput.type = "file";
        hiddenFileInput.name = `color[${index}][images][${imageIndex}]`;
        hiddenFileInput.className = "d-none";
        document.body.append(hiddenFileInput);

        // Assign the file object (assuming it's already in the `variant.images` array)
        const dataTransfer = new DataTransfer();
        if (image && image instanceof File) {
          console.log(
            `Adding file at color[${index}][images][${imageIndex}]`,
            image
          );
          dataTransfer.items.add(image);
        } else {
          console.error(
            `Invalid or undefined image at color[${index}][images][${imageIndex}]`,
            image
          );
        }
        hiddenFileInput.files = dataTransfer.files;
      });

      //================================================================

      container.append(variantHTML);
    });

    updateHiddenInputs();
  }

  function updateStorageVariantsDisplay() {
    const container = $("#storageVariants");
    container.empty();

    storageVariants.forEach((variant, index) => {
      let variantHTML = `
        <div class="variant-item">
          <div class="form-check mb-0">
            <input class="form-check-input" type="radio" name="storageVariant" id="storage${index}" ${
        variant.isDefault ? "checked" : ""
      } onchange="updateStorageDefault(${index})">
            <label class="form-check-label" for="storage${index}">
              ${variant.name} ${variant.price > 0 ? `(+₹${variant.price})` : ""}
            </label>
          </div>
          <i class="fas fa-times delete-variant" onclick="deleteStorageVariant(${index})"></i>
        </div>
      `;

      //=====================================

      variant.images.forEach((image, imageIndex) => {
        variantHTML += `
      <input type="file" name="storage[${index}][images][${imageIndex}]" class="d-none" id="storageImage${index}_${imageIndex}">
    `;
        // Set the input's file object programmatically
        const hiddenFileInput = document.createElement("input");
        hiddenFileInput.type = "file";
        hiddenFileInput.name = `storage[${index}][images][${imageIndex}]`;
        hiddenFileInput.className = "d-none";
        document.body.append(hiddenFileInput);

        // Assign the file object (assuming it's already in the `variant.images` array)
        const dataTransfer = new DataTransfer();
        if (image && image instanceof File) {
          console.log(
            `Adding file at storage[${index}][images][${imageIndex}]`,
            image
          );
          dataTransfer.items.add(image);
        } else {
          console.error(
            `Invalid or undefined image at storage[${index}][images][${imageIndex}]`,
            image
          );
        } // Add the file object
        hiddenFileInput.files = dataTransfer.files;
      });

      //======================================
      container.append(variantHTML);
    });

    updateHiddenInputs();
  }

  window.updateColorDefault = function (index) {
    colorVariants.forEach((v, i) => (v.isDefault = i === index));
    updateHiddenInputs();
  };

  window.updateStorageDefault = function (index) {
    storageVariants.forEach((v, i) => (v.isDefault = i === index));
    updateHiddenInputs();
  };

  window.deleteColorVariant = function (index) {
    colorVariants.splice(index, 1);
    if (colorVariants.length > 0 && !colorVariants.some((v) => v.isDefault))
      colorVariants[0].isDefault = true;
    updateColorVariantsDisplay();
  };

  window.deleteStorageVariant = function (index) {
    storageVariants.splice(index, 1);
    if (storageVariants.length > 0 && !storageVariants.some((v) => v.isDefault))
      storageVariants[0].isDefault = true;
    updateStorageVariantsDisplay();
  };
  function updateHiddenInputs() {
    console.log("hiiiii");
    // $("#selectedColorVariant").val(JSON.stringify(colorVariants));
    // $("#selectedStorageVariant").val(JSON.stringify(storageVariants));
  }

  $("#addProduct").submit(async function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    //Append storage variants
    storageVariants.forEach((variant, storageIndex) => {
      formData.append(`storage[${storageIndex}][variant]`, variant.name);
      formData.append(`storage[${storageIndex}][price]`, variant.price);
      formData.append(`storage[${storageIndex}][default]`, variant.isDefault);
      formData.append(`storage[${storageIndex}][stock]`, variant.stock);
      // Append each image file in this variant
      variant.images.forEach((image, imageIndex) => {
        if (image) {
          formData.append(
            `storage[${storageIndex}][images][${imageIndex}]`,
            image
          );
          formData.append(
            `storage[${storageIndex}][imageNames][${imageIndex}]`,
            `storage[${storageIndex}][images][${imageIndex}]`
          );
        } else {
          formData.append(
            `storage[${storageIndex}][imageNames][${imageIndex}]`,
            false
          );
        }
      });
    });

    // // Append color variants
    colorVariants.forEach((variant, colorIndex) => {
      formData.append(`color[${colorIndex}][variant]`, variant.name);
      formData.append(`color[${colorIndex}][price]`, variant.price);
      formData.append(`color[${colorIndex}][default]`, variant.isDefault);
      formData.append(`color[${colorIndex}][stock]`, variant.stock);
      // Append each image file in this variant
      variant.images.forEach((image, imageIndex) => {
        if (image) {
          formData.append(`color[${colorIndex}][images][${imageIndex}]`, image);
          formData.append(
            `color[${colorIndex}][imageNames][${imageIndex}]`,
            `color[${colorIndex}][images][${imageIndex}]`
          );
        } else {
          formData.append(
            `color[${colorIndex}][imageNames][${imageIndex}]`,
            false
          );
        }
      });
    });

    // Debugging: Log FormData key-value pairs
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const res = await axios.post("/admin/addproduct", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  });
});

//===========================================================================================================================
// document.addEventListener("DOMContentLoaded", function () {
//   let colorVariants = [];
//   let storageVariants = [];

//   // Add Color Variant
//   document
//     .getElementById("addColorVariant")
//     .addEventListener("click", function () {
//       const name = document.getElementById("colorName").value;
//       const price = document.getElementById("colorPrice").value;
//       const isDefault = document.getElementById("colorDefault").checked;

//       if (name) {
//         // If this is set as default, unset others
//         if (isDefault) {
//           colorVariants.forEach((v) => (v.isDefault = false));
//         }

//         // If this is the first variant, make it default
//         if (colorVariants.length === 0) {
//           isDefault = true;
//         }

//         colorVariants.push({ name, price, isDefault });
//         updateColorVariantsDisplay();

//         // Close modal and reset form
//         const modal = document.getElementById("colorModal");
//         const modalInstance = mdb.Modal.getInstance(modal);
//         modalInstance.hide();
//         document.getElementById("colorForm").reset();
//       }
//     });

//   // Add Storage Variant
//   document
//     .getElementById("addStorageVariant")
//     .addEventListener("click", function () {
//       const name = document.getElementById("storageName").value;
//       const price = document.getElementById("storagePrice").value;
//       const isDefault = document.getElementById("storageDefault").checked;

//       if (name) {
//         // If this is set as default, unset others
//         if (isDefault) {
//           storageVariants.forEach((v) => (v.isDefault = false));
//         }

//         // If this is the first variant, make it default
//         if (storageVariants.length === 0) {
//           isDefault = true;
//         }

//         storageVariants.push({ name, price, isDefault });
//         updateStorageVariantsDisplay();

//         // Close modal and reset form
//         const modal = document.getElementById("storageModal");
//         const modalInstance = mdb.Modal.getInstance(modal);
//         modalInstance.hide();
//         document.getElementById("storageForm").reset();
//       }
//     });

//   function updateColorVariantsDisplay() {
//     const container = document.getElementById("colorVariants");
//     container.innerHTML = colorVariants
//       .map(
//         (variant, index) => `
//       <div class="variant-item">
//         <div class="form-check mb-0">
//           <input class="form-check-input" type="radio" name="colorVariant"
//                  id="color${index}" ${variant.isDefault ? "checked" : ""}
//                  onchange="updateColorDefault(${index})">
//           <label class="form-check-label" for="color${index}">
//             ${variant.name} ${variant.price > 0 ? `(+₹${variant.price})` : ""}
//           </label>
//         </div>
//         <i class="fas fa-times delete-variant" onclick="deleteColorVariant(${index})"></i>
//       </div>
//     `
//       )
//       .join("");
//     updateHiddenInputs();
//   }

//   function updateStorageVariantsDisplay() {
//     const container = document.getElementById("storageVariants");
//     container.innerHTML = storageVariants
//       .map(
//         (variant, index) => `
//       <div class="variant-item">
//         <div class="form-check mb-0">
//           <input class="form-check-input" type="radio" name="storageVariant"
//                  id="storage${index}" ${variant.isDefault ? "checked" : ""}
//                  onchange="updateStorageDefault(${index})">
//           <label class="form-check-label" for="storage${index}">
//             ${variant.name} ${variant.price > 0 ? `(+₹${variant.price})` : ""}
//           </label>
//         </div>
//         <i class="fas fa-times delete-variant" onclick="deleteStorageVariant(${index})"></i>
//       </div>
//     `
//       )
//       .join("");
//     updateHiddenInputs();
//   }

//   window.updateColorDefault = function (index) {
//     colorVariants.forEach((v, i) => (v.isDefault = i === index));
//     updateHiddenInputs();
//   };

//   window.updateStorageDefault = function (index) {
//     storageVariants.forEach((v, i) => (v.isDefault = i === index));
//     updateHiddenInputs();
//   };

//   window.deleteColorVariant = function (index) {
//     colorVariants.splice(index, 1);
//     if (colorVariants.length > 0 && !colorVariants.some((v) => v.isDefault)) {
//       colorVariants[0].isDefault = true;
//     }
//     updateColorVariantsDisplay();
//   };

//   window.deleteStorageVariant = function (index) {
//     storageVariants.splice(index, 1);
//     if (
//       storageVariants.length > 0 &&
//       !storageVariants.some((v) => v.isDefault)
//     ) {
//       storageVariants[0].isDefault = true;
//     }
//     updateStorageVariantsDisplay();
//   };

//   function updateHiddenInputs() {
//     document.getElementById("selectedColorVariant").value =
//       JSON.stringify(colorVariants);
//     document.getElementById("selectedStorageVariant").value =
//       JSON.stringify(storageVariants);
//   }

//   // Form submission validation
//   document
//     .getElementById("productForm")
//     .addEventListener("submit", function (e) {
//       if (colorVariants.length === 0 || storageVariants.length === 0) {
//         e.preventDefault();
//         alert("Please add at least one color and one storage variant.");
//       }
//     });
// });
