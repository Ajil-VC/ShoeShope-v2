const exceljs = require('exceljs');
const pdfDocument = require('pdfkit');
const { format, setDate, endOfWeek } = require('date-fns');
const { Admin, Product, Order, returnItem } = require('../../models/models');





const getTopProducts = async (sortOn) => {

    //Taking the top selling products based products, Categories, Brands.
    //Tied products will not show in this query. Means, If 2 products have 
    //Same number of quantity sold then it will take the first one only 
    //after sorting.

    try {

        if (sortOn == 'Products') {

            const bestSellers = await Order.aggregate([
                { $unwind: "$items" },
                {
                    $match: {
                        "items.paymentStatus": 'PAID'
                    }
                },
                {
                    $group: {
                        _id: "$items.product.id",
                        productName: { $first: "$items.product.name" },
                        productImage: { $first: "$items.product.images" },
                        totalUnitsSold: { $sum: "$items.quantity" },
                        totalOrders: { $sum: 1 },
                        productPrice: { $first: "$items.product.price" },
                        baseAmount: { $sum: "$items.subtotal" }
                    }
                },
                { $sort: { totalUnitsSold: -1 } },
                { $limit: 10 }
            ]);

            return { bestSellers };

        } else if (sortOn == 'Brands') {

            const bestSellers = await Order.aggregate([

                { $unwind: "$items" },
                {
                    $match: {
                        "items.paymentStatus": 'PAID'
                    }
                },
                {
                    $group: {
                        _id: { brands: "$items.product.Brand", productId: "$items.product.id" },
                        productName: { $first: "$items.product.name" },
                        productImage: { $first: "$items.product.images" },
                        totalUnitsSold: { $sum: "$items.quantity" },
                        totalRevenue: { $sum: "$items.subtotal" }
                    }
                },
                { $sort: { "_id.brands": 1, totalUnitsSold: -1 } },
                {
                    $group: {
                        _id: "$_id.brands",
                        totalUnitsSold: { $sum: "$totalUnitsSold" },
                        totalOrders: { $sum: 1 },
                        baseAmount: { $sum: "$totalRevenue" },
                        bestSellingProduct: {
                            $first: {
                                productName: "$productName",
                                productImage: "$productImage",
                                totalUnitsSold: "$totalUnitsSold"
                            }
                        }
                    }
                },
                { $sort: { totalUnitsSold: -1 } },
                { $limit: 10 }
            ]);
            return { bestSellers };

        } else if (sortOn == 'Categories') {

            const bestSellers = await Order.aggregate([

                { $unwind: "$items" },
                {
                    $match: {
                        "items.paymentStatus": 'PAID'
                    }
                },
                {
                    $group: {
                        _id: { category: "$items.product.Category", productId: "$items.product.id" },
                        productName: { $first: "$items.product.name" },
                        productImage: { $first: "$items.product.images" },
                        totalUnitsSold: { $sum: "$items.quantity" },
                        totalRevenue: { $sum: "$items.subtotal" }
                    }
                },
                { $sort: { "_id.category": 1, totalUnitsSold: -1 } },
                {
                    $group: {
                        _id: "$_id.category",
                        totalUnitsSold: { $sum: "$totalUnitsSold" },
                        totalOrders: { $sum: 1 },
                        baseAmount: { $sum: "$totalRevenue" },
                        bestSellingProduct: {
                            $first: {
                                productName: "$productName",
                                productImage: "$productImage",
                                totalUnitsSold: "$totalUnitsSold"
                            }
                        }
                    }
                },
                { $sort: { totalUnitsSold: -1 } },
                { $limit: 10 }
            ]);
            return { bestSellers };

        }

    } catch (error) {
        console.error("Internal Error Occured while trying to fetch best sellers from db.", error.stack);
        return null;
    }


}


