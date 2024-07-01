const express = require('express')
const auth = require('./route/auth/auth')
const JwtToken = require('./Jwt/TokenExtractor');
const Response = require('./responseModel/response');
const User = require('./database/models/User');
const users = require('./route/user/user');
require("dotenv").config()
const tokenData = new JwtToken();
const ApiRes = new Response();



const app = express()
app.use(express.json())
const port = process.env.PORT || 3000
app.use('/api/v1/auth', auth)
app.use('/api/v1/users', users)

app.get('/', async(req, res) => {
    res.send('Hello World!')
});

app.get("/verify", async (req, res)=>{
    console.log(req.query);
    try {
        const {token} = req.query;
        const data = tokenData.tokenExtractor(token);
        if (data.error){
            ApiRes.errorResponse(res, data.messag, 401);
            return;
        }
        const id = data.id;
        const user = await User.findOne({where: {id: id}});
        if (!user) {
            ApiRes.errorResponse(res, "User not found", 400);
            return;
        }
        if (user.dataValues.isEmailVerifird) {
            ApiRes.errorResponse(res, "User email already verifed", 400);
            return;
        }
        if (user.dataValues.isDisable) {
            ApiRes.errorResponse(res, "User account disable", 400);
            return;
        }
        const update = await User.update({isEmailVerifird: true}, {where: {id: id}});
        if (update[0] !=1) {
            ApiRes.errorResponse(res, "User email verification fail", 400);
            return;
        }
        ApiRes.successResponse(res, "Update successfull", null);
    } catch (error) {
        console.log(error);
        ApiRes.serverError(res, error.message);
    }
})
app.get("/:id", (req, res)=>{
    console.log(req.params);
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))