const express = require('express');
const usersware = require('../../../middleware/usersware');
const Response = require('../../../responseModel/response');
const JwtToken = require('../../../Jwt/TokenExtractor');
const BkashGateway = require('../../../paymentgateway/bkashGateway');
const BinanceGateway = require('../../../paymentgateway/binanceGateway');
const CreteUID = require('../../../common/createUnique');
const subscription = express.Router();

const Respon = new Response()
const Jwt = new JwtToken()
const bkash = new BkashGateway()
const binance = new BinanceGateway()
const createUid = new CreteUID()


subscription.use(usersware);
subscription.use(express.json());

subscription.post('/get-subscription', async (req, res)=>{
    try {
        const {amount} = req.body;
        if(typeof(amount) !== 'number'){
            Respon.errorResponse(res, "You should provide amount as Number", 400);
            return;
        }
        if(Number(amount) != 480 && Number(amount) != 960){
            Respon.errorResponse(res, "Amount should be 480 or 960 BDT", 400);
            return;
        }
        const pack = amount == 960 ? 'platinum':'gold';
        const JwtToken = req.headers.authorization.split(' ')[1];
        const tokenData = Jwt.tokenExtractor(JwtToken);
        const userId = tokenData.id;
        const data = await bkash.createPaymentLink(userId, pack, amount);
        if (data.err) {
            Respon.errorResponse(res, "Payment link not create", 400);
            return;
        }
        Respon.successResponse(res, "Successfully create link", data)
    } catch (error) {
        console.log(error);
        Respon.serverError(res, error.message)
    }
})

subscription.post("/get-subcription-international", async (req, res)=>{
    try {
        const {amount} = req.body;
        if (typeof(amount) !== 'number') {
            Respon.errorResponse(res, "amount can't be null or not be string", 400);
            return;
        }
        if (amount != 4 && amount != 8) {
            Respon.errorResponse(res, "amount should be 4 or 8", 400);
            return;
        }
        const JwtToken = req.headers.authorization.split(' ')[1];
        const tokenData = Jwt.tokenExtractor(JwtToken);
        const userId = tokenData.id;
        const plan = amount == 8 ? 'platinum':'gold';
        const data = {
            "env": {
              "terminalType": "APP"
            },
            "orderTags": {
              "ifProfitSharing": false
            },
            "merchantTradeNo": createUid.createUid(32),
            "orderAmount": amount,
            "currency": "USDT",
            "description": `Your selected plan ${plan}`,
            "goodsDetails": [{
              "goodsType": "02",
              "goodsCategory": "Online subscription",
              "referenceGoodsId": createUid.createUid(5),
              "goodsName": plan,
              "goodsDetail": "Subscription"
            }]
        }

        const getLink = await binance.createPayment(data, userId)
        if (!getLink) {
            Respon.errorResponse(res, "We can't create link for you. Please try again");
            return;
        }
        Respon.successResponse(res, "Payment link create successfully", getLink);
    } catch (error) {
        console.log(error);
        Respon.serverError(res, error.message)
    }
})

module.exports = subscription;