const mongoose = require('mongoose')
const session = require('express-session')
const morgan = require('morgan')

const {passport} = require('./middleware/googleauth')

const {PORT,sessionSecret} = require('./config/config')

const express = require('express')
const app = express();

app.use(morgan('dev'))


app.use(session({
    secret : sessionSecret,
    resave : false,
    saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());

const userRouter = require('./routes/userRoutes') 
const adminRouter = require('./routes/adminRoutes')
const path = require('path')


mongoose.connect("mongodb://127.0.0.1:27017/ShoeShope")
.then(()=> {
    console.log("Connected to the database")
})
.catch((err)=>{
    console.error("Something went wrong !!!",err);
})


app.use(express.static(path.join(__dirname,'public')))


app.set('view engine','ejs')

app.use('/',userRouter);
app.use('/admin',adminRouter)


app.listen(PORT,() => {
    console.log(`ShoeShope is listening at http://localhost:${PORT}/admin/login`)
})