const getSaleData = async (req, res) => {


    try {

        const currentYear = new Date().getFullYear();

        const [monthlyNetDeliveredProducts, monthlyOrderCount] = await Promise.all([

            Order.aggregate([
                {
                    $match: {
                        status: 'Delivered',// Filter orders with status 'Delivered'
                        $expr: { $eq: [{ $year: "$createdAt" }, currentYear] }
                    }
                },
                {
                    $lookup: {
                        from: 'returnitems', // The name of the returns collection
                        localField: 'return', // Field in the orders collection
                        foreignField: '_id', // Field in the returns collection
                        as: 'returnsDetails' // Alias for the joined documents
                    }
                },
                {
                    $addFields: {
                        returnedProductIds: { $map: { input: '$returnsDetails', as: 'returnid', in: '$$returnid.productId' } }
                    }
                },
                {
                    $addFields: {
                        nonReturnedProducts: {
                            $filter: {
                                input: '$items',
                                as: 'item',
                                cond: { $not: [{ $in: ['$$item.product.id', '$returnedProductIds'] }] }
                            }
                        }
                    }
                },
                {
                    $project: {
                        nonReturnedProducts: 1,
                        createdAt: 1,
                        orderCount: { $literal: 1 } // Add a literal value of 1 for each order
                    }
                },
                {
                    $unwind: '$nonReturnedProducts'
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, // Group by month
                        products: { $push: '$nonReturnedProducts' },
                        orderCount: { $sum: '$orderCount' } // Sum up the count of orders
                    }
                },
                {
                    $sort: { "_id": 1 } // Ensure sorting by month
                }

            ]),


            Order.aggregate([
                {
                    $match: {
                        // status: 'Delivered',// Filter orders with status 'Delivered'
                        $expr: { $eq: [{ $year: "$createdAt" }, currentYear] }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" }
                        },
                        totalOrders: { $sum: 1 } // Sum the totalItems field for each month
                    }
                },
                {
                    $sort: {
                        // "_id.year": 1,  
                        "_id.month": 1
                    } // Sort the result by year and month
                },
                {
                    $project: {
                        _id: 0,
                        year: "$_id.year",
                        month: "$_id.month",
                        totalOrders: 1
                    }
                }
            ])
        ])

        const products = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (let i = 0; i < monthlyNetDeliveredProducts.length; i++) {

            const month = monthlyNetDeliveredProducts[i]._id.split('-')[1];
            const monthInt = parseInt(month);
            products[monthInt - 1] = monthlyNetDeliveredProducts[i]?.orderCount || 0;
        }
        const sales = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (let i = 0; i < monthlyOrderCount.length; i++) {

            const month = monthlyOrderCount[i]?.month || 0;
            sales[month - 1] = monthlyOrderCount[i]?.totalOrders || 0;
        }

        return res.status(200).json({
            "sales": sales,
            "products": products
        });

    } catch (error) {
        console.error("Internal error while getting sale data", error.stack);
        return res.status(500).send("Internal error while getting sale data", error);
    }

}

