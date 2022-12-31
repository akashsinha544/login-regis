const {UserModel} = require("../Models/user.schema.js");
const Utils = require("../Utils/emailVerification.util.js");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const {userSchema} = require("../Models/user.schema.js");
const path = require('path');
// Creating object
let sendEmail = new Utils();

class UserController{

    async home(req,res){
        try {
            res.render("login",{query:""});
        } catch (error) {
            res.status(400).json({
                success:false,
                message:error.message
            });
        }
    }
    // Register controller
    async register(req,res){
        try {
            const {name,userName,email,password,phoneNumber} = req.body;
            const createUser = await UserModel.create({name,userName,email,password,phoneNumber});
            createUser.save((err,small)=>{
                if(err != null) {
                    return res.status(400).json({
                        success:false,
                        message:err.message
                    });
                }else{
                    sendEmail.emailVerification(small.email,small.emailVerfied,"emailVerify");
                    // res.status(200).json({
                    //     success:true,
                    //     message:"User registered."
                    // });   
                    res.redirect("/login");
                }
            });
        } catch (error) {
            return res.status(400).json({
                success:false,
                message:error.message
            });
        }
    }
    // calling login view
    async callRegisterView(req,res){
        try {
            return res.render("register",{query:""});
        } catch (error) {
            res.status(400).json({
                success:false,
                message:error.message
            });
        }
    }
    // Email verificatikon controller
    async verifyEmail(req,res){
        try {
            const token = req.params.evtk;
            const checkToken = await jwt.verify(token,process.env.ALGORITHM);
            if(checkToken.emailVerifyToken === 'emailVerifyToken'){
                const findUser = await UserModel.findOne({email:checkToken.email});
                let [extractToken] = findUser.emailVerfied;
                if(extractToken.token === token){
                    const emailVerifiedSuccessfully = await UserModel.findOneAndUpdate({_id:findUser._id},{emailVerfied:{token:undefined,isVerify:true}},{new:true});
                    // res.status(200).json({
                    //     success:true,
                    //     message:"Email verified"
                    // });
                    res.render("emailVerify",{query:"Email verified"});
                }else{
                    // res.status(400).json({
                    //     success:false,
                    //     message:"Invalid token"
                    // });     
                    res.render("emailVerify",{query:"Invalid token"});
                }
            }
        } catch (error) {
            res.status(400).json({
                success:false,
                message:error.message
            });
        }
    }
    // Login controller
    async login(req,res){
        try {
            const {password} = req.body;
            bcrypt.compare(password,req.checkEmailIsValid.password,function(err,response){
                if(!response) {
                    // return res.status(400).json({
                    //     success:false,
                    //     message:"Invalid User"
                    // });
                    return res.render("login",{query:"Invalid user."});
                }else{
                    let [isEmailVerified] = req.checkEmailIsValid.emailVerfied;
                    if(isEmailVerified.isVerify === true){
                        req.session.isAuth = true;
                        req.session.user = {
                            userName:req.checkEmailIsValid.userNama,
                            email:req.checkEmailIsValid.email,
                            userId:req.checkEmailIsValid._id
                        }
                        return res.redirect("/profile");
                        // return res.status(400).json({
                        //     success:false,
                        //     message:"Valid user."
                        // });
                    }else{
                        // return res.status(400).json({
                        //     success:false,
                        //     message:"Email is not verified."
                        // }); 
                        return res.render("login",{query:"Email is not verified."});
                    }
                }
            });
        } catch (error) {
            res.status(400).json({
                success:false,
                message:error.message
            });
        }
    }
    // calling login view
    async callLoginView(req,res){
        try {
            return res.render("login",{query:""});
        } catch (error) {
            res.status(400).json({
                success:false,
                message:error.message
            });
        }
    }
    // Forgot password
    async forgotPassword(req,res){
        try {
            const userInformation = req.userInfo;
            let token = await userSchema.methods.generateToken(userInformation);
            const updateForgotTokenInDb = await UserModel.findOneAndUpdate({_id:userInformation._id},{forgotPasswordToken:{token:token,tokenExpiresIn:Date.now() + 5 * 60 * 1000}},{new:true})
            if(updateForgotTokenInDb){
                sendEmail.emailVerification(updateForgotTokenInDb.email,updateForgotTokenInDb.forgotPasswordToken,"forgot");
                // res.status(400).json({
                //     success:false,
                //     message:"Email is sent on registered email id"
                // }); 
                res.render("forgotPassword",{query:"Email sent."});   
            }
        } catch (error) {
            res.status(400).json({
                success:false,
                message:error.message
            });
        }
    }
    // calling forgot password view
    async callForgotPasswordView(req,res){
        try {
            return res.render("forgotPassword",{query:""});
        } catch (error) {
            res.status(400).json({
                success:false,
                message:error.message
            });
        }
    }
    // Verify forgot token and change password
    async resetPassword(req,res){
        try {
            const [findForgotToken] = req.findUser.forgotPasswordToken;
            const token = req.fptk;
            if(findForgotToken.token === token && Date.now() < findForgotToken.tokenExpiresIn){
                const {password,confirmPassword} = req.body;
                if(password === confirmPassword){
                    const hashPass = await bcrypt.hash(password,8);
                    const changePassword = await UserModel.findOneAndUpdate({_id:req.findUser._id},{password:hashPass,forgotPasswordToken:{token:undefined,tokenExpiresIn:undefined}},{new:true});
                    if(changePassword != null){
                        // res.status(400).json({
                        //     success:false,
                        //     message:"Password is updated."
                        // });    
                        res.redirect("/login"); 
                    }else{
                        res.status(400).json({
                            success:false,
                            message:"Something went wrong."
                        });
                    }
                }else{
                    res.status(400).json({
                        success:false,
                        message:"Passwords are not matching."
                    });    
                }
            }else{
                await UserModel.findOneAndUpdate({_id:req.findUser._id},{forgotPasswordToken:{token:undefined,tokenExpiresIn:undefined}},{new:true});
                res.status(400).json({
                    success:false,
                    message:"Forgot password request expire."
                });    
            }
            
        } catch (error) {
            res.status(400).json({
                success:false,
                message:error.message
            });
        }
    }
    // calling reset password view
    async callResetPasswordView(req,res){
        try {
            return res.render("resetPassword",{query :req.params.fptk});
        } catch (error) {
            res.status(400).json({
                success:false,
                message:error.message
            });
        }
    }
    // Profile controller
    async profile(req,res){
        try {
            let {userId} = req.session.user;
            let userInfo = await UserModel.findOne({_id:userId}).select({name:1,userName:1,email:1,phoneNumber:1,state:1,collageName:1,country:1,profile:1,_id:0});
            res.render("profile",{query:userInfo});
        } catch (error) {
            res.status(400).json({
                success:false,
                message:error.message
            });
        }
    }
    // logout Controller
    async logout(req,res){
        try {
            req.session.destroy((err)=>{
                if(err) return res.status(400).json({
                    success:false,
                    message:err.message
                });
                res.redirect("/login");
            });
        } catch (error) {
            res.status(400).json({
                success:false,
                message:error.message
            });
        }
    }
    // Update profile Data
    async updateProfile(req,res){
        try {
            let {userId} = req.session.user;
            const {name,phoneNumber,state,country,collage} = req.body;
            if(req.files !== null){
                const file = req.files.profile;
                var filePath = path.join(path.dirname(require.main.filename), 'images', `${file.name}`);
                file.mv(filePath, err => {
                    if (err) return res.status(500).json({
                        success:false,
                        message:err.message
                    }); 
                });
            } 
            const updateUserData = await UserModel.findOneAndUpdate({_id:userId},{name,phoneNumber,state,country,collageName:collage,profile:filePath},{new:true});
            if(updateUserData !== null || updateUserData !== undefined){
                // res.status(400).json({
                //     success:true,
                //     message:"Data updated."
                // });
                res.redirect("/profile");
            }
        } catch (error) {
            res.status(400).json({
                success:false,
                message:error.message
            });
        }
    }
    // update password controller view
    async updatePasswordView(req,res){
        try {
            res.render("updatePassword");
        } catch (error) {
            res.staus(400).json({
                success:false,
                message:error.message
            });
        }
    }
    // update password controller
    async updatePassword(req,res){
        try {
            let {userId} = req.session.user;
            const {password,confirmPassword} = req.body;
            if(password === confirmPassword){
                let hashPass = await userSchema.methods.hashPassword(password);
                let response = await UserModel.findOneAndUpdate({_id:userId},{password:hashPass},{new:true});
                if(response !== null){
                    req.session.destroy((err)=>{
                        if(err) return res.status(400).json({
                            success:false,
                            message:err.message
                        });
                        res.redirect("/login");
                    })
                }
            }
        } catch (error) {
            res.status(400).json({
                success:false,
                message:error.message
            });
        }
    }
}

module.exports = UserController;