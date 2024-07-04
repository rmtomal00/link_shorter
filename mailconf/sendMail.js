const mailer = require('nodemailer');
require('dotenv').config()

class SendMail{
    constructor(){

    }
    prepare(){
        return mailer.createTransport({
            host: process.env.HOST_EMAIL,
            port: process.env.PORT_EMAIL,
            auth:{
                user: process.env.EMAIL,
                pass: process.env.PASSWORD_EMAIL
            },
            sender: process.env.EMAIL,
            tls:{
                rejectUnauthorized: false
            },
            secure: true
        })
    }

    async sendMail(email, subject, body){
        try {
            const sendHistory = await this.prepare().sendMail({
                to: email,
                from: process.env.EMAIL,
                subject: subject,
                text: body
            });
            return {
                emailId: sendHistory.messageId,
                message: sendHistory.response
            }
        } catch (error) {
            console.log(error);
            return {
                emailId: null,
                message: null
            }
        }
    }
}
module.exports = SendMail