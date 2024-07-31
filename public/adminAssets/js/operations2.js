
const listCoupons = async(couponId) =>{

    try{
        
        const response = await fetch(`http://localhost:2000/admin/coupons?coupon=${couponId}`,{method : 'PATCH'});
        
        if(!response.ok){
            throw new Error('Network repsonse was not ok while changing coupon status.');
        }
    
        const data = await response.json();

    }catch(error){
        console.log("Error occured while trying to patch coupon",error);
    }
}


async function downloadFile(format,timeRange){

    try{

        if(timeRange.custom){

            const start_date = encodeURIComponent(timeRange.range.start);
            const end_date = encodeURIComponent(timeRange.range.end);
            var range = `&start_date=${start_date}&end_date=${end_date}`;
        }else{

            var range = `&range=${timeRange.range}`;
        }

        const response = await fetch(`http://localhost:2000/admin/dashboard/export?format=${format}${range}`);
        if(!response.ok){
            throw new Error(`Network response was not ok while trying to download the ${format} file`);
        }

        const data = await response.blob();
        
        if(data){
            
            const url = await window.URL.createObjectURL(data);
            Swal.fire({

                title: "<strong>Your file is ready</strong>",
                icon: "info",
                html: `
                  <a href="${url}" id="download-link" >Click here to download</a>
                `,
                showConfirmButton: false,     
                didOpen: ()=> {
                    document.getElementById('download-link').onclick = ()=> {
                        Swal.close();
                    }
                }           
            });


        }else{
            console.log("No data");
        }

    }catch(error){
        console.log('Error occured while fetching and trying to download the file',error);
    }

}


function addRowsToSaleReportTable(totalSaleData,salesdata,sale_table){
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

    const tdGrossSaleTotal =document.createElement('td');
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


const getSaleReport = async(range, customRangeOb = null) =>{

    const sale_report_header = document.getElementById('sale-report-header');
    const saleR_total_sales_count = document.getElementById('saleR-total-sales-count');
    const saleR_total_order_amount = document.getElementById('saleR-total-order-amount');
    const saleR_total_discount = document.getElementById('saleR-total-discount');

    let customrange = ''
    if(customRangeOb){

        const start_date = encodeURIComponent(customRangeOb.startDate);
        const end_date = encodeURIComponent(customRangeOb.endDate);
        customrange = `&start_date=${start_date}&end_date=${end_date}`
    }

    try{

        const response = await fetch(`http://localhost:2000/admin/dashboard/sales-report?range=${range}${customrange}`,{
            method : 'GET',
            headers: {  
                'Accept': 'application/json' 
            },
        });
    
        if(!response.ok){
            throw new Error('Network response was not ok while trying to get sales report.');
        }
    
        const data = await response.json();
   
        if(data.status){
 
            sale_report_header.innerText = data.message;
            saleR_total_sales_count.innerText = data.givenRangeSaleOverAllData[0].overAllSalesCount;
            saleR_total_order_amount.innerText = `₹${data.givenRangeSaleOverAllData[0].overAllOrderAmount}`;
            saleR_total_discount.innerText = `₹${data.givenRangeSaleOverAllData[0].couponDiscount + data.givenRangeSaleOverAllData[0].otherDiscount }`;
           
            const sale_table = document.getElementById('sale-table');
            sale_table.textContent = "";
            
            addRowsToSaleReportTable(data.aggregatedRangeTotal,data.givenRangeGroupedData,sale_table);
        }else{

            const sale_table = document.getElementById('sale-table');
            const saleR_table = document.getElementById('saleR-table');
            sale_table.textContent = "";
            
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            //set the colspan attribute to span all columns
            const columnCount = saleR_table.querySelector('thead tr').children.length;
            td.setAttribute('colspan',columnCount);

            td.innerText = data.noDataMessage;
            tr.appendChild(td)
            sale_table.appendChild(tr);


            sale_report_header.innerText = data.message;
            saleR_total_sales_count.innerText = '0';
            saleR_total_order_amount.innerText = `₹0`;
            saleR_total_discount.innerText = `₹0`;

           
        }

    }catch(error){
        console.log("Error occured while trying to get sales report.",error);
    }
}


document.addEventListener('DOMContentLoaded',() => {
   

    const timeRange = {range: 'currWeek',custom : false};

    const saleR_daily = document.getElementById('saleR-daily');
    if(saleR_daily){
        saleR_daily.addEventListener('click',()=> {

            timeRange.range = 'thisDay';
            timeRange.custom = false;
            getSaleReport('thisDay');
        })
    }

    const saleR_weekly = document.getElementById('saleR-weekly');
    if(saleR_weekly){
        saleR_weekly.addEventListener('click',()=> {

            timeRange.range = 'currWeek';
            timeRange.custom = false;
            getSaleReport('currWeek');
        })
    }

    const saleR_monthly = document.getElementById('saleR-monthly');
    if(saleR_monthly){
        saleR_monthly.addEventListener('click',()=> {

            timeRange.range = 'currMonth';
            timeRange.custom = false;
            getSaleReport('currMonth');
        })
    }

    const saleR_apply_date = document.getElementById('saleR-apply-date');
    const saleR_start_date = document.getElementById('saleR-start-date');
    const saleR_end_date = document.getElementById('saleR-end-date');
    if(saleR_apply_date){
        saleR_apply_date.addEventListener('click',()=> {

            const startDate = saleR_start_date.value;
            const endDate = saleR_end_date.value;
            if(!startDate || !endDate ){

                Swal.fire({
                    title: 'Select the range!',
                    text: "Please select starting and ending date",
                    icon: 'error'
                });
            }else{

                timeRange.range = {start : startDate, end : endDate};
                timeRange.custom = true;
                getSaleReport('customRange',{startDate, endDate});
            }
        })
    }



    const saleR_download_excel = document.getElementById('saleR-download-excel');
    if(saleR_download_excel){

        saleR_download_excel.addEventListener('click',()=> {

            downloadFile('excel',timeRange);
        })
    }



});



