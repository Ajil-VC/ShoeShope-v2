const {Admin,User,Category,Brand,Product,Order} = require('../models/models')
const bcrypt = require('bcrypt');
const mongoose = require('mongoose') 

const securePassword = async (password) => {
    
    try{

        const hashedP = await bcrypt.hash(password,10);
        return hashedP;

    }catch(error){
        console.log(error)
    }

}

const adminRegistration = async(req,res) => {


        try{

            const {firstName,lastName,email,password} = req.body
           
            const sPassword = await securePassword(password)


            const newAdmin = new Admin({
                firstName   : firstName,
                lastName    : lastName,
                email       : email,
                password    : sPassword,
                isAuthorised  : 1  
            })

    
            const adminData = await newAdmin.save();

            if(adminData){
                return console.log('Admin Created Successfully')
            }else{
                return console.log('Something went wrong while registering Admin')
            }
        }catch(error){
            console.log('Error while registering Admin\n',error);
        }
}

const  loadLogin = async(req,res) => {

    try{
        return res.status(200).render('adminLogin')
    }catch(error){
        console.log("Error when tried to login Admin", error)
        res.status(500).send('Internal Server Error')
    }
}

const loginAdmin = async(req,res) => {

    try{

        const {email,password} = req.body;

        const adminData = await Admin.findOne({email}).exec();
        if(!adminData){
            return res.status(404).send('Admin not found')
        }
        const passwordMatch = await bcrypt.compare(password,adminData.password)
        
        if(passwordMatch){
            req.session.admin_id = adminData._id; 
            req.session.isAuthorised = adminData.isAuthorised; 
            return res.status(200).redirect('dashboard')
        }else{
            return res.status(404).send('Email or Password Incorrect')
        }

    }catch(error){
        
        console.log('Error while Admin loggin in',error);
        return res.status(500).send("Internal server error while Admin login")
    }

}

const loadDashboard = (req,res) => {

    try{

        return res.status(200).render('dashboard');

    }catch(error){

        console.log("Error while rendering dashboard\n",error);
        return res.status(500).send("Error while rendering dashboard")
    }
}



const loadCustomerList = async(req,res) => {


    const page = parseInt(req.query.page) || 1 ;
    const limit = 5;
    try{

        //Getting fetched data here
        // const searchQuery = req.query.query;
        // console.log(typeof searchQuery)

        // if(typeof searchQuery === "undefined"){

        //     //If you don't provide .exec() at the end of a Mongoose query, Mongoose will still execute the query, but it won't return a promise immediately. Instead, it will return a Mongoose Query object, which allows for further chaining of query methods before execution.
        //     const userData = await User.find({ isVerified : 1 }).exec();
        //     return res.status(200).render('customerList',{users:userData});
        // }else{

        //     //'.*'+searchQuery+'.*' It will match any document where the field contains the substring and i stands for caseinsensitive
        //     const regexPattern = new RegExp('.*'+searchQuery+'.*','i');
        //     const userData = await User.find({firstName : regexPattern}).exec();

        //     return res.json(userData)

        // }

        const skip = (page - 1) * limit; 

        const userData = await User.find().skip(skip).limit(limit).exec();
        const totalDocuments = await User.countDocuments().exec();
        const totalPages = Math.ceil(totalDocuments / limit);
        return res.status(200).render('customerList',{user : userData, totalPages : totalPages, currentPage : page});
        // return res.status(200).json({user : userData, totalPages : totalPages, currentPage : page})

        
    }catch(error){
        console.log("Error While rendering customerList\n",error)
        return res.status(500).send('Server Error whil taking customer list',error)
    }
}

const blockOrUnblockUser = async (req,res) => {



    const idToBlockorUnblock = req.query.id;
    try{

        const userData = await User.findOne({_id:idToBlockorUnblock})
        if(!userData.isBlocked){
            const user = await User.findByIdAndUpdate({_id:idToBlockorUnblock},{$set:{isBlocked:1}});
            req.session.idToBlockorUnblock = false;
            return res.status(200).json({userID : user._id,isBlocked: user.isBlocked});
            
        }else{
            const user = await User.findByIdAndUpdate({_id:idToBlockorUnblock},{$set:{isBlocked:0}})
            //should send the json data to frontend and update it there.    
            return res.status(200).json({userID : user._id,isBlocked: user.isBlocked});
        }

    }catch(error){
        console.log('Internal Error while blocking or unblocking ',error)
        return res.status(500).send("Internal Error while blocking or unblocking")
    }

}

const deleteUser = async (req,res) => {
    
    const idToDelete = req.query.id;

    try{

        
        await User.deleteOne({_id : idToDelete})
        console.log("User Deleted successfully ")

        //should send the json data to frontend and update it there.
     

    }catch(error){
        console.log('Internal Error while deleting user',error)
        return res.status(500).send("Internal Error while deleting user")
    }

}


const loadCategory = async(req,res) => {

    try{
        const brands = await Brand.find({}).exec();
        const categoryDetails = await Category.find({}).exec();
     
        return res.status(200).render('categories',{brands,categoryDetails});

    }catch(error){

        console.log("Couldn't load category page");
        return res.status(500).send("Couldn't load category page")
    }
}

