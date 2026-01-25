const { User, Category, Brand, Product, Order, returnItem, transaction, coupon, wallet, Offer } = require('../models/models')

const mongoose = require('mongoose');
const { format, setDate, endOfWeek } = require('date-fns');
const fs = require('fs')







const addNewCoupon = async (req, res) => {

    try {

        if (req.body.status == 'active') {
            var status = true;
        } else {
            var status = false;
        }

        const newCoupon = new coupon({
            couponName: req.body.couponName,
            couponCode: req.body.couponCode,
            discount: req.body.discount,
            status: status,
            MaxAmount: req.body.MaxAmount,
            MinAmount: req.body.MinAmount,
            expiryDate: req.body.expiry
        })

        const coupondata = await newCoupon.save();
        if (coupondata) {
            return res.status(201).redirect('/admin/coupons');
        }


    } catch (error) {

        console.error("Internal error while trying to add new coupon.", error.stack);
        return res.status(500).send("Internal error while trying to add new coupon.", error);
    }
}


const changeCouponStatus = async (req, res) => {

    try {

        const couponId = new mongoose.Types.ObjectId(req.query.coupon);
        const currentCoupon = await coupon.findOne({ _id: couponId });
        const updatedCoupon = await coupon.findByIdAndUpdate({ _id: couponId }, { $set: { status: !currentCoupon.status } }, { new: true })

    } catch (error) {
        console.error('Internal error occured while changing coupon status', error.stack);
        return res.status(500).send('Internal error occured while changing coupon status', error);
    }
}


const loadCoupons = async (req, res) => {

    try {

        if (req.query.code) {

            const couponCode = req.query.code;
            const couponIsExist = await coupon.findOne({
                couponCode: couponCode
            }).exec();
            if (couponIsExist) {

                return res.status(200).json({ status: true });
            } else {
                return res.status(200).json({ status: false });
            }
        }

        const [coupons, initiatedReturns] = await Promise.all([
            coupon.find().exec(),
            returnItem.aggregate([

                { $match: { status: 'initiated' } },
                { $count: 'total' }
            ])
        ]);
        const initiatedReturnCount = initiatedReturns[0]?.total || 0;
        return res.status(200).render('coupons', { coupons, initiatedReturnCount });

    } catch (error) {
        console.error("Internal error while trying to load coupons", error.stack);
        return res.status(500).send("Internal error while trying to load coupons", error);
    }

}


const loadOffers = async (req, res) => {

    try {

        const [initiatedReturns, offers] = await Promise.all([

            returnItem.aggregate([

                { $match: { status: 'initiated' } },
                { $count: 'total' }
            ]),

            Offer.find().exec(),


        ]);
        const initiatedReturnCount = initiatedReturns[0]?.total || 0;

        return res.status(200).render('offers', { initiatedReturnCount, offers })

    } catch (error) {

        console.error('Internal error while trying to load offer page', error.stack);
        return res.status(500).render('error', {
            code: '500',
            title: 'Oops!',
            message: "Something went wrong. Please try again later.",
            redirect: '/admin/dashboard'
        });
    }
}


async function addOfferToProducts(newOfferData) {

    try {

        const discountValue = newOfferData.discountValue;
        const discountType = newOfferData.discountType;
        let products = [];

        if (newOfferData.applicableOn === 'product') {

            products = await Product.find({ _id: { $in: newOfferData.products } });

        } else if (newOfferData.applicableOn === 'category') {

            const fetchedCategories = newOfferData.categories.map(async catId => {

                return Category.findOne({ _id: catId }).exec();
            })
            const categoryDocuments = await Promise.all(fetchedCategories);
            const categoryNames = categoryDocuments.map(category => category.name);
            products = await Product.find({ Category: { $in: categoryNames } });

        }


        const offerUpdation = products.map(async item => {

            let newDiscount = 0;
            if (discountType == 'percentage') {

                newDiscount = (item.regularPrice * discountValue) / 100;

            } else if (discountType == 'fixed') {

                newDiscount = discountValue;
            }

            if (item.isOnOffer) {

                const existingOffer = item.appliedOffer;
                const updatingOffer = newOfferData._id;
                if (existingOffer.equals(updatingOffer)) {
                    //This block offer updation
                    if (newOfferData.isActive) {

                        item.salePrice = item.regularPrice - newDiscount;
                        return await item.save();
                    } else {

                        item.salePrice = item.regularPrice;
                        item.isOnOffer = false;
                        item.appliedOffer = null;
                        return await item.save();
                    }

                } else {
                    //This block offer addition
                    if (newOfferData.isActive) {

                        const oldItemDiscount = item.regularPrice - item.salePrice;
                        if (oldItemDiscount < newDiscount) {
                            item.salePrice = item.regularPrice - newDiscount;
                            item.appliedOffer = newOfferData._id;
                            return await item.save();
                        }
                    }
                }

            } else {

                if (newOfferData.isActive) {

                    item.salePrice = item.regularPrice - newDiscount;
                    item.appliedOffer = newOfferData._id;
                    item.isOnOffer = true;
                    return await item.save();
                }

            }

            return item;
        })

        const categoryOfferPromise = await Promise.all(offerUpdation);
        if (categoryOfferPromise) {

            return true;
        }

        return false;


    } catch (error) {

        console.error("Error occured while trying to add offer to products.", error);
        return false;
    }

}

