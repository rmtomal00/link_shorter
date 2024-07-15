const EJSfileRenderer = require("../common/ejsFileRender");
const BinancePending = require("../database/models/binancepending");
const Subscribtion = require("../database/models/subscribtion");
const User = require("../database/models/User");
const SendMail = require("../mailconf/sendMail");
const BinanceGateway = require("../paymentgateway/binanceGateway");
const cron = require('node-cron')

const checkPaymentStatus = new BinanceGateway()
const MailSender = new SendMail()
const getHtmlEjs = new EJSfileRenderer()
const marchent = process.env.marchentId

class BinancePaymentStatus{

    constructor(){}

    async checkPaymentStatus(){
        var size = 0;
        while(true){
            const getpending = await BinancePending.findAll({
                offset: size*100,
                limit:100,
                raw: true
            });
            //console.log(getpending);
            if (getpending.length <= 0) {
                size = 0;
                break;
            }
            for (let index = 0; index < getpending.length; index++) {
                const userData = getpending[index];
                if (userData.expireTime < Date.now()) {
                    await BinancePending.destroy({
                        where: {
                            id: userData.id
                        }
                    })
                    continue;
                } else {
                    const data = {
                        "merchantId": marchent,
                        "subMerchantId": marchent,
                        "merchantTradeNo": userData.merchantTradeNo,
                        "prepayId": userData.prepayId
                    }
                    const getPaymentData = await checkPaymentStatus.getPaymentStatus(data, userData.userId)
                    console.log(getPaymentData);
                    if (!getPaymentData || getPaymentData.status === "PAID") {
                        const plan = Number(getPaymentData.orderAmount) == 8 ? "platinum" : "gold";
                        const oldPlan = await Subscribtion.findOne({
                            where: {userId: userData.userId},
                            raw: true
                        })
                        if ( String(oldPlan.plan).toLocaleLowerCase().trim() === String(plan).toLocaleLowerCase().trim()) {
                            console.log("old subscriber");
                            await Subscribtion.update({
                                plan: String(oldPlan.plan).toLocaleLowerCase().trim(),
                                valid: new Date().getTime() + 30*24*60*60*1000
                            },{
                                where: {userId: userData.userId}
                            });
                        }else{
                            console.log("new subscriber");
                            await Subscribtion.update({
                                plan: plan,
                                lastUpdate: new Date().getTime(),
                                updatedAt: new Date().getTime(),
                                valid: new Date().getTime() + 30*24*60*60*1000
                            },{
                                where: {userId: userData.userId}
                            });
                        }
                        const user = await User.findOne({
                            where:{
                                id: userData.userId
                            },
                            raw: true
                        })
                        const allData = {
                            username: user.username,
                            plan: String(plan).toUpperCase(),
                            currency: "USDT",
                            orderAmount: getPaymentData.orderAmount,
                            merchantTradeNo: userData.merchantTradeNo
                        }
                
                        const htmlContent = getHtmlEjs.getEjsToHtml(allData, "binancerecipent.ejs", "../views")
                        //console.log(htmlContent);
                        MailSender.sendMailHtml(user.email, "Payment Receive Confirmation", htmlContent)
                        await BinancePending.destroy({
                            where: {
                                id: userData.id
                            }
                        })
                    }
                }
            }
            size = size+1;
        }

    }

    startCronr(){
        console.log("Scheduler started");
        cron.schedule('*/1 * * * *', async () => { // Runs every day at midnight
            try {
               await this.checkPaymentStatus();
            } catch (error) {
                console.error('Error updating subscriptions:', error);
            }
        }).start();
    }
}

module.exports = BinancePaymentStatus;