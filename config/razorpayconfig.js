

const Razorpay = require('razorpay');
const {Key_Secret,Key_id} = require('../config/config');

const razorpay = new Razorpay({
    key_id : Key_id,
    key_secret : Key_Secret
})

module.exports = razorpay;