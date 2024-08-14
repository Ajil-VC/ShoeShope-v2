const mongoose = require('mongoose');
const { MONGO_URI } = require('./config');

const connectDB = async () => {

    try {

        await mongoose.connect(MONGO_URI);

        console.log("Connected to the database")

    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        process.exit(1);
    }
}

module.exports = connectDB;