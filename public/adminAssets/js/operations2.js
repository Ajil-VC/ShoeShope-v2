



const listCoupons = async (couponId) => {

    try {

        const response = await fetch(`http://localhost:2000/admin/coupons?coupon=${couponId}`, { method: 'PATCH' });

        if (!response.ok) {
            throw new Error('Network repsonse was not ok while changing coupon status.');
        }

        const data = await response.json();

    } catch (error) {
        console.log("Error occured while trying to patch coupon", error);
    }
}


async function downloadFile(format, timeRange) {

    try {

        if (timeRange.custom) {

            const start_date = encodeURIComponent(timeRange.range.start);
            const end_date = encodeURIComponent(timeRange.range.end);
            var range = `&start_date=${start_date}&end_date=${end_date}`;
        } else {

            var range = `&range=${timeRange.range}`;
        }

        const response = await fetch(`http://localhost:2000/admin/dashboard/export?format=${format}${range}`);
        if (!response.ok) {
            throw new Error(`Network response was not ok while trying to download the ${format} file`);
        }

        const fileType = response.headers.get('X-File-Type');
        let filename = 'download';

        const data = await response.blob();

        if (data) {


            if (fileType == 'excel') {
                filename = filename.endsWith('.xlsx') ? filename : 'sales_report.xlsx';
            } else if (fileType == 'pdf') {
                filename = filename.endsWith('.pdf') ? filename : 'sales_report.pdf';
            }

            const url = await window.URL.createObjectURL(data);
            Swal.fire({

                title: "<strong>Your file is ready</strong>",
                icon: "info",
                html: `
                  <a href="${url}" id="download-link" download="${filename}" >Click here to download</a>
                `,
                showConfirmButton: false,
                didOpen: () => {
                    document.getElementById('download-link').onclick = () => {
                        Swal.close();
                    }
                }
            });


        } else {
            console.log("No data");
        }

    } catch (error) {
        console.log('Error occured while fetching and trying to download the file', error);
    }

}


function addRowsToSaleReportTable(totalSaleData, salesdata, sale_table) {
    //This function will create rows dynamically. for sales report.
    // const fragment = document.createDocumentFragment();

    salesdata.forEach(rowData => {

        const tr = document.createElement('tr');

        //Adding td data into tr below.
        const tdDate = document.createElement('td');
        tdDate.innerText = rowData.date;
        tr.appendChild(tdDate);

        const tdOrderCount = document.createElement('td');
        tdOrderCount.innerText = rowData.orderCount;
        tr.appendChild(tdOrderCount);

        const tdGrossSale = document.createElement('td');
        tdGrossSale.innerText = `₹${rowData.prodFocusedDetails.grossSales}`;
        tr.appendChild(tdGrossSale);

        const tdDiscounts = document.createElement('td');
        tdDiscounts.innerText = `₹${rowData.prodFocusedDetails.discounts}`;
        tr.appendChild(tdDiscounts);

        const tdCpnDis = document.createElement('td');
        tdCpnDis.innerText = `₹${rowData.prodFocusedDetails.couponDeductions}`;
        tr.appendChild(tdCpnDis);

        const tdNetSales = document.createElement('td');
        tdNetSales.innerText = `₹${rowData.prodFocusedDetails.netSales}`;
        tr.appendChild(tdNetSales);

        sale_table.appendChild(tr);
    });

    const trTotal = document.createElement('tr');
    trTotal.classList.add('sale-report-table-total');

    const tdTotal = document.createElement('td');
    tdTotal.innerText = "Total :";
    trTotal.appendChild(tdTotal);

    const tdOrderTotal = document.createElement('td');
    tdOrderTotal.innerText = totalSaleData.orderTotal;
    trTotal.appendChild(tdOrderTotal);

    const tdGrossSaleTotal = document.createElement('td');
    tdGrossSaleTotal.innerText = `₹${totalSaleData.grossSaleTotal}`;
    trTotal.appendChild(tdGrossSaleTotal);

    const tdDiscountTotal = document.createElement('td');
    tdDiscountTotal.innerText = `₹${totalSaleData.discountTotal}`;
    trTotal.appendChild(tdDiscountTotal);

    const tdcouponDisTotal = document.createElement('td');
    tdcouponDisTotal.innerText = `₹${totalSaleData.couponDisTotal}`;
    trTotal.appendChild(tdcouponDisTotal);

    const tdNetSaleTotal = document.createElement('td');
    tdNetSaleTotal.innerText = `₹${totalSaleData.netSaleTotal}`;
    trTotal.appendChild(tdNetSaleTotal);

    sale_table.appendChild(trTotal)

}


