if(process.env.NODE_ENV!="production"){
require('dotenv').config();
}


const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError");
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js")
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash=require('connect-flash');
const cookieParser = require('cookie-parser');
const passport=require("passport");
const localStrategy=require("passport-local");
const User=require("./models/user.js");




app.engine("ejs",ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,"/public")));
app.use(cookieParser());



let dburl=process.env.ATLAS_DB_URL;
// Connecting Database
main()
.then(()=>{
    console.log("Database Connected");
})
.catch((err)=>{
    console.log(err);
})


async function main() {
    await mongoose.connect(dburl);
}


// Starting the server
app.listen(8080,(req,res)=>{
    console.log("Server listening to 8080 port");
}) ;

const store=MongoStore.create({
    mongoUrl:dburl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter:24*3600
});

store.on("error",()=>{
    console.log("Error in mongo session",err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized:true,
  cookie:{
    expires: new Date()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true
  }
};


 
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});

// All listing route
app.use("/listings",listingRouter);

// All review route
app.use("/listings/:id/reviews",reviewRouter);

// All user routes
app.use("/",userRouter);


// Handling wrong route 
app.all("/", wrapAsync(async(req, res, next) => {
    res.redirect("/listings");
}));

app.all("/:var", wrapAsync(async(req, res, next) => {
    next(new ExpressError(404, "Page Not Found!!"));
}));

// Global Error Handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("listings/error.ejs",{message});
});


