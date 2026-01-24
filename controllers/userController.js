const { User, OTP, Product, Category, Brand, Address, Cart, Order, transaction, returnItem, wallet, coupon } = require('../models/models');

const mongoose = require('mongoose')
const { ObjectId } = require('mongodb')
const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator');
const { appPassword, webhookSecret } = require('../config/config')
const nodemailer = require('nodemailer')
const { add, format } = require('date-fns');
const crypto = require('crypto');

const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const puppeteer = require('puppeteer');
const RESPONSE_MESSAGES = require('../config/response.messages');
const HttpStatusCode = require('../config/http_status_enum');


const securePassword = async (password) => {

    try {

        const hashedP = await bcrypt.hash(password, 10);
        return hashedP;

    } catch (error) {
        console.error(error.stack)
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).render('error', { code: '500', title: 'Oops!', message: RESPONSE_MESSAGES.COMMON.SERVER_ERROR });
    }

}

const loadRegister = async (req, res) => {

    try {

        return res.render('registration')

    } catch (error) {

        console.error(error.stack)
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).render('error', { code: '500', title: 'Oops!', message: "We couldn't find the page you were looking for." });
    }
}

//OTP Generating here
//************************************* */
const gen_otp = async (req, res) => {

    req.session.formdata = { ...req.body }
    const { email } = { ...req.body }


    const otp = otpGenerator.generate(5, { digits: true, alphabets: false, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false })
    try {

        await OTP.create({ email, otp })

        //Sending OTP to the email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'fullstackdevelopersince2024@gmail.com',
                pass: appPassword
            }
        });
        await transporter.sendMail({
            from: "fullstackdevelopersince2024@gmail.com",
            to: email,
            subject: "OTP Verification",
            text: `Your OTP for verification is " ${otp} "`
        });

        return res.status(HttpStatusCode.OK).render('otpVerification');

    } catch (error) {
        console.error(error.stack)
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).render('error', { code: '500', title: 'Oops!', message: "Error while sending otp. Please try again" });
    }
}
//resend otp here
//************************************* */
const resend_otp = async (req, res) => {

    const email = req.session.formdata.email;

    const otp = otpGenerator.generate(5, { digits: true, alphabets: false, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false })
    try {

        await OTP.create({ email, otp })

        //Sending OTP to the email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'fullstackdevelopersince2024@gmail.com',
                pass: appPassword
            }
        });
        await transporter.sendMail({
            from: "fullstackdevelopersince2024@gmail.com",
            to: email,
            subject: "OTP Verification",
            text: `Your OTP for verification is " ${otp} "`
        });

        return res.json({ success: true, message: "OTP send to your email.." })

    } catch (error) {

        console.error(error.stack)
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).render('error', { code: '500', title: 'Oops!', message: "Error While sending otp; Please try again." });
    }

}


//OTP verification here
//************************************* */
const verifyOTP = async (req, res) => {

    try {

        const otp = req.body.otp.join('');//Getting array of otp so added this
        const email = req.session.formdata.email;
        const userDatafromSession = req.session.formdata;

        /* Using .exec() with Mongoose queries ensures a promise is returned,
        aligning with modern JavaScript practices for handling asynchronous operations. */
        const otpRecord = await OTP.findOne({ email, otp }).exec()

        //Registering the user 
        if (otpRecord) {
            const sPassword = await securePassword(userDatafromSession.password)

            try {
                const newUser = new User({
                    firstName: userDatafromSession.firstName,
                    lastName: userDatafromSession.lastName,
                    email: userDatafromSession.email,
                    mobile_no: userDatafromSession.mobile_no,
                    password: sPassword,
                    isVerified: 1
                })


                const userData = await newUser.save();

                if (userData) {

                    return res.status(201).json({ status: true })
                } else {
                    res.send('Something went wrong while registering')
                }
            } catch (error) {
                res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send('Internal server error while registering\nLooks like the email is already used.')
            }

        } else {
            return res.json({ message: "Invalid otp!!", status: false });
        }

    } catch (error) {
        console.error("Errory while verifying otp.", error.stack)
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).render('error', { code: '500', title: 'Oops!', message: "Errory while verifying otp." });
        //This might need to change into json response. JSON ERROR
    }
}

const loadLogin = (req, res) => {

    try {
        return res.status(HttpStatusCode.OK).render('login')
    } catch (error) {

        console.error("Error while loading login page", error.stack)
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).render('error', { code: '500', title: 'Oops!', message: "Error while loading login page" });
    }
}

const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;

        const userData = await User.findOne({ email }).exec();
        if (userData.google_id) {
            return res.status(HttpStatusCode.OK).redirect('/auth/google')
        } else
            if (!userData.isBlocked) {//False means user is blocked.
                return res.status(HttpStatusCode.UNAUTHORIZED).render('error', { title: 'Unauthorized', message: RESPONSE_MESSAGES.AUTH.UNAUTHORIZED, code: '401' });
            }
            else if (userData) {
                const passwordMatch = await bcrypt.compare(password, userData.password)

                if (passwordMatch) {

                    req.session.user_id = userData._id;
                    req.session.isAuthorised = userData.isAuthorised;
                    req.session.isBlocked = userData.isBlocked;

                    return res.status(HttpStatusCode.OK).redirect('/')
                } else {
                    return res.status(RESPONSE_MESSAGES.AUTH.UNAUTHORIZED).render('error', { code: '401', title: 'Not Found!', message: RESPONSE_MESSAGES.AUTH.INVALID_CREDENTIALS });
                }
            } else {
                return res.status(HttpStatusCode.NOT_FOUND).render('error', { code: '404', title: 'Oops!', message: "User Not Found." });
            }

    } catch (error) {

        console.error('Internal Error while login', error.stack);
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).render('error', { code: '500', title: 'Oops!', message: "Internal error while login." });
    }
}

const searchProduct = async (req, res) => {

    try {

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
                        { 'name': { $regex: searchkey, $options: 'i' } },
                        { 'brandInfo.name': { $regex: searchkey, $options: 'i' } },
                        { 'categoryInfo.name': { $regex: searchkey, $options: 'i' } },
                        { 'ProductName': { $regex: searchkey, $options: 'i' } }
                    ]
                }
            }
        ]).exec();

        if (products.length > 0) {

            // return res.status(200).json({status:true, products});
            return res.status(HttpStatusCode.OK).render('product_search', { products });
        } else {
            return res.status(HttpStatusCode.NOT_FOUND).send('No products found');
            // return res.status(404).render('error',{code : '404',title : 'Oops!', message : "No Products Found." });
            // return res.status(200).json({status:false, message : 'No products found'});
        }

    } catch (error) {

        console.error('Internal error while fetching products from mongodb.', error.stack);
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).render('error', { code: '500', title: 'Oops!', message: "Internal error while fetching products." });
    }
}




const getTopProducts = async () => {


    try {


        const [bestSellingProducts, bestSellingCategories] = await Promise.all([

            Order.aggregate([
                { $unwind: "$items" },
                {
                    $match: {
                        "items.paymentStatus": 'PAID'
                    }
                },
                {
                    $group: {
                        _id: "$items.product.id",
                        productName: { $first: "$items.product.name" },
                        productPrice: { $first: "$items.product.price" },
                        productImage: { $first: "$items.product.images" },
                        totalUnitsSold: { $sum: "$items.quantity" },
                    }
                },
                { $sort: { totalUnitsSold: -1 } },
                { $limit: 4 }
            ]),

            Order.aggregate([

                { $unwind: "$items" },
                {
                    $match: {
                        "items.paymentStatus": 'PAID'
                    }
                },
                {
                    $group: {
                        _id: { category: "$items.product.Category", productId: "$items.product.id" },
                        productName: { $first: "$items.product.name" },
                        productPrice: { $first: "$items.product.price" },
                        productImage: { $first: "$items.product.images" },
                        totalUnitsSold: { $sum: "$items.quantity" },
                    }
                },
                { $sort: { "_id.category": 1, totalUnitsSold: -1 } },
                { $limit: 4 }
            ])


        ]);

        return { bestSellingProducts, bestSellingCategories };

    } catch (error) {
        console.error("Internal Error while trying to get best products.", error.stack);
        return null;
    }


}


