const jwt = require("jsonwebtoken");
require('dotenv').config()
const secret = process.env.JWT_SECRET;

class JwtToken{
    constructor(){}

    createToken(email, id){
        const token = jwt.sign({email, id}, secret, {expiresIn: '1h'})
        //console.log(token);
        return token;
    }

    tokenExtractor(token){
        try {
            const data = jwt.verify(token, secret)
            return {
                error: false,
                id: data.id,
                email: data.email
            }
        } catch (error) {
            return {
                error: true,
                messag: error.message
            }
        }
    }
}

module.exports = JwtToken