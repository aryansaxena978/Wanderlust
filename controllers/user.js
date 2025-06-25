const User=require("../models/user.js");

module.exports.renderSignupForm=(req,res)=>{
    res.render("listings/users/signup.ejs")
};

module.exports.signup=async(req,res)=>{
    try{
        let {username,email,password}=req.body;
        const newUser=new User({email,username});
        const registredUser=await User.register(newUser,password);
        console.log(registredUser);
        req.login(registredUser,(err)=>{
            if(err)
                return next(err);
            else
            {
                req.flash("success","Welcome to Wanderlust");
                res.redirect("/listings");
            }
        });
        
    }
    catch(err){
        req.flash("error",err.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm=(req,res)=>{
    res.render("listings/users/login.ejs");
};

module.exports.login=(req,res)=>{
                req.flash("success","Welcome back to Wanderlust");
                let redirectUrl=res.locals.redirectUrl||"/listings";
                res.redirect(redirectUrl);
};

module.exports.logout=(req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        else{
            req.flash("success","Logged out successfully");
            res.redirect("/listings");
        }
    })
};