const addNewOffer = async (req, res) => {

    try {

        const isOfferActive = (req.body.isActive == 'on') ? true : false;

        let productIds = [];
        let categoryIds = [];
        let minPurchaseAmount = 0;
        if (req?.body?.products) {

            let returnedProductId = req.body.products;
            if (!Array.isArray(returnedProductId)) {
                returnedProductId = [returnedProductId];
            }
            productIds = returnedProductId.map(id => new mongoose.Types.ObjectId(id));

        } else if (req?.body?.categories) {

            let returnedCategoryId = req.body.categories;
            if (!Array.isArray(returnedCategoryId)) {
                returnedCategoryId = [new mongoose.Types.ObjectId(returnedCategoryId)];
            }
            categoryIds = returnedCategoryId.map(id => new mongoose.Types.ObjectId(id));

        } else if (req?.body?.minPurchaseAmount) {

            minPurchaseAmount = req.body.minPurchaseAmount;

        }

        const newOffer = new Offer({

            title: req.body.title,
            description: req.body.description,
            discountType: req.body.discountType,
            discountValue: req.body.discountValue,
            applicableOn: req.body.applicableOn,

            products: productIds,
            categories: categoryIds,
            minPurchaseAmount: minPurchaseAmount,

            startDate: new Date(req.body.startDate),
            endDate: new Date(req.body.endDate),
            isActive: isOfferActive

        });

        const newOfferData = await newOffer.save();
        if (newOfferData) {

            if (req.body.applicableOn !== 'cart') {

                const result = await addOfferToProducts(newOfferData);
                if (result) {

                    return res.status(201).redirect('/admin/offers');
                } else {
                    console.error("Something went wrong while trying to add offer to the products.");
                }

            }

        }

    } catch (error) {

        console.error("Internal error occured while trying to add new Offer.", error.stack);
        return res.status(500).render('error', {
            code: '500',
            title: 'Oops!',
            message: "Something went wrong. Please try again later.",
            redirect: '/admin/offers'
        });
    }
}


const getCategoriesOrProductsForOffer = async (req, res) => {

    try {

        const searchProduct = req.query.searchProd;
        const searchCategory = req.query.searchCat;

        if (typeof searchCategory !== 'undefined') {

            if (mongoose.Types.ObjectId.isValid(searchCategory)) {
                // If the searchKey is a valid ObjectId
                var categoryQuery = { _id: new mongoose.Types.ObjectId(searchCategory) };
            } else {
                // If the searchKey is a string, perform a case-insensitive search by name
                var categoryQuery = { name: { $regex: `^${searchCategory}`, $options: 'i' } };
            }

            const categories = await Category.find(categoryQuery);
            if (categories.length < 1) {

                return res.status(200).json({ status: false });
            }

            return res.status(200).json({ status: true, categories });

        }

        if (typeof searchProduct !== 'undefined') {

            if (mongoose.Types.ObjectId.isValid(searchProduct)) {
                // If the searchKey is a valid ObjectId
                var productQuery = { _id: new mongoose.Types.ObjectId(searchProduct) };
            } else {
                // If the searchKey is a string, perform a case-insensitive search by name
                var productQuery = { ProductName: { $regex: `^${searchProduct}`, $options: 'i' } };
            }

            const products = await Product.find(productQuery);
            if (products.length < 1) {

                return res.status(200).json({ status: false });
            }

            return res.status(200).json({ status: true, products });

        }

    } catch (error) {

        console.error('Internal Error occured while trying to fetch the categories for offers.', error);
        return res.status(500).send(`Internal Error occured while trying to fetch the categories for offers\n${error}`);
    }
}


