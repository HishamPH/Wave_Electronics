import { Success, Failed } from "./toast.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

$(document).ready(function () {
  const loadingOverlay = $("#loadingOverlay");
  const initialData = $("#initial-data");
  let variant = initialData.data("variant");
  const colors = initialData.data("color");
  const storages = initialData.data("storage");
  const productId = initialData.data("product-id");
  generateColors();
  generateStorages();
  $(".addtocart").click(function () {
    let id = $(this).data("path");
    updateQuantity(id);
  });

  $("#color-group").on("click", ".color", async function (e) {
    const color = $(this).data("color");
    if (color == variant.color) return;
    try {
      loadingOverlay.css("display", "flex");
      const res = await axios.post(
        `/user/product/change-variant/${productId}`,
        {
          color,
          storage: variant.storage || "",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("hello");
      const { fullPrice, currentVariant, totalDiscount } = res.data;
      console.log(fullPrice, totalDiscount);
      variant = currentVariant;
      $("#full-price").text(`₹${fullPrice}`);
      $("#discount-price").text(
        `₹${(fullPrice - totalDiscount).toLocaleString("hi")}`
      );
      updateImages();
      updateStock(currentVariant.stock);
      generateColors();
    } catch (err) {
      Failed(err.response ? err.response.data.message : err.message);
      console.log(err.message);
    } finally {
      loadingOverlay.css("display", "none");
    }
  });

  $("#storage-group").on("click", ".storage", async function (e) {
    const storage = $(this).data("storage");
    if (storage == variant.storage) return;
    try {
      const res = await axios.post(
        `/user/product/change-variant/${productId}`,
        {
          color: variant.color || "",
          storage,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("hello");
      const { fullPrice, totalDiscount, currentVariant } = res.data;
      console.log(fullPrice, totalDiscount);
      variant = currentVariant;
      $("#full-price").text(`₹${fullPrice.toLocaleString("hi")}`);
      $("#discount-price").text(
        `₹${(fullPrice - totalDiscount).toLocaleString("hi")}`
      );
      updateStock(currentVariant.stock);
      generateStorages();
    } catch (err) {
      Failed(err.response ? err.response.data.message : err.message);
      console.log(err.message);
    }
  });

  async function updateQuantity(id) {
    try {
      const res = await axios.post(
        `/user/addtocart/${id}`,
        { variant },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(res);
      $("#cartCount").text(res.data.count);
      Success("added to cart");
    } catch (err) {
      Failed(err.response ? err.response.data.message : err.message);
      console.log(err.message);
    }
  }

  function generateColors() {
    let container = $("#color-group");
    container.empty();
    colors.forEach((item, index) => {
      let colorHTML = `
        <button class="btn me-3 rounded-0 color ${
          item == variant.color ? "btn-outline-primary" : "btn-outline-muted"
        }" data-color="${item}"> ${item}</button>`;
      container.append(colorHTML);
    });
  }

  function generateStorages() {
    let container = $("#storage-group");
    container.empty();
    storages.forEach((item, index) => {
      let storageHTML = `
        <button class="btn me-3 rounded-0 storage ${
          item == variant.storage ? "btn-outline-primary" : "btn-outline-muted"
        }" data-storage="${item}"> ${item}</button>`;
      container.append(storageHTML);
    });
  }

  function updateImages() {
    $("#image-1").attr("src", "/images/" + variant.images[0]);
    $("#image-2").attr("src", "/images/" + variant.images[1]);
    $("#image-3").attr("src", "/images/" + variant.images[2]);
  }

  function updateStock(stock) {
    const stockStatus = $("#stock-status");
    if (stock > 0) {
      stockStatus.text("In stock");
      stockStatus.removeClass("text-danger").addClass("text-success");
    } else {
      stockStatus.text("Out of stock");
      stockStatus.removeClass("text-success").addClass("text-danger");
    }
  }
});
