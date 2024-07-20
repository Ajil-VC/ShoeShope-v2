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

    address : [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    }],

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
    },
    wishlist : [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],

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

    userId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'User'
    },
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
    },
    selectedAdd: {
        type: Boolean,
        default: false
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
    reserved : {
        type : Number,
        required : true,
        default : 0
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


const cartSchema = new mongoose.Schema({

    userId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'User'
    },
    items : [
        {
            productId : {
                type : mongoose.Schema.Types.ObjectId,
                required : true,
                ref : 'Product'
            },
            quantity : {
                type : Number,
                required : true,
                min : 1,
                max : 4
            },
            isSelected : {
                type: Boolean,
                required: true,
                default: true
            },
            size : {
                type : String,
                required : true,
                default : 'S'
            }
        }
    ] 
})



const orderItemSchema = new mongoose.Schema({

    product: {
        id: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        size: {
            type: String
        },
        Brand: {
            type: String
        },
        Category: {
            type: String
        },
        price: {
            type: Number,
            required: true
        },
        images: {
            type : Array,
             
        },
        
    },
      quantity: { type: Number, required: true, min: 1 },
      subtotal: { type: Number, required: true }
})

const orderSchema = new mongoose.Schema({

    paymentGatewayOrderId: String,
    items: [orderItemSchema],
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    totalItems : {
        type : Number,
        required : true,
        default : 1
    },
    subTotal : {
        type : Number,
        required : true,
        default : 0
    },
    gstAmount : {
        type : Number,
        default : 0
    },
    discount : {
        type : Number,
        required : true,
        default : 0
    },
    totalAmount : {
        type : Number,
        required : true,
        default : 0
    },
    orderDate : {
        type : Date,
        required: true,
        default : Date.now
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    confirmation : {
        type: Number,
        required: true,
        default: 0
    },
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Address'
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['UPI Method', 'Cash on Delivery'],
        default: 'UPI Method'
    },
    
},{timestamps : true});




const returnItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product' 
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Order'
    },
    refundAmnt: {
        type: Number,
        required: true
    },
    returnDate: {
        type: Date,
        default: Date.now
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['initiated','approved','rejected' ],
    },
    
});




const transactionSchema = new mongoose.Schema({

    userId : {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    orderId : {
        type : String,
        required : true,
    },
    paymentId : {
        type : String,
        default : null
    },
    amount : {
        type: Number,
        required: true
    },
    type : {
        type: String,
        enum: ['deposit', 'payment', 'refund', 'withdrawal'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    currency: {
        type: String,
        required: true,
        default: 'INR'
    },
    description: {
        type: String,
        default: ''
    }

},{timestamps : true});


const walletSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    balance: {
      type: Number,
      required: true,
      default: 0
    },
    transactions: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'transaction'
    }],
    
})



const User = mongoose.model('User', userSchema);
const OTP = mongoose.model('OTP',otpSchema);
const Address = mongoose.model('Address',addressSchema);
const Cart = mongoose.model('Cart',cartSchema);
const Order = mongoose.model('Order',orderSchema);
const transaction = mongoose.model('transaction',transactionSchema);
const returnItem = mongoose.model('returnItem',returnItemSchema);
const wallet = mongoose.model('wallet',walletSchema);

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
    Address,
    
    Cart,
    Order,
    transaction,
    returnItem,
    wallet
}