const express = require('express');
const Response = require('../../responseModel/response');
const BkashGateway = require('../../bkash/bkashGateway');
const Subscribtion = require('../../database/models/subscribtion');
const payment = express.Router()

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
        res.send(JSON.stringify(data))
    } catch (error) {
        console.log(error);
        res.status(500).send("<h1> Server error. Please contact to the support team </h1>")
    }
})

module.exports = payment