const loadHomePage = async (req, res) => {

    try {

        const [activeCategory, allActiveProducts, { bestSellingProducts, bestSellingCategories }] = await Promise.all([

            Category.find({ isActive: 1 }),
            Product.find({ isActive: 1 }).sort({ _id: -1 }),
            getTopProducts()
        ])

        const categoryNames = activeCategory.map(cat => cat.name);
        const products = allActiveProducts.filter(product => {

            if (categoryNames.includes(product.Category)) {
                return product;
            }
        })

        return res.status(200).render('home', {
            products,
            bestSellingProducts,
            bestSellingCategories
        });

    } catch (error) {

        console.error('Internal Error while loading home page', error.stack)
        return res.status(500).render('error', { code: '500', title: 'Oops!', message: "Something went wrong. Please try again later." });

    }
}

const loadShowcase = async (req, res) => {


    if (req.accepts('html')) {

        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        const skip = (page - 1) * limit;

        try {

            const [category, brand, productsData] = await Promise.all([

                Category.find({ isActive: 1 }).exec(),
                Brand.find().exec(),
                Product.aggregate([
                    { $match: { isActive: 1 } },
                    {
                        '$lookup': {
                            from: 'categories',
                            localField: 'Category',
                            foreignField: 'name',
                            as: 'categoryDetails'
                        }
                    },
                    { '$unwind': '$categoryDetails' },
                    { '$match': { 'categoryDetails.isActive': 1 } },
                    {
                        '$facet': {
                            'products': [
                                { '$skip': skip },
                                { '$limit': limit }
                            ],
                            'totalCount': [
                                { '$count': 'count' }
                            ]
                        }
                    }

                ])

            ]);

            const groupProducts = productsData[0].products;
            const totalDocuments = productsData[0].totalCount[0]?.count || 0;
            const totalPages = Math.ceil(totalDocuments / limit);

            return res.status(200).render('showcase', {
                category,
                brand,
                groupProducts,
                totalPages: totalPages,
                currentPage: page
            });


        } catch (error) {
            console.error("Internal error while loading showcase", error.stack)
            return res.status(500).render('error', { code: '500', title: 'Oops!', message: "Something went wrong. Please try again later." });
        }
    } else {

        try {

            const page = parseInt(req.query.page) || 1;
            const limit = 6;
            const skip = (page - 1) * limit;

            let query = { isActive: 1 };
            const queryArray = []
            const matchQuery = { $match: null };
            const facetQuery = {
                '$facet': {
                    'products': [
                        { '$skip': skip },
                        { '$limit': limit }
                    ],
                    'totalCount': [
                        { '$count': 'count' }
                    ]
                }
            };
            const lookupTOCategory = {
                '$lookup': {
                    from: 'categories',
                    localField: 'Category',
                    foreignField: 'name',
                    as: 'categoryDetails'
                }
            };
            const unwindCategory = {
                '$unwind': '$categoryDetails'
            }
            const matchCategory = {
                '$match': {
                    'categoryDetails.isActive': 1 // Assuming isActive field is in your categories schema
                }
            };

            const searchText = req.query.searchquery && req.query.searchquery !== "undefined" ? req.query.searchquery : '';
            const groups = req.query.groups && req.query.groups !== "undefined" ? req.query.groups.split(',') : [];
            const brands = req.query.brands && req.query.brands !== "undefined" ? req.query.brands.split(',') : [];
            const categories = req.query.categories && req.query.categories !== "undefined" ? req.query.categories.split(',') : [];
            const sortvalue = parseInt(req.query.sortValue);


            const searchquery = { $regex: `^${searchText}`, $options: 'i' };
            query.ProductName = searchquery;
            if (groups.length > 0) {
                query.targetGroup = { $in: groups };
            }
            if (brands.length > 0) {
                query.Brand = { $in: brands }
            }
            if (categories.length > 0) {
                query.Category = { $in: categories }
            }

            matchQuery.$match = query;
            queryArray.push(matchQuery);
            queryArray.push(lookupTOCategory);
            queryArray.push(unwindCategory);
            queryArray.push(matchCategory);

            if (sortvalue && (sortvalue !== 'undefined')) {
                const sortQuery = { '$sort': { salePrice: sortvalue } }
                facetQuery['$facet']['products'].unshift(sortQuery);
            }

            queryArray.push(facetQuery);

            const productsData = await Product.aggregate(queryArray);
            const products = productsData[0].products;
            const totalDocuments = productsData[0].totalCount[0]?.count || 0;
            const totalPages = Math.ceil(totalDocuments / limit);

            if (totalDocuments > 0) {

                return res.status(200).json({
                    status: true,
                    products,
                    totalPages: totalPages,
                    currentPage: page
                });

            } else {
                return res.status(200).json({ status: false, message: 'No products in this combination' });
            }

        } catch (error) {

            console.error("Internal error while trying to search documents", error.stack)
            return res.status(500).render('error', { code: '500', title: 'Oops!', message: "Something went wrong. Please try again later." });
            //might need to change it into json respoonse. JSON ERROR
        }
    }
}




const loadProductDetails = async (req, res) => {


    try {

        const product_id = new mongoose.Types.ObjectId(req.query.product_id);
        let userID = "";
        if (req?.user?.user_id) {
            userID = req.user.user_id;
        } else if (req.session.user_id) {
            userID = req.session.user_id
        }
        let elemMatch = null;
        let isInWishlist = null;

        if (userID) {

            elemMatch = await Cart.findOne({
                userId: userID,
                items: {
                    $elemMatch: {
                        productId: product_id
                    }
                }
            });

            isInWishlist = await User.findOne({
                _id: userID,
                wishlist: product_id
            })
        }

        const product_details = await Product.findOne({ _id: product_id });
        const category = product_details.Category;
        const target = product_details.targetGroup;

        const related_products = await Product.find({ $and: [{ Category: category }, { targetGroup: target }] });

        return res.render('product_details', {
            product_details,
            related_products,
            target,
            elemMatch,
            isInWishlist
        });

    } catch (error) {

        console.error('Internal Error while loading product Details', error.stack);
        return res.status(500).render('error', { code: '500', title: 'Oops!', message: "We couldn't find the page you were looking for." });
    }

}


const loadUserProfile = async (req, res) => {

    let userID = '';
    try {

        if (req?.user?.user_id) {
            userID = req.user.user_id;
        } else if (req.session.user_id) {
            userID = req.session.user_id;
        }

        const userDetails = await User.findOne({ _id: userID }).exec();


        const [defaultAddress, otherAddress, orders, userWallet, latestTransactions] = await Promise.all([
            Address.findOne({ _id: { $in: userDetails.address }, defaultAdd: 1 }).exec(),
            Address.find({ _id: { $in: userDetails.address }, defaultAdd: 0 }).exec(),
            Order.find({ customer: userID }).populate('shippingAddress').sort({ createdAt: -1 }).exec(),
            wallet.findOne({ userId: userID }).populate('transactions').exec(),
            transaction.find({ userId: userID }).sort({ createdAt: -1 }).exec()
        ]);

        //Taking documents directly from transaction documents instead of taking from userWallet.
        //Because at the time of payment the transaction ids are not pushing into the wallet transactions.
        // const latestTransactions = userWallet?.transactions.reverse();

        return res.status(200).render('profile', { userDetails, defaultAddress, otherAddress, orders, userWallet, latestTransactions });
    } catch (error) {

        console.error("Internal error while loading profile", error.stack)
        return res.status(500).render('error', { code: '500', title: 'Oops!', message: "Something went wrong. Please try again later." });
    }
}

const getOrderDetails = async (req, res) => {

    const orderId = new mongoose.Types.ObjectId(req.query.order_id);

    try {
        const order = await Order.findById({ _id: orderId }).populate('shippingAddress');
        const allProducts = order.items;
        const address = order.shippingAddress;
        const orderDate = order.orderDate;
        const orderStatus = order.status;
        const deliveryDate = order.updatedAt;
        const orderPaymentStatus = order.overallPaymentStatus;
        const paymentMethod = order.paymentMethod;

        const products = allProducts.map(item => {

            const itemPriceRatio = item.subtotal / order.subTotal;
            const itemGst = itemPriceRatio * order.gstAmount.toFixed(2);

            const totalDed = order.couponDiscount + order.otherDiscount;
            const itemDecs = (itemPriceRatio * totalDed).toFixed(2);

            const prodTotalPrice = item.subtotal + +itemGst - +itemDecs;

            return {
                product: {
                    id: item.product.id,
                    name: item.product.name,
                    size: item.product.size,
                    Brand: item.product.Brand,
                    Category: item.product.Category,
                    price: item.product.price,
                    images: item.product.images
                },
                quantity: item.quantity,
                subtotal: item.subtotal,
                itemTotalGst: itemGst,
                itemDecs,
                itemNetTotal: prodTotalPrice,
                status: item.status,
                paymentStatus: item.paymentStatus,
                _id: item._id
            }
        })

        return res.status(200).json({
            status: true,
            products,
            address,
            orderDate,
            orderStatus,
            orderId: order._id,
            deliveryDate,
            orderPaymentStatus,
            paymentMethod
        });

    } catch (error) {
        console.error("Internal error while gettting order details.", error.stack)
    }

}

