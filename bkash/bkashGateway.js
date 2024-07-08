const { default: axios } = require("axios");
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
                token: token.data.id_token,
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

    async excutePayment(payId, token){
        try {
            const data = axios.post(
                "https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/execute",
                {
                    paymentID: payId
                },
                {
                    Authorization: token,
                    "X-APP-Key": this.#app_key
                }
            )
            return {
                data,
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
}

module.exports = BkashGateway