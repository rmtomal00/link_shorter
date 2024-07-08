const AppSetting = require("../database/models/appSetting");
const Subscribtion = require("../database/models/subscribtion");
const DailyHistory = require("./DailyClick");

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
        console.log(planData.total);

        const getTotalShortLink = await new DailyHistory().countShortLink(new Date(userSubsData.updatedAt)-(12*3600*1000), new Date(userSubsData.lastUpdate).getTime()+(12*60*60*1000), {userId: id})
        console.log(getTotalShortLink);
        if (planData.total < getTotalShortLink[0].count) {
            return true
        }
        return false
    }
}

module.exports = UserSubscribtion