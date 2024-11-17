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

      $("#croppingSection").show();
      cropperImage = document.getElementById("cropperImage");

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
  }
}

//edit
function cancelCropping() {
  $("#croppingSection").hide();
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
  const initialData = $("#initial-data");
  const color = initialData.data("color");
  const storage = initialData.data("storage");

  let colorVariants = color || [];
  let storageVariants = storage || [];
  updateColorVariantsDisplay();
  console.log(colorVariants);
  $("#addColorVariant").click(function () {
    const image1 = $("#image1")[0].files[0];
    const image2 = $("#image2")[0].files[0];
    const image3 = $("#image3")[0].files[0];
    const images = [image1, image2, image3];
    const variant = $("#colorName").val();
    const price = $("#colorPrice").val();
    let isDefault = $("#colorDefault").prop("checked");
    const stock = $("#colorStock").val();
    if (name) {
      if (isDefault) colorVariants.forEach((v) => (v.default = false));

      if (colorVariants.length === 0) isDefault = true;

      colorVariants.push({ variant, price, default: isDefault, stock, images });
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
    const name = $("#storageName").val();
    const price = $("#storagePrice").val();
    let isDefault = $("#storageDefault").prop("checked");
    const stock = $("#storageStock").val();
    if (name) {
      if (isDefault) storageVariants.forEach((v) => (v.default = false));
      if (storageVariants.length === 0) isDefault = true;
      storageVariants.push({ name, price, default: isDefault, stock });
      updateStorageVariantsDisplay();
      const modal = $("#storageModal");
      const modalInstance = mdb.Modal.getInstance(modal[0]);
      modalInstance.hide();
      $("#storageForm")[0].reset();
      // $(".imagePreview").each(function () {
      //   $(this).attr("src", "").hide();
      // });
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
        variant.default ? "checked" : ""
      } onchange="updateColorDefault(${index})">
            <label class="form-check-label" for="color${index}">
              ${variant.variant} ${
        variant.price > 0 ? `(+₹${variant.price})` : ""
      }
            </label>
          </div>
          <i class="fas fa-times delete-variant deleteColor" data-index="${index}""></i>
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
        variant.default ? "checked" : ""
      } onchange="updateStorageDefault(${index})">
            <label class="form-check-label" for="storage${index}">
              ${variant.variant} ${
        variant.price > 0 ? `(+₹${variant.price})` : ""
      }
            </label>
          </div>
          <i class="fas fa-times delete-variant deleteStorage" data-index="${index}"></i>
        </div>
      `;

      //=====================================

      //======================================
      container.append(variantHTML);
    });

    updateHiddenInputs();
  }

  window.updateColorDefault = function (index) {
    colorVariants.forEach((v, i) => (v.default = i === index));
    updateHiddenInputs();
  };

  window.updateStorageDefault = function (index) {
    storageVariants.forEach((v, i) => (v.default = i === index));
    updateHiddenInputs();
  };

  $("#colorVariants").on("click", ".deleteColor", function (e) {
    const id = $(this).data("index");
    colorVariants.splice(id, 1);
    if (colorVariants.length > 0 && !colorVariants.some((v) => v.default))
      colorVariants[0].default = true;
    updateColorVariantsDisplay();
  });

  $("#storageVariants").on("click", ".deleteStorage", function (e) {
    const id = $(this).data("index");
    storageVariants.splice(id, 1);
    if (storageVariants.length > 0 && !storageVariants.some((v) => v.default))
      storageVariants[0].default = true;
    updateStorageVariantsDisplay();
  });

  window.deleteColorVariant = function (index) {};

  window.deleteStorageVariant = function (index) {};
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
      formData.append(`storage[${storageIndex}][default]`, variant.default);
      formData.append(`storage[${storageIndex}][stock]`, variant.stock);
      // Append each image file in this variant
    });

    // // Append color variants
    colorVariants.forEach((variant, colorIndex) => {
      formData.append(`color[${colorIndex}][variant]`, variant.name);
      formData.append(`color[${colorIndex}][price]`, variant.price);
      formData.append(`color[${colorIndex}][default]`, variant.default);
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

function editColorVariantModal() {}
