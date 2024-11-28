import { Success, Failed } from "../toast.js";

$(document).ready(function () {
  const loadingOverlay = $("#loadingOverlay");
  $("#add-category").submit(async function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const formObject = {};
    formData.forEach((value, key) => {
      formObject[key] = value;
    });
    try {
      loadingOverlay.removeClass("d-none");
      const res = await axios.post(
        "/admin/add-category",
        {
          ...formObject,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const { message, status } = res.data;
      if (status) {
        Success(message);
        window.location.reload();
      }
    } catch (err) {
      Failed(err.response ? err.response.data.message : err.message);
      console.log(err?.message);
    } finally {
      loadingOverlay.addClass("d-none");
    }
  });

  $(".edit-category").submit(async function (e) {
    e.preventDefault();
    const categoryId = $(this).data("category-id");
    const formData = new FormData(this);
    const formObject = {};
    formData.forEach((value, key) => {
      formObject[key] = value;
    });
    try {
      loadingOverlay.removeClass("d-none");
      const res = await axios.post(
        `/admin/edit-category/${categoryId}`,
        {
          ...formObject,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const { message, status } = res.data;
      if (status) {
        Success(message);
        window.location.reload();
      }
    } catch (err) {
      Failed(err.response ? err.response.data.message : err.message);
      console.log(err?.message);
    } finally {
      loadingOverlay.addClass("d-none");
    }
  });

  $("#category-table").on("click", ".blockCategory", async function () {
    console.log("hello");
    const categoryId = $(this).data("category-id");
    try {
      loadingOverlay.removeClass("d-none");
      const res = await axios.put(`/admin/block-category/${categoryId}`);
      const { message, status } = res.data;
      if (status) {
        Success(message);
        window.location.reload();
      }
    } catch (err) {
      Failed(err.response ? err.response.data.message : err.message);
      console.log(err?.message);
    } finally {
      loadingOverlay.addClass("d-none");
    }
  });
});
