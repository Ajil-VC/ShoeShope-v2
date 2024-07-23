document.addEventListener('DOMContentLoaded', function() {
    "use strict";

    /*Sale statistics Chart*/
    if (document.getElementById('myChart')) {
        var ctx = document.getElementById('myChart').getContext('2d');
        var chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Sales',
                    tension: 0.3,
                    fill: true,
                    backgroundColor: 'rgba(44, 120, 220, 0.2)',
                    borderColor: 'rgba(44, 120, 220)',
                    data: []  // We'll fetch this data from the backend
                },
                {
                    label: 'Products',
                    tension: 0.3,
                    fill: true,
                    backgroundColor: 'rgba(380, 200, 230, 0.2)',
                    borderColor: 'rgb(380, 200, 230)',
                    data: []  // We'll fetch this data from the backend
                }]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            usePointStyle: true,
                        },
                    }
                }
            }
        });

        // Fetch data from backend
        fetch('/admin/api/sales-data')
            .then(response => response.json())
            .then(data => {
                chart.data.datasets[0].data = data.sales;
                chart.data.datasets[1].data = data.products;
                chart.update();
            })
            .catch(error => console.error('Error fetching sales data:', error));
    }

    /*Sale statistics Chart 2*/
    // if (document.getElementById('myChart2')) {
    //     var ctx = document.getElementById("myChart2").getContext('2d');
    //     var myChart = new Chart(ctx, {
    //         type: 'bar',
    //         data: {
    //             labels: ["900", "1200", "1400", "1600"],
    //             datasets: [
    //                 {
    //                     label: "US",
    //                     backgroundColor: "#5897fb",
    //                     barThickness: 10,
    //                     data: []  // We'll fetch this data from the backend
    //                 },
    //                 {
    //                     label: "Europe",
    //                     backgroundColor: "#7bcf86",
    //                     barThickness: 10,
    //                     data: []  // We'll fetch this data from the backend
    //                 },
    //                 {
    //                     label: "Asian",
    //                     backgroundColor: "#ff9076",
    //                     barThickness: 10,
    //                     data: []  // We'll fetch this data from the backend
    //                 },
    //                 {
    //                     label: "Africa",
    //                     backgroundColor: "#d595e5",
    //                     barThickness: 10,
    //                     data: []  // We'll fetch this data from the backend
    //                 },
    //             ]
    //         },
    //         options: {
    //             plugins: {
    //                 legend: {
    //                     labels: {
    //                         usePointStyle: true,
    //                     },
    //                 }
    //             },
    //             scales: {
    //                 y: {
    //                     beginAtZero: true
    //                 }
    //             }
    //         }
    //     });

    //     // Fetch data from backend
    //     // fetch('/api/region-sales')
    //     //     .then(response => response.json())
    //     //     .then(data => {
    //     //         myChart.data.datasets[0].data = data.us;
    //     //         myChart.data.datasets[1].data = data.europe;
    //     //         myChart.data.datasets[2].data = data.asian;
    //     //         myChart.data.datasets[3].data = data.africa;
    //     //         myChart.update();
    //     //     })
    //     //     .catch(error => console.error('Error fetching region sales data:', error));
    // }

    if (document.getElementById('myChart2')) {
            var ctx = document.getElementById("myChart2").getContext('2d');
            
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: [ 'Blue', 'Yellow'],
                    datasets: [{
                        data: [60, 100],
                        backgroundColor: [
                           
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 206, 86, 0.8)',
                           
                        ],
                        borderColor: [
                        
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                         
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: false,
                            text: 'Doughnut Chart Example'
                        }
                    }
                }
            });
           
    }

    

});