const getOfferDetails = async (req, res) => {

    try {

        const offerId = new mongoose.Types.ObjectId(req.params.offerid);
        const offerType = req.query.applicable_on;

        if (offerType === 'product') {

            const offerDetails = await Offer.findOne({ _id: offerId }).populate('products');
            return res.status(200).json({ status: true, offerDetails });

        } else if (offerType === 'category') {

            const offerDetails = await Offer.findOne({ _id: offerId }).populate('categories');
            const categoryNames = offerDetails.categories.map(item => item.name);

            const productsInOffer = await Promise.all(categoryNames.map(async category => {

                const products = await Product.find({ Category: category, appliedOffer: offerId });
                return products;
            }))

            const flattenedProducts = productsInOffer.flat();
            offerDetails.products = flattenedProducts;

            return res.status(200).json({ status: true, offerDetails });

        }

        return res.status(404).json({ status: false })

    } catch (error) {

        console.error("Internal error occured while trying to get offer details.", error);
    }
}



const updateOffer = async (req, res) => {

    try {

        console.log(req.body, "This is the form data.");
        const isActive = req?.body?.isActive === 'on';

        const offerId = new mongoose.Types.ObjectId(req.body.offerId);

        const offerData = await Offer.findOne({ _id: offerId });
        if (offerData) {

            const startDate = new Date(req.body.startDate);
            const endDate = new Date(req.body.endDate);

            offerData.title = req.body.title;
            offerData.discountType = req.body.discountType;
            offerData.discountValue = +req.body.discountValue;
            offerData.minPurchaseAmount = +req.body.minPurchaseAmount;
            offerData.startDate = startDate;
            offerData.endDate = endDate;
            offerData.isActive = isActive;

            const updatedOffer = await offerData.save();
            if (updatedOffer) {

                const result = addOfferToProducts(updatedOffer);
                if (result) {

                    return res.status(201).redirect('/admin/offers');
                } else {

                    console.error("Something went wrong while trying to add offer to the products.");
                }
            }

        }

    } catch (error) {
        console.error("Internal error while trying to update Offer.", error);
    }
}


const loadCustomerList = async (req, res) => {


    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    try {

        //Getting fetched data here
        // const searchQuery = req.query.query;

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

        const [userData, totalDocuments, initiatedReturns] = await Promise.all([
            User.find().skip(skip).limit(limit).exec(),
            User.countDocuments().exec(),
            returnItem.aggregate([

                { $match: { status: 'initiated' } },
                { $count: 'total' }
            ])
        ]);
        const initiatedReturnCount = initiatedReturns[0]?.total || 0;
        const totalPages = Math.ceil(totalDocuments / limit);
        return res.status(200).render('customerList', { user: userData, totalPages: totalPages, currentPage: page, initiatedReturnCount });
        // return res.status(200).json({user : userData, totalPages : totalPages, currentPage : page})


    } catch (error) {
        console.error("Error While rendering customerList\n", error.stack)
        return res.status(500).send('Server Error whil taking customer list', error)
    }
}

