require("dotenv").config();
const nodemailer = require("nodemailer");
class Utils{
    async emailVerification(email,emailVerfied,option){
        try {
          let [verificationToken] = emailVerfied;
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: process.env.EMAIL,
                  pass: process.env.PASSWORD
                }
              });
              let mailOptions;
              if(option == "forgot"){
                mailOptions = {
                  from: process.env.EMAIL,
                  to: email,
                  subject: 'Forgot password',
                  html:`<h1>Welcome</h1><p><a href="${process.env.LINk}4000/reset-password/${verificationToken.token}">click here</a> to reset your passsword</p>`
                };
              }else{
                mailOptions = {
                  from: process.env.EMAIL,
                  to: email,
                  subject: 'Email verification',
                  html:`<h1>Welcome</h1><p><a href="${process.env.LINk}4000/verifyEmail/${verificationToken.token}">click here</a> to verify your email</p>`
                };
              }
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent');
                }
              });
        } catch (error) {
            console.log(error.message);
        }
    }
}

module.exports = Utils;