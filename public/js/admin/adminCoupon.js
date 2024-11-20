import { Success, Failed } from "../toast.js";

$(document).ready(function () {
  $(".deleteCoupon").click(function () {
    const id = $(this).data("id");
    console.log(id);
    deleteCoupon(id);
  });

  async function deleteCoupon(couponId) {
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
        const res = await axios.delete(`/admin/coupons/delete/${couponId}`);
        if (res.status) {
          const row = $(`#coupon-${couponId}`);
          row.remove();
          Success("coupon deleted");
        } else {
          Failed(`couldn't delete the coupon`);
        }
      }
    } catch (err) {
      Failed(err.response ? err.response.data.message : err.message);
      console.log(err?.message);
    }
  }
});
//href = "/admin/coupons/delete/<%= row._id%>";
