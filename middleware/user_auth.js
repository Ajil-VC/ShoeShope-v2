

const isLoggedIn = async(req,res,next) => {

    try{
        if( !req.session.user_id && !req.user ){
         
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
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
 
module.exports = {
    isLoggedOut,
    isLoggedIn
}