const updateUserProfile = async (req, res) => {

    const firstName = req.body.Fname;
    const lastName = req.body.Lname;
    const newPassword = req.body.npassword;

    const newHashedPassword = await securePassword(newPassword);

    let userID = "";
    if (req?.user?.user_id) {
        userID = req.user.user_id;
    } else if (req.session.user_id) {
        userID = req.session.user_id
    }
    try {

        await User.updateOne({ _id: userID }, { $set: { firstName: firstName, lastName: lastName, password: newHashedPassword } });
        // return res.status(200).json({status:true})
        return res.redirect('/profile')

    } catch (error) {
        console.error("Internal Error whil updloading the profile details", error.stack);
        return res.status(500).send("Internal Error whil updloading the profile details", error);
    }
}

const addItemToWishlist = async (req, res) => {

    let userID = "";
    if (req?.user?.user_id) {
        userID = new mongoose.Types.ObjectId(req.user.user_id);
    } else if (req.session.user_id) {
        userID = new mongoose.Types.ObjectId(req.session.user_id)
    }
    const productId = new mongoose.Types.ObjectId(req.query.productId);

    try {

        const userData = await User.findOne({ _id: userID });
        if (!userData.wishlist) {
            userData.wishlist = [productId];
        } else {
            if (userData.wishlist.includes(productId)) {
                //Element removal

                userData.wishlist = userData.wishlist.filter(item => !item.equals(productId));

                const isUpdated = await userData.save();
                const itemsLeftInWishlist = isUpdated.wishlist.length;
                if (isUpdated) {
                    return res.status(200).json({ status: true, add: -1, itemsLeftInWishlist });
                }
            } else {

                userData.wishlist.push(productId);
            }
        }
        const isUpdated = await userData.save();
        if (isUpdated) {
            return res.status(200).json({ status: true, add: 1 });
        } else {
            return res.status(200).json({ status: false });
        }

    } catch (error) {
        console.error("Ineternal error occured while trying to add product to wishlist.", error.stack);
        return res.status(500).send("Ineternal error occured while trying to add product to wishlist.", error);
    }

}


const loadWishlist = async (req, res) => {

    try {

        let userID = "";
        if (req?.user?.user_id) {
            userID = new mongoose.Types.ObjectId(req.user.user_id);
        } else if (req.session.user_id) {
            userID = new mongoose.Types.ObjectId(req.session.user_id)
        }

        const userData = await User.findOne({ _id: userID }).populate('wishlist');

        return res.status(200).render('wishlist', { userData });

    } catch (error) {
        console.error("Internal error occured while trying to load wishlist", error.stack);
        return res.status(500).send("Internal error occured while trying to load wishlist", error);
    }

}




const logoutUser = async (req, res) => {

    try {

        if (req?.user?.user_id) {

            req.logout((err) => {

                if (err) {
                    console.error("Error occured while trying to logout the passport authenticated user", err);
                    return next(err);
                } else {

                    return res.status(302).redirect('/')
                }
            })

        }
        else if (req.session.user_id) {

            req.session.destroy((err) => {

                if (err) {
                    console.error("Error while destroying session : ", err);
                    return res.status(500).send("Error while destroying session : ", err);
                }


                return res.status(302).redirect('/');
            });
        }

    } catch (error) {
        console.error("Internal error while trying to logout", error.stack);
        return res.status(500).send("Internal error while trying to logout", error);
    }

}

const addNewAddress = async (req, res) => {

    let userID = "";
    if (req?.user?.user_id) {
        userID = new mongoose.Types.ObjectId(req.user.user_id);
    } else if (req.session.user_id) {
        userID = new mongoose.Types.ObjectId(req.session.user_id)
    }
    let isDefault = 0;
    let selectedAdd = false


    try {


        isDefaultAd = await User.aggregate([
            { $match: { _id: new ObjectId(userID) } }, { $project: { size: { $size: "$address" } } }
        ]).exec();

        if (isDefaultAd[0].size < 1) {
            isDefault = 1;
            selectedAdd = true;
        } else if (req.query.action == 'checkout') {
            const setSelectedAddrStatus = await Address.updateMany({ userId: userID, selectedAdd: true }, { $set: { selectedAdd: false } }).exec();

            if (setSelectedAddrStatus.acknowledged) {

                selectedAdd = true;
            }
        } else {
            isDefault = 0;
        }

        const newAddress = new Address({
            userId: userID,
            addressType: req.body.addressName,
            pinCode: req.body.addressPincode,
            place: req.body.addressPlace,
            city: req.body.addressCity,
            district: req.body.addressDistrict,
            state: req.body.addressState,
            landmark: req.body.addressLandmark,
            mobile_no: req.body.addressMobile,
            defaultAdd: isDefault,
            selectedAdd: selectedAdd
        })
        const addressData = await newAddress.save();
        if (addressData) {

            await User.updateOne({ _id: userID }, { $push: { address: addressData._id } });
            if (req.query.action == 'checkout') {

                return res.status(201).redirect('/checkout_page')
            }
            return res.status(201).redirect('/profile')

        } else {
            console.error("Something went wrong while creating address", error.stack);
            return res.send("Something went wrong while creating address");
        }

    } catch (error) {
        console.error("Internal error while adding new Address", error.stack);
        return res.status(500).send("Internal erro while adding new Address", error);
    }
}

const makeDefaultAddress = async (req, res) => {

    const AddressId = req.query.AddressID;

    try {
        const address_id = new mongoose.Types.ObjectId(AddressId);

        let userID = "";
        if (req?.user?.user_id) {
            userID = req.user.user_id;
        } else if (req.session.user_id) {
            userID = req.session.user_id
        }

        const userDetails = await User.findOne({ _id: userID })
        const removeDefaultAddress = await Address.updateMany({ _id: { $in: userDetails.address }, defaultAdd: 1 }, { $set: { defaultAdd: 0 } }).exec();

        await Address.updateOne({ _id: address_id }, { $set: { defaultAdd: 1 } }).exec();

        return res.status(200).json({ status: true });

    } catch (error) {

        console.error("Internal server error while trying to make default address", error.stack)
        res.status(500).send("Internal server error while trying to make default address", error);
    }

}

const deleteAddress = async (req, res) => {

    const address_id = req.query.AddressID;
    const addressId = new mongoose.Types.ObjectId(address_id);

    let isDefault = 0;

    let userID = "";
    if (req?.user?.user_id) {
        userID = req.user.user_id;
    } else if (req.session.user_id) {
        userID = req.session.user_id
    }

    try {

        const userDetails = await User.findOne({ _id: userID });
        const [defaultAddress, deletingAddress, isDefault] = await Promise.all([
            Address.findOne({ _id: { $in: userDetails.address }, defaultAdd: 1 }).exec(),
            Address.findOne({ _id: addressId }).exec(),
            User.aggregate([
                { $match: { _id: new ObjectId(userID) } }, { $project: { size: { $size: "$address" } } }
            ]).exec()
        ]);

        const isQueryAdAndDefaultAdEq = (addressId.toString() === defaultAddress._id.toString());

        if (!isQueryAdAndDefaultAdEq || (isQueryAdAndDefaultAdEq && (isDefault[0].size == 1))) {
            if (deletingAddress.selectedAdd && !isQueryAdAndDefaultAdEq) {
                await Address.updateOne({ _id: defaultAddress._id }, { $set: { selectedAdd: true } });
            }
            const isDeleted = await Address.deleteOne({ _id: addressId }).exec();

            if (isDeleted.deletedCount) {

                await User.updateOne({ _id: userID }, { $pull: { address: addressId } }).exec();

                return res.json({ status: true });
            }

        } else {

            const otherAddress = await Address.findOne({ _id: { $in: userDetails.address }, defaultAdd: 0 }).exec();

            if (isQueryAdAndDefaultAdEq && deletingAddress.selectedAdd) {
                await Address.updateOne({ _id: otherAddress._id }, { $set: { defaultAdd: 1, selectedAdd: true } }).exec();
            } else {

                await Address.updateOne({ _id: otherAddress._id }, { $set: { defaultAdd: 1 } }).exec();
            }

            const prome = await Promise.all([
                User.updateOne({ _id: userID }, { $pull: { address: addressId } }).exec(),
                Address.deleteOne({ _id: addressId }).exec()

            ]);

            return res.json({ status: true });
        }

    } catch (error) {

        console.error("Internal error while trying to delete address", error.stack);
        return res.status(500).send("Internal error while trying to delete address", error);
    }
}

