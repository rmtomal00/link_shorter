const AppSetting = require("../database/models/appSetting");
const Subscribtion = require("../database/models/subscribtion");
const DailyHistory = require("./DailyClick");
const UserProfile = require("./UserProfile");
const {startOfMonth, endOfMonth, format} = require('date-fns')

const UserProfiles = new UserProfile()

class UserSubscribtion{
    constructor(){}
    
    async getUserSubscribtionData(userId){
        try {
            const data = await Subscribtion.findOne({
                where:{
                    userId: userId
                },
                raw: true
            })
            //console.log(data);
            if (String(data.plan).toLowerCase().trim() !== "free") {
                return {
                    subscriber: true
                }
            }
            return {
                subscriber: false
            }
        } catch (error) {
            //console.log(error);
            throw (error)
        }
    }

    async getUserSubscribtionDataAllDetails(userId){
        try {
            const data = await Subscribtion.findOne({
                where:{
                    userId: userId
                },
                raw: true
            })
            //console.log(data);
            return data
        } catch (error) {
            //console.log(error);
            throw (error)
        }
    }

    async getUserStatusForLinkShort(id){
        const userSubsData = await this.getUserSubscribtionDataAllDetails(id)
        //console.log(userSubsData);
        const planData = await AppSetting.findOne({
            where: {packname: userSubsData.plan},
            raw: true
        })
        const today = new Date()
        const startDate = startOfMonth(today)
        const endDate = endOfMonth(today)
        
        const getTotalShortLink = await UserProfiles.countTotalShortLinkMonth(startDate, endDate, {userId: id})
        console.log(getTotalShortLink);
        if (planData.total <= getTotalShortLink.count) {
            return true
        }
        return false
    }
}

module.exports = UserSubscribtion