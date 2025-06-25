const Listing=require("../models/listing.js");


module.exports.index=async(req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
};

module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing=async(req,res)=>{
    let {id}=req.params;
    let list=await Listing.findById(id).populate({path:'reviews',populate:{
        path:"author",
    }}).populate("owner");
    if(!list){
        req.flash("error","Listing you requested for does not exist !");
        res.redirect("/listings");
    }
    else
        res.render("listings/show.ejs",{list});
};

module.exports.createListing=async(req,res,next)=>{
    let url=req.file.path;
    let filename=req.file.filename;
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    await newListing.save();
    req.flash("success","New Listing Created !!");
    res.redirect("/listings");
};

module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    let list=await Listing.findById(id);

    if(!list){
        req.flash("error","Listing you requested for dosent exist");
        return res.redirect("/listings");
    }
    let originalImgUrl=list.image.url;
    originalImgUrl=originalImgUrl.replace("/upload","/upload/h_300,w_250")
    res.render("listings/edit.ejs",{list,originalImgUrl});
};

module.exports.updateListing=async (req,res)=>{
    let {id}=req.params;
    let newListing=await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file !=="undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        newListing.image={url,filename};
        await newListing.save();
    } 
    req.flash("success","Listing Updated !!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;
    let list =await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted !!");
    res.redirect("/listings");
};