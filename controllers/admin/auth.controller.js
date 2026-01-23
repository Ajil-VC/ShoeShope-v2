const { Admin } = require('../../models/models');
const bcrypt = require('bcrypt');

const securePassword = async (password) => {

    try {

        const hashedP = await bcrypt.hash(password, 10);
        return hashedP;

    } catch (error) {
        console.error(error.stack)
    }

}

const adminRegistration = async (req, res) => {


    try {

        const { firstName, lastName, email, password } = req.body

        const sPassword = await securePassword(password)


        const newAdmin = new Admin({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: sPassword,
            isAuthorised: 1
        })


        const adminData = await newAdmin.save();

        if (adminData) {
            return console.log('Admin Created Successfully')
        } else {
            return console.log('Something went wrong while registering Admin')
        }
    } catch (error) {
        console.error('Error while registering Admin\n', error.stack);
    }
}

const loadLogin = async (req, res) => {

    try {
        return res.status(200).render('adminLogin')
    } catch (error) {
        console.error("Error when tried to login Admin", error.stack)
        res.status(500).send('Internal Server Error')
    }
}

const loginAdmin = async (req, res) => {

    try {

        const { email, password } = req.body;

        const adminData = await Admin.findOne({ email }).exec();
        if (!adminData) {
            return res.status(404).send('Admin not found')
        }
        const passwordMatch = await bcrypt.compare(password, adminData.password)

        if (passwordMatch) {
            req.session.admin_id = adminData._id;
            req.session.isAuthorised = adminData.isAuthorised;
            return res.status(200).redirect('dashboard')
        } else {
            return res.status(404).send('Email or Password Incorrect')
        }

    } catch (error) {

        console.error('Error while Admin loggin in', error.stack);
        return res.status(500).send("Internal server error while Admin login")
    }

}



const logoutAdmin = async (req, res) => {

    try {

        if (req.session.admin_id) {

            req.session.destroy((err) => {

                if (err) {
                    console.error("Error while destroying session : ", err);
                    return res.status(500).send("Error while destroying session : ", err);
                }


                return res.status(302).redirect('/admin/login');
            });
        } else {
            console.error("Unknown Error while logging out", error.stack)
        }

    } catch (error) {
        console.error("Internal error while trying to logout", error.stack);
        return res.status(500).send("Internal error while trying to logout", error);
    }

}


module.exports = {
    adminRegistration,
    loadLogin,
    loginAdmin,
    logoutAdmin,
}