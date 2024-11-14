$(document).ready(function () {
  $(".salesChart").click(function (e) {
    e.preventDefault();
    let data = $(this).data("time");
    $.ajax({
      url: `/admin/chart/${data}`,
      method: "GET",
      success: function (res) {
        if (res.value) {
          Chart.getChart("myChart").destroy();
          const data = {
            labels: res.dates,
            datasets: [
              {
                label: "Sales count",
                data: res.pdCount,
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1,
              },
            ],
          };
          const ctx = document.getElementById("myChart").getContext("2d");
          const myChart = new Chart(ctx, {
            type: "bar",
            data: data,
            options: {
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            },
          });
        }
      },
      error: function (xhr, status, error) {
        console.error("Error updating quantity:", error);
      },
    });
  });
});