const addBrandOrCategory = async (req,res) => {

 
    if(req.query.brand){

        const newBrand = req.query.brand;

        try{

            await new Brand({
                name : newBrand
            }).save()
            
    
            console.log("Added Successfully Give a sweet alert here");
            return;
    
        }catch(error){
    
            console.log('Error while adding new Brand\n');
            return res.status(500).send("Error while adding new Brand");
    
        }

    }


    if(req.body.category.trim() && req.body.description.trim()){

        const category = req.body.category.trim() ;
        const description =  req.body.description.trim() ;

        try{

            const newCategory = await new Category({

                name : category,
                description : description
            })
            await newCategory.save();
            // const categoryDetails = await Category.find({});
            // return res.status(201).render('categories',{categoryDetails});
            return res.status(201).json({status : true});

        }catch(error){

            console.log("Error occured while creating Category\n",error)
            // return res.status(500).send("Category already saved in database.")
            return res.status(201).json({status : false,message : "Category already saved in database."});
        }
        
    }else{
      
    }
    
}

const softDeleteCategory = async(req,res) => {

    const itemID = new mongoose.Types.ObjectId(req.query.categoryID);
   
    try{

        const category = await Category.findOne({_id:itemID}).exec();
      
        if(category.isActive){
            
            const categoryDetails = await Category.findOneAndUpdate({_id:itemID},{$set:{isActive : 0}},{new : true}).exec();
            console.log(categoryDetails)
            return res.status(200).json({status : false,message : `${categoryDetails.name} Successfully deactivated.`});
        }else{

            const categoryDetails = await Category.findOneAndUpdate({_id:itemID},{$set:{isActive : 1}},{new : true}).exec();
            console.log(categoryDetails)
            return res.status(200).json({status : true,message : `${categoryDetails.name} Successfully Activated.`});
        }

    }catch(error){

        console.log("Error while performing softdeletion",error);
        return res.status(500).send('Error while performing softdeletion');
    }

}

const updateCategory = async(req,res) => {

    const categoryId = new mongoose.Types.ObjectId(req.query.id);
    const name = req.query.category_name;
    const description = req.query.description;

    try{

        const updpatedCategory = await Category.updateOne({_id : categoryId},{$set:{name:name,description:description}}).exec();

        if(updpatedCategory.modifiedCount){
        
            return res.status(200).json({status : true});
        }else{
        
            console.log("Could not update category.")
            return res.status(200).json({status : false,message : "Couldnt update category."});
        }

    }catch(error){

        if(error.code === 11000){
            console.log("1100000000 hahaha")
            return res.json({status : false,message : "Category already exist."});
        }

        console.log("Internal server error while performing udpation of categories.",error);
        return res.status(500).send("Internal server error while performing udpation of categories.",error);
    }
}



const loadAllProducts = async (req,res) => {

    const page = parseInt(req.query.page) || 1 ;
    const limit = 6;

    try{
     
        const skip = (page - 1) * limit; 
        const [products, totalDocuments] = await Promise.all([
            Product.find().skip(skip).limit(limit).exec(),
            Product.countDocuments().exec()
        ])
        const totalPages = Math.ceil(totalDocuments / limit);

        return res.render('productslist',{products,totalPages : totalPages, currentPage : page})

    }catch(error){

        console.log('Error while loading products\n',error);
        return res.status(500).send("Error while loading products")
    }
}

const softDeleteProducts = async(req,res) => {
    //Complete this function to list product
    const productID = req.query.productID;
    try{

        const product = await Product.findOne({_id:productID}).exec();
        
        if(product.isActive){
            
            await Product.updateOne({_id:productID},{$set:{isActive : 0}}).exec();
            const productDetails = await Product.find({});
            // return res.status(200).render('productslist',{productDetails})
            return res.json({productID : productID,isActive:0})
        }else{

            await Product.updateOne({_id:productID},{$set:{isActive : 1}}).exec();
            const productDetails = await Product.find({});
            return res.status(200).render('productslist',{productDetails})

        }

    }catch(error){

        console.log("Error while performing softdeletion of Produts",error);
        return res.status(500).send('Error while performing softdeletion Produts');
    }
}

const loadAddNewProduct = async(req,res) => {

    try{
        
        const categories = await Category.find({}).exec();
        const brand = await Brand.find({}).exec();

        return res.status(200).render('add-new-product',{categories,brand})

    }catch(error){

        console.log("Internal Error while loading addNewProduct\n",error);
        return res.status(500).send('Error while loading addNewProduct');
    }

}