const blockOrUnblockUser = async (req, res) => {



    const idToBlockorUnblock = req.query.id;
    try {

        const userData = await User.findOne({ _id: idToBlockorUnblock })
        if (userData.isBlocked) {
            const user = await User.findByIdAndUpdate(
                { _id: idToBlockorUnblock },
                { $set: { isBlocked: false } },
                { new: true }
            );

            //You might need to change the sessions data into database in production enviornment.    
            const sessionStore = req.sessionStore;

            // Get all session keys
            const sessionKeys = Object.keys(sessionStore.sessions);

            for (const sessionId of sessionKeys) {
                const sessionData = JSON.parse(sessionStore.sessions[sessionId]);

                let sessionUserId = sessionData.user_id || (sessionData.passport?.user?.user_id);

                if (sessionUserId === idToBlockorUnblock) {
                    await new Promise((resolve, reject) => {
                        sessionStore.destroy(sessionId, (err) => {
                            if (err) {
                                console.error('Error destroying session:', err);
                                reject(err);
                            } else {

                                resolve();
                            }
                        });
                    });

                    // Verify session destruction
                    const remainingSession = sessionStore.sessions[sessionId];

                }
            }
            return res.status(200).json({ userID: user._id, isBlocked: user.isBlocked });

        } else {
            const user = await User.findByIdAndUpdate(
                { _id: idToBlockorUnblock },
                { $set: { isBlocked: true } },
                { new: true }
            );
            //should send the json data to frontend and update it there.    
            return res.status(200).json({ userID: user._id, isBlocked: user.isBlocked });
        }

    } catch (error) {
        console.error('Internal Error while blocking or unblocking ', error.stack)
        return res.status(500).send("Internal Error while blocking or unblocking")
    }

}

const deleteUser = async (req, res) => {

    const idToDelete = req.query.id;

    try {


        await User.deleteOne({ _id: idToDelete })

        //should send the json data to frontend and update it there.


    } catch (error) {
        console.error('Internal Error while deleting user', error.stack)
        return res.status(500).send("Internal Error while deleting user")
    }

}


const loadCategory = async (req, res) => {

    try {

        const [brands, categoryDetails, initiatedReturns] = await Promise.all([
            Brand.find({}).exec(),
            Category.find({}).exec(),
            returnItem.aggregate([

                { $match: { status: 'initiated' } },
                { $count: 'total' }
            ])
        ])
        const initiatedReturnCount = initiatedReturns[0]?.total || 0;
        return res.status(200).render('categories', { brands, categoryDetails, initiatedReturnCount });

    } catch (error) {

        console.error("Couldn't load category page", error.stack);
        return res.status(500).send("Couldn't load category page")
    }
}

const addBrandOrCategory = async (req, res) => {


    if (req.query.brand) {

        const newBrand = req.query.brand;

        try {

            await new Brand({
                name: newBrand
            }).save()

            return;

        } catch (error) {

            console.error('Error while adding new Brand\n', error.stack);
            return res.status(500).send("Error while adding new Brand");

        }

    }


    if (req.body.category.trim() && req.body.description.trim()) {

        const category = req.body.category.trim();
        const description = req.body.description.trim();

        try {

            const newCategory = await new Category({

                name: category,
                description: description
            })
            await newCategory.save();
            // const categoryDetails = await Category.find({});
            // return res.status(201).render('categories',{categoryDetails});
            return res.status(201).json({ status: true });

        } catch (error) {

            console.error("Error occured while creating Category\n", error.stack)
            // return res.status(500).send("Category already saved in database.")
            return res.status(201).json({ status: false, message: "Category already saved in database." });
        }

    } else {

    }

}

const softDeleteCategory = async (req, res) => {

    const itemID = new mongoose.Types.ObjectId(req.query.categoryID);

    try {

        const category = await Category.findOne({ _id: itemID }).exec();

        if (category.isActive) {

            const categoryDetails = await Category.findOneAndUpdate({ _id: itemID }, { $set: { isActive: 0 } }, { new: true }).exec();

            return res.status(200).json({ status: false, message: `${categoryDetails.name} Successfully deactivated.` });
        } else {

            const categoryDetails = await Category.findOneAndUpdate({ _id: itemID }, { $set: { isActive: 1 } }, { new: true }).exec();

            return res.status(200).json({ status: true, message: `${categoryDetails.name} Successfully Activated.` });
        }

    } catch (error) {

        console.error("Error while performing softdeletion", error.stack);
        return res.status(500).send('Error while performing softdeletion');
    }

}

const updateCategory = async (req, res) => {

    const categoryId = new mongoose.Types.ObjectId(req.query.id);
    const name = req.query.category_name;
    const description = req.query.description;

    try {

        const updpatedCategory = await Category.updateOne({ _id: categoryId }, { $set: { name: name, description: description } }).exec();

        if (updpatedCategory.modifiedCount) {

            return res.status(200).json({ status: true });
        } else {

            console.error("Could not update category.", error.stack)
            return res.status(200).json({ status: false, message: "Couldnt update category." });
        }

    } catch (error) {

        if (error.code === 11000) {

            return res.json({ status: false, message: "Category already exist." });
        }

        console.error("Internal server error while performing udpation of categories.", error.stack);
        return res.status(500).send("Internal server error while performing udpation of categories.", error);
    }
}

