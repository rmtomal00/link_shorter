const express = require('express');
const usersware = require('../../../middleware/usersware');
const Response = require('../../../responseModel/response');
const JwtToken = require('../../../Jwt/TokenExtractor');
const BkashGateway = require('../../../bkash/bkashGateway');
const subscription = express.Router();

const Respon = new Response()
const Jwt = new JwtToken()
const bkash = new BkashGateway()


subscription.use(usersware);
subscription.use(express.json());

subscription.post('/get-subscription', async (req, res)=>{
    try {
        const {amount} = req.body;
        if(typeof(amount) !== 'number'){
            Respon.errorResponse(res, "You should provide amount as Number", 400);
            return;
        }
        // if(Number(amount) != 480 && Number(amount) != 960){
        //     Respon.errorResponse(res, "Amount should be 480 or 960 BDT", 400);
        //     return;
        // }
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

module.exports = subscription;