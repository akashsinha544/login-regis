const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
class DbConnection{
    constructor(){
        try {
            mongoose.connect(process.env.MONGODBURL);
            mongoose.connection.on("connected",()=>{
                console.log("connected");
            })
            mongoose.connection.on("error",(e)=>{
                console.log(e)
            })
        } catch (error) {
            console.log(error.message);
        }
    }
}

module.exports = DbConnection;