const dotenv = require('dotenv')
dotenv.config()

const config = {
     PORT : process.env.PORT,
     sessionSecret : process.env.sessionSecret,
     appPassword : process.env.appPassword,
     GOOGLE_CLIENT_ID : process.env.GOOGLE_CLIENT_ID,
     GOOGLE_CLIENT_SECRET : process.env.GOOGLE_CLIENT_SECRET
}

module.exports = config;