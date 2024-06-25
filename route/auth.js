const express = require("express");
const NullChecker = require("../common/nullChecker");
const Response = require("../responseModel/response");
const User = require("../database/models/User");
const auth = express.Router()
const nullChecker = new NullChecker()
const Res = new Response()


auth.use(express.json());

auth.get("/register", async (req, res)=>{
    try {
        var {username, password, email} = req.body;
        email = String(email).toLowerCase().trim();
        username = String(username).trim()
        const  dataObj = {username, email, password}
        const chck = await nullChecker.check(dataObj)
        if(chck){
            Res.errorResponse(res, chck, 400);
            return
        }
        if (!String(email).includes("@") || !String(email).split("@")[1].includes(".")) {
            Res.errorResponse(res, "Email invaild format", 400);
            return
        }

        if ((String(password).length <= 5)) {
            //console.log(String(password).length);
            Res.errorResponse(res, "Password lenght is less then 6 charecters", 400);
            return
        }
        const user = await User.findOne({email: email});
        if (user) {
            Res.errorResponse(res, "Email already register", 400);
            return
        }
        console.log(user);

        Res.successResponse(res, "Successfull", null,)
    } catch (error) {
        console.log(error);
        Res.serverError(res, error.message)
    }
})


module.exports = auth