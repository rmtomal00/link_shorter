const e = require("express");
const users = e.Router();
const middleware = require("../../middleware/usersware");
const JwtToken = require("../../Jwt/TokenExtractor");
const Response = require("../../responseModel/response");
const CreteUID = require("../../common/createUnique");
const StoreLink = require("../../database/models/storelink");
const NullChecker = require("../../common/nullChecker");
const DailyHistory = require("../../service/DailyClick");
const DateManager = require("../../common/dateManager");
const LinkDetails = require("../../service/LinkDetails");
const UserSubscribtion = require("../../service/userSubscribtion");
const AppSetting = require("../../database/models/appSetting");

const Jwt = new JwtToken()
const Respon = new Response()
const createUid = new CreteUID()
const nullChecker = new NullChecker()
const base_url = process.env.BASE_URL
const daily = new DailyHistory()
const dataManager = new DateManager();
const linkDetails = new LinkDetails()
const UserSubs = new UserSubscribtion();


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

        var {userlink} = req.body

        const obj = {Link: userlink}
        const nullcheck = await nullChecker.check(obj)
        if (nullcheck) {
            Respon.errorResponse(res, nullcheck, 400);
            return;
        }
        const regex = /https?:\/\/[^\s/$.?#].[^\s]*/d;
        userlink = String(userlink).toLowerCase().trim()
        if (!userlink.match(regex)) {
            Respon.errorResponse(res, "You don't add the https:// or http:// in the link", 400);
            return;
        }
        //console.log();
        const id = await createUid.getUID()
        //console.log(id);
        const link = base_url+"/"+id;
        console.log(link);
        const storelink = await StoreLink.create({userId: tokenData.id, shortId: id, link: userlink, shortlink: link, type: "website"});
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

users.post("/get-history-daily", async (req, res)=>{
    try {
        const {startDate, endDate} = req.body
        var token = req.headers.authorization;
        const obj = {startDate, endDate, token}
        const nullcheck = await nullChecker.check(obj)
        //console.log(nullcheck);
        if (nullcheck) {
            Respon.errorResponse(res, nullcheck, 400);
            return;
        }
        console.log(dataManager.checkDateFormat(startDate));
        if (!dataManager.checkDateFormat(startDate) || !dataManager.checkDateFormat(endDate)) {
            Respon.errorResponse(res, "Data format invalid, It should be like yyyy-mm-dd", 400);
            return;
        }
        token = token.split(' ')[1];
        const tokenData = Jwt.tokenExtractor(token);
        if(tokenData.error){
            Respon.errorResponse(res, tokenData.messag, 400);
            return;
        }
        const userId = tokenData.id; const email = tokenData.email;
        const stdate = new Date(startDate);
        const edDate = new Date(endDate);
        const UserClickData = await daily.dailyCount(stdate, edDate, {userId: userId})
        console.log(UserClickData);
        Respon.successResponse(res, "Successfully fetch data", UserClickData);
    } catch (error) {
        console.log(error);
        Respon.serverError(res, error.message)
    }
})

users.post("/get-history-based-url", async (req, res)=>{
    try {
        const {startDate, endDate, page} = req.body
        var obj = {startDate, endDate};
        const token = req.headers.authorization.split(" ")[1];
        const nullcheck = await nullChecker.check(obj)
        if (nullcheck) {
            Respon.errorResponse(res, nullcheck, 400);
            return;
        }
        if (!dataManager.checkDateFormat(startDate) || !dataManager.checkDateFormat(endDate)) {
            Respon.errorResponse(res, "Data format invalid, It should be like yyyy-mm-dd", 400);
            return;
        }
        const pages = page
        //console.log(pages);
        if (typeof(pages) !== 'number' || pages < 0) {
            Respon.errorResponse(res, "Provided page number is not number or You provided less then 0", 400);
            return;
        }
        const TokenData = Jwt.tokenExtractor(token);
        const id = TokenData.id; const email = TokenData.email;
        const skip = pages * 100;
        const stdate = new Date(startDate);
        const edDate = new Date(endDate);
        const data = await daily.dailyCountByLinkId(stdate, edDate, {userId: id}, skip);
        if (data.length == 0) {
            Respon.errorResponse(res, `No data found for ${pages}`, 400);
            return;
        }
        Respon.successResponse(res, "Successfully fetch data", data);
    } catch (error) {
        console.log(error);
        Respon.serverError(res, error.message);
    }
})

users.post('/get-tracker-by-user', async (req, res)=>{
    try {
        const {startDate, endDate, page} = req.body
        var obj = {startDate, endDate};
        const token = req.headers.authorization.split(" ")[1];
        const nullcheck = await nullChecker.check(obj)
        if (nullcheck) {
            Respon.errorResponse(res, nullcheck, 400);
            return;
        }
        if (!dataManager.checkDateFormat(startDate) || !dataManager.checkDateFormat(endDate)) {
            Respon.errorResponse(res, "Data format invalid, It should be like yyyy-mm-dd", 400);
            return;
        }
        const pages = page
        //console.log(pages);
        if (typeof(pages) !== 'number' || pages < 0) {
            Respon.errorResponse(res, "Provided page number is not number or You provided less then 0", 400);
            return;
        }
        const TokenData = Jwt.tokenExtractor(token);
        const id = TokenData.id; const email = TokenData.email;
        const skip = pages * 100;
        const stdate = new Date(startDate);
        const edDate = new Date(endDate);
        const checkUserMembership = await UserSubs.getUserSubscribtionData(id)
        if (checkUserMembership.subscriber) {
            var data = await linkDetails.getLinkHistoryByUserforPaid(id, stdate, edDate, skip);
        }else{
            data = await linkDetails.getLinkHistoryByUser(id, stdate, edDate, skip);
        }
        if (data.length == 0) {
            Respon.errorResponse(res, `No data found for ${pages}`, 400);
            return;
        }
        Respon.successResponse(res, "Successfully fetch data", data);
    } catch (error) {
        console.log(error);
        Respon.serverError(res, error.messag)
    }
})

module.exports = users