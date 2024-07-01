const JwtToken = require("../Jwt/TokenExtractor");
const NullChecker = require("../common/nullChecker");
const User = require("../database/models/User");
const Response = require("../responseModel/response");
const Respon = new Response()
const nullChecker = new NullChecker();
const Jwt = new JwtToken()

module.exports = async (req,res, next)=>{
    try {
        const provideToken = req.headers.authorization
        const obj = {provideToken}
        const nullCheck = await nullChecker.check(obj);
        if (nullCheck) {
            Respon.errorResponse(res, nullCheck, 401);
            return;
        }
        const token = String(provideToken).trim().split(' ')[1];
        //console.log(token);
        if (!token) {
            Respon.errorResponse(res, 'Invalid token format. Please provide with "Bearer token"', 401);
            return;
        }
        const tokenData = Jwt.tokenExtractor(token);
        if (tokenData.error) {
            Respon.errorResponse(res, `Error due to ${tokenData.messag}`, 401);
            return;
        }
        if (!tokenData.id || !tokenData.email) {
            Respon.errorResponse(res, "Data missing in your token", 401);
            return;
        }
        const user = await User.findOne({where: {id: tokenData.id}});
        if (!user || !user.dataValues) {
            Respon.errorResponse(res, "User not found", 401);
            return;
        }
        const userDetails = user.dataValues
        if (userDetails.token !== token) {
            Respon.errorResponse(res, "Token revoked", 401);
            return;
        }
        if (!userDetails.isEmailVerifird) {
            Respon.errorResponse(res, "User account is not verified", 401);
            return;
        }
        if (userDetails.idDisable) {
            Respon.errorResponse(res, "User account is disable", 401);
            return;
        }
        next()
    } catch (error) {
        console.log(error);
        Respon.serverError(res, error.message)
    }
}