const addNewProduct = async(req,res) => {

    const {productName,description,regularPrice } = req.body;
    const {salePrice,stockQuantity,category,brand,targetGroup} = req.body;

    const product_name = req.query.product_name;
    
    try{
        
        if(req.query.product_name){

            const isProductExist = await Product.findOne({ProductName : product_name}).exec();
            if(isProductExist){
    
                return res.status(200).json({status : false, message : `A product is already exist in the name ${product_name}`});
            }
            return res.json({status : true})
        }
        
        const newProduct = new Product({
            ProductName : productName,
            Description : description,
            regularPrice: regularPrice,
            salePrice   : salePrice,
            stockQuantity: stockQuantity,
            Category    : category,
            Brand   : brand,
            image   : req.files.map(file => file.filename),
            targetGroup : targetGroup
        });

        await newProduct.save();
        return res.status(201).json({status : true ,message:"Product Added Successfully"});

    }catch(error){

        console.log('Internal Error While Adding new product\n',error);
        return res.status(500).send('Internal Error While Adding new product');
    }
}

const loadEditProduct = async(req,res) => {

    const productId = new mongoose.Types.ObjectId(req.query.productId)
    try{
        
        const [categories,brand,product] = await Promise.all([
          
            Category.find({}).exec(),
            Brand.find({}).exec(),
            Product.findOne({_id : productId})
        ])
        if(!product){
            return res.status(404).send("Product not Found")
        }

        return res.status(200).render('edit-product',{categories,brand,product})

    }catch(error){

        console.log("Internal Error while loading addNewProduct\n",error);
        return res.status(500).send('Error while loading addNewProduct');
    }

}

const updateProduct = async(req,res) => {

    const productId = new mongoose.Types.ObjectId(req.query.productId);

    try{

        const product = await Product.findOne({_id : productId}).exec();
        console.log(product,"asdflkjh");
        if(!product){
            throw new Error('Product not found');
        }

        Object.keys(req.body).forEach(key => {
          
            if(req.body[key] !== undefined){
                product[key] = req.body[key];
            }
        })

    
        let newImages = null;
        if(req.files && req.files.length > 0){
            newImages = req.files.map(file => file.filename)
        
        }
        if(newImages){

            product.image = [...newImages,...product.image];
        }
     
        const updatedProduct = await product.save();
        if(updatedProduct){
            return res.status(200).json({status : true, redirect : `/admin/productslist/edit_product?productId=${productId}`});
        }

    }catch(error){
        console.log("Internal Error while updating product details.",error);
    }
}




const loadOrderList = async(req,res) => {

    const page = parseInt(req.query.page) || 1 ;
    const limit = 5;

    try{

        const skip = (page - 1) * limit; 
        
        const [orders,totalDocuments] = await Promise.all([
            
            Order.find().skip(skip).limit(limit).populate('customer').exec(),
            Order.countDocuments().exec()
        ])
        const totalPages = Math.ceil(totalDocuments / limit);
    
        return res.status(200).render('order-list',{orderlist : orders, totalPages : totalPages, currentPage : page});

    }catch(error){
        console.log("Internal error while trying to load order list",error);
    }
}

const loadOrderDetails = async(req,res) => {
 
    const orderId = new mongoose.Types.ObjectId(req.query.orderId)

    try{

        const orderDetails = await Order.findOne({_id : orderId}).populate('customer').populate('shippingAddress').exec();
        console.log(orderDetails)
   
        return res.status(200).render('order-details',{orderDetails});

    }catch(error){
        console.log("Internal Error occured while loading order Details.")
    }
}

const updateOrderStatus = async(req,res) => {

    const orderId = new mongoose.Types.ObjectId(req.query.orderId);
    const orderStatus = req.query.orderStatus;

    try{

        let order = await Order.findOneAndUpdate({_id : orderId},{$set:{status : orderStatus}},{new : true});

        if((order.confirmation ===  0) && (orderStatus === 'Delivered')){
        
            order = await Order.findOneAndUpdate({_id : orderId},{$set:{confirmation : 1}},{new : true});
            
            const prome = order.items.map(async item => {
                return Product.updateOne({_id : item.product.id},{$inc : { reserved : -item.quantity }}).exec();
            });
            
            await Promise.all(prome);
              
        }else if( (order.confirmation ===  0) && (orderStatus === 'Cancelled')) {

            order = await Order.findOneAndUpdate({_id : orderId},{$set:{confirmation : 1}},{new : true});
            
            const prome = order.items.map(async item => {
                return Product.updateOne({_id : item.product.id},
                    {$inc : { reserved : -item.quantity, stockQuantity : item.quantity }}).exec();
            });
            
            await Promise.all(prome);
            
        }
        
        return res.status(200).json({status : true, message : `Successfully set the status to ${orderStatus}`,orderstatus : orderStatus })
            
    }catch(error){
        console.log("Internal Error while trying to update the status of order.");
    }
}


module.exports = {
    adminRegistration,
    loadLogin,
    loginAdmin,
    loadDashboard,

    loadCustomerList,
    blockOrUnblockUser,
    deleteUser,
    
    loadCategory,
    addBrandOrCategory,
    softDeleteCategory,
    updateCategory,

    loadAllProducts,
    loadAddNewProduct,
    addNewProduct,
    loadEditProduct,
    updateProduct,
    softDeleteProducts,

    loadOrderList,
    loadOrderDetails,
    updateOrderStatus
}