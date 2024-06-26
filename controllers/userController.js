const {User,OTP,Product,Category,Brand,Address} = require('../models/models');
const mongoose = require('mongoose') 
const {ObjectId} = require('mongodb')
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
        console.log("Your OTP is : ",otp)
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
//resend otp here
//************************************* */
const resend_otp = async (req,res) => {

    console.log("Heloo this is resend  otp")
    console.log(req.session.formdata)
    const email = req.session.formdata.email;
   
    const otp = otpGenerator.generate(5,{digits:true,alphabets:false,upperCaseAlphabets:false,lowerCaseAlphabets:false, specialChars:false})
    try{
        console.log("Your OTP is : ",otp)
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

        return res.json({success:true,message : "OTP send to your email.."})
        
    }catch(error){
        console.log(error);
        res.status(500).send("Error sending OTP")
    }

}


//OTP verification here
//************************************* */
const verifyOTP = async(req,res) => {

   try{
    
    const otp = req.body.otp.join('');//Getting array of otp so added this
    const email = req.session.formdata.email;
    const userDatafromSession = req.session.formdata;
    console.log("From back:",otp)

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
                    console.log("User created successfully")
                    return res.status(201).json({status:true})
                }else{
                    res.send('Something went wrong while registering')
                }
            }catch(error){
                res.status(500).send('Internal server error while registering\nLooks like the email is already used.')
            }
            
        }else{
            return res.json({message:"Invalid otp!!",status:false});
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
        console.log(userData)
        if(userData.google_id){
            return res.status(200).redirect('/auth/google')
        }
        else if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password)
            
            if(passwordMatch){
    
                req.session.user_id = userData._id; 
                req.session.isAuthorised = userData.isAuthorised; 
                req.session.isBlocked = userData.isBlocked;
                console.log(req.session)
    
                return res.status(200).redirect('home')
            }else{
                return res.status(401).send('email or password incorrect');
            }
        }else{
            return res.status(404).send("User not found");
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

const loadShowcase = async(req,res) => {

    try{
     
        const targetGroup = req.query.group ;
        const category = await Category.find().exec(); 
        const brand = await Brand.find().exec();

        const groupProducts = await Product.find({targetGroup : targetGroup}).exec(); 

        if(category.length == 0){
            console.log("\n\n\n Category is empty\n\n\n");
        }
        if(brand.length == 0){
            console.log("\n\n\n Brand is empty\n\n\n");
        }
        
        return res.status(200).render('showcase',{category,brand,groupProducts,targetGroup}) ;

        
    }catch(error){
        console.log("Internal error while loading showcase");
        return res.status(500).send("Internal error while loading showcase");
    }
}




const loadProductDetails = async (req,res) => {

    const product_id = req.query.product_id ; 
    
    try{
        
        const product_details = await Product.findOne({ _id : product_id });
        const category  = product_details.Category ;
        const target    = product_details.targetGroup ;
 
        const related_products = await Product.find({ $and:[{Category : category},{targetGroup : target }]});

        return res.render('product_details',{product_details,related_products,target});

    }catch(error){

        console.log('Internal Error while loading product Details');
        return res.status(500).send("Internal Error while loading product Details");
    }

}


const loadUserProfile = async(req,res) => {

    let userID = '';
    try{
        if(req?.user?.google_id){
            userID = req.user._id;

        }else if(req.session.user_id){
            userID = req.session.user_id;
        }  

        const userDetails = await User.findOne({_id : userID}).exec() ;
        const defaultAddress =await Address.findOne({_id:{$in:userDetails.address},defaultAdd:1}).exec ();
        const otherAddress =await Address.find({_id:{$in:userDetails.address},defaultAdd:0}).exec ();
            console.log(otherAddress)
        if(!defaultAddress){

            return res.status(200).render('profile',{userDetails,defaultAddress});    
        }

        return res.status(200).render('profile',{userDetails,defaultAddress,otherAddress});
    }catch(error){

        console.log("Internal error while loading profile",error);
        return res.status(500).send("Internal error while loading profile",error);
    }
}

const updateUserProfile = async(req,res) => {

    const firstName = req.body.Fname;
    const lastName = req.body.Lname;
    const newPassword = req.body.npassword;
    const newHashedPassword = await securePassword(newPassword);
    console.log(newHashedPassword);
    let userID = "";
    if(req?.user?._id){
        userID = req.user._id;
    }else if(req.session.user_id){
        userID = req.session.user_id
    }
    try{

        await User.updateOne({_id:userID},{$set:{firstName:firstName,lastName:lastName,password:newHashedPassword}});
        // return res.status(200).json({status:true})
        return res.redirect('/profile')

    }catch(error){
        console.log("Internal Error whil updloading the profile details",error);
        return res.status(500).send("Internal Error whil updloading the profile details",error);
    }
}


const logoutUser = async(req,res) => {

    try{

        if(req?.user?.google_id){

            req.logout((err) => {
    
                if(err){
                    console.log("Error occured while trying to logout the passport authenticated user",err);
                    return next(err);
                }else{
                    console.log("User logged out successfully")
                    return res.status(302).redirect('/home')
                }
            })
            
        }
        else if(req.session.user_id){

            req.session.destroy((err) => {
                
                if(err){
                    console.error("Error while destroying session : ",err);
                    return res.status(500).send("Error while destroying session : ",err);
                }

                console.log("User logged out successfully");
                return res.status(302).redirect('/home');
            });
        }else{
            console.log("Unknown Error while logging out")
        }

    }catch(error){
        console.log("Internal error while trying to logout",error);
        return res.status(500).send("Internal error while trying to logout",error);
    }

}

const addNewAddress = async(req,res) => {

    let userID = "";
    let isDefault = 0;
    if(req?.user?._id){
        userID = req.user._id;
    }else if(req.session.user_id){
        userID = req.session.user_id
    }
    try{
        

        isDefault = await User.aggregate([
            {$match:{_id:new ObjectId(userID)}},{$project:{size:{$size:"$address"}}}
        ]).exec();
        console.log(isDefault);
        if(isDefault[0].size < 1 ){
            isDefault = 1;
        }else{
            isDefault = 0;
        }

        const newAddress = new Address({

            addressType : req.body.addressName,
            pinCode     : req.body.addressPincode,
            place       : req.body.addressPlace,
            city        : req.body.addressCity,
            district    : req.body.addressDistrict,
            state       : req.body.addressState,
            landmark    : req.body.addressLandmark,
            mobile_no   : req.body.addressMobile,
            defaultAdd  : isDefault
        })
        const addressData = await newAddress.save();
        if(addressData){
            
            await User.updateOne({_id:userID},{$push:{address : addressData._id}});
            return res.status(201).redirect('/profile')
        }else{
            console.log("Something went wrong while creating address");
            return res.send("Something went wrong while creating address");
        }

    }catch(error){
        console.log("Internal error while adding new Address",error);
        return res.status(500).send("Internal erro while adding new Address",error);
    }
}

const makeDefaultAddress = async(req,res) =>{
    
    const AddressId = req.query.AddressID;
    console.log("Why",AddressId)
    try{
        const address_id = new mongoose.Types.ObjectId(AddressId);
        
        let userID = "";
        if(req?.user?._id){
            userID = req.user._id;
        }else if(req.session.user_id){
            userID = req.session.user_id
        }
    
        const userDetails = await User.findOne({_id : userID}) 
        const removeDefaultAddress = await Address.updateMany({_id:{$in:userDetails.address},defaultAdd:1},{$set:{defaultAdd:0}}).exec ();
        console.log("Status of removal:",removeDefaultAddress.modifiedCount);
        
        await Address.updateOne({_id : address_id},{$set:{defaultAdd:1}}).exec();

        return res.status(200).json({status : true});

    }catch(error){

        console.log("Internal server error while trying to make default address",error)
        res.status(500).send("Internal server error while trying to make default address",error);
    }

}

const deleteAddress = async(req,res) => {

    const address_id = req.query.AddressID;
    const addressId = new mongoose.Types.ObjectId(address_id);
    let isDefault = 0;

    let userID = "";
        if(req?.user?._id){
            userID = req.user._id;
        }else if(req.session.user_id){
            userID = req.session.user_id
        }

    try{

        const userDetails = await User.findOne({_id : userID});
        const defaultAddress = await Address.findOne({_id:{$in:userDetails.address},defaultAdd:1}).exec ();
        
        isDefault = await User.aggregate([
            {$match:{_id:new ObjectId(userID)}},{$project:{size:{$size:"$address"}}}
        ]).exec();

        const isQueryAdAndDefaultAdEq = (addressId.toString() === defaultAddress._id.toString());
        if(!isQueryAdAndDefaultAdEq || (isQueryAdAndDefaultAdEq && isDefault[0].size == 1)){

            await User.updateOne({_id : userID},{$pull:{address:addressId}}).exec();
            await Address.deleteOne({_id: addressId }).exec();
            console.log("Address deleted Successfully.");
            return res.json({ status : true });

        }else{
            
            const otherAddress =await Address.findOne({_id:{$in:userDetails.address},defaultAdd:0}).exec ();
            await Address.updateOne({_id : otherAddress._id},{$set:{defaultAdd:1}}).exec();
            await User.updateOne({_id : userID},{$pull:{address:addressId}}).exec(); 
            await Address.deleteOne({_id: addressId }).exec();
            return res.json({ status : true });
        }

    }catch(error){

        console.log("Internal error while trying to delete address",error);
        return res.status(500).send("Internal error while trying to delete address",error);
    }
}

const updateAddress = async(req,res) => {

    //complete this part
}

const loadCart = async(req,res) => {

    console.log("Hellleooeo")
    try{

        return res.status(200).render('cart')

    }catch(error){
        console.log("Internal server error while trying to get cart",error);
        return res.status(500).send("Internal server error while trying to get cart",error);
    }
}

const addProductToCart = async(req,res) => {

    console.log("This is productID",req.query.product_id)
    let userID = "";
        if(req?.user?._id){
            userID = req.user._id;
        }else if(req.session.user_id){
            userID = req.session.user_id
        }
        console.log("This is User id:",userID)

        

    try{


    }catch(error){

        console.log("Internal Error while trying add product to the Cart",error);
        return res.status(500).send("Internal Error while trying add product to the Cart",error);
    }
}

module.exports = {

    loadRegister,
    loadLogin,
    loginUser,
    gen_otp,
    verifyOTP,
    loadHomePage,
    loadShowcase,
    loadProductDetails,
    resend_otp,
    loadUserProfile,
    updateUserProfile,
    addNewAddress,
    makeDefaultAddress,
    deleteAddress,
    updateAddress,
    logoutUser,
    loadCart,
    addProductToCart
  
}