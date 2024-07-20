const express = require('express');
const adminRouter = express.Router();
const path = require('path');
const fs = require('fs');

adminRouter.use(express.urlencoded({ extended: true }));

const multer = require('multer')
const storage = multer.diskStorage({
    destination: function(req,file,cb){

        console.log("This is inside multer",req.body)
        let directoryPath = path.join(__dirname,'../public/ProductImage')
        if(fs.existsSync(directoryPath)){
            
            // if(fs.existsSync(path.join(directoryPath,req.body.brand))){

            //     directoryPath = path.join(directoryPath,req.body.brand);
            //     cb(null,directoryPath);

            // }else{

            //     fs.mkdirSync(path.join(directoryPath,req.body.brand),{recursive : true});
            //     directoryPath = path.join(directoryPath,req.body.brand);
            //     cb(null,directoryPath);
            // }
     
            cb(null,directoryPath);

        }else{

            // fs.mkdir(directoryPath, {recursive : true}, (err) => {

            //     if(err){
            //         console.log("Error while creating parent folder(ProductImage)",err);
            //     }else{
            //         console.log("ProductImage Folder created successfully");
            //         fs.mkdirSync( path.join(directoryPath,req.body.brand),{recursive : true})
                  
            //                 console.log(`Folder ${req.body.brand} created successfully`)
            //                 directoryPath = path.join(directoryPath,req.body.brand);
            //                 cb(null,directoryPath);
                       
                     
            //     }
            // });
            fs.mkdirSync(directoryPath );
            cb(null,directoryPath)

        }

    },
    filename: function(req,file,cb){
        const name = Date.now()+'_'+file.originalname;
        cb(null,name)
    }
})
const upload = multer({storage:storage})

adminRouter.use((req,res,next) => {

    req.app.set('views','./views/Admin');
    next();
    
})
const adminController = require('../controllers/adminController')

// Admin Signup done by postman
adminRouter.post('/signup',adminController.adminRegistration);

adminRouter.get('/login',adminController.loadLogin);
adminRouter.post('/login',adminController.loginAdmin);
adminRouter.get('/dashboard',adminController.loadDashboard);

adminRouter.get('/customers',adminController.loadCustomerList);
adminRouter.patch('/customers',adminController.blockOrUnblockUser);
adminRouter.delete('/customers',adminController.deleteUser);

adminRouter.get('/category',adminController.loadCategory);
adminRouter.post('/category',adminController.addBrandOrCategory);
adminRouter.patch('/category',adminController.softDeleteCategory);
adminRouter.put('/category',adminController.updateCategory);

adminRouter.get('/productslist',adminController.loadAllProducts);
adminRouter.patch('/productslist',adminController.softDeleteProducts);
adminRouter.get('/productslist/add_new_product',adminController.loadAddNewProduct);
adminRouter.post('/productslist/add_new_product',upload.array('image',3),adminController.addNewProduct);
adminRouter.get('/productslist/edit_product',adminController.loadEditProduct);
adminRouter.put('/productslist/edit_product',upload.array('image',3),adminController.updateProduct);

adminRouter.get('/order-list',adminController.loadOrderList);
adminRouter.get('/order-list/order-details',adminController.loadOrderDetails);
adminRouter.patch('/order-list/order-details',adminController.updateOrderStatus);
adminRouter.get('/returned-order',adminController.loadReturnedOrders);
adminRouter.put('/returned-order',adminController.changeReturnStatus);



module.exports = adminRouter;