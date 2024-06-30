const express = require("express");
const NullChecker = require("../common/nullChecker");
const Response = require("../responseModel/response");
const User = require("../database/models/User");
const JwtToken = require("../Jwt/TokenExtractor");
const { hashSync, compareSync } = require("bcrypt");
const SendMail = require("../mailconf/sendMail");
const auth = express.Router()
const nullChecker = new NullChecker()
const Res = new Response()
const jwtToken = new JwtToken();
const sendmail = new SendMail();
const base_url = process.env.BASE_URL


auth.use(express.json());

auth.get("/register", async (req, res)=>{
    try {
        var {username, password, email} = req.body;
        const  dataObj = {username, email, password}
        const chck = await nullChecker.check(dataObj)
        
        if(chck){
            Res.errorResponse(res, chck, 400);
            return
        }
        email = String(email).toLowerCase().trim();
        username = String(username).trim()

        if (!String(email).includes("@") || !String(email).split("@")[1].includes(".")) {
            Res.errorResponse(res, "Email invaild format", 400);
            return
        }

        if ((String(password).length <= 5)) {
            //console.log(String(password).length);
            Res.errorResponse(res, "Password lenght is less then 6 charecters", 400);
            return
        }
        //console.log(email);
        const user = await User.findOne({where:{email: email}});
        console.log(user);
        if (user) {
            Res.errorResponse(res, "Email already register", 400);
            return
        }
        const hash = hashSync(password, 10)
        const createUser = await User.create({username, email, password: hash})
        const token = jwtToken.createToken(null, createUser.dataValues.id)
        const url = `${base_url}/verify?token=${token}`;
        const mail = sendmail.sendMail(email, "Verify email from Team71.link", url);
        Res.successResponse(res, "Successfull");
    } catch (error) {
        console.log(error);
        Res.serverError(res, error.message)
    }
});

auth.post("/login", async (req, res)=>{
    try {
        var {email, password} = req.body;
        
        const obj = {email, password}
        const nullCheck = await nullChecker.check(obj);
        console.log(nullCheck);
        if (nullCheck) {
            Res.errorResponse(res, nullCheck, 400);
            return;
        }
        email = String(email).toLowerCase().trim();
        const user = await User.findOne({where: {email: email}});
        //console.log(user);
        if (!user) {
            Res.errorResponse(res, "User not found", 400);
            return;
        }

        const userDetails = user.dataValues;
        const pass = await compareSync(password, userDetails.password)
        //console.log(pass);
        if (!pass) {
            Res.errorResponse(res, "User password not match", 400);
            return;
        }
        if (!userDetails.isEmailVerifird) {
            Res.errorResponse(res, "User email not verified", 400);
            return;
        }
        if (userDetails.isDisable) {
            Res.errorResponse(res, "User account disable", 400);
            return;
        }

        const genToken = jwtToken.createToken(userDetails.email, userDetails.id);
        console.log(genToken);

        const userTokenUpdate = await User.update({token: genToken}, {where: {email: email}})
        if (userTokenUpdate[0] != 1) {
            Res.errorResponse(res, "User token not update, Login fail", 400);
            return;
        }
        Res.successResponse(res, "Login seccessfully", {token: genToken});
    } catch (error) {
        console.log(error);
        Res.serverError(res, error.message)
    }
})

auth.post("/forget-password", async (req, res)=>{
    try {
        var {email} = req.body;
        const obj = {email};
        const check = await nullChecker.check(obj);
        if (check) {
            Res.errorResponse(res, check, 400);
            return;
        }

        email = String(email).toLowerCase().trim();

        const user = await User.findOne({where: {email:email}});
        if (!user) {
            Res.errorResponse(res, "User not found", 400);
            return;
        }
        const userDetails = user.dataValues;
        if (!userDetails.isEmailVerifird) {
            Res.errorResponse(res, "User email not verified", 400);
            return;
        }
        if (userDetails.isDisable) {
            Res.errorResponse(res, "User account is disbale", 400);
            return;
        }
        const tokenGen = await jwtToken.createToken(userDetails.email, userDetails.id);
        if (!tokenGen) {
            Res.errorResponse(res, "User token not generate", 400);
            return;
        }
        await User.update({temp_token: tokenGen}, {where: {id: userDetails.id}})
        const link = process.env.BASE_URL+'/forget-password?token='+tokenGen;
        sendmail.sendMail(userDetails.email, "Forget password for Team71.link", link);
        Res.successResponse(res, "Please check your email");
    } catch (error) {
        console.log(error);
        Res.serverError(res, error.message)
    }
})

auth.post("/confirm-password", async (req, res)=>{
    try {
        const {token, password, cmpassword} = req.body;
        const obj = {token, password, cmpassword}
        const nullcheck = await nullChecker.check(obj);
        if(nullcheck){
            Res.errorResponse(res, nullcheck, 400);
            return;
        }
        if (String(password) !== String(cmpassword)) {
            Res.errorResponse(res, "Password and Confirm not match", 400);
            return;
        }
        const tokenData = jwtToken.tokenExtractor(token);
        if (tokenData.error) {
            Res.errorResponse(res, tokenData.messag, 401)
            return;
        }
        const user = await User.findOne({where: {id: tokenData.id}});
        if (!user) {
            Res.errorResponse(res, "User not found", 400)
            return;
        }
        if (!user.dataValues.temp_token || user.dataValues.temp_token !== token) {
            Res.errorResponse(res, "Token revoked", 400)
            return;
        }
        const hashPass = await hashSync(password, 10);
        const update = await User.update({password: hashPass, temp_token: null}, {where: {id: tokenData.id}});
        if (update[0] != 1) {
            Res.errorResponse(res, "Password not update", 400);
            return;
        }
        sendmail.sendMail(tokenData.email, "Password change successfully", `Hi${user.dataValues.username}\nYour password change successfully`)
        Res.successResponse(res, "Password change successfully");
    } catch (error) {
        console.log(error);
        Res.serverError(res, error.message)
    }
})

auth.get("/resend-email-verification", async(req, res)=>{
    try {
        const {email} = req.query
        if (!email) {
            Res.errorResponse(res, "Email can't be null", 400);
            return;
        }
        const user = await User.findByPk({where: {email}});
        if (!user) {
            Res.errorResponse(res, "User not found", 400)
            return;
        }
        if (user.dataValues.isEmailVerifird) {
            Res.errorResponse(res, "User already verified", 400)
            return;
        }
        const token = jwtToken.createToken(email, user.dataValues.id);
        if (!token) {
            Res.errorResponse(res, "Token creating error", 400)
            return;
        }
        const url = `${base_url}/verify?token=${token}`;
        sendmail.sendMail(email, "Verify email from Team71.link", url);
        Res.successResponse(res, "Successfully resend email, Please check your mail");
    } catch (error) {
        console.log(error);
        Res.serverError(res, error.message);
    }
})

module.exports = auth