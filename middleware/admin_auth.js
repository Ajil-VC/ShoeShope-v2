
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

        
        if (!req.session.admin_id || !req.session.isAuthorised) {

            const acceptHeader = req.headers.accept || "";
            
            if (req.xhr || acceptHeader.indexOf('json') > -1) {
                // If the client expects a JSON response
                return res.status(401).json({ redirect: '/admin/login'});
            } else {
                // For regular HTTP requests
                return res.redirect('/admin/login');
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

        if (req.session.admin_id && req.session.isAuthorised) {
            return res.redirect('/admin/dashboard');
        }
        next();
    } catch (error) {
        console.log("internal error occured while checking isLoggedOut", error);
        return res.status(500).send("internal error occured while checking isLoggedOut", error)
    }
}


const setViews = async (req, res, next) => {

    req.app.set('views', './views/Admin');
    next();
}


module.exports = {
    isLoggedOut,
    isLoggedIn,
    noCacheMiddleware,
    setViews
}