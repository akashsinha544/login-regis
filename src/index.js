require("dotenv").config();
const express = require("express");
const app = express();
const router = require("../Routes/user.routes.js");
const DbConnection = require("../DB/db.connection.js");
const session = require("express-session");
const mongoDBSession = require("connect-mongodb-session");
const MongoDBStore = mongoDBSession(session);
const fileUpload = require('express-fileupload')
// Db connection
new DbConnection();

// Template engin for frontend
app.set('view engine','ejs');

// middlewares
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Adding session
const store = new MongoDBStore({
    uri:process.env.MONGODBURL,
    collection:"sessions"
});
app.use(session({
    secret:"This is used to genderated session.",
    resave:false,
    saveUninitialized:false,
    store:store
}));    

// Adding routes
app.use("/",router);
// Listening to port
app.listen(process.env.PORT,()=>{
    console.log(`Listening to PORT:${process.env.PORT}`);
})