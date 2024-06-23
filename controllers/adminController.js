const {Admin,User,Category,Brand,Product} = require('../models/models')
const bcrypt = require('bcrypt');

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
    const limit = 10;
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
            await User.updateOne({_id:idToBlockorUnblock},{$set:{isBlocked:1}});
            //should send the json data to frontend and update it there.
            
        }else{
            await User.updateOne({_id:idToBlockorUnblock},{$set:{isBlocked:0}})
            //should send the json data to frontend and update it there.    
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


    if(req.query.color){

        const newBrand = req.query.brand;

        try{

            // await new Brand({
            //     name : newBrand
            // }).save()
            
    
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
            const categoryDetails = await Category.find({});
            return res.status(201).render('categories',{categoryDetails})

        }catch(error){

            console.log("Error occured while creating Category\n",error)
            return res.status(500).send("Category already saved in database.")
        }
        
    }else{
      
    }
    
}

const softDeleteCategory = async(req,res) => {

    const itemID = req.query.categoryID;
    try{

        const category = await Category.findOne({_id:itemID}).exec();
        
        if(category.isActive){
            
            await Category.updateOne({_id:itemID},{$set:{isActive : 0}}).exec();
            const categoryDetails = await Category.find({});
            return res.status(200).render('categories',{categoryDetails})
        }else{

            await Category.updateOne({_id:itemID},{$set:{isActive : 1}}).exec();
            const categoryDetails = await Category.find({});
            return res.status(200).render('categories',{categoryDetails})

        }

    }catch(error){

        console.log("Error while performing softdeletion",error);
        return res.status(500).send('Error while performing softdeletion');
    }

}


const loadAllProducts = async (req,res) => {

    try{

        return res.render('productslist')

    }catch(error){

        console.log('Error while loading products\n',error);
        return res.status(500).send("Error while loading products")
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

    console.log("\n\n\n\n\nChecking from back",req.files,"\n\n\n\n\n",req.body);

    const { productName,description,regularPrice } = req.body;
    const {salePrice,stockQuantity,category,brand,targetGroup} = req.body;

    try{
        //Add modal asking "Update details instead of creating duplicate."
   
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
        // return res.status(201).send("New Product added successfully");

    }catch(error){

        console.log('Internal Error While Adding new product\n',error);
        return res.status(500).send('Internal Error While Adding new product');
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
    loadAllProducts,
    loadAddNewProduct,
    addNewProduct
}