const express = require('express');
const adminRouter = express.Router();
const authenticate = require('../middleware/admin_auth');

adminRouter.use(authenticate.noCacheMiddleware);
adminRouter.use(express.urlencoded({ extended: true }));

//requiring multer logic here
const upload = require('../middleware/admin_upload');
adminRouter.use(authenticate.setViews);
const adminController = require('../controllers/adminController')

// Admin Signup done by postman
adminRouter.post('/signup', adminController.adminRegistration);

adminRouter.get('/login', authenticate.isLoggedOut, adminController.loadLogin);
adminRouter.post('/login', authenticate.isLoggedOut, adminController.loginAdmin);
adminRouter.get('/dashboard', authenticate.isLoggedIn, adminController.loadDashboard);
adminRouter.get('/api/sales-data', authenticate.isLoggedIn, adminController.getSaleData);
adminRouter.get('/api/doughnut-data', authenticate.isLoggedIn, adminController.getCategoryData)
adminRouter.get('/dashboard/sales-report', authenticate.isLoggedIn, adminController.salesReport);
adminRouter.get('/dashboard/export', authenticate.isLoggedIn, adminController.exportAndDownload);
adminRouter.get('/logout', authenticate.isLoggedIn, adminController.logoutAdmin);

adminRouter.get('/best_sellers', authenticate.isLoggedIn, adminController.loadBestSellers);

adminRouter.get('/coupons', authenticate.isLoggedIn, adminController.loadCoupons);
adminRouter.post('/coupons', authenticate.isLoggedIn, adminController.addNewCoupon);
adminRouter.patch('/coupons', authenticate.isLoggedIn, adminController.changeCouponStatus);

adminRouter.get('/offers', authenticate.isLoggedIn, adminController.loadOffers);
adminRouter.post('/offers', authenticate.isLoggedIn, adminController.addNewOffer);
adminRouter.get('/offers/category', authenticate.isLoggedIn, adminController.getCategoriesOrProductsForOffer);
adminRouter.get('/offers/:offerid', authenticate.isLoggedIn, adminController.getOfferDetails);
// adminRouter.get('/offers/product/:', authenticate.isLoggedIn, adminController.getProductsWithOffer);
adminRouter.put('/offers', authenticate.isLoggedIn, adminController.updateOffer);

adminRouter.get('/customers', authenticate.isLoggedIn, adminController.loadCustomerList);
adminRouter.patch('/customers', authenticate.isLoggedIn, adminController.blockOrUnblockUser);
adminRouter.delete('/customers', authenticate.isLoggedIn, adminController.deleteUser);

adminRouter.get('/category', authenticate.isLoggedIn, adminController.loadCategory);
adminRouter.post('/category', authenticate.isLoggedIn, adminController.addBrandOrCategory);
adminRouter.patch('/category', authenticate.isLoggedIn, adminController.softDeleteCategory);
adminRouter.put('/category', authenticate.isLoggedIn, adminController.updateCategory);

adminRouter.get('/productslist', authenticate.isLoggedIn, adminController.loadAllProducts);
adminRouter.patch('/productslist', authenticate.isLoggedIn, adminController.softDeleteProducts);
adminRouter.get('/productslist/add_new_product', authenticate.isLoggedIn, adminController.loadAddNewProduct);
adminRouter.post('/productslist/add_new_product', authenticate.isLoggedIn, upload.array('image', 4), adminController.addNewProduct);
adminRouter.get('/productslist/edit_product', authenticate.isLoggedIn, adminController.loadEditProduct);
adminRouter.put('/productslist/edit_product', authenticate.isLoggedIn, upload.array('image', 3), adminController.updateProduct);

adminRouter.get('/order-list', authenticate.isLoggedIn, adminController.loadOrderList);
adminRouter.get('/order-list/order-details', authenticate.isLoggedIn, adminController.loadOrderDetails);
adminRouter.patch('/order-list/order-details', authenticate.isLoggedIn, adminController.updateOrderStatus);
adminRouter.get('/returned-order', authenticate.isLoggedIn, adminController.loadReturnedOrders);
adminRouter.put('/returned-order', authenticate.isLoggedIn, adminController.changeReturnStatus);



module.exports = adminRouter;