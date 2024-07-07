const { Op } = require("sequelize");
const sequelize = require("../database/db");
const Tracker = require("../database/models/tracker");

class LinkDetails{
    constructor(){}

    async getLinkHistoryByUserforPaid(userId, startDate, endDate, skip){
        try {
            const data = await Tracker.findAll({
                attributes:["id", "userId", "link", 'linkId', "createAt", "ip"],
                where:{
                    [Op.and]:[
                        {createAt:{
                            [Op.gte]: startDate,
                            [Op.lt]: endDate
                        }},
                        {userId: userId}
                    ]
                },
                limit: 100,
                offset: skip,
                raw: true
            })
            //console.log(data);
            return data;
        } catch (error) {
            //console.log(error);
            throw (error)
        }
    }

    async getLinkHistoryByUser(userId, startDate, endDate, skip){
        try {
            const data = await Tracker.findAll({
                attributes:[
                  "id", "userid", "link"
                ],
                where:{
                    [Op.and]:[
                        {createAt:{
                            [Op.gte]: startDate,
                            [Op.lt]: endDate
                        }},
                        {userId: userId}
                    ]
                },
                limit: 100,
                offset: skip,
                raw: true
            })
            //console.log(data);
            return data;
        } catch (error) {
            //console.log(error);
            throw (error)
        }
    }
}
module.exports = LinkDetails