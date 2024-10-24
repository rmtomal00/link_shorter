const StoreLink = require("../database/models/storelink");
const User = require("../database/models/User");
const sequelize = require("../database/db");
const { Op } = require("sequelize");

class UserProfile {
    constructor() {
    }

    async getUserProfile(userId){
        const UserData = await User.findOne({where: {id: userId},  raw: true})
        
        if (!UserData) {
            throw new Error("User not found");
        }
        const {password, token, temp_token, ...UserObject} = UserData

        return UserObject
    }

    async updateUserProfile(JsonObject, userId){
        if (typeof(JsonObject) !== 'object') {
            throw new Error("JsonObject not an object")
        }
        const update = await User.update(JsonObject, {where: {id: userId}})
        if (update[0] != 1) {
            throw new Error("Update is not seccessfully");
        }
        return "Update successfully"
    }

    async countTotalShortLinkMonth(startDate, endDate, findObject){
        try {
            
            return StoreLink.findOne({
                attributes: [[sequelize.fn("COUNT", sequelize.col('id')), "count"]],
                where: {
                    [Op.and]: [
                        {createAt:{
                            [Op.lte]: endDate,
                            [Op.gte]: startDate
                        }},
                        findObject
                    ]
                },
                raw: true
            })
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }

}

module.exports = UserProfile