const getSaleReport = async (range, customRangeOb = null) => {

    const sale_report_header = document.getElementById('sale-report-header');
    const saleR_total_sales_count = document.getElementById('saleR-total-sales-count');
    const saleR_total_order_amount = document.getElementById('saleR-total-order-amount');
    const saleR_total_discount = document.getElementById('saleR-total-discount');

    let customrange = ''
    if (customRangeOb) {

        const start_date = encodeURIComponent(customRangeOb.startDate);
        const end_date = encodeURIComponent(customRangeOb.endDate);
        customrange = `&start_date=${start_date}&end_date=${end_date}`
    }

    try {

        const response = await fetch(`http://localhost:2000/admin/dashboard/sales-report?range=${range}${customrange}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok while trying to get sales report.');
        }

        const data = await response.json();

        if (data.status) {

            sale_report_header.innerText = data.message;
            saleR_total_sales_count.innerText = data.givenRangeSaleOverAllData[0].overAllSalesCount;
            saleR_total_order_amount.innerText = `₹${data.givenRangeSaleOverAllData[0].overAllOrderAmount}`;
            saleR_total_discount.innerText = `₹${data.givenRangeSaleOverAllData[0].couponDiscount + data.givenRangeSaleOverAllData[0].otherDiscount}`;

            const sale_table = document.getElementById('sale-table');
            sale_table.textContent = "";

            addRowsToSaleReportTable(data.aggregatedRangeTotal, data.givenRangeGroupedData, sale_table);
        } else {

            const sale_table = document.getElementById('sale-table');
            const saleR_table = document.getElementById('saleR-table');
            sale_table.textContent = "";

            const tr = document.createElement('tr');
            const td = document.createElement('td');
            //set the colspan attribute to span all columns
            const columnCount = saleR_table.querySelector('thead tr').children.length;
            td.setAttribute('colspan', columnCount);

            td.innerText = data.noDataMessage;
            tr.appendChild(td)
            sale_table.appendChild(tr);


            sale_report_header.innerText = data.message;
            saleR_total_sales_count.innerText = '0';
            saleR_total_order_amount.innerText = `₹0`;
            saleR_total_discount.innerText = `₹0`;


        }

    } catch (error) {
        console.log("Error occured while trying to get sales report.", error);
    }
}


document.addEventListener('DOMContentLoaded', () => {


    const timeRange = { range: 'currWeek', custom: false };

    const saleR_daily = document.getElementById('saleR-daily');
    if (saleR_daily) {
        saleR_daily.addEventListener('click', () => {

            timeRange.range = 'thisDay';
            timeRange.custom = false;
            getSaleReport('thisDay');
        })
    }

    const saleR_weekly = document.getElementById('saleR-weekly');
    if (saleR_weekly) {
        saleR_weekly.addEventListener('click', () => {

            timeRange.range = 'currWeek';
            timeRange.custom = false;
            getSaleReport('currWeek');
        })
    }

    const saleR_monthly = document.getElementById('saleR-monthly');
    if (saleR_monthly) {
        saleR_monthly.addEventListener('click', () => {

            timeRange.range = 'currMonth';
            timeRange.custom = false;
            getSaleReport('currMonth');
        })
    }

    const currentDate = new Date().toISOString().split('T')[0];
    const saleR_apply_date = document.getElementById('saleR-apply-date');
    const saleR_start_date = document.getElementById('saleR-start-date');
    const saleR_end_date = document.getElementById('saleR-end-date');
    if (saleR_start_date) {
        saleR_start_date.setAttribute('max', currentDate);
        saleR_end_date.setAttribute('max', currentDate);
    }
    if (saleR_apply_date) {
        saleR_apply_date.addEventListener('click', () => {

            const startDate = saleR_start_date.value;
            const endDate = saleR_end_date.value;
            if (!startDate || !endDate) {

                Swal.fire({
                    title: 'Select the range!',
                    text: "Please select starting and ending date",
                    icon: 'error'
                });
            } else {

                timeRange.range = { start: startDate, end: endDate };
                timeRange.custom = true;
                getSaleReport('customRange', { startDate, endDate });
            }
        })
    }



    const saleR_download_excel = document.getElementById('saleR-download-excel');
    if (saleR_download_excel) {

        saleR_download_excel.addEventListener('click', () => {

            downloadFile('excel', timeRange);
        })
    };

    const saleR_download_pdf = document.getElementById('saleR-download-pdf');
    if (saleR_download_pdf) {

        saleR_download_pdf.addEventListener('click', () => {

            downloadFile('pdf', timeRange);
        })
    }


    const couponCode = document.getElementById('couponCode');
    const couponcode_error = document.getElementById('couponcode-error');
    let couponCodeIsExist = false;
    if (couponCode) {
        couponCode.addEventListener('change', (e) => {

            const input = e.target.value;

            fetch(`http://localhost:2000/admin/coupons?code=${input}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok")
                    }

                    return response.json();
                })
                .then(data => {

                    if (data.status) {
                        couponCodeIsExist = true;
                    } else {

                        couponCodeIsExist = false;
                    }

                })
                .catch(error => {
                    console.log("There was a problem with the fetch operation of getting coupon code", error)
                });
        })
    }


    const coupon_dis_error = document.getElementById('coupon-dis-error');
    const coupon_status_error = document.getElementById('coupon-status-error');
    const coupon_min_error = document.getElementById('coupon-min-error');
    const coupon_max_error = document.getElementById('coupon-max-error');
    const coupon_date_error = document.getElementById('coupon-date-error');

    const expirationDate = document.getElementById('expirationDate');
    if (expirationDate) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const minDate = tomorrow.toISOString().split('T')[0];
        expirationDate.setAttribute('min', minDate);
    }
    const addCouponForm = document.getElementById('addCouponForm');
    if (addCouponForm) {

        addCouponForm.addEventListener('submit', function (e) {
            e.preventDefault();

            let couponValidation = true;
            const discountPercentage = document.getElementById('discountPercentage').value.trim();
            const couponstatus = document.getElementById('couponstatus').value;
            const minimumAmnt = document.getElementById('MinimumAmnt').value.trim();
            const maximumAmnt = document.getElementById('MaximumAmnt').value.trim();
            const expiration = expirationDate.value;

            coupon_dis_error.innerText = '';
            coupon_status_error.innerText = '';
            coupon_min_error.innerText = '';
            coupon_max_error.innerText = '';
            couponcode_error.innerText = '';
            coupon_date_error.innerText = '';

            if (!expiration) {
                couponValidation = false;
                coupon_date_error.innerText = 'Please select a date';
            }

            if (!minimumAmnt) {
                couponValidation = false;
                coupon_min_error.innerText = 'This field cant be empty';
            } else if (minimumAmnt < 1) {
                couponValidation = false;
                coupon_min_error.innerText = 'Please select a positive value';
            }

            if (!maximumAmnt) {
                couponValidation = false;
                coupon_max_error.innerText = 'This field cant be empty';
            } else if (maximumAmnt < 1) {
                couponValidation = false;
                coupon_max_error.innerText = 'Please select a positive value';
            }

            if (!couponCode.value) {
                couponValidation = false;
                couponcode_error.innerText = 'This field cant be empty';
            } else if (couponCodeIsExist) {
                couponValidation = false;
                couponcode_error.innerText = 'This coupon code already exists';
            }

            if (!discountPercentage) {
                couponValidation = false;
                coupon_dis_error.innerText = 'This field cant be empty';
            } else if (discountPercentage > 100) {
                couponValidation = false;
                coupon_dis_error.innerText = 'This value should be less than 100';
            } else if (discountPercentage < 1) {
                couponValidation = false;
                coupon_dis_error.innerText = 'This value should be greater than 0';
            }

            if (!couponstatus) {
                couponValidation = false;
                coupon_status_error.innerText = 'Please select a value';
            }

            if (couponValidation) {

                this.submit();
            }
        })
    }



    function createTopCategoryTable(data) {

        const best_selling_products_heading = document.getElementById('best-selling-products-heading');
        best_selling_products_heading.innerText = 'Best Selling Categories';
        const best_seller_table_container = document.getElementById('best-seller-table-container');

        document.getElementById('best-seller-table').remove();
        const table = document.createElement('table');
        table.classList.add('table', 'table-hover');
        table.setAttribute('id', 'best-seller-table');

        best_seller_table_container.appendChild(table);

        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        const tableHead = ['Category', 'Total Units Sold', 'Total Orders', 'Base Amount', 'Top Product'];
        tableHead.forEach(header => {
            const th = document.createElement('th');
            th.setAttribute('scope', 'col');
            th.innerText = header;
            th.style.fontWeight = 'bold';
            tr.appendChild(th);
        });
        const tbody = document.createElement('tbody');
        thead.appendChild(tr);
        table.appendChild(thead);
        table.appendChild(tbody);

        data.bestSellers.forEach((rowData, index) => {

            const newRow = table.insertRow(index + 1);
            //Adding cells to the row.
            const categoryCell = newRow.insertCell(0);
            const unitsSoldCell = newRow.insertCell(1);
            const totOrderCell = newRow.insertCell(2);
            const baseAmntCell = newRow.insertCell(3);
            const topProdCell = newRow.insertCell(4);

            categoryCell.innerText = rowData._id;
            unitsSoldCell.innerText = rowData.totalUnitsSold;
            totOrderCell.innerText = rowData.totalOrders;
            baseAmntCell.innerText = `₹${rowData.baseAmount}`;
            topProdCell.innerHTML = `<a class="itemside" href="#">
                                                <div class="left">
                                                    <img src="/ProductImage/${rowData.bestSellingProduct.productImage[0]}" class="img-sm img-thumbnail" alt="Item">
                                                </div>
                                                <div class="info">
                                                    <h6 class="mb-0"> ${rowData.bestSellingProduct.productName} (${rowData.bestSellingProduct.totalUnitsSold} pcs) </h6>
                                                </div>
                                            </a>`;
            newRow.style.backgroundColor = '#ffffff';

        })
    }

    function createTopBrandsTable(data) {

        const best_selling_products_heading = document.getElementById('best-selling-products-heading');
        best_selling_products_heading.innerText = 'Best Selling Brands';
        const best_seller_table_container = document.getElementById('best-seller-table-container');

        document.getElementById('best-seller-table').remove();
        const table = document.createElement('table');
        table.classList.add('table', 'table-hover');
        table.setAttribute('id', 'best-seller-table');

        best_seller_table_container.appendChild(table);

        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        const tableHead = ['Brand', 'Total Units Sold', 'Total Orders', 'Base Amount', 'Top Product'];
        tableHead.forEach(header => {
            const th = document.createElement('th');
            th.setAttribute('scope', 'col');
            th.innerText = header;
            th.style.fontWeight = 'bold';
            tr.appendChild(th);
        });
        const tbody = document.createElement('tbody');
        thead.appendChild(tr);
        table.appendChild(thead);
        table.appendChild(tbody);

        data.bestSellers.forEach((rowData, index) => {

            const newRow = table.insertRow(index + 1);
            //Adding cells to the row.
            const categoryCell = newRow.insertCell(0);
            const unitsSoldCell = newRow.insertCell(1);
            const totOrderCell = newRow.insertCell(2);
            const baseAmntCell = newRow.insertCell(3);
            const topProdCell = newRow.insertCell(4);

            categoryCell.innerText = rowData._id;
            unitsSoldCell.innerText = rowData.totalUnitsSold;
            totOrderCell.innerText = rowData.totalOrders;
            baseAmntCell.innerText = `₹${rowData.baseAmount}`;
            topProdCell.innerHTML = `<a class="itemside" href="#">
                                                <div class="left">
                                                    <img src="/ProductImage/${rowData.bestSellingProduct.productImage[0]}" class="img-sm img-thumbnail" alt="Item">
                                                </div>
                                                <div class="info">
                                                    <h6 class="mb-0"> ${rowData.bestSellingProduct.productName} (${rowData.bestSellingProduct.totalUnitsSold} pcs) </h6>
                                                </div>
                                            </a>`;
            newRow.style.backgroundColor = '#ffffff';

        })
    }

    function createTopProductTable(data) {

        const best_selling_products_heading = document.getElementById('best-selling-products-heading');
        best_selling_products_heading.innerText = 'Best Selling Products';
        const best_seller_table_container = document.getElementById('best-seller-table-container');

        document.getElementById('best-seller-table').remove();
        const table = document.createElement('table');
        table.classList.add('table', 'table-hover');
        table.setAttribute('id', 'best-seller-table');

        best_seller_table_container.appendChild(table);

        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        const tableHead = ['Product', 'Total Units Sold', 'Total Orders', 'Product Price', 'Base Amount'];
        tableHead.forEach(header => {
            const th = document.createElement('th');
            th.setAttribute('scope', 'col');
            th.innerText = header;
            th.style.fontWeight = 'bold';
            tr.appendChild(th);
        });
        const tbody = document.createElement('tbody');
        thead.appendChild(tr);
        table.appendChild(thead);
        table.appendChild(tbody);

        data.bestSellers.forEach((rowData, index) => {

            const newRow = table.insertRow(index + 1);
            //Adding cells to the row.
            const productCell = newRow.insertCell(0);
            const unitsSoldCell = newRow.insertCell(1);
            const totOrderCell = newRow.insertCell(2);
            const prodPriceCell = newRow.insertCell(3);
            const baseAmntCell = newRow.insertCell(4);

            productCell.innerHTML = `<a class="itemside" href="#">
                                                <div class="left">
                                                    <img src="/ProductImage/${rowData.productImage[0]}" class="img-sm img-thumbnail" alt="Item">
                                                </div>
                                                <div class="info">
                                                    <h6 class="mb-0"> ${rowData.productName} </h6>
                                                </div>
                                        </a>`;
            unitsSoldCell.innerText = rowData.totalUnitsSold;
            totOrderCell.innerText = rowData.totalOrders;
            prodPriceCell.innerText = `₹${rowData.productPrice}`;
            baseAmntCell.innerText = `₹${rowData.baseAmount}`;

            newRow.style.backgroundColor = '#ffffff';

        })

    }

    async function fetchBestSellingProduct(sortOn) {

        try {

            const response = await fetch(`http://localhost:2000/admin/best_sellers?sort_on=${sortOn}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok while trying to fetch best selling products.');
            }
            const data = await response.json();
            console.log(data);
            if (data.status) {

                if (data.sortOn == 'Categories') {

                    createTopCategoryTable(data);

                } else if (data.sortOn == 'Products') {

                    createTopProductTable(data);

                } else if (data.sortOn == 'Brands') {

                    createTopBrandsTable(data);

                }

            } else {
                Swal.fire({
                    title: 'Error Occured',
                    text: "Error occured while trying to fetch data.",
                    icon: 'error'
                });
            }

        } catch (error) {
            console.log("Error occured while trying to fetch and set best seller products.", error);
        }

    }

    const best_seller_products = document.getElementById('best-seller-products');
    if (best_seller_products) {

        best_seller_products.addEventListener('change', (e) => {

            const sortOn = e.target.value;
            fetchBestSellingProduct(sortOn);

        })
    }



    function offerFormValidation() {

        let validation = true;

        const offer_title = document.getElementById('off-title').value;
        const offer_discount_type = document.getElementById('off-discount-type').value;
        const offer_discount_value = document.getElementById('off-discount-value').value;
        const offer_applicable_on = document.getElementById('off-applicable-on').value;
        const offer_min_purchase = document.getElementById('off-min-purchase').value;

        const offer_start_date = document.getElementById('off-start-date').value;
        const offer_end_date = document.getElementById('off-end-date').value;
        const startDate = new Date(offer_start_date);
        const endDate = new Date(offer_end_date);

        if (!offer_title) {

            offer_title_error.innerText = 'Please enter an offer name';
            validation = false;
        }

        if (!offer_discount_type) {

            offer_discount_error.innerText = "Please select a discount type";
            validation = false;
        }

        if (!offer_discount_value) {

            offer_disvalue_error.innerText = "Please enter a discount value";
            validation = false;
        }else if(offer_discount_value < 1){

            offer_disvalue_error.innerText = "Minimum value is 1";
            validation = false;
        }else if((offer_discount_type == 'percentage') && (offer_discount_value <1 || offer_discount_value > 100)){

            offer_disvalue_error.innerText = "Discount percentage must be between 0% and 100%";
            validation = false;
        }

        if (!offer_applicable_on) {

            offer_applicable_error.innerText = "Please select an option";
            validation = false;
        }

        if (offer_min_purchase < 0) {

            offer_min_purchase_error.innerText = "Minimum value is 0. ";
            validation = false;
        }

        if (!offer_start_date) {

            offer_startdate_error.innerText = "Please select a offer starting date.";
            validation = false;
        }

        if (!offer_end_date) {

            offer_enddate_error.innerText = "Please select a offer ending date.";
            validation = false;
        }else if(startDate > endDate){

            offer_enddate_error.innerText = "Please select a date greater than starting date.";
            validation = false;
        }

        return validation;

    }

    const offer_start_date = document.getElementById('off-start-date');
    if(offer_start_date){
        const today = new Date();
        const minDate = today.toISOString().split('T')[0];
        offer_start_date.setAttribute('min', minDate);
    }
    const offer_end_date = document.getElementById('off-end-date');
    if (offer_end_date) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const minDate = tomorrow.toISOString().split('T')[0];
        offer_end_date.setAttribute('min', minDate);
    }
    const offer_title_error = document.getElementById('offer-title-error');
    const offer_discount_error = document.getElementById('offer-discount-error');
    const offer_disvalue_error = document.getElementById('offer-disvalue-error');
    const offer_applicable_error = document.getElementById('offer-applicable-error');
    const offer_min_purchase_error = document.getElementById('offer-min-purchase-error');
    const offer_startdate_error = document.getElementById('offer-startdate-error');
    const offer_enddate_error = document.getElementById('offer-enddate-error');

    const offer_create_form = document.getElementById('off-create-form');
    if (offer_create_form) {
        offer_create_form.addEventListener('submit', (function (e) {

            e.preventDefault();

            offer_title_error.innerText = '';
            offer_discount_error.innerText = '';
            offer_disvalue_error.innerText = '';
            offer_applicable_error.innerText = '';
            offer_min_purchase_error.innerText = '';
            offer_startdate_error.innerText = '';
            offer_enddate_error.innerText = '';

            const formIsValidated = offerFormValidation();

            if (formIsValidated) {
                this.submit();
            }
        }))
    }

});



