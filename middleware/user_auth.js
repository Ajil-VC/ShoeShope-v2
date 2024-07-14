// const noCacheMid = (req , res, next) => {
//     res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
//     next();
// }

// res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
// res.setHeader('Pragma', 'no-cache');
// res.setHeader('Expires', '0');
// res.redirect('/login');

const isLoggedIn = async(req,res,next) => {

    try{
        
        
        if( !req.session.user_id && !req.user ){

            const acceptHeader = req.headers.accept || "";
            if (req.xhr || acceptHeader.indexOf('json') > -1) {
                // If the client expects a JSON response
                return res.json({ redirect: '/login' });
              } else {
                // For regular HTTP requests
                return res.redirect('/login');
              }
            
        }
        next();
    }catch(error){

        console.log("Internal error while checking isLoggedIn",error);
        return res.status(500).send("Internal error while checking isLoggedIn",error);
    }
}

const isLoggedOut = async(req,res,next) => {

    try{

        console.log("This is from isLoggedOut");
        if( req.session.user_id || req.user ){
            return res.redirect('/home');
        }
        next();
    }catch(error){
        console.log("internal error occured while checking isLoggedOut",error);
        return res.status(500).send("internal error occured while checking isLoggedOut",error)
    }
}

const isBlocked = async(req,res,next) => {

    try{
        if(req.session.isBlocked || req.user.isBlocked){
            return res.status(401).send("Unauthorized");
        }
        next();

    }catch(error){
        console.log("Interal error occured while checking user isblocked",error);
        return res.status(500).send("Interal error occured while checking user isblocked",error);
    }
}
 
module.exports = {
    isLoggedOut,
    isLoggedIn,
    isBlocked,
    // noCacheMid
}