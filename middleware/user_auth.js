

const isLoggedIn = async(req,res,next) => {

    try{

        req.user ? next() : res.sendStatus(401) ;
    }catch(error){

    }
}

module.exports = {
    isLoggedIn
}