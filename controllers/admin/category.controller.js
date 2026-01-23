
const { Order } = require('../../models/models');


const getCategoryData = async (req, res) => {

    try {

        const categoryWiseData = await Order.aggregate([{
            $unwind: '$items'
        }, {
            $match: {
                'items.paymentStatus': 'PAID'
            }
        }, {
            $group: {
                _id: '$items.product.Category',
                totalQtySold: { $sum: '$items.quantity' }
            }
        }, {
            $sort: { totalQtySold: -1 }
        }
        ]);

        const labelsData = [];
        const valuesData = [];
        categoryWiseData.forEach(ob => {

            labelsData.push(ob._id);
            valuesData.push(ob.totalQtySold);

        });

        return res.status(200).json({
            "labels": labelsData,
            "values": valuesData
        });

    } catch (error) {

        console.error("Internal error while trying to get category details for doughnut graph", error.stack);
        return res.status(500).send("Internal error while trying to get category details for doughnut graph", error);
    }

}


module.exports = {
    getCategoryData
}