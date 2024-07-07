const Subscribtion = require("../database/models/subscribtion");

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
        console.log(userSubsData);
        const planData = await AppSetting.findOne({
            where: {packname: userSubsData.plan}
        })
        console.log(planData);
        if (condition) {
            
        }
    }
}

module.exports = UserSubscribtion