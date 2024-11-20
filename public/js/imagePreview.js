//const { Success, Failed } = require("./toast.js");

$(document).ready(() => {});

let cropper;
let currentPreviewId;
function openCropper(input, previewId) {
  console.log("the cropper has been summoned");
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
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
        $("#editCroppingSection").show();
        cropperImage = document.getElementById("editCropperImage");
      }

      cropperImage.src = e.target.result;
      currentPreviewId = previewId;
      if (cropper) {
        cropper.destroy();
      }
      cropper = new Cropper(cropperImage, {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 1,
      });
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
    $("#croppingSection").hide();
    $("#editCroppingSection").hide();
  }
}

//edit
function cancelCropping() {
  $("#croppingSection").hide();
  $("#editCroppingSection").hide();
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
  const variant = initialData.data("variant");

  let variants = variant || [];
  updateVariantsDisplay();
  $("#addVariant").click(function () {
    try {
      const image1 = $("#image1")[0].files[0];
      const image2 = $("#image2")[0].files[0];
      const image3 = $("#image3")[0].files[0];
      const images = [image1, image2, image3];
      const color = $("#variantColor").val();
      const storage = $("#variantStorage").val();
      const price = $("#variantPrice").val();
      let isDefault = $("#variantDefault").prop("checked");
      const stock = $("#variantStock").val();
      console.log(color, storage, price, stock, isDefault);
      if (color && storage) {
        if (isDefault) variants.forEach((v) => (v.default = false));
        if (variants.length === 0) isDefault = true;
        variants.push({
          color,
          storage,
          price,
          default: isDefault,
          stock,
          images,
        });
        console.log(variants);
        updateVariantsDisplay();
        const modal = $("#variantModal");
        const modalInstance = mdb.Modal.getInstance(modal);
        modalInstance.hide();
        $("#variantForm")[0].reset();
        $(".imagePreview").each(function () {
          $(this).attr("src", "").hide();
        });
        $(".placeholder-text").show();
      }
    } catch (error) {
      console.log(error);
    }
  });

  function updateVariantsDisplay() {
    const container = $("#variants");
    container.empty();
    variants.forEach((variant, index) => {
      let variantHTML = `
        <div class="variant-item">
          <div class="form-check mb-0">
            <input class="form-check-input" type="radio" name="variantGood" id="variant${index}" ${
        variant.default ? "checked" : ""
      } onchange="updateVariantDefault(${index})">
            <label class="form-check-label" for="variant${index}">
              ${variant.color} ${variant.storage} ${
        variant.price > 0 ? `(+₹${variant.price})` : ""
      }
            </label>
          </div>
          <i class="fas fa-pencil edit-variant editVariant" data-index="${index}""></i>
          <i class="fas fa-times delete-variant deleteVariant" data-index="${index}""></i>
        </div>
      `;
      //================================================================

      variant.images.forEach((image, imageIndex) => {
        variantHTML += `
      <input type="file" name="variant[${index}][images][${imageIndex}]" class="d-none" id="variantImage${index}_${imageIndex}">
    `;
        // Set the input's file object programmatically
        const hiddenFileInput = document.createElement("input");
        hiddenFileInput.type = "file";
        hiddenFileInput.name = `variant[${index}][images][${imageIndex}]`;
        hiddenFileInput.className = "d-none";
        document.body.append(hiddenFileInput);
        const dataTransfer = new DataTransfer();
        if (image && image instanceof File) {
          console.log(
            `Adding file at variant[${index}][images][${imageIndex}]`,
            image
          );
          dataTransfer.items.add(image);
        } else {
          // console.error(
          //   `Invalid or undefined image at variant[${index}][images][${imageIndex}]`,
          //   image
          // );
        }
        hiddenFileInput.files = dataTransfer.files;
      });

      //================================================================

      container.append(variantHTML);
    });

    updateHiddenInputs();
  }

  window.updateVariantDefault = function (index) {
    console.log("hellooooooooo");
    variants.forEach((v, i) => (v.default = i === index));
    updateHiddenInputs();
  };

  // let modal = null;

  $("#variants").on("click", ".editVariant", function (e) {
    const id = $(this).data("index");
    const variant = variants[id];

    const modalElement = $("#editVariantModal");
    modal = new mdb.Modal(modalElement);
    // Populate modal fields
    $("#editVariantColor").val(variant.color);
    $("#editVariantStorage").val(variant.storage);
    $("#editVariantPrice").val(variant.price || 0);
    $("#editVariantStock").val(variant.stock || 0);
    $("#editVariantDefault").prop("checked", variant.default);
    for (let i = 4; i <= 6; i++) {
      const image = variant.images?.[i - 4] || "";
      const preview = $(`#imagePreview${i}`);
      const placeholder = $(`#placeholder${i}`);
      if (image) {
        preview.attr("src", `/images/${image}`).show();
        placeholder.hide();
      } else {
        preview.hide();
        placeholder.show();
      }
    }
    modal.show();
    $("#editVariant")
      .off("click")
      .on("click", function (e) {
        e.preventDefault();
        const image1 = $("#image4")[0].files[0] || variant.images[0];
        const image2 = $("#image5")[0].files[0] || variant.images[1];
        const image3 = $("#image6")[0].files[0] || variant.images[2];
        const images = [image1, image2, image3];
        const updatedVariant = {
          color: $("#editVariantColor").val(),
          storage: $("#editVariantStorage").val(),
          price: parseFloat($("#editVariantPrice").val()) || 0,
          stock: parseInt($("#editVariantStock").val()) || 0,
          default: $("#editVariantDefault").prop("checked"),
          images,
        };
        if (updatedVariant.default)
          variants.forEach((v) => (v.default = false));
        variants[id] = updatedVariant;
        modal.hide();
        updateVariantsDisplay();
      });
  });

  $("#editVariantModal").on("hidden.mdb.modal", function () {
    $("#editVariant").off("click"); // Remove any lingering event listeners
  });

  $("#variants").on("click", ".deleteVariant", function (e) {
    const id = $(this).data("index");
    variants.splice(id, 1);
    if (variants.length > 0 && !variants.some((v) => v.default))
      variants[0].default = true;
    updateVariantsDisplay();
  });

  function updateHiddenInputs() {
    $("#selectedColorVariant").val(JSON.stringify(variants));
  }

  $("#addProduct").submit(async function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    appendForm(formData, variants);
    const res = await axios.post("/admin/addproduct", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    window.location.href = "/admin/products";
  });
  $("#editProduct").submit(async function (e) {
    e.preventDefault();
    const productId = $(this).data("product-id");
    const formData = new FormData(this);
    appendForm(formData, variants);
    const res = await axios.post(`/admin/editproduct/${productId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    window.location.reload();
    console.log(res.data);
  });
});

function appendForm(formData, variants) {
  variants.forEach((variant, index) => {
    // Append basic fields
    formData.append(`variant[${index}][color]`, variant.color);
    formData.append(`variant[${index}][storage]`, variant.storage);
    formData.append(`variant[${index}][price]`, variant.price);
    formData.append(`variant[${index}][default]`, variant.default);
    formData.append(`variant[${index}][stock]`, variant.stock);

    // Append images
    variant.images.forEach((image, imgIndex) => {
      if (image) {
        // Add the image file
        formData.append(`variant[${index}][images][${imgIndex}]`, image);

        // Add image name if needed
        formData.append(
          `variant[${index}][imageNames][${imgIndex}]`,
          `variant[${index}][images][${imgIndex}]`
        );
      } else {
        // Add placeholder for missing image
        formData.append(`variant[${index}][imageNames][${imgIndex}]`, false);
      }
    });
  });
}
