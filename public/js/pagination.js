import { Success, Failed } from "./toast.js";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

$(document).ready(function () {
  $("#search-input").on(
    "input",
    debounce(() => handleSearch(1), 500)
  );

  $("#search-addon").on("click", function () {
    handleSearch();
  });

  async function handleSearch(currPage = 1) {
    const loading = $("#loadingOverlay");
    const query = $("#search-input").val().trim();
    const sort = $(`input[name="order"]:checked`).val();
    const checked = $(`#filter input[name="filter"][type="checkbox"]:checked`);
    let filters = checked
      .map(function () {
        return $(this).val();
      })
      .get();
    if (filters.length === 0) {
      filters = $(`#filter input[name="filter"][type="checkbox"]`)
        .map(function () {
          return $(this).val();
        })
        .get();
    }
    const page = Number(currPage);
    try {
      loading.removeClass("d-none");
      await delay(2000);
      const res = await axios.post(
        "/user/filters",
        { filters },
        {
          params: {
            sort: sort,
            query: query,
            page: page,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const { totalPages, currentPage, products, wishlist } = res.data;
      console.log(res.data);
      updateProducts(products, wishlist, totalPages, currentPage);
      loading.addClass("d-none");
    } catch (err) {
      Failed(err.response ? err.response.data.message : err.message);
      console.log(err.message);
    }
    console.log("Searching for:", query);
  }

  $(".filter").on("change", function (e) {
    handleSearch();
  });

  $("#pagination-buttons").on("click", ".page-link", function (e) {
    e.preventDefault();
    let page = $(this).text();
    handleSearch(page);
  });
});

function updateProducts(products, wishlist, totalPages, currentPage) {
  const container = $("#searchResult");
  container.empty();
  const page = $("#pagination-buttons");
  page.empty();
  if (products.length === 0) {
    const html = `<div class="d-flex justify-content-center align-items-center ">
          <div>
            No items found
          </div> 
        </div>`;
    container.append(html);
    return;
  }

  products.forEach((row) => {
    row.defaultVariant = row.variant.find((variant) => variant.default);
    let wishImage = "heart-white";
    if (wishlist.includes(row._id.toString())) {
      wishImage = "heart";
    }
    const html = `
      <div class="col-xl-3 col-lg-4 col-md-6 ">
        <div class="card rounded-0 ">
           ${
             row.offer
               ? `<span class="badge position-absolute  p-2  bg-danger w-auto rounded-0  " style="top: 15px; right: 15px;">
              - ${row.offer.percentage}%
            </span>`
               : ""
           }
            
          <img src="/images/${
            row.defaultVariant.images[0]
          }" class="card-img-top card-img-auto" alt="Product Image" style="object-fit: cover;">
          <div class="card-body bg-white" style="height: 220px;">
            <a href="/user/detail/${row._id}">
                <div class="card-title m-0 text-truncate fw-bold ">${
                  row.productName
                }</div>
                <p class="card-text fw-bold text-dark mb-2 ">₹${row.defaultPrice.toLocaleString(
                  "hi"
                )}</p>
                <p class="card-text text-truncate text-black " style="height: 48px;">${
                  row.spec1
                }</p>
                
            </a>
            <div class="d-flex justify-content-between mt-3">
              <button data-path="${
                row._id
              }" class="btn btn-dark rounded-pill addtocart" data-mdb-ripple-init>Add to cart</button>
              
                <button data-path="${
                  row._id
                }" class="btn d-flex justify-content-center align-items-center rounded-circle wishlist" style="height: 50px; width: 50px;background-color:#dadada;"><img src="/img/${wishImage}.png" style="width: 30px; height: 30px;" alt="heart"></button>
            </div>
          </div>
        </div>
    </div>`;
    container.append(html);
  });

  for (let i = 1; i <= totalPages; i++) {
    const pageHTML = `<li class="page-item ${
      i == currentPage ? "active" : ""
    }" ><button class="page-link" name="page">${i}</button></li>`;
    page.append(pageHTML);
  }
}

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}
