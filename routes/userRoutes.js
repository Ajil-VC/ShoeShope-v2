const express = require('express');
const userRouter = express.Router();
const authenticate = require('../middleware/user_auth');
const {passport} = require('../middleware/googleauth');


userRouter.use(express.urlencoded({extended:true}));


userRouter.use((req,res,next) => {
    
    req.app.set('views','./views/Users');
    next();

})

const userController = require('../controllers/userController');

userRouter.get('/',(req,res) => {
    res.send('This is user route')
})

//Registration
userRouter.get('/signup',userController.loadRegister) ;
userRouter.post('/signup',userController.gen_otp) ;
userRouter.get('/resend_otp',userController.resend_otp) ;
userRouter.post('/signup/verify-otp',userController.verifyOTP) ;

//Login
userRouter.get('/login',userController.loadLogin) ;
userRouter.post('/login',userController.loginUser) ;
userRouter.get('/home',userController.loadHomePage) ;

//google auth
userRouter.get('/auth/google', passport.authenticate('google',{scope:['email','profile']}))
userRouter.get('/google/callback',passport.authenticate('google',{
    successRedirect : '/home',
    failureRedirect : '/auth/failure'
}))
userRouter.get('/auth/failure',(req,res) => {
    res.send("Something went wrong....")
})

userRouter.get('/home',userController.loadHomePage) ;
userRouter.get('/showcase',userController.loadShowcase) ;
userRouter.get('/product_details',userController.loadProductDetails) ;
userRouter.post('/product_details',authenticate.isLoggedIn,userController.addProductToCart)
userRouter.get('/cart',authenticate.isLoggedIn,userController.loadCart);
userRouter.delete('/cart',authenticate.isLoggedIn,userController.removeProductFromCart);
userRouter.put('/cart',authenticate.isLoggedIn,userController.selectItemToOrder);
userRouter.patch('/cart',authenticate.isLoggedIn,userController.changeQuantity);

userRouter.get('/checkout',authenticate.isLoggedIn,userController.validateCart);
userRouter.get('/checkout_page',authenticate.isLoggedIn,userController.loadCheckout);
userRouter.patch('/checkout_page',authenticate.isLoggedIn,userController.changeDeliveryAddress);
userRouter.post('/checkout_page/addAddress',userController.addNewAddress);

userRouter.get('/profile',authenticate.isLoggedIn,userController.loadUserProfile)
userRouter.put('/profile/account-detail',userController.updateUserProfile)
userRouter.post('/profile/address',userController.addNewAddress);
userRouter.patch('/profile/address',userController.makeDefaultAddress);
userRouter.delete('/profile/address',userController.deleteAddress);
userRouter.put('/profile/address',userController.updateAddress);
userRouter.get('/profile/logout',authenticate.isLoggedIn,userController.logoutUser);


module.exports = userRouter;