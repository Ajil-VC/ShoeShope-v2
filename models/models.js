const mongoose = require('mongoose')

const adminSchema = mongoose.Schema({
    firstName:{
        type : String,
        required : true
    },
    lastName : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    isAuthorised:{
        type:Number,
        default:0
    },
    image:{
        type:String,
    }

})

const userSchema = mongoose.Schema({

    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
    },

    email:{
        type:String,
        required:true
    },
    address : {
        type : Array
    },

    mobile_no:{
        type:String,

    },

    password:{
        type:String,
        
    },
    isVerified:{
        type:Number,
        default:0
    },
    isAuthorised:{
        type:Number,
        default:0
    },
    isBlocked:{
        type:Number,
        default:0
    },
    image:{
        type:String,
    },
    google_id:{
        type:String,
    }

}, {timestamps : true});

const categorySchema = mongoose.Schema({

    name : {
        type : String,
        required : true
    },
    isActive : {
        type : Number,
        default : 1
    },
    description : {
        type : String,
        required : true
    }
});

const brandSchema = mongoose.Schema({

    name : {
        type : String,
        required : true
    },
    image : {

        type : String
    }
})


const addressSchema = new mongoose.Schema({

    addressType: {
        type: String,
        required: true
    },
    place: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    district: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    landmark: {
        type: String,
        required: false,
    },
    pinCode: {
        type: String,
        required: true,
    },
    mobile_no: {
        type: String,
        required: true,
    },
    defaultAdd: {
        type: Number,
        default: 0 
    }

});


const otpSchema = new mongoose.Schema({
    email: {type:String , required : true},
    otp: {type:String , required : true},
    createdAt: { type: Date, expires: '1m', default: Date.now }
});


const productSchema = new mongoose.Schema({

    ProductName : {
        type : String,
        required : true
    },
    Category : {
        type : String,
        required : true
    },
    Brand : {
        type : String,
        required : true
    },
    Description : {
        type : String,
        required : true
    },
    regularPrice : {
        type : Number,
        required : true
    },
    salePrice : {
        type : Number,
        required : true
    },
    stockQuantity : {
        type : Number,
        required : true
    },
    image : {
        type : Array,
        required : true
    },
    isActive : {
        type : Number,
        default : 1
    },
    targetGroup : {
        type :String
    }    

},{timestamps : true});


const User = mongoose.model('User', userSchema);
const OTP = mongoose.model('OTP',otpSchema);
const Address = mongoose.model('Address',addressSchema);

const Admin = mongoose.model('Admin',adminSchema);

const Category = mongoose.model('Category',categorySchema);
const Brand = mongoose.model('Brand',brandSchema);

const Product = mongoose.model('Product',productSchema);

module.exports = {
    User,
    OTP,
    Admin,
    Category,
    Brand,
    Product,
    Address
}