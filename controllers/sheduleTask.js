const cron = require('node-cron');
const {Product, Category, Offer} = require('../models/models');

async function setupSheduledTask(){

    try{

        // Daily task
        cron.schedule('0 0 * * *', () => {
            console.log('Running daily task');
            // Your daily task logic here
        });
    
    
    
        // Task that runs every 1 minutes
        // Now it is used only for test. need to change the shedule time.
        cron.schedule('* * * * *', async function() {
            console.log('Running task every 1 minutes');
    
            try{

                const offers = await Offer.find();
                console.log(offers);
               
                //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::://
                const expiredOffers = offers;// Should Remove this line after.This is not actual expiredOffers.
                //Commented snippet below is the actual expired offers.

                // const currentDate = new Date();
                // const expiredOffers = offers.filter(offer => {
                //     return currentDate >= offer.endDate;
                // })
                // console.log(expiredOffers,'Expired.');
                //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::://

                

            }catch(error){
                console.error('Internal error occured while trying to process the sheduled job.',error);
            }
            
        });


    }catch(error){

        console.error('Internal error occured while sheduling the job.',error);
    }


}

module.exports = setupSheduledTask;