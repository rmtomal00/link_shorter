const express = require('express');
const Response = require('../../responseModel/response');
const BkashGateway = require('../../paymentgateway/bkashGateway');
const Subscribtion = require('../../database/models/subscribtion');
const payment = express.Router()
const path = require('path');
const JwtToken = require('../../Jwt/TokenExtractor');

const ApiRes = new Response()
const bkash = new BkashGateway()


payment.use(express.json());
payment.use(express.urlencoded({extended: true}));

payment.all("/excute", async (req, res)=>{
    try {
        const {paymentID} = req.query
        if (!paymentID) {
            res.send("<h1> paymentID can't be null</h1>")
            return;
        }
        const data = await bkash.excutePayment(paymentID);
        if (data.err) {
            res.send(`Payment error due to ${data.msg}`);
            return;
        }
        if(data.responseData.statusMessage !== "Successful"){
            res.send(`Payment error due to ${data.responseData.statusMessage}`);
            return;
        }
        const paymentReference = JSON.parse(data.responseData.payerReference);
        //console.log(paymentReference);
        const userSubsData = await Subscribtion.findOne({where: {userId: paymentReference.userId},raw: true});
        //console.log(userSubsData);
        var isSamePack = false;
        if (String(userSubsData.plan).toLocaleLowerCase().trim() === String(paymentReference.plan).toLocaleLowerCase().trim()) {
            isSamePack = true
        }
        var updatePack;
        if (isSamePack) {
            //console.log("same pack");
            updatePack = await Subscribtion.update({
                plan: paymentReference.plan,
                valid: new Date().getTime() + 30*24*60*60*1000
            },{
                where: {userId: paymentReference.userId}
            });
        }else{
            //console.log("change pack");
            updatePack = await Subscribtion.update({
                plan: paymentReference.plan,
                lastUpdate: new Date(),
                updatedAt: new Date(),
                valid: new Date().getTime() + 30*24*60*60*1000
            },{
                where: {userId: paymentReference.userId}
            });
        }
        if (updatePack[0] == 0) {
            res.send('<h1> Please contact with support team. Your payment complete successfully but pack not update </h1>');
            return;
        }
        console.log(data.responseData);
        const rData = data.responseData;
        const tokenSecret = new JwtToken().createTokenLogin(null, JSON.stringify({userId: paymentReference.userId, date: new Date()}), "12345678h");
        const postData = {
            digitalSign: tokenSecret,
            userPhone: rData.customerMsisdn,
            userPlan: String(paymentReference.plan).toUpperCase(),
            userid: paymentReference.userId,
            trxId: rData.trxID,
            paymentId: rData.paymentID,
            trxStatus: 'Complete',
            invoiceId: rData.merchantInvoiceNumber,
            currency: 'BDT',
            gateway: 'Bkash',
            planName: String(paymentReference.plan).toUpperCase(),
            price: rData.amount,
            fee: '0.0',
            total: rData.amount
        };
        res.render("paymentrecipnt", {data: postData})
    } catch (error) {
        console.log(error);
        res.status(500).send("<h1> Server error. Please contact to the support team </h1>")
    }
})

module.exports = payment