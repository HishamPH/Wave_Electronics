import { Failed, Success } from "../toast.js";

$(document).ready(function () {
  let categories = JSON.parse(cat);
  updateCategories();
  let modal;
  let editModal;

  $("#addCategoryButton").click(function () {
    $("#categoryName").val("");
    if (!modal) {
      modal = new mdb.Modal($("#addCategoryModal"));
    }
    modal.show();
  });

  $("#addCategory").click(async function () {
    try {
      const cat = $("#categoryName").val();
      if (!cat || cat.trim() == "") {
        Failed(`category can't be an empty string`);
        return;
      }
      const res = await axios.post(
        "/admin/add-category",
        { categoryName: cat },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      modal.hide();
      const { category } = res.data;
      categories.push(category);
      updateCategories();
    } catch (err) {
      Failed(err.response ? err.response.data.message : err.message);
      console.log(err?.message);
    }
  });

  let editId = null;

  $("#categoryContainer").on("click", ".editCategoryButton", async function () {
    editId = $(this).data("category-id");
    console.log(editId);
    const category = categories.find((item) => item._id == editId);
    if (!editModal) {
      console.log("hello");
      editModal = new mdb.Modal($("#editCategoryModal"));
    }
    $("#editCategoryName").val(category.categoryName);
    editModal.show();
  });

  $("#editCategorySubmit").click(async function () {
    try {
      const cat = $("#editCategoryName").val();
      console.log(editId);
      if (!cat || cat.trim() == "") {
        Failed(`category can't be an empty string`);
        return;
      }
      const res = await axios.post(
        `/admin/edit-category/${editId}`,
        { categoryName: cat.toUpperCase() },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      editModal.hide();
      const { category } = res.data;
      const current = categories.findIndex((item) => item._id == editId);
      categories.splice(current, 1, category);
      console.log(categories);
      updateCategories();
      editId = null;
    } catch (err) {
      Failed(err.response ? err.response.data.message : err.message);
      console.log(err?.message);
    }
  });

  $("#categoryContainer").on("click", ".deleteCategory", async function () {
    const deleteId = $(this).data("delete-id");
    console.log(deleteId);
    try {
      const result = await Swal.fire({
        title: "Delete Coupon",
        text: "Do you want to delete this coupon",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Remove",
      });
      if (result.isConfirmed) {
        const res = await axios.delete(`/admin/delete-category/${deleteId}`);
        const deleteIndex = categories.findIndex(
          (item) => item._id == deleteId
        );
        categories.splice(deleteIndex, 1);
        updateCategories();
        Success("category deleted successfully");
      }
    } catch (err) {
      Failed(err.response ? err.response.data.message : err.message);
      console.log(err?.message);
    }
  });

  function updateCategories() {
    const container = $("#categoryContainer");
    container.empty();
    categories.forEach((cat, index) => {
      const catHTML = `<div class="col-9">${cat.categoryName}</div>
                <div class="col-3 d-flex justify-content-between">
                    <button  class="btn btn-primary rounded-pill editCategoryButton" data-category-id="${cat._id}">EDIT</button>
                    <button  class="btn btn-danger  rounded-pill deleteCategory" data-delete-id="${cat._id}">REMOVE</button>                
                </div>`;

      container.append(catHTML);
    });
  }
});