const loadAllProducts = async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = 9;


    try {

        const skip = (page - 1) * limit;
        const [products, totalDocuments, initiatedReturns] = await Promise.all([
            Product.find().skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
            Product.countDocuments().exec(),
            returnItem.aggregate([

                { $match: { status: 'initiated' } },
                { $count: 'total' }
            ])
        ])
        const totalPages = Math.ceil(totalDocuments / limit);
        const initiatedReturnCount = initiatedReturns[0]?.total || 0;
 
        return res.render('productslist', { products, totalPages: totalPages, currentPage: page, initiatedReturnCount })

    } catch (error) {

        console.error('Error while loading products\n', error.stack);
        return res.status(500).send("Error while loading products")
    }
}

const softDeleteProducts = async (req, res) => {
    //Complete this function to list product
    const productID = req.query.productID;
    try {

        const product = await Product.findOne({ _id: productID }).exec();

        if (product.isActive) {

            await Product.updateOne({ _id: productID }, { $set: { isActive: 0 } }).exec();
            const productDetails = await Product.find({});
            // return res.status(200).render('productslist',{productDetails})
            return res.json({ productID: productID, isActive: 0 })
        } else {

            await Product.updateOne({ _id: productID }, { $set: { isActive: 1 } }).exec();
            const productDetails = await Product.find({});
            return res.status(200).render('productslist', { productDetails })

        }

    } catch (error) {

        console.error("Error while performing softdeletion of Produts", error.stack);
        return res.status(500).send('Error while performing softdeletion Produts');
    }
}

const loadAddNewProduct = async (req, res) => {

    try {

        const [categories, brand, initiatedReturns] = await Promise.all([
            Category.find({}).exec(),
            Brand.find({}).exec(),
            returnItem.aggregate([

                { $match: { status: 'initiated' } },
                { $count: 'total' }
            ])
        ]);
        const initiatedReturnCount = initiatedReturns[0]?.total || 0;

        return res.status(200).render('add-new-product', { categories, brand, initiatedReturnCount })

    } catch (error) {

        console.error("Internal Error while loading addNewProduct\n", error.stack);
        return res.status(500).send('Error while loading addNewProduct');
    }

}

const addNewProduct = async (req, res) => {

    const {
        productName,
        description,
        regularPrice,
        salePrice,
        category,
        brand,
        targetGroup,
        sizes } = req.body;

    const product_name = req.query.product_name;
    try {


        if (req.query.product_name) {

            const isProductExist = await Product.findOne({ ProductName: product_name }).exec();
            if (isProductExist) {

                return res.status(200).json({ status: false, message: `A product is already exist in the name ${product_name}` });
            }
            return res.json({ status: true })
        }
        const variants = sizes.map((item) => {
            return {
                size: item.size,
                quantity: Number(item.quantity)
            }
        });

        const newProduct = new Product({
            ProductName: productName,
            Description: description,
            regularPrice: regularPrice,
            salePrice: salePrice,
            Category: category,
            Brand: brand,
            image: req.files.map(file => file.filename),
            targetGroup: targetGroup,
            sizes: variants
        });

        await newProduct.save();
        return res.status(201).json({ status: true, message: "Product Added Successfully" });

    } catch (error) {

        console.error('Internal Error While Adding new product\n', error.stack);
        return res.status(500).send('Internal Error While Adding new product');
    }
}

const loadEditProduct = async (req, res) => {

    try {

        const productId = new mongoose.Types.ObjectId(req.query.productId)
        const [categories, brand, product, initiatedReturns] = await Promise.all([

            Category.find({}).exec(),
            Brand.find({}).exec(),
            Product.findOne({ _id: productId }),
            returnItem.aggregate([

                { $match: { status: 'initiated' } },
                { $count: 'total' }
            ])
        ]);
        if (!product) {
            return res.status(404).render('error', {
                code: '404',
                title: 'Oops!',
                message: "Product Not Found.Recheck the product Id",
                redirect: '/admin/productslist'
            });
        }
        const initiatedReturnCount = initiatedReturns[0]?.total || 0;

        return res.status(200).render('edit-product', { categories, brand, product, initiatedReturnCount })

    } catch (error) {

        console.error('Internal Error while loading edit produdt page', error.stack);
        return res.status(500).render('error', {
            code: '500',
            title: 'Oops!',
            message: "Something went wrong. Please try again later.",
            redirect: '/admin/productslist'
        });
    }

}

