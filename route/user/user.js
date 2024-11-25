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
const UserProfile = require("../../service/UserProfile");
const {createHandler} = require('graphql-http')
const {startOfMonth, endOfMonth, format, startOfYear, endOfYear} = require("date-fns")

const Jwt = new JwtToken()
const Respon = new Response()
const createUid = new CreteUID()
const nullChecker = new NullChecker()
const base_url = process.env.BASE_URL
const daily = new DailyHistory()
const dateManager= new DateManager();
const linkDetails = new LinkDetails()
const UserSubs = new UserSubscribtion();
const UserProfiles = new UserProfile();


users.use(e.json());
users.use(middleware);

users.post("/user-profile", async (req, res)=>{
    try {
        const token = req.headers.authorization.split(" ")[1];
        const tokenData =Jwt.tokenExtractor(token.trim());

        //userData get from diffrent
        const userData = await UserProfiles.getUserProfile(tokenData.id);
        const userSubscribtion = await UserSubs.getUserSubscribtionDataAllDetails(tokenData.id)
        const date = new Date();
        const startMonth = format(startOfMonth(date), "yyyy-MM-dd");
        const endMonth = format(endOfMonth(date), "yyyy-MM-dd")
        const totalShortLinkMonth = await UserProfiles.countTotalShortLinkMonth(startMonth, endMonth, {userId: tokenData.id})
        console.log(totalShortLinkMonth);
        
        const userProfile = {
            userData,
            totalShortLinkMonth,
            userSubscribtion
        }
        Respon.successResponse(res, "User Profile get successfully", userProfile);
    } catch (error) {
        console.log(error);
        Respon.serverError(res, error.message)
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
        const getStatus = await UserSubs.getUserStatusForLinkShort(tokenData.id)
        console.log(getStatus);
        if (getStatus) {
            Respon.errorResponse(res, "You have complete your trile limit. Please Update your plan", 400);
            return;
        }
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
        console.log(dateManager.checkDateFormat(startDate));
        if (!dateManager.checkDateFormat(startDate) || !dateManager.checkDateFormat(endDate)) {
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
        if (!dateManager.checkDateFormat(startDate) || !dateManager.checkDateFormat(endDate)) {
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
        if (!dateManager.checkDateFormat(startDate) || !dateManager.checkDateFormat(endDate)) {
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
        var data
        if (checkUserMembership.subscriber) {
            data = await linkDetails.getLinkHistoryByUserforPaid( stdate, edDate, skip, {userId: id});
        }else{
            data = await linkDetails.getLinkHistoryByUser( stdate, edDate, skip, {userId: id});
        }
        if (data.length === 0) {
            Respon.errorResponse(res, `No data found for ${pages}`, 400);
            return;
        }
        Respon.successResponse(res, "Successfully fetch data", data);
    } catch (error) {
        console.log(error);
        Respon.serverError(res, error.messag)
    }
})

users.post("/get-link-history", async (req, res)=>{
    try {
        
        const {startDate, endDate} = req.body;
        if (!startDate || !endDate) {
            Respon.errorResponse(res, "Start and End date can't be empty", 400)
            return
        }

        if(!dateManager.checkDateFormat(startDate) || !dateManager.checkDateFormat(endDate)){
            Respon.errorResponse(res, "Date format should be yyyy-mm-dd", 400)
            return
        }
        const token = req.headers.authorization.split(" ")[1];
        const userId = Jwt.tokenExtractor(token).id

        const data = await daily.getShortLinkWithDetails(startDate, endDate, {userId: userId})
        const click = await daily.getCountClick(startDate, endDate, {userId: userId})
        const readyData = {
            click,
            data
        }
        Respon.successResponse(res, "Successfully get data", readyData);
    } catch (error) {
        console.log(error);
        Respon.serverError(res, error.message)
    }
})

users.post('/get-link-history-chunk', async (req, res)=>{
    try {
        const token = req.headers.authorization.split(' ')[1]
        const {startDate, endDate, leave} = req.body
        if (!startDate || !endDate || !String(leave) || !token){
            Respon.errorResponse(res, "startDate and end date leave can't be null", 400)
            return
        }
        if(!dateManager.checkDateFormat(startDate) || !dateManager.checkDateFormat(endDate)){
            Respon.errorResponse(res, "Date should be in yyyy-mm-dd format", 400)
            return;
        }
        const userId  = Jwt.tokenExtractor(token).id;
        const userdata = await daily.getShortLinkWithDetails(startDate, endDate, {userId: userId}, Number(leave));
        if (userdata.length === 0) {
            Respon.errorResponse(res, "No more data exist", 200)
            return;
        }
        Respon.successResponse(res, "Successfully get data", userdata)
    } catch (error) {
        console.log(error);
        Respon.serverError(res, error.message)
    }
})

users.post('/get-data-history-page', async (req, res)=>{
    const {linkId, skip} = req.body;
    const token = req.headers.authorization.split(' ')[1]
    try{
        console.log(skip < 0)
        if (!linkId || !(typeof skip === "number" && skip >= 0)){
            Respon.errorResponse(res, "LinkId not valid or not added skip or skip is not a number", 400)
            return;
        }
        let userId = Jwt.tokenExtractor(token).id;
        if (!userId){
            Respon.errorResponse(res, "UserId not found", 400)
            return;
        }
        const userSubscription = await UserSubs.getUserSubscribtionData(userId);

        const startDate = startOfYear(Date.now())
        const endDate = endOfYear(Date.now());
        const totalClick = await daily.getCountClick(startDate, endDate, {userId: userId}, {shortId: linkId});
        if (userSubscription.subscriber){
            const linkHisData =  await linkDetails.getLinkHistoryByUserforPaid( startDate, endDate, skip, {userId: userId}, {linkId: linkId})
            Respon.successResponse(res, "Successfully get paid user data", {clickData: totalClick, linkData: linkHisData})
        }else{
            const linkHisData =  await linkDetails.getLinkHistoryByUser(startDate, endDate, skip, {userId: userId}, {linkId: linkId})
            Respon.successResponse(res, "Successfully get free user data", {clickData: totalClick, linkData: linkHisData})
        }
    }catch (error) {
        console.log(error)
        Respon.serverError(res, error.message)
    }
})
module.exports = users