const saleReportByRange = async (range, start_date, end_date) => {

    if (range == 'currWeek') {

        var startTime = new Date();
        startTime.setUTCHours(0, 0, 0, 0);
        startTime.setUTCDate(startTime.getUTCDate() - startTime.getUTCDay());

        var endTime = new Date(startTime);
        endTime.setUTCDate(endTime.getUTCDate() + 7);

    } else if (range == 'currMonth') {

        var startTime = new Date();
        startTime.setUTCHours(0, 0, 0, 0)
        startTime.setUTCDate(1);

        var endTime = new Date(startTime);
        endTime.setUTCMonth(endTime.getUTCMonth() + 1);

    } else if (start_date && end_date) {

        const date1 = new Date(start_date);
        const date2 = new Date(end_date);

        if (date1 < date2) {

            var startTime = new Date(date1);
            var endTime = new Date(date2);
        } else {

            var startTime = new Date(date2);
            var endTime = new Date(date1);
        }

        //Setting time of the start day into 0
        startTime.setUTCHours(0, 0, 0, 0);
        //Setting time of the end day into maximum
        endTime.setUTCHours(23, 59, 59, 999);

    }

    const givenRangeSaleOverAllData = await Order.aggregate([

        {

            $match: {

                createdAt: {

                    $gte: startTime,

                    $lt: endTime

                }

            }
        },

        {
            $group: {

                _id: null,

                overAllSalesCount: { $count: {} },

                overAllOrderAmount: { $sum: "$totalAmount" },

                couponDiscount: {

                    $sum: {

                        $ifNull: ["$couponDiscount", 0]

                    }

                },

                otherDiscount: {

                    $sum: {

                        $ifNull: ["$otherDiscount", 0]

                    }

                }

            }

        }

    ]);



    const thisWeekOrders = await Order.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startTime,
                    $lt: endTime
                }
            }
        }
    ]);


    // Grouping data according to current week
    const groupedData = thisWeekOrders.reduce((acc, curr) => {

        const date = new Date(curr.createdAt).toISOString().split('T')[0];

        if (acc[date]) {
            acc[date].orderCount++;

            const updatingFocusObject = curr.items.filter(item => item.status === 'Delivered')
                .map(product => {

                    acc[date].prodFocusedDetails.grossSales = acc[date].prodFocusedDetails.grossSales + product.subtotal;

                    //Below Im calculating the coupon discount for the particular product.
                    const prodPriceProportion = product.subtotal / curr.subTotal;
                    acc[date].prodFocusedDetails.couponDeductions =
                        Number((acc[date].prodFocusedDetails.couponDeductions + (prodPriceProportion * curr.couponDiscount)).toFixed(2));

                    //Below Im calculating netsales.
                    acc[date].prodFocusedDetails.netSales =
                        Number((acc[date].prodFocusedDetails.netSales + product.subtotal - (prodPriceProportion * curr.couponDiscount)).toFixed(2));

                })


        } else {


            //Below im calculating the Gross sales amount,discount,
            // Coupon deductions, net sales using filter & map methods
            //And setting it into the desired date.

            const prodFocusedDetails = curr.items.filter(item => item.status === 'Delivered')
                .map(product => {


                    if (acc[date]?.orderCount) {

                        acc[date].prodFocusedDetails.grossSales = acc[date].prodFocusedDetails.grossSales + product.subtotal;

                        //Below Im calculating the coupon discount for the particular product.
                        const prodPriceProportion = product.subtotal / curr.subTotal;
                        acc[date].prodFocusedDetails.couponDeductions =
                            Number((acc[date].prodFocusedDetails.couponDeductions + (prodPriceProportion * curr.couponDiscount)).toFixed(2));

                        //Below Im calculating netsales.
                        acc[date].prodFocusedDetails.netSales =
                            Number((acc[date].prodFocusedDetails.netSales + product.subtotal - (prodPriceProportion * curr.couponDiscount)).toFixed(2));

                    } else {

                        acc[date] = {
                            //Here Im initializing the Object to group and get detailed data.
                            orderCount: 1,
                            prodFocusedDetails: {
                                grossSales: 0,
                                discounts: 0,
                                couponDeductions: 0,
                                netSales: 0
                            }
                        };

                        acc[date].prodFocusedDetails.grossSales = product.subtotal;

                        //Below Im calculating the coupon discount for the particular product.
                        const prodPriceProportion = product.subtotal / curr.subTotal;
                        acc[date].prodFocusedDetails.couponDeductions = Number((prodPriceProportion * curr.couponDiscount).toFixed(2));

                        //Below Im calculating netsales.
                        acc[date].prodFocusedDetails.netSales = Number((product.subtotal - (prodPriceProportion * curr.couponDiscount)).toFixed(2));


                    }



                })

        }
        return acc;
    }, {});

    const givenRangeGroupedData = Object.entries(groupedData).map(([date, values]) => {
        return { date: date, ...values };
    });

    //below im trying to sum up all the data in givenRangeGroupedData.
    //The last week is already over. So Please confirm everything 
    const aggregatedRangeTotal = givenRangeGroupedData.reduce((acc, cur) => {

        acc.orderTotal = acc.orderTotal + cur.orderCount;
        acc.grossSaleTotal = acc.grossSaleTotal + cur.prodFocusedDetails.grossSales;
        acc.discountTotal = acc.discountTotal + cur.prodFocusedDetails.discounts;
        acc.couponDisTotal = acc.couponDisTotal + cur.prodFocusedDetails.couponDeductions;
        acc.netSaleTotal = acc.netSaleTotal + cur.prodFocusedDetails.netSales;
        return acc;

    }, { orderTotal: 0, grossSaleTotal: 0, discountTotal: 0, couponDisTotal: 0, netSaleTotal: 0 })


    return {
        givenRangeSaleOverAllData,
        givenRangeGroupedData,
        aggregatedRangeTotal,
    };
}

