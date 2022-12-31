const {UserModel,userSchema} = require("../Models/user.schema.js");
class UserMiddleware{
    // Register validation
    async registerFieldValidation(req,res,next){
        try {
            let {name,userName,email,password,phoneNumber} = req.body;
            password = password.trim();
            userName = userName.trim();
            email = email.trim();
            name = name.trim();
            phoneNumber = phoneNumber.trim();
            // Validate name
            if(!name){
                return res.status(400).json({
                    success:false,
                    message:"Name is required"
                });
            }
            // Validate username
            if(!userName){
                return res.status(400).json({
                    success:false,
                    message:"Username is required"
                });
            }
            // Validate email;
            if(!email){
                return res.status(400).json({
                    success:false,
                    message:"Email is required"
                });
            }
            // Validate password
            if(!password){
                return res.status(400).json({
                    success:false,
                    message:"Password is required"
                });
            }
            // Validate phone number
            if(!phoneNumber){
                return res.status(400).json({
                    success:false,
                    message:"Phone number is required"
                });
            }
            // finding user exist
            // const finduser = await UserModel.findOne({
            //     $or:[
            //             {email},
            //             {userName}
            //         ]
            // });
            let finduser;
            finduser = await UserModel.findOne({userName});
            if(finduser === null) {
                finduser = await UserModel.findOne({email});
                if(finduser === null) return next();
                else{
                    return res.status(400).json({
                        success:false,
                        message:"Email already exits."
                    })
                }
            }
            else{
                return res.status(400).json({
                    success:false,
                    message:"Username already exits."
                })
            }
        } catch (error) {
            res.status(400).json({
                success:false,
                message:error.message
            });
        }
    }
    // Login validation
    async loginFieldValidation(req,res,next){
        try {
            if(req.session.isAuth) return res.redirect("/profile");
            const {userName,password} = req.body;
            if(!userName){
                return res.status(400).json({
                    success:false,
                    message:"Email or username is required"
                });
            }
            if(!password){
                return res.status(400).json({
                    success:false,
                    message:"Password is required"
                });
            }
            const checkEmailIsValid = await UserModel.findOne({$or:[
                {email:userName},
                {userName:userName}
            ]});
            if(checkEmailIsValid !== null){
                req.checkEmailIsValid = checkEmailIsValid;
                next();
            }else{
                res.status(400).json({
                    success:false,
                    message:"Invalid user."
                });
            }
        } catch (error) {
            res.status(400).json({
                success:false,
                message:error.message
            });
        }
    }
    // forgot password email validation
    async forgotPasswordValidation(req,res,next){
        try {
            const {email} = req.body;
            if(!email){
                // return res.status(400).json({
                //     success:false,
                //     message:"Email is required."
                // });
                res.render("forgotPassword",{query:"Email is required."});
            }
            const response = await UserModel.findOne({email:email});
            if(response !== null){
                let [emailVerfiedToken] = response.emailVerfied;
                if(emailVerfiedToken.isVerify === true){
                    req.userInfo = response;
                    next();
                }else if(emailVerfiedToken.isVerify !== true){
                    // res.status(400).json({
                    //     success:false,
                    //     message:"Email is not verified."
                    // }); 
                    res.render("forgotPassword",{query:"Email is not verified."});
                }else{
                    // res.status(400).json({
                    //     success:false,
                    //     message:"Invalid email."
                    // }); 
                    res.render("forgotPassword",{query:"Invalid Email."});
                }
            }
            else{
                // res.status(400).json({
                //     success:false,
                //     message:"Invalid Email."
                // }); 
                res.render("forgotPassword",{query:"Invalid Email."});
            }
        } catch (error) {
            res.status(400).json({
                success:false,
                message:error.message
            });
        }
    }
    // Reset password and confirm password validation
    async resetPasswordValidation(req,res,next){
        try {
            const {fptk} = req.params;
            let response = await userSchema.methods.verifyToken(fptk);
            if(response.email !== null || response.email !== undefined){
                const findUser = await UserModel.findOne({email:response.email});
                if(findUser){
                    req.findUser = findUser; 
                    req.fptk = fptk; 
                    next();
                }else{
                    res.status(400).json({
                        success:false,
                        message:"Invalid user."
                    });    
                }
            }else{
                res.status(400).json({
                    success:false,
                    message:"Invalid user."
                });
            }
        } catch (error) {
            res.status(400).json({
                success:false,
                message:error.message
            });
        }
    }
    // Auth middleware
    async isAuth(req,res,next){
        try {
            if(req.session.isAuth) return next();
            return res.redirect("/login");
        } catch (error) {
            res.staus(400).json({
                success:false,
                message:error.message
            });
        }
    }
    // Middleware for not loggedIn user
    async unAuth(req,res,next){
        try {
            if(req.session.isAuth) return res.redirect("/profile");
            return next();
        } catch (error) {
            res.status(400).json({
                success:false,
                message:error.message
            });
        }
    }
}

module.exports = UserMiddleware;