const updateProduct = async (req, res) => {


    try {
        const productId = new mongoose.Types.ObjectId(req.query.productId);

        const product = await Product.findOne({ _id: productId }).exec();

        if (!product) {
            throw new Error('Product not found');
        }

        Object.keys(req.body).forEach(key => {

            if (req.body[key] !== undefined) {
                product[key] = req.body[key];
            }
        })

        const variants = req.body.sizes.map((item) => {
            return {
                size: item.size,
                quantity: Number(item.quantity)
            }
        });
        product.sizes = variants;
        
        let newImages = null;
        if (req.files && req.files.length > 0) {
            newImages = req.files.map(file => file.filename)

        }
        if (newImages) {

            product.image = [...newImages, ...product.image];
        }

        const updatedProduct = await product.save();
        if (updatedProduct) {
            return res.status(200).json({ status: true, redirect: `/admin/productslist/edit_product?productId=${productId}` });
        }

    } catch (error) {
        console.error('Internal Error while updating product Details', error.stack);
        return res.status(500).json({ status: false });
    }
}


const removeImageFromProduct = async (req, res) => {

    try {

        const productId = new mongoose.Types.ObjectId(req.query.productid);
        const imageName = req.query.image;

        const productDetails = await Product.updateOne(
            { _id: productId },
            { $pull: { image: imageName } }
        );

        if (productDetails) {

            const htmlPreviewElemId = `imPreview-${imageName}`;
            return res.status(200).json({ status: true, htmlPreviewElemId });
        } else {
            return res.status(200).json({ status: false });
        }


    } catch (error) {
        console.error('Internal error occured while trying to remove the image from product.', error);
    }

}


const loadOrderList = async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    try {

        const skip = (page - 1) * limit;

        const [orders, totalDocuments, initiatedReturns] = await Promise.all([

            Order.find().skip(skip).limit(limit).populate('customer').sort({ createdAt: -1 }).exec(),
            Order.countDocuments().exec(),
            returnItem.aggregate([

                { $match: { status: 'initiated' } },
                { $count: 'total' }
            ])
        ])
        const totalPages = Math.ceil(totalDocuments / limit);
        const initiatedReturnCount = initiatedReturns[0]?.total || 0;

        return res.status(200).render('order-list', { orderlist: orders, totalPages: totalPages, currentPage: page, initiatedReturnCount });

    } catch (error) {
        console.error("Internal error while trying to load order list", error.stack);
    }
}

const loadOrderDetails = async (req, res) => {

    try {
        const orderId = new mongoose.Types.ObjectId(req.query.orderId)

        const [orderDetails, initiatedReturns] = await Promise.all([
            Order.findOne({ _id: orderId }).populate('customer').populate('shippingAddress').exec(),
            returnItem.aggregate([

                { $match: { status: 'initiated' } },
                { $count: 'total' }
            ])
        ])

        const initiatedReturnCount = initiatedReturns[0]?.total || 0;

        let grandSubTotal = 0;
        let grandGST = 0;
        let grandDiscount = 0;
        let grandTotal = 0;

        const items = orderDetails.items.map(item => {

            const amtRatio = item.subtotal / orderDetails.subTotal;
            const itemGST = (amtRatio * orderDetails.gstAmount).toFixed(2);

            const totalDed = orderDetails.couponDiscount + orderDetails.otherDiscount;
            const itemDecs = (amtRatio * totalDed).toFixed(2);

            const prodTotalPrice = item.subtotal + +itemGST - +itemDecs;

            if ((item.paymentStatus !== 'REFUNDED') && (item.paymentStatus !== 'CANCELLED')) {

                grandSubTotal += item.subtotal;
                grandGST += +itemGST;
                grandDiscount += +itemDecs;
                grandTotal += prodTotalPrice;
            }

            return {
                name: item.product.name,
                brand: item.product.Brand,
                prodImage: item.product.images,
                prodQuantity: item.quantity,
                prodRate: item.product.price,
                prodgst: itemGST,
                prodDeductions: itemDecs,
                prodNetTotal: prodTotalPrice,
                status: item.paymentStatus
            }
        });

        return res.status(200).render('order-details', {
            orderDetails,
            items,
            grandSubTotal,
            grandGST,
            grandDiscount,
            grandTotal,
            initiatedReturnCount
        });

    } catch (error) {

        console.error('Internal Error occured while loading order Details.', error.stack);
        return res.status(500).render('error', {
            code: '500',
            title: 'Oops!',
            message: "Something went wrong. Please try again later.",
            redirect: '/admin/order-list'
        });
    }
}

