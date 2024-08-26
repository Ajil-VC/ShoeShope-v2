const cron = require('node-cron');
const { Product, Category, Offer } = require('../models/models');

async function setupSheduledTask() {

    try {

        // Daily task
        // cron.schedule('0 0 * * *', () => {
        //     console.log('Running daily task');
        //     // Your daily task logic here
        // });

        
        cron.schedule('0 3 * * *', async function () {
            console.log('Running task every 1 minutes');

            try {

                const offers = await Offer.find();
                console.log(offers, "This is offers");

                //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::://
                // const expiredOffers = offers;// Should Remove this line after.This is not actual expiredOffers.
                //Commented snippet below is the actual expired offers.

                const currentDate = new Date();
                const expiredOffers = offers.filter(offer => {
                    return currentDate >= offer.endDate;
                })
                // console.log(expiredOffers,'Expired.');
                //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::://

                await Promise.all(expiredOffers.map(async (offer) => {

                    let products = [];

                    if (offer.applicableOn == 'product') {

                        const fetchedProducts = offer.products.map(productId => {

                            return Product.find({ _id: productId });
                        })
                        products = (await Promise.all(fetchedProducts)).flat();

                    } else if (offer.applicableOn == 'category') {

                        const fetchedCategories = offer.categories.map(async catId => {

                            return Category.findOne({ _id: catId }).exec();
                        })
                        const categoryDocuments = await Promise.all(fetchedCategories);
                        const categoryNames = categoryDocuments.map(category => category.name);
                        products = await Product.find({ Category: { $in: categoryNames } });

                    }

                    //Below im reverting the offers.

                    const updatedProductDetails = products.map(async item => {

                        item.salePrice = item.regularPrice; 
                        item.isOnOffer = false;
                        item.appliedOffer = null;
                        await item.save();
                        return item;
                  
                    })
                
                    if(updatedProductDetails){

                        const isOfferDeleted = await Offer.deleteOne({_id : offer._id}).exec();
                    
                    }

                }))

            } catch (error) {
                console.error('Internal error occured while trying to process the sheduled job.', error);
            }

        });


    } catch (error) {

        console.error('Internal error occured while sheduling the job.', error);
    }


}


module.exports = setupSheduledTask;