const salesReport = async (req, res) => {
    //for fetching sales report from frontend

    var start_date = req.query.start_date ?? null;
    var end_date = req.query.end_date ?? null;

    try {

        const range = req.query.range ?? null;

        const {
            givenRangeSaleOverAllData,
            givenRangeGroupedData,
            aggregatedRangeTotal
        } = await saleReportByRange(range, start_date, end_date);

        if (range === 'thisDay') {
            var message = "Today's Sales Report";
        } else if (range === 'currWeek') {
            var message = 'This Week Sales Report';
        } else if (range === 'currMonth') {
            var message = "This Month Sales Report";
        } else {
            var message = "Custom range Sales Report";
        }

        if (givenRangeGroupedData.length < 1) {

            return res.status(200).json({
                status: false,
                message,
                noDataMessage: "No Data available in this range."
            });

        } else {

            return res.status(200).json({
                status: true,
                givenRangeSaleOverAllData,
                givenRangeGroupedData,
                aggregatedRangeTotal,
                message
            });
        }

    } catch (error) {

        console.error("Internal error while trying to get sales report.", error.stack);
        return res.status(500).send("Internal error while trying to get sales report.", error);
    }

}


const loadDashboard = async (req, res) => {

    try {

        // const currentYear = new Date().getFullYear();
        // const startDate = new Date(`${currentYear}-01-01T00:00:00Z`);
        const currentDate = new Date();

        const monthsElapsed = currentDate.getMonth() + 1;


        const [
            productsCount,
            categories,
            orderStatics,
            returnOrders,
            { givenRangeSaleOverAllData, givenRangeGroupedData, aggregatedRangeTotal }] = await Promise.all([

                Product.aggregate([{ $group: { _id: null, total: { $sum: "$stockQuantity" } } }]),
                Product.aggregate([{ $group: { _id: "$Category" } }]),

                Order.aggregate([
                    {
                        $group: {
                            _id: "$status",
                            count: { $sum: 1 },
                            totalAmnt: { $sum: "$totalAmount" }
                        }
                    },
                ]),

                returnItem.aggregate([
                    {
                        $group: {
                            _id: '$status',
                            count: { $sum: 1 },
                            totalAmnt: { $sum: "$refundAmnt" }
                        }
                    },
                    { $match: { _id: { $in: ['approved', 'initiated'] } } }
                ]),

                saleReportByRange('currWeek')//Getting datas from this current week

            ]);



        const categoryCount = categories.length;
        const deliveredOrderCountRawData = orderStatics.filter(ob => ob._id == 'Delivered')[0]?.count;
        const deliveredOrderCount = Number.isNaN(deliveredOrderCountRawData) ? 0 : deliveredOrderCountRawData;

        const totalDeliveredAmountRawdata = orderStatics.filter(ob => ob._id == 'Delivered')[0]?.totalAmnt;
        const totalDeliveredAmount = Number.isNaN(totalDeliveredAmountRawdata) ? 0 : totalDeliveredAmountRawdata;

        const totalReturnCountRawData = returnOrders.filter(elem => (elem._id == 'approved'))[0]?.count || 0;
        const totalReturnCount = Number.isNaN(totalReturnCountRawData) ? 0 : totalReturnCountRawData;
        const totalReturnedAmntRawData = returnOrders.filter(elem => (elem._id == 'approved'))[0]?.totalAmnt;
        const totalReturnedAmnt = Number.isNaN(totalReturnedAmntRawData) ? 0 : totalReturnedAmntRawData;

        const purchasedCount = deliveredOrderCount - totalReturnCount;
        const purchasedAmount = (totalDeliveredAmount - totalReturnedAmnt).toFixed(2);
        const avgMonthlyEarningRawData = (purchasedAmount / 7).toFixed(2);
        const avgMonthlyEarning = Number.isNaN(avgMonthlyEarningRawData) ? 0 : avgMonthlyEarningRawData;

        const initiatedReturnCountRawData = returnOrders.filter(elem => (elem._id == 'initiated'))[0]?.count;
        const initiatedReturnCount = Number.isNaN(initiatedReturnCountRawData) ? 0 : initiatedReturnCountRawData;

        return res.status(200).render('dashboard', {
            productsCount,
            categoryCount,
            purchasedCount,
            purchasedAmount,
            avgMonthlyEarning,
            givenRangeSaleOverAllData,
            givenRangeGroupedData,
            aggregatedRangeTotal,
            initiatedReturnCount
        });

    } catch (error) {

        console.error("Error while rendering dashboard\n", error.stack);
        return res.status(500).send("Error while rendering dashboard")

    }
}

