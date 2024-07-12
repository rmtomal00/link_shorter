const { default: axios } = require("axios");
const PaymentHistory = require("../database/models/paymentHistory");
require("dotenv").config()

class BkashGateway{
    #app_key = process.env.bkash_api_key;
    #app_secret = process.env.bkash_secret_key;
    #username = process.env.bkash_phone;
    #password = process.env.bkash_password;
    #base_url = "https://team71.link"//process.env.BASE_URL // need to change it
    constructor(){}
    async createPaymentLink(id, planName, amount){
        
        try {
            let invoiceId = new Date().getTime()
            
            const token = await this.#generateToken()

            const linkData = await axios.post(
                'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/create',
                {   
                    "mode": "0011",
                    "payerReference": JSON.stringify({"userId": id, "plan": planName}),
                    "callbackURL": `${this.#base_url}/payment/excute`,
                    "amount": amount,
                    "currency": "BDT",
                    "intent": "sale",
                    "merchantInvoiceNumber": String(invoiceId)
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        authorization: token.data.id_token,
                        'X-APP-Key': this.#app_key,
                    }
                }
            )
            //console.log(linkData.data);
            return {
                err: false,
                paymentUrl: linkData.data.bkashURL,
                paymentId: linkData.data.paymentID
            }
        } catch (error) {
            console.log(error.message);
            return {
                err: true,
                msg: error.message
            }
        }

    }

    async excutePayment(payId){
        try {
            const getToken = await this.#generateToken()
            const token = getToken.data.id_token;
            //console.log(token);
            const data = await axios.post(
                "https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/execute",
                {
                    paymentID: payId
                },
                {
                    headers:{
                        Authorization: token,
                        "X-APP-Key": this.#app_key
                    }
                }
            )
            if (Number(data.data.statusCode) != Number("0000")) {
                return {
                    responseData: data.data,
                    err: true,
                    msg: data.data.statusMessage
                }
            }
            const referenceData = JSON.parse(data.data.payerReference)
            const insertOnHistory = await PaymentHistory.create({
                payId: data.data.trxID,
                amount: data.data.amount,
                gatewayname: 'bkash',
                userId: referenceData.userId,
                plan: referenceData.plan
            });
            return {
                responseData: data.data,
                err: false
            };
        } catch (error) {
            console.log(error);
            return {
                err: true,
                msg: error.message
            }
        }
    }

    async #generateToken(){
        const token = await axios.post(
            "https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant",
            {
                app_key: this.#app_key,
                app_secret: this.#app_secret
            },
            {
                headers:{
                    username: this.#username,
                    password: this.#password
                }
            }
        );

        return token
    }
}


module.exports = BkashGateway