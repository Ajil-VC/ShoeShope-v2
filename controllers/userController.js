const {User,OTP,Product,Category,Brand,Address,Cart,Order,transaction,returnItem,wallet } = require('../models/models');

const mongoose = require('mongoose') 
const {ObjectId} = require('mongodb')
const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator');
const {appPassword} = require('../config/config')
const nodemailer = require('nodemailer')
const {add,format} = require('date-fns');
const crypto = require('crypto');


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
        console.log(userData,"This is user data\n\n\n\n")
        if(userData.google_id){
            return res.status(200).redirect('/auth/google')
        }else if(userData.isBlocked){
            return res.status(401).send("Unauthorized");
        }
        else if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password)
            
            if(passwordMatch){
    
                req.session.user_id = userData._id; 
                req.session.isAuthorised = userData.isAuthorised; 
                req.session.isBlocked = userData.isBlocked;
    
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


const searchProduct = async(req,res) => {

    try{

        const searchkey = req.query.searchkey;

        const products = await Product.aggregate([
            {
                $lookup: {
                  from: 'brands',
                  localField: 'Brand',
                  foreignField: 'name',
                  as: 'brandInfo'
                }
              },
              {
                $lookup: {
                  from: 'categories',
                  localField: 'Category',
                  foreignField: 'name',
                  as: 'categoryInfo'
                }
              },
              {
                $match: {
                  $or: [
                    { 'name': { $regex: searchkey , $options: 'i' } },
                    { 'brandInfo.name': { $regex: searchkey , $options: 'i' } },
                    { 'categoryInfo.name': { $regex: searchkey , $options: 'i' } },
                    { 'ProductName': {$regex: searchkey , $options: 'i'} }
                  ]
                }
              }
        ]).exec();

        if(products.length > 0){

            // return res.status(200).json({status:true, products});
            return res.status(200).render('product_search',{products});
        }else{
            return res.status(404).send('No products found');
            // return res.status(200).json({status:false, message : 'No products found'});
        }

    }catch(error){
        console.log("Internal error while fetching products from mongodb.",error);
        return res.send("Internal error while fetching products from mongodb.",error);
    }
}


const loadHomePage = async(req,res) => {

    try {

        const products = await Product.find({isActive : 1}).sort({_id : -1}).limit(8) ;
       
        res.status(200).render('home',{products}) ;

    }catch(error){
        console.log("Internal Error while loading home page",error);
        res.status(500).send("Internal Error while loading home page");
    }
}

const loadShowcase = async(req,res) => {

    if(req.accepts('html')){

        try{
         
            const targetGroup = req.query.group ;
            const [category, brand, groupProducts] = await Promise.all([
                Category.find({isActive : 1}).exec(),
                Brand.find().exec(),
                Product.find({targetGroup : targetGroup}).exec()
            ])
    
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
    }else{

        try{

      
            let query = {targetGroup : req.query.group};
            const queryArray = []
            const matchQuery = {$match : null};

            const brands = (req.query.brands === "undefined" || req.query.brands === '') ? [] : req.query.brands.split(',') ;
            const categories = req.query.categories === "undefined" || req.query.categories=== '' ? [] : req.query.categories.split(',');
            const sortvalue = parseInt(req.query.sortValue) ;
            
            if(brands.length > 0){
                query.Brand = {$in : brands}
            }
            if(categories.length > 0){
                query.Category = {$in : categories}
            }
          
            matchQuery.$match = query;
            queryArray.push(matchQuery);

            if(sortvalue && (sortvalue !== 'undefined')){
                const sortQuery = {$sort : { salePrice : sortvalue}}
                queryArray.push(sortQuery);
            }
            console.log(queryArray)
            const products = await Product.aggregate(queryArray)

            if(products.length > 0){

                return res.status(200).json({status:true, products});
            }else{
                return res.status(200).json({status:false, message : 'No products in this combination'});
            }

        }catch(error){
            console.log("Interal error while trying to search documents.",error);
        }
    }
}




const loadProductDetails = async (req,res) => {

    const product_id = req.query.product_id ; 
    let userID = "";
    if(req?.user?._id){
        userID = req.user._id;
    }else if(req.session.user_id){
        userID = req.session.user_id
    }
    let elemMatch = null;

    try{
        if(userID){

                elemMatch = await Cart.findOne({ 
                userId : userID,
                items:{$elemMatch: {
                    productId: product_id }
                }
            })
        }
        console.log("This is elem match\n\n\n\n",elemMatch,userID,"This is userID\n\n\n\n")
        const product_details = await Product.findOne({ _id : product_id });
        const category  = product_details.Category ;
        const target    = product_details.targetGroup ;
 
        const related_products = await Product.find({ $and:[{Category : category},{targetGroup : target }]});

        return res.render('product_details',{product_details,related_products,target, elemMatch});

    }catch(error){

        console.log('Internal Error while loading product Details',error);
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
   
      
        const [defaultAddress,otherAddress,orders,userWallet] = await Promise.all([
            Address.findOne({_id:{$in:userDetails.address},defaultAdd:1}).exec(),
            Address.find({_id:{$in:userDetails.address},defaultAdd:0}).exec(),
            Order.find({customer : userID}).populate('shippingAddress').exec(),
            wallet.findOne({userId : userID}).populate('transactions').populate().exec()
        ]);
console.log(userWallet)     
        return res.status(200).render('profile',{userDetails,defaultAddress,otherAddress,orders,userWallet});
    }catch(error){

        console.log("Internal error while loading profile",error);
        return res.status(500).send("Internal error while loading profile",error);
    }
}

const getOrderDetails = async(req,res) => {

    const orderId = new mongoose.Types.ObjectId(req.query.order_id);
    
    try{
        const order = await Order.findById({_id : orderId}).populate('shippingAddress');
        const products = order.items;
        const address = order.shippingAddress;
        const orderDate = order.orderDate;
        const orderStatus = order.status;
        console.log(order)
        return res.status(200).json({status : true, products,address,orderDate,orderStatus, orderId: order._id});

    }catch(error){
        console.log("Internal error while gettting order details.",error)
    }
    
}

const updateUserProfile = async(req,res) => {

    const firstName = req.body.Fname;
    const lastName = req.body.Lname;
    const newPassword = req.body.npassword;
    console.log(newPassword)
    const newHashedPassword = await securePassword(newPassword);
    
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

const addItemToWishlist = async(req,res) => {

    let userID = "";
    if(req?.user?._id){
        userID = new mongoose.Types.ObjectId(req.user._id);
    }else if(req.session.user_id){
        userID = new mongoose.Types.ObjectId(req.session.user_id)
    }
    const productId = new mongoose.Types.ObjectId(req.query.productId);
    
    try{

        const userData = await User.findOne({_id : userID});
        if(!userData.wishlist){
            userData.wishlist = [productId];
        }else{
            if(userData.wishlist.includes(productId)){
                //Element removal
                console.log(userData.wishlist)
                userData.wishlist = userData.wishlist.filter(item => !item.equals(productId));
                console.log(userData.wishlist)
                const isUpdated = await userData.save();
                if(isUpdated){
                    return res.status(200).json({status : true , add : -1});
                }
            }else{

                userData.wishlist.push(productId);
            }
        }
        const isUpdated = await userData.save();
        if(isUpdated){
            return res.status(200).json({status : true , add : 1});
        }else{
            return res.status(200).json({status : false});
        }

    }catch(error){
        console.log("Ineternal error occured while trying to add product to wishlist.",error);
        return res.status(500).send("Ineternal error occured while trying to add product to wishlist.",error);
    }

}


const loadWishlist = async(req,res) => {

    try{

        let userID = "";
        if(req?.user?._id){
            userID = new mongoose.Types.ObjectId(req.user._id);
        }else if(req.session.user_id){
            userID = new mongoose.Types.ObjectId(req.session.user_id)
        }

        const userData = await User.findOne({_id : userID}).populate('wishlist');
        console.log(userData);

        return res.status(200).render('wishlist',{userData});

    }catch(error){
        console.log("Internal error occured while trying to load wishlist",error);
        return res.status(500).send("Internal error occured while trying to load wishlist",error);
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
    if(req?.user?._id){
        userID = new mongoose.Types.ObjectId(req.user._id);
    }else if(req.session.user_id){
        userID = new mongoose.Types.ObjectId(req.session.user_id)
    }
    let isDefault = 0;
    let selectedAdd = false
    
    
    try{
        

        isDefaultAd = await User.aggregate([
            {$match:{_id:new ObjectId(userID)}},{$project:{size:{$size:"$address"}}}
        ]).exec();
       
        if(isDefaultAd[0].size < 1){
            isDefault = 1;
            selectedAdd = true;
        }else if(req.query.action == 'checkout'){
            const setSelectedAddrStatus = await Address.updateMany({userId : userID,selectedAdd : true},{$set : {selectedAdd : false}}).exec();
        
            if(setSelectedAddrStatus.acknowledged){
          
                selectedAdd = true;
            }
        }else{
            isDefault = 0;
        }
        
        const newAddress = new Address({
            userId      : userID,
            addressType : req.body.addressName,
            pinCode     : req.body.addressPincode,
            place       : req.body.addressPlace,
            city        : req.body.addressCity,
            district    : req.body.addressDistrict,
            state       : req.body.addressState,
            landmark    : req.body.addressLandmark,
            mobile_no   : req.body.addressMobile,
            defaultAdd  : isDefault,
            selectedAdd : selectedAdd
        })
        const addressData = await newAddress.save();
        if(addressData){
            
            await User.updateOne({_id:userID},{$push:{address : addressData._id}});
            if(req.query.action == 'checkout'){
                
                return res.status(201).redirect('/checkout_page')    
            }
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
    console.log("new mongoose.Types.ObjectId(address_id);",addressId)
    let isDefault = 0;

    let userID = "";
        if(req?.user?._id){
            userID = req.user._id;
        }else if(req.session.user_id){
            userID = req.session.user_id
        }

    try{

        const userDetails = await User.findOne({_id : userID});
        const [defaultAddress, deletingAddress, isDefault] = await Promise.all([
            Address.findOne({_id:{$in:userDetails.address},defaultAdd:1}).exec (),
            Address.findOne({_id : addressId}).exec(),
            User.aggregate([
                {$match:{_id:new ObjectId(userID)}},{$project:{size:{$size:"$address"}}}
            ]).exec()
        ]);

        const isQueryAdAndDefaultAdEq = (addressId.toString() === defaultAddress._id.toString());
      
        if(!isQueryAdAndDefaultAdEq || (isQueryAdAndDefaultAdEq && (isDefault[0].size == 1))){
            if(deletingAddress.selectedAdd && !isQueryAdAndDefaultAdEq){
                await Address.updateOne({_id : defaultAddress._id},{$set:{selectedAdd : true}});
            }
            const isDeleted = await Address.deleteOne({_id: addressId }).exec();

            if(isDeleted.deletedCount){
                
                await User.updateOne({_id : userID},{$pull:{address:addressId}}).exec();
                console.log("Address deleted Successfully.");
                return res.json({ status : true });
            }

        }else{
            
            const otherAddress = await Address.findOne({_id:{$in:userDetails.address},defaultAdd:0}).exec ();

            if(isQueryAdAndDefaultAdEq && deletingAddress.selectedAdd){
                await Address.updateOne({_id : otherAddress._id},{$set:{defaultAdd:1, selectedAdd : true}}).exec();
            }else{

                await Address.updateOne({_id : otherAddress._id},{$set:{defaultAdd:1}}).exec();
            }
            
            const prome = await Promise.all([
                User.updateOne({_id : userID},{$pull:{address:addressId}}).exec(),
                Address.deleteOne({_id: addressId }).exec()

            ]);
            console.log(prome);
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


//CartItems Getting function
// --->
// --->
const cartItemsFindFn = async(userID) =>{

    try{

        let cartItemsArray = [];
        let subTotal = 0 ;
        let totalSelectedItems = 0;        
        const hasCart = await Cart.findOne({userId : userID});
     
        if(hasCart){

            let cartItems = await Cart.findById(hasCart._id).populate('items.productId');
            cartItemsArray = cartItems.items
     
            for(let i = 0 ; i < cartItemsArray.length ; i++){
                if(cartItemsArray[i].isSelected){
    
                    subTotal = subTotal + (cartItemsArray[i].productId.salePrice * cartItemsArray[i].quantity);
                    console.log(subTotal)
                    totalSelectedItems = totalSelectedItems + cartItemsArray[i].quantity;
                }
            }
        }
        let gst = (subTotal * (16 / 100)).toFixed(2);
        let totalAmount = subTotal + +gst;

        return { cartItemsArray,subTotal,totalAmount,gst,totalSelectedItems };
        
    }catch(error){
        throw new Error("Internal server error while getting cart Details.")
    }

}


const loadCart = async(req,res) => {

    let userID = "";
    if(req?.user?._id){
        userID = req.user._id;
    }else if(req.session.user_id){
        userID = req.session.user_id
    }
    try{

        const { cartItemsArray,subTotal,totalAmount,gst,totalSelectedItems } = await cartItemsFindFn(userID);
        return res.status(200).render('cart',{cartItemsArray,subTotal,totalAmount,gst,totalSelectedItems})

    }catch(error){
        console.log("Internal server error while trying to get cart",error);
        return res.status(500).send("Internal server error while trying to get cart",error);
    }
}

const addProductToCart = async(req,res) => {

    const productID = req.query.product_id;
    let userID = "";
        if(req?.user?._id){
            userID = req.user._id;
        }else if(req.session.user_id){
            userID = req.session.user_id
        }

    try{

        const hasCart = await Cart.findOne({userId : userID});
        if(hasCart){

            const item = {
                productId : productID,
                quantity  : 1
            }
            await Cart.updateOne({_id : hasCart._id},{$push:{items : item}});
            return res.status(201).json({status:true});
    
        }else{
            
            const newCart = new Cart({
                userId  : userID,
                items   : [
                    {
                        productId : productID,
                        quantity  : 1
                    }
                ]  
            });
    
            const cartData = await newCart.save();
            if(cartData){
                console.log("This is cartdata",cartData);
            }else{
                console.log("cart not added")
            }
            return res.status(201).json({status:true});
        }


    }catch(error){

        console.log("Internal Error while trying add product to the Cart",error);
        return res.status(500).send("Internal Error while trying add product to the Cart",error);
    }
}

const removeProductFromCart = async (req,res) => {
    
    let userID = "";
    if(req?.user?._id){
        userID = req.user._id;
    }else if(req.session.user_id){
        userID = req.session.user_id
    }
    const productId = req.query.productId ;
    
    try{

        const userCart = await Cart.findOne({userId : userID});
        console.log(userCart,"This is remova")

        await Cart.updateOne({userId : userID},{$pull : {items : {productId : productId }}});
        const { cartItemsArray,subTotal,totalAmount,gst,totalSelectedItems } = await cartItemsFindFn(userID);
        const totalCartItems = cartItemsArray.length;
        return res.status(200).json({
            status : true,
            productId : productId,
            subTotal : subTotal,
            totalAmount : totalAmount,
            gst : gst,
            totalCartItems : totalCartItems,
            totalSelectedItems : totalSelectedItems
        });

    }catch(error){

        console.log("Internal Error while trying to remove the product from cart",error);
        return res.status(500).send("Internal Error while trying to remove the product from cart",error);
    }
}

const selectItemToOrder = async(req,res) => {

    let userID = "";
    if(req?.user?._id){
        userID = new mongoose.Types.ObjectId(req.user._id);
    }else if(req.session.user_id){
        userID = new mongoose.Types.ObjectId(req.session.user_id)
    }
    const productId = req.query.productId ;
    const productID = new mongoose.Types.ObjectId(productId);
   

    try{

        const product =await Cart.aggregate([
            {$match : {userId : userID} },
            {$unwind:"$items"},
            {$match:{"items.productId" : productID}}
        ]).exec();
        let productIsSelected = product[0].items.isSelected;
        productIsSelected = !productIsSelected;

            await Cart.findOneAndUpdate(
            { userId: userID, 'items.productId': productId },
            { $set: { 'items.$.isSelected': productIsSelected } }, 
          );

          const { subTotal,totalAmount,gst,totalSelectedItems } = await cartItemsFindFn(userID);
          return res.status(200).json({
            status : true,
            productId : productId,
            subTotal : subTotal,
            totalAmount : totalAmount,
            gst : gst,
            totalSelectedItems : totalSelectedItems
        });

    }catch(error){

        console.log("Internal error while trying to select the item",error);
        return res.status(500).send("Internal error while trying to select the item",error)
    }
    
}

const changeQuantity = async (req,res) => {

    let userID = "";
    if(req?.user?._id){
        userID = new mongoose.Types.ObjectId(req.user._id);
    }else if(req.session.user_id){
        userID = new mongoose.Types.ObjectId(req.session.user_id)
    }
    const productId = req.query.productId ;
    const productID = new mongoose.Types.ObjectId(productId);
    const newQuantity = req.query.newQuantity;
    const shoeSize =req.query.shoeSize;
    if(newQuantity){

        try{
            const product = await Product.findOne({_id : productID}).exec();
            const productStock = product.stockQuantity;
    
            if(newQuantity > productStock){
                return res.json({status:false, message : `Only ${productStock} is available`,stock:productStock});
            }else if(newQuantity > 4){
                return res.json({status:false, message : "Max 4 items per product"});
            }else if(newQuantity < 1){
                return res.json({status: false, message : "Item quantity cannot be less than 1"})
            }      
            
            await Cart.findOneAndUpdate(
                { userId: userID, 'items.productId': productId },
                { $set: { 'items.$.quantity': newQuantity } }, 
              );
    
              const { subTotal,totalAmount,gst,totalSelectedItems } = await cartItemsFindFn(userID);
              return res.status(200).json({
                status : true,
                productId : productId,
                subTotal : subTotal,
                totalAmount : totalAmount,
                gst : gst,
                totalSelectedItems : totalSelectedItems
              })
    
        }catch(error){
            console.log("Internal Error while changing product quantity",error);
            return res.status(500).send("Internal Error while changing product quantity",error);
        }
    }

    if(shoeSize){
        
        try{

            await Cart.findOneAndUpdate(
                { userId: userID, 'items.productId': productId },
                { $set: { 'items.$.size': shoeSize } }, 
              );

        }catch(error){
            console.log("Internal Error while trying to change the size.",error);
            return res.status(500).send("Internal Error while trying to change the size.",error);
        }

    }

}


const loadCheckout = async(req,res) => {

    let userID = "";
    if(req?.user?._id){
        userID = new mongoose.Types.ObjectId(req.user._id);
    }else if(req.session.user_id){
        userID = new mongoose.Types.ObjectId(req.session.user_id)
    }

    try{

        const { cartItemsArray,subTotal,totalAmount,gst,totalSelectedItems } = await cartItemsFindFn(userID);
        
        const currentDate = new Date();
        const deliveryDate = add(currentDate, { days: 5 });
        const expectedDeliveryDate = format(deliveryDate,'EEEE yyyy MMMM dd');

        const address = await User.findById(userID).populate('address').exec();
        const selectedAddress = await Address.findOne({userId : userID,selectedAdd : true});
        
        return res.status(200).render('checkout',{
        cartItemsArray,
        subTotal,
        totalAmount,
        gst,
        totalSelectedItems,
        expectedDeliveryDate,
        selectedAddress,
        address
    })

    }catch(error){

        console.log("Internal error while loading checkout",error);
        return res.status(500).send("Internal error while loading checkout",error);
    }

}

const validateCart = async(req,res) => {

    let userID = "";
    if(req?.user?._id){
        userID = new mongoose.Types.ObjectId(req.user._id);
    }else if(req.session.user_id){
        userID = new mongoose.Types.ObjectId(req.session.user_id)
    }

    try{

        const { cartItemsArray,subTotal,totalAmount,gst,totalSelectedItems } = await cartItemsFindFn(userID);

            if(totalSelectedItems < 1){
                return res.json({status : false, message : "Need atleast 1 item selected to checkout"})
            }
console.log(cartItemsArray)            
            for(let i = 0 ; i < cartItemsArray.length ; i++){
                if((cartItemsArray[i].productId.isActive === 0) && cartItemsArray[i].isSelected){
                    return res.json({status : false , message : "Some Products are unavailable."});
                }if( cartItemsArray[i].isSelected ){
                    if(cartItemsArray[i].productId.stockQuantity < cartItemsArray[i].quantity){
                        return res.json({status : false , message : "Stock limit exceeded for some products. Please revise your selection."});
                    }
                }
            }

            res.json({
                status : true,
                redirect: '/checkout_page'
            })

    }catch(error){
        console.log("Internal error while validating cart",error);
        return res.status(500).send("Internal error while validating cart",error);
    }
}


const changeDeliveryAddress = async(req,res) => {

    let userID = "";
    if(req?.user?._id){
        userID = new mongoose.Types.ObjectId(req.user._id);
    }else if(req.session.user_id){
        userID = new mongoose.Types.ObjectId(req.session.user_id)
    }
    const addressId = new mongoose.Types.ObjectId(req.query.addressId);
    
    try{

        const setSelectedAddrStatus = await Address.updateMany({userId : userID,selectedAdd : true},{$set : {selectedAdd : false}}).exec();
        if(setSelectedAddrStatus.acknowledged){

            const address = await Address.findOneAndUpdate({_id : addressId},{$set:{selectedAdd : true}},{new : true});
            
            return res.status(200).json({status: true,address});
        }

    }catch(error){

        console.log("Internal Error while trying to change the address",error)
        return res.status(500).send("Internal Error while trying to change the address",error);
    }
    

}

const getItemsAndReserve = async(cartItemsArray) =>{
  
    try{

        //getting the purchasing item according to the selection.
        const productsToOrder = cartItemsArray.filter(filteringItem  => filteringItem.isSelected == true )  
        .map(item =>{
    
            return {
                product : {
                    id : item.productId._id,
                    name : item.productId.ProductName,
                    size : item.size,
                    Brand : item.productId.Brand,
                    Category : item.productId.Category,
                    price : item.productId.salePrice,
                    images : [item.productId.image[0],item.productId.image[1]],
                },
                quantity: item.quantity,
                subtotal : (item.productId.salePrice) * (item.quantity)
            }
    
        });

        if(productsToOrder.length < 1){
            
            return null;
        }
       
        try{
            const concurrentReservation = productsToOrder.map(async item => {

                const productIsAvailable = await Product.findById({_id : item.product.id});
                if(!productIsAvailable){

                    throw new Error(`Product not found ${item.product.id}`);
                }else if(productIsAvailable.stockQuantity < item.quantity){
                    
                    //Need to handle the rollback if one product is insufficient in stock.

                    throw new Error(`Insufficient stock for the product ${item.product.id}`);
                }

                return Product.updateOne(
                    {_id : item.product.id},
                    {$inc :{
                        reserved : item.quantity,
                        stockQuantity : -item.quantity     
                    }}
                );  
            })

            const reservationResult = await Promise.all(concurrentReservation);
            const reservedItemCount = reservationResult.reduce((acc,cur) => {
                return acc + cur.modifiedCount;
            },0);
            if(reservedItemCount == productsToOrder.length){
                console.log("Completly reserved");
                return productsToOrder;
            }else{
                console.log("Couldn't reserve all the products choosed.");
                console.log("Here is the reservation result: ",reservationResult);
                return null;
            }

        }catch(error){

            console.log("Internal error while reserving the products",error);
        }

        
    }catch(error){
        console.log("Error while getting and reserving the items.",error);
        return res.status(500).send("Error while getting and reserving the items.",error);
    }
   
}


const makeRazorpayment = async(razorpay, amountToPay,orderId) => {

    const options = {

        amount : amountToPay * 100,
        currency : 'INR',
        // receipt : 'receipt_' + Date.now()
        receipt : orderId
    };

    try{

        const order = await razorpay.orders.create(options);
        return order;
    }catch(error){

        console.log("Internal error while trying to perform razorpayment",error);
        return false;
    }

}


const placeOrder = async(req,res) => {

    let userID = "";
    if(req?.user?._id){
        userID = new mongoose.Types.ObjectId(req.user._id);
    }else if(req.session.user_id){
        userID = new mongoose.Types.ObjectId(req.session.user_id)
    }

    const paymentMethod = req.query.paymentMethod;
    const razorpay = req.razorpay;
    const razorpay_key = req.razorpay_key;
    
    if(req?.params?.address_is_selected){
        //In this block im checking if any address is selected.   
        try{

            const isAdSelected = await Address.findOne({userId : userID, selectedAdd : true}).exec();

            if(isAdSelected){
                return res.status(200).json({status : true});
            }else{
                return res.json({status : false, message : "Please select an address."});
            }

        }catch(error){
            console.log("Internal error occured while trying to check if address is selected.",error);
            return res.status(500).send("Internal error occured while trying to check if address is selected.",error);
        }
    }


    try{
      
        const { cartItemsArray,subTotal,totalAmount,gst,totalSelectedItems } = await cartItemsFindFn(userID);
        const address = await Address.findOne({userId : userID, selectedAdd : true});
        const productsToOrder = await getItemsAndReserve(cartItemsArray);
        var amountToPay = totalAmount;

        if(productsToOrder){

            const newOrder = new Order({
               
                paymentGatewayOrderId: null,
                customer    : userID,
                items       : productsToOrder,
                totalItems  : totalSelectedItems,
                subTotal    : subTotal,
                gstAmount   : gst,
                discount    : 0,
                totalAmount : totalAmount,
                shippingAddress : address._id,
                paymentMethod   : paymentMethod
    
            });
    

            if(paymentMethod !== 'Cash on Delivery'){

                var orderResult = await makeRazorpayment(razorpay, amountToPay,newOrder._id);
                console.log(orderResult);
                newOrder.paymentGatewayOrderId = orderResult.id;
    
            }                
            
            const orderDetails = await newOrder.save();

            if(orderDetails){
                
                const IdsToRemoveFromCart = productsToOrder.map(item => item.product.id)
               
                await Cart.updateOne({userId : userID},{$pull: {
                    items: { 
                        productId: {$in : IdsToRemoveFromCart}
                    }}
                }) 

                if(paymentMethod !== 'Cash on Delivery'){
        
                    return res.status(201).json({status : true,razorpay_key : razorpay_key, orderResult})
                }  
                return res.status(201).json({status : true,redirect:`/order_placed?order_id=${orderDetails._id}`})
    
            }else{
                console.log("Couldn't make the order")
                return res.json({status : false,message:"Couldn't place the order"})
            }
            
        }else{
            return res.json({status : false,message:"Need ateleast 1 item to proceed"})
        }

    }catch(error){

        console.log("Internal error while trying to place order.",error);
        return res.json({status : false,message:"Internal server error while placing the order"})
       
    }
}


const paymentVerification = async(req,res) => {

    let userID = "";
    if(req?.user?._id){
        userID = new mongoose.Types.ObjectId(req.user._id);
    }else if(req.session.user_id){
        userID = new mongoose.Types.ObjectId(req.session.user_id)
    }
    
    try{
        const { orderId, paymentId, signature,amount } = req.body;

        const expectedSignature = await crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');
  
        if(expectedSignature === signature){
            
            const Transaction = new transaction({
                
                userId : userID,
                orderId, 
                paymentId,
                amount : amount,
                type : 'payment',
                status: 'completed',
                currency: 'INR',
                description: ""
            });
    
            const transactionSaveResult = await Transaction.save();
            if(transactionSaveResult){

                return res.status(201).json({status : true, redirect : `/order_placed?order_id=${orderId}`});
            }else{
                return res.json({status : false , message : 'Could not save transaction details.'});
            }
        }else{
            return res.json({status : false, message : 'Invalid Signature'});
        }
    }catch(error){

        console.log("Internal error while trying to make transaction.",error);
    }
}

const loadOrderPlaced = async(req,res) => {

    try{

        return res.status(200).render('order_placed',{order_id : req.query.order_id})

    }catch(error){
        console.log("Internal error while loading order placed page",error);
    }
}

const initiateReturn = async(req,res) => {

    try{

        let userID = "";
        if(req?.user?._id){
            userID = new mongoose.Types.ObjectId(req.user._id);
        }else if(req.session.user_id){
            userID = new mongoose.Types.ObjectId(req.session.user_id)
        }

        const return_item_id = new mongoose.Types.ObjectId(req.query.return_item_id);
        const order_id = new mongoose.Types.ObjectId(req.query.order_id);
        const reason = req.query.reason;
    
        const isReturned = await returnItem.findOne({order : order_id, productId : return_item_id}).exec();
        if(isReturned){
            return res.json({status : false, message : `Return already Initiated with the reason: ${isReturned.reason}`});
        }

        const order = await Order.findOne({_id : order_id}).exec();

        for(let i = 0 ; i < order.items.length ; i++){
            
            if(order.items[i].product.id.toString() === return_item_id.toString()){
                var amount = order.items[i].subtotal;
            
            }
        }


        
        const returnDetails = new returnItem({

            productId: return_item_id,
            customer: userID,
            order: order_id,
            refundAmnt: amount,
            reason: reason,
            status: 'initiated',
            
        })

        const returnData = await returnDetails.save();
        if(returnData){
            
            return res.status(200).json({status : true, message : 'Return initialized.'});
        }else{
            console.log("Couldn't initiate the return.");
            return res.json({status : false, message : 'Couldnt initiate the return.'});
        }


    }catch(error){
        console.log("Internal error while trying to post the return request",error);
        return res.status(500).send("Internal error while trying to post the return request",error);
    }
}

module.exports = {

    loadRegister,
    loadLogin,
    loginUser,
    gen_otp,
    verifyOTP,
    resend_otp,

    loadHomePage,
    loadShowcase,
    searchProduct,
    loadProductDetails,
    loadUserProfile,
    updateUserProfile,
    
    addNewAddress,
    makeDefaultAddress,
    deleteAddress,
    updateAddress,

    addItemToWishlist,
    loadWishlist,

    logoutUser,
    loadCart,
    addProductToCart,
    removeProductFromCart,
    selectItemToOrder,
    changeQuantity,

    validateCart,
    loadCheckout,
    changeDeliveryAddress,
    placeOrder,
    paymentVerification,
    loadOrderPlaced,
    getOrderDetails,

    initiateReturn
  
}