const getAddressDetails = async (req, res) => {


    try {
        //Finding address to populate on frontend in edit.
        const addressId = new mongoose.Types.ObjectId(req.query.addressId);
        const addressDetails = await Address.findOne({ _id: addressId });

        if (addressDetails) {
            return res.status(200).json({ status: true, addressDetails });
        } else {
            return res.status(404).json({ status: false, message: "Address not found in database" });
        }

    } catch (error) {

        console.error("Internal error occured while trying to fetch Address.", error.stack);
        return res.status(500).json({ status: false, message: `Internal error occured while trying to fetch Address.\nError: ${error}` })
    }
}

const updateAddress = async (req, res) => {


    try {

        const addressId = new mongoose.Types.ObjectId(req.body.addressId);
        const addressDetails = await Address.findOne({ _id: addressId });

        if (!addressDetails) {
            throw new Error("Address not found.");
        }

        Object.keys(req.body).forEach(key => {

            if ((req.body[key] !== undefined) && req.body[key] !== '') {

                addressDetails[key] = req.body[key];
            }
        })

        const updatedAddress = await addressDetails.save();

        if (updatedAddress) {

            return res.status(201).redirect('/profile')
        } else {
            return res.status(403).send('Address updation failed!');
        }

    } catch (error) {
        console.error("Internal error while trying to update the address.", error.stack);
        return res.status(500).send("Internal error while trying to update the address.", error);
    }

}


//CartItems Getting function
// --->
// --->
const cartItemsFindFn = async (userID, couponCode) => {

    try {

        let cartItemsArray = [];
        let subTotal = 0;
        let totalSelectedItems = 0;
        let couponDiscount = 0;
        let minimumAmount = 0;
        let maximumAmount = Infinity;
        if (couponCode) {
            // const selectedCoupon = await coupon.findOne({couponCode : couponCode});
            const selectedCoupon = await coupon.findOne({ usedBy: { $nin: [userID] }, status: true, couponCode: couponCode });
            if (selectedCoupon) {

                couponDiscount = selectedCoupon.discount;
                minimumAmount = selectedCoupon.MinAmount;
                maximumAmount = selectedCoupon.MaxAmount;
            }
        }
        const hasCart = await Cart.findOne({ userId: userID });

        if (hasCart) {

            let cartItems = await Cart.findById(hasCart._id).populate('items.productId');
            cartItemsArray = cartItems.items

            for (let i = 0; i < cartItemsArray.length; i++) {
                if (cartItemsArray[i].isSelected) {

                    subTotal = subTotal + (cartItemsArray[i].productId.salePrice * cartItemsArray[i].quantity);
                    totalSelectedItems = totalSelectedItems + cartItemsArray[i].quantity;
                }
            }
        }
        let gst = (subTotal * (16 / 100)).toFixed(2);
        let grandTotal = subTotal + +gst;
        let offerAmount = 0;

        if (grandTotal > minimumAmount) {

            offerAmount = (((subTotal + +gst) * couponDiscount) / 100) ?? couponDiscount;
            if (offerAmount > maximumAmount) {
                offerAmount = maximumAmount;
            }

        }
        let totalAmount = grandTotal - offerAmount;

        return {
            cartItemsArray,
            subTotal,
            totalAmount,
            gst,
            totalSelectedItems,
            couponDiscount,
            offerAmount,
            grandTotal,
            minimumAmount,
            maximumAmount
        };

    } catch (error) {
        throw new Error("Internal server error while getting cart Details.")
    }

}


const loadCart = async (req, res) => {

    let userID = "";
    if (req?.user?.user_id) {
        userID = req.user.user_id;
    } else if (req.session.user_id) {
        userID = req.session.user_id
    }
    try {

        const coupons = await coupon.find({ usedBy: { $nin: [userID] }, status: true });

        const { cartItemsArray, subTotal, totalAmount, gst, totalSelectedItems } = await cartItemsFindFn(userID);
        return res.status(200).render('cart', { cartItemsArray, subTotal, totalAmount, gst, totalSelectedItems, coupons })

    } catch (error) {
        console.error("Internal server error while trying to get cart", error.stack);
        return res.status(500).send("Internal server error while trying to get cart", error);
    }
}

const addProductToCart = async (req, res) => {

    const productID = req.query.product_id;
    let userID = "";
    if (req?.user?.user_id) {
        userID = req.user.user_id;
    } else if (req.session.user_id) {
        userID = req.session.user_id
    }

    try {

        const hasCart = await Cart.findOne({ userId: userID });
        let isItemExist = [];
        if (hasCart) {

            isItemExist = hasCart.items.filter(element => element.productId.equals(productID));
        }

        if (hasCart && isItemExist.length < 1) {

            const item = {
                productId: productID,
                quantity: 1
            }
            await Cart.updateOne({ _id: hasCart._id }, { $addToSet: { items: item } });
            return res.status(201).json({ status: true });

        } else if (hasCart && isItemExist.length > 0) {
            return res.status(201).json({ status: true });
        } else if (!hasCart) {

            const newCart = new Cart({
                userId: userID,
                items: [
                    {
                        productId: productID,
                        quantity: 1
                    }
                ]
            });

            const cartData = await newCart.save();

            return res.status(201).json({ status: true });
        }


    } catch (error) {

        console.error("Internal Error while trying add product to the Cart", error.stack);
        return res.status(500).send("Internal Error while trying add product to the Cart", error);
    }
}

const removeProductFromCart = async (req, res) => {

    let userID = "";
    if (req?.user?.user_id) {
        userID = req.user.user_id;
    } else if (req.session.user_id) {
        userID = req.session.user_id
    }
    const productId = req.query.productId;
    const couponCode = req.query.coupon;

    try {

        const userCart = await Cart.findOne({ userId: userID });

        await Cart.updateOne({ userId: userID }, { $pull: { items: { productId: productId } } });
        const { cartItemsArray,
            subTotal,
            totalAmount,
            gst,
            totalSelectedItems,
            couponDiscount,
            offerAmount,
            minimumAmount,
            maximumAmount } = await cartItemsFindFn(userID, couponCode);

        const totalCartItems = cartItemsArray.length;
        return res.status(200).json({
            status: true,
            productId: productId,
            subTotal: subTotal,
            totalAmount: totalAmount,
            gst: gst,
            totalCartItems: totalCartItems,
            totalSelectedItems: totalSelectedItems,
            discount: couponDiscount,
            discountAmount: offerAmount,
            minimumAmount: minimumAmount,
            maximumAmount: maximumAmount
        });

    } catch (error) {

        console.error("Internal Error while trying to remove the product from cart", error.stack);
        return res.status(500).send("Internal Error while trying to remove the product from cart", error);
    }
}

const selectItemToOrder = async (req, res) => {

    let userID = "";
    if (req?.user?.user_id) {
        userID = new mongoose.Types.ObjectId(req.user.user_id);
    } else if (req.session.user_id) {
        userID = new mongoose.Types.ObjectId(req.session.user_id)
    }
    const productId = req.query.productId;
    const productID = new mongoose.Types.ObjectId(productId);
    const couponCode = req.query.coupon;

    try {

        const product = await Cart.aggregate([
            { $match: { userId: userID } },
            { $unwind: "$items" },
            { $match: { "items.productId": productID } }
        ]).exec();
        let productIsSelected = product[0].items.isSelected;
        productIsSelected = !productIsSelected;

        await Cart.findOneAndUpdate(
            { userId: userID, 'items.productId': productId },
            { $set: { 'items.$.isSelected': productIsSelected } },
        );

        const { subTotal,
            totalAmount,
            gst,
            totalSelectedItems,
            couponDiscount,
            offerAmount,
            minimumAmount,
            maximumAmount } = await cartItemsFindFn(userID, couponCode);

        return res.status(200).json({
            status: true,
            productId: productId,
            subTotal: subTotal,
            totalAmount: totalAmount,
            gst: gst,
            totalSelectedItems: totalSelectedItems,
            discount: couponDiscount,
            discountAmount: offerAmount,
            minimumAmount: minimumAmount,
            maximumAmount: maximumAmount
        });

    } catch (error) {

        console.error("Internal error while trying to select the item", error.stack);
        return res.status(500).send("Internal error while trying to select the item", error)
    }

}

