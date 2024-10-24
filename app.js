const express = require('express')
const auth = require('./route/auth/auth')
const JwtToken = require('./Jwt/TokenExtractor');
const Response = require('./responseModel/response');
const User = require('./database/models/User');
const users = require('./route/user/user');
const StoreLink = require('./database/models/storelink');
const Tracker = require('./database/models/tracker');
const path = require('path');
const ScheduleSystemsSubscribtion = require('./scheduleService/subscribtion');
const DailyHistory = require('./service/DailyClick');
const subscription = require('./route/user/subscrib/subs');
const payment = require('./route/paymentconfirm/paymentconfirm');
const BinancePaymentStatus = require('./scheduleService/binancepaymentstatus');
require("dotenv").config()
const tokenData = new JwtToken();
const ApiRes = new Response();
const base_url = process.env.BASE_URL;
const cors = require('cors')
var cookieParser = require('cookie-parser');
const { where } = require('sequelize');




const app = express()
app.use(express.json())
app.use(cookieParser("letTest"))
app.use(cors({
    origin: '*', // Replace with your frontend URL or use '*' to allow all
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify the allowed methods
    allowedHeaders: ['Authorization', 'Content-Type'] // Specify the allowed headers
  }))
const port = process.env.PORT || 3000
app.use('/api/v1/auth', auth)
app.use('/api/v1/users', users)
app.use('/api/v1/users', subscription)
app.use('/payment', payment);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/test', async(req, res) => {
    res.send('Hello World!')
});

app.get('/forget-password', (req, res)=>{
    const {token} = req.query
    if (!token) {
        res.send("<h1>Token is missing </h1>")
        return;
    }
    const data = tokenData.tokenExtractor(token);
    if (data.error) {
        res.send(`<h1>${data.messag}</h1>`)
    }
    res.render('forgetpassword', {id:token})
})

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
app.get("/:linkId", async (req, res)=>{
    //console.log(req.params);
    try {
        const {linkId} = req.params;
        const getCookiess = req.cookies[linkId]
        id = linkId
        if (!id) {
            ApiRes.errorResponse(res, "Link not valid", 400);
            return;
        }
        var deviceData = req.headers['user-agent']
        var device = "";
        var bool = false
        for (let index = 0; index < deviceData.length; index++) {
            if (deviceData[index]==="(") {
                bool = true;
            }
            if (bool) {
                if (!(deviceData[index]==="(") && !(deviceData[index]===")")) {
                    device += deviceData[index]
                }
            }
            if (deviceData[index]===")") {
                break
            }
        }
        const ip = req.socket.remoteAddress
        //console.log(device);
        
        const idData = await StoreLink.findOne({where: {shortId: id}});
        if(!idData){
            ApiRes.errorResponse(res, "Invalid link", 400)
            return;
        }
        const data = idData.dataValues;
        const userId = data.userId, realLink = data.link;
        if (!userId || !realLink) {
            ApiRes.errorResponse(res, "Link not found", 404);
            return
        }
        if (getCookiess) {
            Tracker.create({linkId: id, ip: ip, click_device: device, link: base_url+"/"+id, userId: userId, unique_click:0})
            data.click += 1;
            StoreLink.update({click: data.click},{where: {shortId: linkId}})
        }else{
            Tracker.create({linkId: id, ip: ip, click_device: device, link: base_url+"/"+id, userId: userId, unique_click:1})
            data.click += 1;
            data.unique_click += 1;
            StoreLink.update({click: data.click, unique_click: data.unique_click },{where: {shortId: linkId}})
        }
        res.cookie(linkId, linkId)
        res.redirect(realLink);
    } catch (error) {
        console.log(error);
        ApiRes.serverError(res, error.message)
    }
})
new ScheduleSystemsSubscribtion().startSchedule()
new BinancePaymentStatus().startCronr()

app.listen(port, () => console.log(`Example app listening on port ${port}!`))