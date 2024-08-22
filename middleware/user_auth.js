
const { User, Cart } = require('../models/models');
const mongoose = require('mongoose')

const noCacheMiddleware = (req, res, next) => {
    res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    next();
};


const isLoggedIn = async (req, res, next) => {

    try {

        const isAuthenticated = req.session.user_id || (req.user && req.user.user_id);

        // Check if user is blocked
        const isBlocked = req.session.isBlocked || (req.user && req.user.isBlocked);
        if (!isAuthenticated || !isBlocked) {

            // User is not authenticated or is blocked
            const acceptHeader = req.headers.accept || "";
            if (req.xhr || acceptHeader.indexOf('json') > -1) {
                // If the client expects a JSON response
                return res.status(401).json({ redirect: '/login', message: isBlocked ? 'Account blocked' : 'Authentication required' });
            } else {
                // For regular HTTP requests
                return res.redirect('/login');
            }
        }

        next();
    } catch (error) {

        console.log("Internal error while checking isLoggedIn", error);
        return res.status(500).send("Internal error while checking isLoggedIn", error);
    }
}

const isLoggedOut = async (req, res, next) => {

    try {

        const isAuthenticated = req.session.user_id || (req.user && req.user.user_id);
        // Check if user is blocked
        const isBlocked = req.session.isBlocked || (req.user && req.user.isBlocked);
        if (isAuthenticated && isBlocked) {
            return res.redirect('/');
        }
        next();
    } catch (error) {
        console.log("internal error occured while checking isLoggedOut", error);
        return res.status(500).send("internal error occured while checking isLoggedOut", error)
    }
}

const isBlocked = async (req, res, next) => {

    try {
        if (req.session.isBlocked || req.user.isBlocked) {
            return res.status(401).send("Unauthorized");
        }
        next();

    } catch (error) {
        console.log("Interal error occured while checking user isblocked", error);
        return res.status(500).send("Interal error occured while checking user isblocked", error);
    }
}

const setViews = async (req, res, next) => {

    req.app.set('views', './views/Users');
    next();
}

const badgeCount = async (req, res, next) => {

    if (req?.session?.user_id || req?.user?.user_id) {

        try {

            if (req?.session?.user_id) {
                var userId = new mongoose.Types.ObjectId(req.session.user_id);
            } else if (req?.user?.user_id) {
                var userId = new mongoose.Types.ObjectId(req.user.user_id);
            }
            const [wishlistData, cartData] = await Promise.all([
                User.aggregate([ 
                    { $match: { _id:userId }}, 
                    { $project: { wishlistCount: { $size: "$wishlist" } } }
                ]),
                Cart.aggregate([
                    {$match:{userId: userId}},
                    {$project:{cartCount:{$size:"$items"}}}
                ])
            ]);

            const wishlistCount = wishlistData[0]?.wishlistCount;
            const cartCount     = cartData[0]?.cartCount;

            res.locals.wishlistCount = wishlistCount;
            res.locals.cartCount    = cartCount ?? 0;

        } catch (error) {
            console.error("Inernal error occured while trying to get badge count in middleware.", error.stack);
        }
    }else{

        res.locals.wishlistCount = 0;
        res.locals.cartCount    = 0;
    }
    next();
}


module.exports = {
    isLoggedOut,
    isLoggedIn,
    isBlocked,
    noCacheMiddleware,
    setViews,
    badgeCount
}