import { Success, Failed } from "./toast.js";

$(document).ready(function () {
  const initialData = $("#initial-data");
  let variant = initialData.data("variant");
  console.log(variant);
  $(".addtocart").click(function () {
    let id = $(this).data("path");
    updateQuantity(id);
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
});
