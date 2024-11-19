const mailer = require('nodemailer');
require('dotenv').config()

class SendMail{
    constructor(){}
    
    #prepare(){
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

        // return mailer.createTransport({
        //     service: 'gmail',
        //     auth:{
        //         user: "noreply.team71@gmail.com",
        //         pass: 'ppsd eeoj qrdy ggsa'
        //     }
        // })
    }

    async sendMailHtml(email, subject, body){
        try {
            const sendHistory = await this.#prepare().sendMail({
                to: email,
                from: process.env.EMAIL,
                subject: subject,
                html: body
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

    async sendMail(email, subject, body){
        try {
            const sendHistory = await this.#prepare().sendMail({
                to: email,
                from: `"Team 71" <${process.env.EMAIL}>`,
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