const changeQuantity = async (req, res) => {

    let userID = "";
    if (req?.user?.user_id) {
        userID = new mongoose.Types.ObjectId(req.user.user_id);
    } else if (req.session.user_id) {
        userID = new mongoose.Types.ObjectId(req.session.user_id)
    }
    const productId = req.query.productId;
    const productID = new mongoose.Types.ObjectId(productId);
    const newQuantity = req.query.newQuantity;
    const shoeSize = req.query.shoeSize;
    const couponCode = req.query.coupon;

    if (newQuantity) {

        try {
            const product = await Product.findOne({ _id: productID }).exec();
            const productStock = product.stockQuantity;

            if (newQuantity > productStock) {
                return res.json({ status: false, message: `Only ${productStock} is available`, stock: productStock });
            } else if (newQuantity > 4) {
                return res.json({ status: false, message: "Max 4 items per product" });
            } else if (newQuantity < 1) {
                return res.json({ status: false, message: "Item quantity cannot be less than 1" })
            }

            await Cart.findOneAndUpdate(
                { userId: userID, 'items.productId': productId },
                { $set: { 'items.$.quantity': newQuantity } },
            );

            const { subTotal,
                totalAmount,
                gst,
                totalSelectedItems,
                couponDiscount,
                offerAmount,
                minimumAmount,
                maximumAmount } = await cartItemsFindFn(userID, couponCode);

            return res.status(200).json({
                status: true,
                productId: productId,
                subTotal: subTotal,
                totalAmount: totalAmount,
                gst: gst,
                totalSelectedItems: totalSelectedItems,
                discount: couponDiscount,
                discountAmount: offerAmount,
                minimumAmount: minimumAmount,
                maximumAmount: maximumAmount

            })

        } catch (error) {
            console.error("Internal Error while changing product quantity", error.stack);
            return res.status(500).send("Internal Error while changing product quantity", error);
        }
    }

    if (shoeSize) {

        try {

            await Cart.findOneAndUpdate(
                { userId: userID, 'items.productId': productId },
                { $set: { 'items.$.size': shoeSize } },
            );

        } catch (error) {
            console.error("Internal Error while trying to change the size.", error.stack);
            return res.status(500).send("Internal Error while trying to change the size.", error);
        }

    }

}


const addCoupon = async (req, res) => {

    let userID = "";
    if (req?.user?.user_id) {
        userID = new mongoose.Types.ObjectId(req.user.user_id);
    } else if (req.session.user_id) {
        userID = new mongoose.Types.ObjectId(req.session.user_id)
    }
    const couponcode = req.query.coupon;
    try {

        const { subTotal,
            totalAmount,
            gst,
            totalSelectedItems,
            couponDiscount,
            offerAmount,
            minimumAmount,
            maximumAmount } = await cartItemsFindFn(userID, couponcode);

        return res.status(200).json({

            status: true,
            subTotal: subTotal,
            totalAmount: totalAmount,
            gst: gst,
            totalSelectedItems: totalSelectedItems,
            discount: couponDiscount,
            discountAmount: offerAmount,
            minimumAmount: minimumAmount,
            maximumAmount: maximumAmount
        })

    } catch (error) {

        console.error('Internal error occured while trying to add coupon.', error.stack);
        return res.status(500).send('Internal error occured while trying to add coupon.', error);
    }
}


const loadCheckout = async (req, res) => {

    let userID = "";
    if (req?.user?.user_id) {
        userID = new mongoose.Types.ObjectId(req.user.user_id);
    } else if (req.session.user_id) {
        userID = new mongoose.Types.ObjectId(req.session.user_id)
    }
    const selectedCoupon = req.query.coupon;

    try {


        const { cartItemsArray,
            subTotal,
            totalAmount,
            gst,
            totalSelectedItems,
            couponDiscount,
            offerAmount } = await cartItemsFindFn(userID, selectedCoupon);

        const sampleImage = cartItemsArray.filter(prod => (prod.isSelected == true))[0].productId.image[0];

        if (selectedCoupon) {

            req.session.coupon = selectedCoupon;

        }

        const currentDate = new Date();
        const deliveryDate = add(currentDate, { days: 5 });
        const expectedDeliveryDate = format(deliveryDate, 'EEEE yyyy MMMM dd');

        const [address, selectedAddress] = await Promise.all([

            User.findById(userID).populate('address').exec(),
            Address.findOne({ userId: userID, selectedAdd: true })
        ])


        return res.status(200).render('checkout', {
            sampleImage,
            subTotal,
            totalAmount,
            gst,
            totalSelectedItems,
            expectedDeliveryDate,
            selectedAddress,
            address,
            discount: couponDiscount,
            discountAmount: offerAmount,
        })


    } catch (error) {

        console.error("Internal error while loading checkout", error.stack);
        return res.status(500).send("Internal error while loading checkout", error);
    }

}


const loadRetryCheckout = async (req, res) => {

    try {

        let userID = "";
        if (req?.user?.user_id) {
            userID = new mongoose.Types.ObjectId(req.user.user_id);
        } else if (req.session.user_id) {
            userID = new mongoose.Types.ObjectId(req.session.user_id)
        }

        const orderId = req.params.orderId;

        const [orderData, address] = await Promise.all([

            Order.findOne({ _id: orderId }).populate('shippingAddress'),
            User.findById(userID).populate('address').exec(),
        ])


        const itemsToBeDelivered = orderData.items.filter(item => (item.status !== 'Cancelled'));

        let subTotal = 0;
        let gst = 0;
        let discountAmount = 0;

        itemsToBeDelivered.forEach(product => {

            const amountRatio = product.subtotal / orderData.subTotal;

            subTotal = subTotal + product.subtotal;

            const prodGST = amountRatio * orderData.gstAmount;
            gst = gst + prodGST;

            const prodCouponDisc = amountRatio * orderData.couponDiscount;
            discountAmount = discountAmount + prodCouponDisc;
        })
        const totalAmount = subTotal + gst - discountAmount;
        const discount = discountAmount / subTotal;

        const selectedAddress = orderData.shippingAddress;

        const currentDate = new Date();
        const deliveryDate = add(currentDate, { days: 5 });
        const expectedDeliveryDate = format(deliveryDate, 'EEEE yyyy MMMM dd');

        return res.status(200).render('retry_checkout', {
            sampleImage: itemsToBeDelivered[0].product.images[0],
            subTotal,
            totalAmount: totalAmount.toFixed(2),
            gst: gst.toFixed(2),
            totalSelectedItems: itemsToBeDelivered.length,
            expectedDeliveryDate,
            selectedAddress,
            address,
            discount: (discount * 100).toFixed(2),//This discount will say the percentage.
            discountAmount: discountAmount.toFixed(2),
            orderId
        })

    } catch (error) {
        console.error("Internal erro occured while trying to retry checkout page.", error.stack);
        return res.status(500).send("Internal erro occured while trying to retry checkout page.", error);
    }

}

const retryPaymentForFailed = async (req, res) => {

    try {

        let userID = "";
        if (req?.user?.user_id) {
            userID = new mongoose.Types.ObjectId(req.user.user_id);
        } else if (req.session.user_id) {
            userID = new mongoose.Types.ObjectId(req.session.user_id)
        }
        const orderId = new mongoose.Types.ObjectId(req.query.order_id);

        const paymentMethod = req.query.paymentMethod;
        const razorpay = req.razorpay;
        const razorpay_key = req.razorpay_key;//this is set from app.js

        const orderData = await Order.findOne({ _id: orderId });


        //Finding amount to pay 
        const itemsToBeDelivered = orderData.items.filter(item => (item.status !== 'Cancelled'));

        let subTotal = 0;
        let gst = 0;
        let discountAmount = 0;

        itemsToBeDelivered.forEach(product => {

            const amountRatio = product.subtotal / orderData.subTotal;

            subTotal = subTotal + product.subtotal;

            const prodGST = amountRatio * orderData.gstAmount;
            gst = gst + prodGST;

            const prodCouponDisc = amountRatio * orderData.couponDiscount;
            discountAmount = discountAmount + prodCouponDisc;
        })
        const amountToPay = subTotal + gst - discountAmount;

        if (orderData) {

            const orderResult = await makeRazorpayment(razorpay, amountToPay, orderData._id);
            orderData.paymentGatewayOrderId = orderResult.id;

            orderData.paymentMethod = paymentMethod;//In case implementing wallet payment.

            const orderDetails = await orderData.save();
            if (orderDetails) {
                return res.status(201).json({ status: true, razorpay_key: razorpay_key, orderResult })

            } else {
                return res.status(404).json({ status: false, message: "Order Coudn't save with new payment gateway order id" });
            }

        } else {

            return res.status(404).json({ status: false, message: "Order Not found" });
        }


    } catch (error) {

        console.error("Internal server error while trying to retry the payment.", error.stack);
        return res.status(500).send("Internal server error while trying to retry the payment.", error);
    }


}

