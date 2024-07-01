const e = require("express");
const users = e.Router();
const middleware = require("../../middleware/usersware");
const JwtToken = require("../../Jwt/TokenExtractor");
const Response = require("../../responseModel/response");
const CreteUID = require("../../common/createUnique");
const StoreLink = require("../../database/models/storelink");

const Jwt = new JwtToken()
const Respon = new Response()
const createUid = new CreteUID()
const base_url = process.env.BASE_URL


users.use(e.json());
users.use(middleware);

users.post("/user-profile", async (req, res)=>{
    try {
        const token = req.headers.authorization.split()[1];
        const tokenData =Jwt.tokenExtractor(token)
        
    } catch (error) {
        console.log(error);
        
    }
    
})
users.post('/short-link', async(req, res)=>{
    try{
        const tokenData = Jwt.tokenExtractor(req.headers.authorization.split(" ")[1]);

        const {userlink} = req.body
        console.log();
        const id = await createUid.getUID()
        console.log(id);
        const link = base_url+"/"+id;
        const storelink = await StoreLink.create({userId: tokenData.id, shortId: id, link: userlink});
        if (!storelink || !storelink.dataValues) {
            Respon.errorResponse(res, "Link not store", 400);
            return;
        }
        Respon.successResponse(res, "Link generate successful", {shortLink: link})
    }catch(error){
        console.log(error);
        Respon.serverError(res, error.message);
    }
})
module.exports = users