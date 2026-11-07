const dotenv = require('dotenv')
dotenv.config()

const config = {
     PORT : process.env.PORT,
     sessionSecret : process.env.sessionSecret,
     appPassword : process.env.appPassword,
     GOOGLE_CLIENT_ID : process.env.GOOGLE_CLIENT_ID,
     GOOGLE_CLIENT_SECRET : process.env.GOOGLE_CLIENT_SECRET,
     GOOGLE_CALLBACK_URL : process.env.GOOGLE_CALLBACK_URL,
     Key_id : process.env.RazorPay_Key_Id,
     Key_Secret : process.env.RazorPay_Key_Secret,
     webhookSecret : process.env.Webhook_Secret,
     MONGO_URI : process.env.MONGO_URI,
     CLOUDINARY_CLOUD_NAME : process.env.CLOUDINARY_CLOUD_NAME,
     CLOUDINARY_API_KEY : process.env.CLOUDINARY_API_KEY,
     CLOUDINARY_API_SECRET : process.env.CLOUDINARY_API_SECRET
}

module.exports = config;