const updateOrderStatus = async (req, res) => {

    const orderId = new mongoose.Types.ObjectId(req.query.orderId);
    const orderStatus = req.query.orderStatus;

    try {

        let order = await Order.findOneAndUpdate({ _id: orderId }, { $set: { status: orderStatus } }, { new: true });

        let pendingItems = order.items.filter(item => ((item.status == 'Pending') || (item.status == 'Shipped'))).map((elem) => {

            return { productId: elem.product.id }
        });

        if ((order.confirmation === 0) && (orderStatus === 'Delivered')) {

            order = await Order.findOneAndUpdate({ _id: orderId }, { $set: { confirmation: 1 } }, { new: true });

            const prome = order.items.filter(prod => ((prod.status == 'Pending') || (prod.status == 'Shipped'))).map(async item => {
                return Product.updateOne({ _id: item.product.id }, { $inc: { reserved: -item.quantity } }).exec();
            });

            await Promise.all(prome);

            const promeOfProductStatus = pendingItems.map(productId => {
                return Order.updateOne(
                    {
                        _id: orderId,
                        'items.product.id': productId.productId
                    }, {
                    $set: {
                        'items.$[elem].status': 'Delivered'
                    }
                },
                    {
                        arrayFilters: [{ 'elem.product.id': productId.productId }],
                        new: true
                    }

                ).exec()
            })
            await Promise.all(promeOfProductStatus);


        } else if ((order.confirmation === 0) && (orderStatus === 'Cancelled')) {

            order = await Order.findOneAndUpdate({ _id: orderId }, { $set: { confirmation: 1 } }, { new: true });

            const prome = order.items.map(async item => {
                return Product.updateOne({ _id: item.product.id },
                    { $inc: { reserved: -item.quantity, stockQuantity: item.quantity } }).exec();
            });

            await Promise.all(prome);

            const promeOfProductStatus = pendingItems.map(productId => {
                return Order.updateOne(
                    {
                        _id: orderId,
                        'items.product.id': productId.productId
                    }, {
                    $set: {
                        'items.$[elem].status': 'Cancelled'
                    }
                },
                    {
                        arrayFilters: [{ 'elem.product.id': productId.productId }],
                        new: true
                    }

                ).exec()
            })
            await Promise.all(promeOfProductStatus);


        }

        return res.status(200).json({ status: true, message: `Successfully set the status to ${orderStatus}`, orderstatus: orderStatus })

    } catch (error) {
        console.error("Internal Error while trying to update the status of order.", error.stack);
    }
}


const loadReturnedOrders = async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    try {

        const [returnedProducts, totalDocuments, initiatedReturns] = await Promise.all([
            returnItem.find().sort({ returnDate: -1 }).skip(skip).limit(limit).populate('customer').exec(),
            returnItem.countDocuments().exec(),
            returnItem.aggregate([

                { $match: { status: 'initiated' } },
                { $count: 'total' }
            ])
        ])
        const totalPages = Math.ceil(totalDocuments / limit);
        const initiatedReturnCount = initiatedReturns[0]?.total || 0;

        return res.render('returned-order', { returnedProducts, totalPages: totalPages, currentPage: page, initiatedReturnCount });

    } catch (error) {

        console.error("Internal error occured while trying to get the returned order details.", error.stack);
        return res.status(500).send("Internal error occured while trying to get the returned order details.", error);
    }
}


