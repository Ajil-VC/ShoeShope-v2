const {User,OTP,Product,Category,Brand} = require('../models/models')
const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator');
const {appPassword} = require('../config/config')
const nodemailer = require('nodemailer')

const securePassword = async (password) => {
    
    try{

        const hashedP = await bcrypt.hash(password,10);
        return hashedP;

    }catch(error){
        console.log(error)
    }

}

const loadRegister = async(req,res) => {

    try{

        res.render('registration')

    }catch(error){
        console.log('something happened')
    }
}

//OTP Generating here
//************************************* */
const gen_otp = async(req,res) => {

    req.session.formdata = {...req.body}
    const {email} = {...req.body}

   
    const otp = otpGenerator.generate(5,{digits:true,alphabets:false,upperCaseAlphabets:false,lowerCaseAlphabets:false, specialChars:false})
    try{

        await OTP.create({email,otp})

        //Sending OTP to the email
        const transporter = nodemailer.createTransport({
            service : 'gmail',
            auth : {
                user : 'fullstackdevelopersince2024@gmail.com',
                pass : appPassword
            }
        });
        await transporter.sendMail({
            from : "fullstackdevelopersince2024@gmail.com",
            to : email,
            subject : "OTP Verification",
            text : `Your OTP for verification is " ${otp} "`
        });

        return res.status(200).render('otpVerification');
        
    }catch(error){
        console.log(error);
        res.status(500).send("Error sending OTP")
    }
}


//OTP verification here
//************************************* */
const verifyOTP = async(req,res) => {

   try{
    
    const otp = req.body.otp;
    const email = req.session.formdata.email;
    const userDatafromSession = req.session.formdata;

        /* Using .exec() with Mongoose queries ensures a promise is returned,
        aligning with modern JavaScript practices for handling asynchronous operations. */
        const otpRecord = await OTP.findOne({email,otp}).exec()

        //Registering the user 
        if(otpRecord){        
            const sPassword = await securePassword(userDatafromSession.password)

            try{
                const newUser = new User({
                    firstName   : userDatafromSession.firstName,
                    lastName    : userDatafromSession.lastName,
                    email       : userDatafromSession.email,
                    mobile_no   : userDatafromSession.mobile_no,
                    password    : sPassword,
                    isVerified  : 1  
                })

        
                const userData = await newUser.save();

                if(userData){
                    return res.status(200).send('successfully registered')
                }else{
                    res.send('Something went wrong while registering')
                }
            }catch(error){
                res.status(500).send('Internal server error while registering')
            }
            
        }else{
            return res.status(400).send('Invalid otp')
        }

   }catch(error){
    console.log("Error in verifying otp\n",error)
    return res.status(500).send('Error in verifying otp')
   }
}

const loadLogin = (req,res) => {

    try{
        return res.status(200).render('login')
    }catch(error){
        console.log("Error while loading login\n",error)
        return res.status(500).send('Something Went Wrong')
    }
}

const loginUser = async (req,res) => {

    try{

        const {email,password} = req.body;

        const userData = await User.findOne({email}).exec();
        const passwordMatch = await bcrypt.compare(password,userData.password)
        
        if(passwordMatch){

            req.session.user_id = userData._id; 
            req.session.isAuthorised = userData.isAuthorised; 
            req.session.isBlocked = userData.isBlocked;
            console.log(req.session)

            return res.status(200).redirect('home')
        }else{
            return res.status(404).send('User Not Found')
        }

    }catch(error){
        
        console.log('Error while loggin in',error);
        return res.status(500).send("Internal server error while logging in")
    }
}

const loadHomePage = async(req,res) => {

    try {

        const products = await Product.find().sort({_id : -1}).limit(8) ;
       
        res.status(200).render('home',{products}) ;

    }catch(error){
        console.log("Internal Error while loading home page",error);
        res.status(500).send("Internal Error while loading home page");
    }
}

const loadMensShowcase = async(req,res) => {

    try{

        const category = await Category.find().exec();
        const brand = await Brand.find().exec();
        console.log("Going to search ")
        const groupProducts = await Product.find({targetGroup : "Men"}).exec(); 

        if(category.length == 0){
            console.log("\n\n\n Category is empty\n\n\n");
        }
        if(brand.length == 0){
            console.log("\n\n\n Brand is empty\n\n\n");
        }
        
        return res.status(200).render('mens',{category,brand,groupProducts}) ;

        
    }catch(error){

    }
}

module.exports = {
    loadRegister,
    loadLogin,
    loginUser,
    gen_otp,
    verifyOTP,
    loadHomePage,
    loadMensShowcase
  
}