const dotenv = require('dotenv')
dotenv.config()

const config = {
     PORT : process.env.PORT,
     sessionSecret : process.env.sessionSecret,
     appPassword : process.env.appPassword,
     GOOGLE_CLIENT_ID : process.env.GOOGLE_CLIENT_ID,
     GOOGLE_CLIENT_SECRET : process.env.GOOGLE_CLIENT_SECRET,
     Key_id : process.env.RazorPay_Key_Id,
     Key_Secret : process.env.RazorPay_Key_Secret,
     webhookSecret : process.env.Webhook_Secret
}

module.exports = config;