const loadBestSellers = async (req, res) => {

    try {

        if (req.accepts('html')) {

            const initiatedReturns = await returnItem.aggregate([

                { $match: { status: 'initiated' } },
                { $count: 'total' }
            ]);
            const initiatedReturnCount = initiatedReturns[0]?.total || 0;

            const { bestSellers } = await getTopProducts('Products');
            return res.status(200).render('best-sellers', { bestSellers, initiatedReturnCount });

        } else {

            const sortOn = req.query.sort_on;
            const { bestSellers } = await getTopProducts(sortOn);
            return res.status(200).json({ status: true, bestSellers, sortOn });

        }

    } catch (error) {
        console.error("Internal error occured while trying to load best Sellers page.", error.stack);
        return res.status(500).send("Internal error occured while trying to load best Sellers page.", error);
    }
}

const exportAndDownload = async (req, res) => {

    try {

        const format = req.query.format;

        const start_date = req.query.start_date ?? null;
        const end_date = req.query.end_date ?? null;

        const range = req.query.range ?? null;

        if (range === 'thisDay') {
            var head = "Today's Sales Report";
        } else if (range === 'currWeek') {
            var head = 'This Week Sales Report';
        } else if (range === 'currMonth') {
            var head = "This Month Sales Report";
        } else {
            var head = "Custom range Sales Report";
        }

        const {

            givenRangeSaleOverAllData,
            givenRangeGroupedData,
            aggregatedRangeTotal

        } = await saleReportByRange(range, start_date, end_date);

        if (format == 'excel') {

            let workbook = new exceljs.Workbook();

            const sheet = workbook.addWorksheet('sale_report');
            sheet.columns = [
                { header: "Date", key: 'date', width: 18 },
                { header: "Orders", key: 'orders', width: 10 },
                { header: "Gross Sales", key: 'grossSales', width: 18 },
                { header: "Discounts", key: 'discounts', width: 18 },
                { header: "Coupon Deductions", key: 'couponDeductions', width: 18 },
                { header: "Net Sales", key: 'netSales', width: 18 },
            ];

            const headerRow = sheet.getRow(1);
            headerRow.eachCell(head => {

                head.font = {
                    bold: true,
                    color: { argb: 'FFFFFFFF' }
                };
                head.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFF0000' }
                }
            });

            await givenRangeGroupedData.forEach((value, idx) => {

                sheet.addRow({
                    date: value.date,
                    orders: value.orderCount,
                    grossSales: value.prodFocusedDetails.grossSales,
                    discounts: value.prodFocusedDetails.discounts,
                    couponDeductions: value.prodFocusedDetails.couponDeductions,
                    netSales: value.prodFocusedDetails.netSales
                })
            });

            sheet.addRow({
                date: "Total",
                orders: aggregatedRangeTotal.orderTotal,
                grossSales: aggregatedRangeTotal.grossSaleTotal,
                discounts: aggregatedRangeTotal.discountTotal,
                couponDeductions: aggregatedRangeTotal.couponDisTotal,
                netSales: aggregatedRangeTotal.netSaleTotal
            });

            const footerRow = sheet.lastRow;
            footerRow.eachCell(footer => {

                footer.font = { bold: true };
                footer.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF0F0F0' }
                }

            })


            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
                'Content-Disposition',
                'attachment; filename="sales_report.xlsx"'
            );
            res.setHeader('X-File-Type', 'excel');

            await workbook.xlsx.write(res);

            res.end();

        } else if (format == 'pdf') {

            //creating a document.
            const doc = new pdfDocument({ size: 'A4', layout: 'portrait' });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment;filename=sales_report.pdf');
            res.setHeader('X-File-Type', 'pdf');

            //pipe the pdf document to the response.
            doc.pipe(res);

            //add content to the pdf.
            doc.fontSize(16).text(head, { align: 'center' });
            doc.moveDown();

            //Setting A4 page size.
            const pageWidth = 595.28;
            // const pageHeight = 841.89;
            const margin = 40;

            //Table configuration
            const table = {
                x: margin,
                y: 100,
                width: pageWidth - 2 * margin,
                rowHeight: 20
            };

            //calculate column width.
            const columnCount = 6;
            const columnWidth = table.width / columnCount;

            //Draw table headers.
            doc.font('Helvetica-Bold').fontSize(8);
            const headers = ['Date', 'Orders', 'Gross Sales', 'Discounts', 'Coupon Deductions', 'Net Sales'];
            headers.forEach((header, index) => {

                doc.text(header, table.x + index * columnWidth + 5, table.y + 5, {
                    width: columnWidth - 4,
                    align: 'left'
                });
            })

            //Draw table content.
            doc.font('Helvetica').fontSize(8);
            givenRangeGroupedData.forEach((obj, index) => {

                const y = table.y + table.rowHeight * (index + 1);
                const data = [

                    obj.date,
                    obj.orderCount.toString(),
                    obj.prodFocusedDetails.grossSales.toString(),
                    obj.prodFocusedDetails.discounts.toString(),
                    obj.prodFocusedDetails.couponDeductions.toString(),
                    obj.prodFocusedDetails.netSales.toString(),
                ]

                data.forEach((text, columnnInd) => {

                    doc.text(text, table.x + columnnInd * columnWidth + 5, y + 5, {
                        width: columnWidth - 4,
                        align: 'left'
                    });
                })

            });

            //add footer row
            const footerRowY = table.y + table.rowHeight * (givenRangeGroupedData.length + 1);

            //draw light grey background for footer.
            doc.fill('#f0f0f0')
                .rect(table.x, footerRowY, table.width, table.rowHeight)
                .fill();

            //reseting color of text back to black.
            doc.fill('black');

            //draw footer text with bold font.
            doc.font('Helvetica-Bold').fontSize(8);

            const footerData = [
                'Total',
                aggregatedRangeTotal.orderTotal,
                aggregatedRangeTotal.grossSaleTotal,
                aggregatedRangeTotal.discountTotal,
                aggregatedRangeTotal.couponDisTotal,
                aggregatedRangeTotal.netSaleTotal
            ];
            footerData.forEach((text, columnIndex) => {

                doc.text(text,
                    table.x + columnIndex * columnWidth + 5,
                    footerRowY + 5,
                    {
                        width: columnWidth - 4,
                        align: 'left'
                    }
                );

            })

            //Draw lines.
            doc.lineWidth(0.5);

            //horizontal lines.
            for (let i = 0; i <= givenRangeGroupedData.length + 2; i++) {
                const y = table.y + i * table.rowHeight;
                doc.moveTo(table.x, y).lineTo(table.x + table.width, y).stroke();
            }

            //vertical lines.
            for (let i = 0; i <= columnCount; i++) {
                const x = table.x + i * columnWidth;
                doc.moveTo(x, table.y).lineTo(x, table.y + table.rowHeight * (givenRangeGroupedData.length + 2)).stroke();
            }

            //finalize the pdf and end the stream here.
            doc.end();

        }

    } catch (error) {

        console.error("Internal Error  occured while trying to download file", error.stack);
        return res.status(500).send("Internal Error  occured while trying to download file", error);
    }
}



module.exports = {
    loadDashboard,
    salesReport,
    getSaleData,
    exportAndDownload,

    loadBestSellers,

}