import { Success, Failed } from "./toast.js";

const loading = $("#loadingOverlay");
const container = $("#searchResult");
const page = $("#pagination-buttons");
$(document).ready(function () {
  $("#search-input").on(
    "input",
    debounce(() => handleSearch(1), 500)
  );

  $("#search-addon").on("click", function () {
    handleSearch();
  });

  async function handleSearch(currPage = 1) {
    page.empty();
    container.html(
      `<span class="spinner-border text-primary" role="status" aria-hidden="true"></span>`
    );
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
    const pageNumber = Number(currPage);
    try {
      const res = await axios.post(
        "/guest/filters",
        { filters },
        {
          params: {
            sort: sort,
            query: query,
            page: pageNumber,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const { totalPages, currentPage, products } = res.data;
      console.log(res.data);
      updateProducts(products, totalPages, currentPage);
    } catch (err) {
      Failed(err.response ? err.response.data.message : err.message);
      console.log(err.message);
    }
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

function updateProducts(products, totalPages, currentPage) {
  container.empty();
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
    const html = `
      <div class="col-xl-3 col-lg-4 col-md-6 ">
        <div class="card rounded-0 ">
           ${
             row.category?.offer > 0
               ? `<span class="badge position-absolute  p-2  bg-danger w-auto rounded-0  " style="top: 15px; right: 15px;">
              - ${row.category.offer}%
            </span>`
               : ""
           }
            
          <img src="/images/${
            row.defaultVariant.images[0]
          }" class="card-img-top card-img-auto" alt="Product Image" style="object-fit: cover;">
          <div class="card-body bg-white" style="height: 220px;">
            <a href="/guest/product-detail/${row._id}">
                <div class="card-title m-0 text-truncate fw-bold ">${
                  row.productName
                }</div>
                <p class="card-text fw-bold text-dark mb-2 ">₹${row.finalPrice.toLocaleString(
                  "hi"
                )}</p>
                <p class="card-text text-truncate text-black " style="height: 48px;">${
                  row.spec1
                }</p>
                
            </a>
            <div class="d-flex justify-content-between mt-3">
              <a href="/user/login">
                                    <button class="btn btn-primary px-3 rounded-pill">
                                        <i class="fa fa-shopping-cart mr-1"></i> Add To cart
                                    </button>
                                </a>
              
                
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
