const mongoose=require("mongoose");
const Listing=require("../models/listing.js");
const initData=require("./data.js");

main()
.then(()=>{
    console.log("Database Connected");
})
.catch((err)=>{
    console.log(err);
})

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust')
}

const initDb=async()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj,owner:"685840e70eeb1b490fcc8e23"}));
    await Listing.insertMany(initData.data).then((result)=>{console.log(result)})
    console.log("Databse Intialized");
}
initDb();