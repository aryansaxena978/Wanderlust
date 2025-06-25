const express=require("express");
const router=express.Router();
const Listing=require("../models/listing.js");
const wrapAsync=require("../utils/wrapAsync.js");
const {isLoggedIn}=require("../middleware.js");
const {isOwner,validateListing}=require("../middleware.js");
const listingController=require("../controllers/listings.js");
const multer  = require('multer');
const {storage}=require("../cloudConfig.js");
const upload = multer({storage});



router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn,
        validateListing,
        upload.single('listing[image]'),
        wrapAsync(listingController.createListing)
    );
    


// Directing to new listing addition form
router.get("/new",isLoggedIn,listingController.renderNewForm);


router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn,
        isOwner,
        upload.single('listing[image]'),validateListing,
        wrapAsync(listingController.updateListing))
    .delete(isLoggedIn,
            isOwner,
            listingController.destroyListing);


router.get("/edit/:id",isLoggedIn,isOwner,listingController.renderEditForm);


module.exports=router;