const validateCart = async (req, res) => {

    let userID = "";
    if (req?.user?.user_id) {
        userID = new mongoose.Types.ObjectId(req.user.user_id);
    } else if (req.session.user_id) {
        userID = new mongoose.Types.ObjectId(req.session.user_id)
    }
    const selectedCoupon = req.query.coupon;

    try {

        const { cartItemsArray, totalSelectedItems } = await cartItemsFindFn(userID, selectedCoupon);

        if (totalSelectedItems < 1) {
            return res.json({ status: false, message: "Need atleast 1 item selected to checkout" })
        }

        for (let i = 0; i < cartItemsArray.length; i++) {
            if ((cartItemsArray[i].productId.isActive === 0) && cartItemsArray[i].isSelected) {
                return res.json({ status: false, message: "Some Products are unavailable." });
            } if (cartItemsArray[i].isSelected) {
                if (cartItemsArray[i].productId.stockQuantity < cartItemsArray[i].quantity) {
                    return res.json({ status: false, message: "Stock limit exceeded for some products. Please revise your selection." });
                }
            }
        }

        res.json({
            status: true,
            redirect: `/checkout_page?coupon=${selectedCoupon}`
        })

    } catch (error) {
        console.error("Internal error while validating cart", error.stack);
        return res.status(500).send("Internal error while validating cart", error);
    }
}


const changeDeliveryAddress = async (req, res) => {

    let userID = "";
    if (req?.user?.user_id) {
        userID = new mongoose.Types.ObjectId(req.user.user_id);
    } else if (req.session.user_id) {
        userID = new mongoose.Types.ObjectId(req.session.user_id)
    }
    const addressId = new mongoose.Types.ObjectId(req.query.addressId);

    try {

        const setSelectedAddrStatus = await Address.updateMany({ userId: userID, selectedAdd: true }, { $set: { selectedAdd: false } }).exec();
        if (setSelectedAddrStatus.acknowledged) {

            const address = await Address.findOneAndUpdate({ _id: addressId }, { $set: { selectedAdd: true } }, { new: true });

            return res.status(200).json({ status: true, address });
        }

    } catch (error) {

        console.error("Internal Error while trying to change the address", error.stack)
        return res.status(500).send("Internal Error while trying to change the address", error);
    }


}

const getItemsAndReserve = async (cartItemsArray) => {

    try {

        //getting the purchasing item according to the selection.
        const productsToOrder = cartItemsArray.filter(filteringItem => filteringItem.isSelected == true)
            .map(item => {

                return {
                    product: {
                        id: item.productId._id,
                        name: item.productId.ProductName,
                        size: item.size,
                        Brand: item.productId.Brand,
                        Category: item.productId.Category,
                        price: item.productId.salePrice,
                        images: [item.productId.image[0], item.productId.image[1]],
                    },
                    quantity: item.quantity,
                    subtotal: (item.productId.salePrice) * (item.quantity),
                    paymentStatus: 'PENDING'
                }

            });

        if (productsToOrder.length < 1) {

            return null;
        }

        try {
            const concurrentReservation = productsToOrder.map(async item => {

                const productIsAvailable = await Product.findById({ _id: item.product.id });
                if (!productIsAvailable) {

                    throw new Error(`Product not found ${item.product.id}`);
                } else if (productIsAvailable.stockQuantity < item.quantity) {

                    //Need to handle the rollback if one product is insufficient in stock.

                    throw new Error(`Insufficient stock for the product ${item.product.id}`);
                }

                return Product.updateOne(
                    { _id: item.product.id },
                    {
                        $inc: {
                            reserved: item.quantity,
                            stockQuantity: -item.quantity
                        }
                    }
                );
            })

            const reservationResult = await Promise.all(concurrentReservation);
            const reservedItemCount = reservationResult.reduce((acc, cur) => {
                return acc + cur.modifiedCount;
            }, 0);
            if (reservedItemCount == productsToOrder.length) {

                return productsToOrder;
            } else {

                return null;
            }

        } catch (error) {

            console.error("Internal error while reserving the products", error.stack);
        }


    } catch (error) {
        console.error("Error while getting and reserving the items.", error.stack);
        return res.status(500).send("Error while getting and reserving the items.", error);
    }

}


const makeRazorpayment = async (razorpay, amountToPay, orderId) => {


    try {
        const options = {

            amount: Math.round(amountToPay * 100),
            currency: 'INR',
            receipt: orderId
        };

        console.log('process.env.RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET, 'KyeId:', process.env.RazorPay_Key_Id);

        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {

        console.error("Internal error while trying to perform razorpayment", error);
        return false;
    }

}


const placeOrder = async (req, res) => {

    let userID = "";
    if (req?.user?.user_id) {
        userID = new mongoose.Types.ObjectId(req.user.user_id);
    } else if (req.session.user_id) {
        userID = new mongoose.Types.ObjectId(req.session.user_id)
    }

    const selectedCoupon = req.session.coupon;
    const paymentMethod = req.query.paymentMethod;
    const razorpay = req.razorpay;
    const razorpay_key = req.razorpay_key;//this is set from app.js

    if (req?.params?.address_is_selected) {
        //In this block im checking if any address is selected.   
        try {

            const isAdSelected = await Address.findOne({ userId: userID, selectedAdd: true }).exec();

            if (isAdSelected) {
                return res.status(200).json({ status: true });
            } else {
                return res.json({ status: false, message: "Please select an address." });
            }

        } catch (error) {
            console.error("Internal error occured while trying to check if address is selected.", error.stack);
            return res.status(500).send("Internal error occured while trying to check if address is selected.", error);
        }
    }


    try {

        const { cartItemsArray, subTotal, totalAmount, gst, totalSelectedItems, offerAmount } = await cartItemsFindFn(userID, selectedCoupon);
        const address = await Address.findOne({ userId: userID, selectedAdd: true });
        const productsToOrder = await getItemsAndReserve(cartItemsArray);
        var amountToPay = totalAmount;

        if (productsToOrder) {

            const newOrder = new Order({

                paymentGatewayOrderId: null,
                customer: userID,
                items: productsToOrder,
                totalItems: totalSelectedItems,
                subTotal: subTotal,
                gstAmount: gst,
                couponDiscount: offerAmount,
                totalAmount: totalAmount,
                overallPaymentStatus: 'PENDING',
                shippingAddress: address._id,
                paymentMethod: paymentMethod

            });


            if (paymentMethod === 'UPI Method') {

                var orderResult = await makeRazorpayment(razorpay, amountToPay, newOrder._id);
                newOrder.paymentGatewayOrderId = orderResult.id;

            } else if (paymentMethod === 'Wallet Payment') {

                const userWallet = await wallet.findOne({ userId: userID });
                if (userWallet.balance < totalAmount) {
                    return res.json({ status: false, message: "Not Enough Amount in Wallet. Choose another payment method" });
                }


                const Transaction = new transaction({

                    userId: userID,
                    orderId: 'Not Available',
                    amount: totalAmount,
                    type: 'payment',
                    paymentMethod: 'wallet',
                    status: 'completed',
                    currency: 'INR',
                    description: "Product purchase"
                });

                userWallet.balance -= totalAmount;
                const updatedUserWallet = await userWallet.save();
                if (updatedUserWallet) {

                    var transactionSaveResult = await Transaction.save();
                }

            }

            const orderDetails = await newOrder.save();


            if (orderDetails) {

                if (paymentMethod === 'Wallet Payment') {

                    transactionSaveResult.orderId = (orderDetails._id).toString();
                    await transactionSaveResult.save();
                    await updateOrderForWalletPayment(orderDetails._id, transactionSaveResult.paymentId);
                }

                const IdsToRemoveFromCart = productsToOrder.map(item => item.product.id)

                await Cart.updateOne({ userId: userID }, {
                    $pull: {
                        items: {
                            productId: { $in: IdsToRemoveFromCart }
                        }
                    }
                });

                //Adding userId to coupon;
                await coupon.updateOne({ couponCode: selectedCoupon }, { $push: { usedBy: userID } });


                if (paymentMethod === 'UPI Method') {

                    return res.status(201).json({ status: true, razorpay_key: razorpay_key, orderResult })
                }
                return res.status(201).json({ status: true, redirect: `/order_placed?order_id=${orderDetails._id}` })

            } else {

                return res.json({ status: false, message: "Couldn't place the order" })
            }

        } else {
            return res.json({ status: false, message: "Need ateleast 1 item to proceed" })
        }

    } catch (error) {

        console.error("Internal error while trying to place order.", error.stack);
        return res.json({ status: false, message: "Internal server error while placing the order" })

    }
}


// const webhook = async(req,res) => {


//     try{

//         const shasum = crypto.createHmac('sha256', webhookSecret);
//         shasum.update(JSON.stringify(req.body));
//         const digest = shasum.digest('hex');

//         if (digest === req.headers['x-razorpay-signature']) {
//             const { payment } = req.body.payload.payment.entity;

//             if (req.body.event === 'payment.failed') {

//                 await Order.findOneAndUpdate(
//                   { paymentGatewayOrderId: payment.order_id },
//                     [
//                         {$set:{ 
//                             overallPaymentStatus: 'FAILED',
//                             items:{
//                                 $map:{
//                                     input:"$items",
//                                     as: "item",
//                                     in: {
//                                         $mergeObjects:
//                                         ["$$item",{paymentStatus : 'FAILED'}]
//                                     }
//                                 }
//                             } 
//                         }}
//                     ]
//                 );



//             } else if (req.body.event === 'payment.captured') {

//                 await Order.findOneAndUpdate(
//                     { paymentGatewayOrderId: payment.order_id },
//                       [
//                           {$set:{ 
//                               overallPaymentStatus: 'PAID',
//                               items:{
//                                   $map:{
//                                       input:"$items",
//                                       as: "item",
//                                       in: {
//                                           $mergeObjects:
//                                           ["$$item",{paymentStatus : 'PAID'}]
//                                       }
//                                   }
//                               } 
//                           }}
//                     ]
//                 );
//             }
//         }

//         res.json({ status: true });

//     }catch(error){
//         console.error("Internal error while handling payment status in webhook",error.stack);
//         res.status(500).send("Internal error while handling payment status in webhook",error);
//     }

// }


const failedPaymentStatus = async (req, res) => {

    const { orderId, paymentId, reason } = req.body;

    try {

        const order = await Order.findOneAndUpdate(
            { paymentGatewayOrderId: orderId },
            [
                {
                    $set: {
                        overallPaymentStatus: 'FAILED',
                        items: {
                            $map: {
                                input: "$items",
                                as: "item",
                                in: {
                                    $mergeObjects:
                                        ["$$item", { paymentStatus: 'FAILED' }]
                                }
                            }
                        }
                    }
                }
            ],
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ status: false, message: 'Order not found' });
        }
        return res.json({ status: true, message: 'Order updated successfully' });

    } catch (error) {
        console.error('Error updating failed payment:', error);
        res.status(500).send('Error updating failed payment:', error);
    }

}