const changeReturnStatus = async (req, res) => {

    const returnId = new mongoose.Types.ObjectId(req.body.returnId);

    try {

        const returnedStatus = await returnItem.findOneAndUpdate(returnId, { $set: { status: req.body.returnStatus } }, { new: true });
        const isWallet = await wallet.findOne({ userId: returnedStatus.customer }).exec();
        const orderId = returnedStatus.order;
        const productId = returnedStatus.productId;

        if (returnedStatus.status === 'approved') {

            var Transaction = new transaction({

                userId: returnedStatus.customer,
                orderId: orderId,
                paymentId: null,
                amount: returnedStatus.refundAmnt,
                type: 'refund',
                paymentMethod: 'wallet',
                status: 'completed',
                currency: 'INR',
                description: "Returned product"

            });

            if (!isWallet) {

                const userWallet = new wallet({

                    userId: returnedStatus.customer,
                    balance: returnedStatus.refundAmnt,
                    transactions: []

                });

                const createWalletForUser = await userWallet.save();
                if (createWalletForUser) {

                    const trasactionData = await Transaction.save();
                    if (trasactionData) {
                        createWalletForUser.transactions.push(trasactionData._id);
                        await createWalletForUser.save();

                        var updatedOrder = await Order.findOneAndUpdate(
                            {
                                _id: orderId,
                                'items.product.id': productId
                            }, {
                            $set: {
                                'items.$[elem].status': 'Returned',
                                'items.$[elem].paymentStatus': 'REFUNDED'
                            }
                        },
                            { arrayFilters: [{ 'elem.product.id': productId }] },
                            { new: true }
                        );
                    }

                    const filteredProducts = updatedOrder.items.filter(prod => ((prod.status == 'Returned') || (prod.status == 'Cancelled')));
                    const orderProdCount = updatedOrder.items.length;

                    if (filteredProducts.length == orderProdCount) {
                        await Order.updateOne({ _id: orderId }, {
                            $set: {
                                status: 'Returned',
                                overallPaymentStatus: 'REFUNDED'
                            }
                        })
                    } else {
                        await Order.updateOne({ _id: orderId }, {
                            $set: {
                                overallPaymentStatus: 'PARTIALLY_REFUNDED'
                            }
                        })
                    }

                    return res.status(201).json({ status: true, message: 'Return approved and amount added to user wallet.' });
                } else {
                    return res.json({ status: false, message: 'Return approved but fund not transffered.' });
                }

            } else {

                isWallet.balance = isWallet.balance + returnedStatus.refundAmnt;
                const updatedWallet = await isWallet.save();

                if (updatedWallet) {

                    const trasactionData = await Transaction.save();
                    if (trasactionData) {
                        updatedWallet.transactions.push(trasactionData._id);
                        await updatedWallet.save();

                        var updatedOrder = await Order.findOneAndUpdate(
                            {
                                _id: orderId,
                                'items.product.id': productId
                            }, {
                            $set: {
                                'items.$[elem].status': 'Returned',
                                'items.$[elem].paymentStatus': 'REFUNDED'
                            }
                        },
                            { arrayFilters: [{ 'elem.product.id': productId }] },
                            { new: true }
                        );
                    }


                    const filteredProducts = updatedOrder.items.filter(prod => ((prod.status == 'Returned') || (prod.status == 'Cancelled')));
                    const orderProdCount = updatedOrder.items.length;

                    if (filteredProducts.length == orderProdCount) {
                        await Order.updateOne({ _id: orderId }, {
                            $set: {
                                status: 'Returned',
                                overallPaymentStatus: 'REFUNDED'
                            }
                        })
                    } else {
                        await Order.updateOne({ _id: orderId }, {
                            $set: {
                                overallPaymentStatus: 'PARTIALLY_REFUNDED'
                            }
                        })
                    }

                    return res.status(201).json({ status: true, message: 'Return approved and amount added to user wallet.' });
                } else {
                    return res.json({ status: false, message: 'Return approved but fund not transffered.' });
                }
            }




        }

    } catch (error) {

        console.error("Internal error while return commit.", error.stack);
        return res.status(500).send("Internal error while return commit.", error);
    }
}






module.exports = {

    loadCoupons,
    addNewCoupon,
    changeCouponStatus,

    loadOffers,
    addNewOffer,
    getCategoriesOrProductsForOffer,
    getOfferDetails,
    updateOffer,

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
    removeImageFromProduct,

    loadOrderList,
    loadOrderDetails,
    updateOrderStatus,
    loadReturnedOrders,
    changeReturnStatus
}