const mongoose = require('mongoose')
const session = require('express-session')
const morgan = require('morgan')
const methodOverride = require('method-override');

const { passport } = require('./middleware/googleauth')

const { PORT, sessionSecret, Key_id } = require('./config/config');
const razorpay = require('./config/razorpayconfig');

const express = require('express')
const app = express();

app.use(express.json());
app.use(morgan('dev'))
app.use(methodOverride('_method'));
app.use((req, res, next) => {

    req.razorpay = razorpay;
    req.razorpay_key = Key_id;
    next();
})


app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());

const userRouter = require('./routes/userRoutes')
const adminRouter = require('./routes/adminRoutes')
const path = require('path')


mongoose.connect("mongodb://127.0.0.1:27017/ShoeShope")
    .then(() => {
        console.log("Connected to the database")
    })
    .catch((err) => {
        console.error("Something went wrong !!!", err);
    })


app.use(express.static(path.join(__dirname, 'public')))


app.set('view engine', 'ejs')

app.use((req, res, next) => {
    res.locals.req = req;
    next();
});

app.use('/', userRouter);
app.use('/admin', adminRouter)

app.use((req, res, next) => {
    return res.status(404).render('error', { code: '404', title: 'Page Not Found', message: "We couldn't find the page you were looking for." });
});
app.use((err, req, res, next) => {

    console.error(error.stack);
    return res.status(404).render('error', { code: '500', title: 'Oops!', message: "We couldn't find the page you were looking for." });
})

app.listen(PORT, () => {
    console.log(`ShoeShope is listening at http://localhost:${PORT}/admin/login`)
})