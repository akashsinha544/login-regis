const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
    name:{
        type:String,
    },
    userName:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    phoneNumber:{
        type:String,
    },
    emailVerfied:[
        {
            token:{
                type:String,
            },
            isVerify:{
                type:Boolean,
                default:false
            }
        },
    ],
    forgotPasswordToken:[
        {
            token:{
                type:String,
            },
            tokenExpiresIn:{
                type:Number
            }
        }
    ],
    state:{
        type:String,
    },
    country:{
        type:String,
    },
    collageName:{
        type:String,
    },
    profile:{
        type:String,
    }
},
{
    timestamps: true 
});

// Model middleware mongoose
// Hashing password
userSchema.pre("save",async function(next){
    try {
        if(this.isModified("password")){
            let hashPassword = await bcrypt.hash(this.password,8);
            this.password = hashPassword;
        }
        const tokenGen = jwt.sign({email:this.email,emailVerifyToken:"emailVerifyToken"},process.env.ALGORITHM);
        this.emailVerfied = {token:tokenGen};
        next();
    } catch (error) {
        console.log(error.message);
    }
});
// Schema method objects
userSchema.methods = {
    generateToken:async function(userInformation){
        return await jwt.sign({email:userInformation.email},process.env.ALGORITHM);
    },
    verifyToken:async function(token){
        return await jwt.verify(token,process.env.ALGORITHM);
    },
    hashPassword:async function(password){
        try {
            return await bcrypt.hash(password,8);
        } catch (error) {
            console.log(error.message);
        }
    }
}
const UserModel = mongoose.model("User",userSchema);

module.exports = {UserModel,userSchema};