const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/user.controller.js");
const UserMiddleware = require("../Middleware/user.middleware.js");

// creating objects
const userControllerObj = new UserController();
const userMiddlewareObj = new UserMiddleware();

// GET routes
router.get("/",userControllerObj.home)
router.get("/registration",userMiddlewareObj.unAuth,userControllerObj.callRegisterView);
router.get("/verifyEmail/:evtk",userMiddlewareObj.unAuth,userControllerObj.verifyEmail);
router.get("/login",userMiddlewareObj.unAuth,userControllerObj.callLoginView);
router.get("/forgotPassword",userMiddlewareObj.unAuth,userControllerObj.callForgotPasswordView);
router.get("/reset-password/:fptk",userMiddlewareObj.unAuth,userControllerObj.callResetPasswordView);
router.get("/profile",userMiddlewareObj.isAuth,userControllerObj.profile);
router.get("/updatePassword",userMiddlewareObj.isAuth,userControllerObj.updatePasswordView);


// POST Routes
router.post("/registration",userMiddlewareObj.unAuth,userMiddlewareObj.registerFieldValidation,userControllerObj.register);
router.post("/login",userMiddlewareObj.loginFieldValidation,userControllerObj.login);
router.post("/forgotPassword",userMiddlewareObj.forgotPasswordValidation,userControllerObj.forgotPassword);
router.post("/reset-password/:fptk",userMiddlewareObj.resetPasswordValidation,userControllerObj.resetPassword);
router.post("/logout",userMiddlewareObj.isAuth,userControllerObj.logout);
router.post("/updateProfile",userMiddlewareObj.isAuth,userControllerObj.updateProfile);
router.post("/updatePassword",userMiddlewareObj.isAuth,userControllerObj.updatePassword);

// Exporting
module.exports = router;