const paymentVerification = async (req, res) => {

    let userID = "";
    if (req?.user?.user_id) {
        userID = new mongoose.Types.ObjectId(req.user.user_id);
    } else if (req.session.user_id) {
        userID = new mongoose.Types.ObjectId(req.session.user_id)
    }

    try {
        const { orderId, paymentId, signature, amount } = req.body;
        console.log(process.env.RAZORPAY_KEY_SECRET, 'This is the raxorpay key secret.');
        const expectedSignature = await crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${orderId}|${paymentId}`)
            .digest('hex');

        if (expectedSignature === signature) {

            const Transaction = new transaction({

                userId: userID,
                orderId,
                paymentId,
                amount: amount,
                type: 'payment',
                paymentMethod: 'razorpay',
                status: 'completed',
                currency: 'INR',
                description: "Product purchase"
            });
            const transactionSaveResult = await Transaction.save();

            const updatedOrder = await Order.findOneAndUpdate(
                { paymentGatewayOrderId: orderId },
                [
                    {
                        $set: {
                            overallPaymentStatus: 'PAID',
                            razorpayPaymentId: paymentId,
                            items: {
                                $map: {
                                    input: "$items",
                                    as: "item",
                                    in: {
                                        $cond: {
                                            if: { $ne: ["$$item.status", "Cancelled"] },
                                            then: { $mergeObjects: ["$$item", { paymentStatus: 'PAID' }] },
                                            else: "$$item"
                                        }
                                    }
                                }
                            }
                        }
                    }
                ],
                { new: true }
            );


            if (updatedOrder) {
                const paidProductsCount = updatedOrder.items.filter(item => (item.paymentStatus === 'PAID')).length;

                if (updatedOrder.items.length > paidProductsCount) {
                    updatedOrder.overallPaymentStatus = 'PARTIALLY_PAID';
                    await updatedOrder.save();
                }
            }
            if (transactionSaveResult) {

                return res.status(201).json({ status: true, redirect: `/order_placed?order_id=${orderId}` });
            } else {
                return res.json({ status: false, message: 'Could not save transaction details.' });
            }
        } else {

            return res.json({ status: false, message: 'Invalid Signature' });
        }
    } catch (error) {

        console.error("Internal error while trying to make transaction.", error.stack);
    }
}

const updateOrderForWalletPayment = async (orderId, paymentId) => {

    try {

        const updatedOrder = await Order.findOneAndUpdate(
            { _id: orderId },
            [
                {
                    $set: {
                        overallPaymentStatus: 'PAID',
                        walletPaymentId: paymentId,
                        items: {
                            $map: {
                                input: "$items",
                                as: "item",
                                in: {
                                    $cond: {
                                        if: { $ne: ["$$item.status", "Cancelled"] },
                                        then: { $mergeObjects: ["$$item", { paymentStatus: 'PAID' }] },
                                        else: "$$item"
                                    }
                                }
                            }
                        }
                    }
                }
            ],
            { new: true }
        );

        if (updatedOrder) {
            const paidProductsCount = updatedOrder.items.filter(item => (item.paymentStatus === 'PAID')).length;

            if (updatedOrder.items.length > paidProductsCount) {
                updatedOrder.overallPaymentStatus = 'PARTIALLY_PAID';
                await updatedOrder.save();
            }
        }

    } catch (error) {
        console.error("Internal Error while trying to update order\n", error.stack);
    }


}

const loadOrderPlaced = async (req, res) => {

    try {

        return res.status(200).render('order_placed', { order_id: req.query.order_id })

    } catch (error) {
        console.error("Internal error while loading order placed page", error.stack);
    }
}


const cancelOrder = async (req, res) => {

    try {

        let userID = "";
        if (req?.user?.user_id) {
            userID = new mongoose.Types.ObjectId(req.user.user_id);
        } else if (req.session.user_id) {
            userID = new mongoose.Types.ObjectId(req.session.user_id)
        }

        let flag = false;
        const cancelledItemId = new mongoose.Types.ObjectId(req.query.return_item_id);
        const orderId = new mongoose.Types.ObjectId(req.query.order_id);

        const [isWallet, orderData, cancelledProdWithOrder] = await Promise.all([

            wallet.findOne({ userId: userID }).exec(),
            Order.findOne({ _id: orderId }).exec(),
            Order.aggregate([
                { $match: { _id: orderId } },
                { $unwind: '$items' },
                { $match: { 'items.product.id': cancelledItemId } }
            ])
        ])

        const gstForCancelled = (cancelledProdWithOrder[0].items.subtotal / cancelledProdWithOrder[0].subTotal) * cancelledProdWithOrder[0].gstAmount;
        const gstAddedAmount = cancelledProdWithOrder[0].items.subtotal + gstForCancelled;
        const totalWithoutDiscount = cancelledProdWithOrder[0].totalAmount + cancelledProdWithOrder[0].couponDiscount;
        const cancelledProductDiscount = (gstAddedAmount / totalWithoutDiscount) * cancelledProdWithOrder[0].couponDiscount;
        const refundAmount = gstAddedAmount - cancelledProductDiscount;


        if (orderData && (cancelledProdWithOrder[0].items.status === 'Pending') &&
            (cancelledProdWithOrder[0].items.paymentStatus === 'PAID')) {

            var Transaction = new transaction({

                userId: userID,
                orderId: orderId,
                paymentId: null,
                amount: refundAmount,
                type: 'refund',
                paymentMethod: 'wallet',
                status: 'completed',
                currency: 'INR',
                description: "Canceled product"

            });


            if (!isWallet) {

                const userWallet = new wallet({

                    userId: userID,
                    balance: refundAmount,
                    transactions: []

                });

                const createWalletForUser = await userWallet.save();

                if (createWalletForUser) {

                    var trasactionData = await Transaction.save();
                    if (trasactionData) {
                        createWalletForUser.transactions.push(trasactionData._id);
                        var walletData = await createWalletForUser.save();
                    }
                    flag = true;

                } else {
                    return res.json({ status: false, message: 'Couldnt create wallet for user.' });
                }

            } else {

                isWallet.balance = isWallet.balance + refundAmount;
                const updatedWallet = await isWallet.save();
                if (updatedWallet) {

                    var trasactionData = await Transaction.save();
                    if (trasactionData) {

                        updatedWallet.transactions.push(trasactionData._id);
                        var walletData = await updatedWallet.save();
                    }
                    flag = true;
                } else {
                    return res.json({ status: false, message: 'Couldnt update wallet.' });
                }
            }

        } else if (orderData && (cancelledProdWithOrder[0].items.status === 'Pending') &&
            ((orderData.paymentMethod == 'Cash on Delivery') || (cancelledProdWithOrder[0].items.paymentStatus === 'FAILED'))) {

            flag = true;

        }

        if (flag) {

            const [updatedOrder, inventoryUpdate] = await Promise.all([

                Order.findOneAndUpdate(
                    {
                        _id: orderId,
                        'items.product.id': cancelledItemId
                    }, {
                    $set: {
                        'items.$[elem].status': 'Cancelled',
                        'items.$[elem].paymentStatus': 'CANCELLED'
                    }
                },
                    {
                        arrayFilters: [{ 'elem.product.id': cancelledItemId }],
                        new: true
                    }

                ).exec(),


                Product.updateOne(
                    { _id: cancelledItemId },
                    {
                        $inc:
                        {
                            reserved: -cancelledProdWithOrder[0].items.quantity,
                            stockQuantity: cancelledProdWithOrder[0].items.quantity
                        }
                    }).exec()
            ])

            //Setting Order status to Cancelled if all the products have cancelled.
            const isAllCancelled = updatedOrder.items.filter(item => item.status !== 'Cancelled');

            if (isAllCancelled.length < 1) {

                updatedOrder.status = 'Cancelled';
                updatedOrder.overallPaymentStatus = 'CANCELLED';
                await updatedOrder.save();
            }

            return res.status(201).json({
                status: true,
                message: 'Product cancelled Successfully.',
                walletData,
                trasactionData,
                itemStatus: 'Cancelled'
            });

        } else {
            return res.status(201).json({ status: false, message: 'Something went wrong while adding amount to user wallet.' });
        }

    } catch (error) {
        console.error(`Internal error while trying to cancel the order.\n${error.stack}`);
        return res.status(500).send(`Internal error while trying to cancel the order.\n${error}`);
    }
}


const initiateReturn = async (req, res) => {

    try {

        let userID = "";
        if (req?.user?.user_id) {
            userID = new mongoose.Types.ObjectId(req.user.user_id);
        } else if (req.session.user_id) {
            userID = new mongoose.Types.ObjectId(req.session.user_id)
        }

        const return_item_id = new mongoose.Types.ObjectId(req.query.return_item_id);
        const order_id = new mongoose.Types.ObjectId(req.query.order_id);
        const reason = req.query.reason;

        const isReturned = await returnItem.findOne({ order: order_id, productId: return_item_id }).exec();
        if (isReturned) {
            return res.json({ status: false, message: `Return already Initiated with the reason: ${isReturned.reason}` });
        }

        const order = await Order.findOne({ _id: order_id }).exec();

        for (let i = 0; i < order.items.length; i++) {

            if (order.items[i].product.id.toString() === return_item_id.toString()) {

                const amntRatio = order.items[i].subtotal / order.subTotal;
                const itemGST = amntRatio * order.gstAmount;
                const totalDiscount = order.couponDiscount + order.otherDiscount;
                const itemDiscount = amntRatio * totalDiscount;
                var amount = order.items[i].subtotal + itemGST - itemDiscount;

            }
        }

        amount = Math.round(amount * 100) / 100;

        const returnDetails = new returnItem({

            productId: return_item_id,
            customer: userID,
            order: order_id,
            refundAmnt: amount,
            reason: reason,
            status: 'initiated',

        })

        const returnData = await returnDetails.save();
        if (returnData) {

            order.return.push(returnData._id);
            await order.save();
            return res.status(200).json({ status: true, message: 'Return initialized.' });
        } else {

            return res.json({ status: false, message: 'Couldnt initiate the return.' });
        }


    } catch (error) {
        console.error("Internal error while trying to post the return request", error.stack);
        return res.status(500).send("Internal error while trying to post the return request", error);
    }
}


async function generateInvoice(invoiceData) {

    const templateHtml = fs.readFileSync(path.join(__dirname, '..', 'views', 'Users', 'invoice.html'), 'utf8');
    const template = Handlebars.compile(templateHtml);
    const html = template(invoiceData);

    const chromePath = process.env.CHROME_PATH || undefined;//Checking in which enviornment it is working.

    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html);

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
            top: '7mm',
            right: '7mm',
            bottom: '7mm',
            left: '7mm'
        }
    });

    await browser.close();
    return pdfBuffer;
}


const downloadInvoice = async (req, res) => {

    try {

        const orderId = new mongoose.Types.ObjectId(req.query.order_id);
        const newDate = new Date();
        const currentDate = format(newDate, 'EEEE yyyy MMMM dd');

        const orderDetails = await Order.findOne({ _id: orderId })
            .populate('customer')
            .populate('shippingAddress');

        const items = orderDetails.items.map(item => {

            const amtRatio = item.subtotal / orderDetails.subTotal;
            const itemGST = (amtRatio * orderDetails.gstAmount).toFixed(2);

            const totalDed = orderDetails.couponDiscount + orderDetails.otherDiscount;
            const itemDecs = (amtRatio * totalDed).toFixed(2);

            const prodTotalPrice = item.subtotal + +itemGST - +itemDecs;

            return {
                name: item.product.name,
                quantity: item.quantity,
                rate: item.product.price,
                gst: itemGST,
                deductions: itemDecs,
                amount: prodTotalPrice,
                status: item.paymentStatus.slice(0, 4)
            }
        });

        let subTotal = 0;
        let discount = 0;
        let gst = 0;
        items.filter(item => item.status === 'PAID')
            .forEach(obj => {
                subTotal += +(obj.rate * obj.quantity).toFixed(2);
                discount = +(discount + +obj.deductions).toFixed(2);
                gst = +(gst + +obj.gst).toFixed(2);
            })
        const deliveredItemsTotal = subTotal + gst - discount;

        const invoiceData = {
            invoiceNumber: orderDetails._id.toString(),
            date: currentDate,
            companyName: 'Shoe Shope',
            companyAddress: 'Kochi',
            companyPhone: '89 2171 2344',
            customerName: orderDetails.customer.firstName + ' ' + orderDetails?.customer?.lastName,
            customerPlace: orderDetails.shippingAddress.place,
            customerCity: orderDetails.shippingAddress.city,
            customerLandMark: orderDetails.shippingAddress.landmark,
            customerDistrict: orderDetails.shippingAddress.district,
            customerPhone: orderDetails.shippingAddress.mobile_no,
            items: items,
            subtotal: subTotal,
            discount: discount,
            GST: gst,
            total: deliveredItemsTotal
        }

        const pdfBuffer = await generateInvoice(invoiceData);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; invoice.pdf',
            'Content-Length': pdfBuffer.length
        })

        res.send(pdfBuffer);

    } catch (error) {

        console.error("Internal error occured while trying to create invoice.", error.stack);
        return res.status(500).send("Internal error occured while trying to create invoice.", error);
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
    getAddressDetails,

    addItemToWishlist,
    loadWishlist,

    logoutUser,
    loadCart,
    addProductToCart,
    removeProductFromCart,
    selectItemToOrder,
    changeQuantity,
    addCoupon,

    loadRetryCheckout,
    retryPaymentForFailed,
    validateCart,
    loadCheckout,
    changeDeliveryAddress,
    placeOrder,
    // webhook,
    failedPaymentStatus,
    paymentVerification,
    loadOrderPlaced,
    getOrderDetails,

    cancelOrder,
    initiateReturn,
    downloadInvoice

}