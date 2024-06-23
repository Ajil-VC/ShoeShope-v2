const express = require('express');
const userRouter = express.Router();
const {isLoggedIn} = require('../middleware/user_auth');
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

userRouter.get('/home',isLoggedIn,userController.loadHomePage)

module.exports = userRouter;