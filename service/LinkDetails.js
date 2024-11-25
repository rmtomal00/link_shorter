const { Op } = require("sequelize");
const sequelize = require("../database/db");
const Tracker = require("../database/models/tracker");
const {format} = require("date-fns")

class LinkDetails{
    constructor(){}

    async getLinkHistoryByUserforPaid(startDate, endDate, skip, ...findObject){
        try {
            const data = await Tracker.findAll({
                attributes:["id", "userId", "link", "createAt", "ip", "click_device", "unique_click", 'country'],
                where:{
                    [Op.and]:[
                        {createAt:{
                            [Op.gte]: startDate,
                            [Op.lt]: endDate
                        }},
                        ...findObject
                    ]
                },
                limit: 100,
                offset: skip,
                raw: true
            })
            //console.log(data);
            return data.map((link, index) => ({
                "ID": skip + index +1,
                "USER ID": link.userId,
                "LINK": link.link,
                "COUNTY": link.country,
                "IP": link.ip,
                "TIME": format(link.createAt, 'dd.MM.yyyy HH:mm:ss'),
                "DEVICE": link.click_device,
                "UNIQUE CLICK": link.unique_click === 1 ? "Yes" : "No"
            }))
        } catch (error) {
            //console.log(error);
            throw (error)
        }
    }

    async getLinkHistoryByUser( startDate, endDate, skip, ...findObject){
        try {
            const data = await Tracker.findAll({
                attributes:[
                  "id", "userId", "link"
                ],
                where:{
                    [Op.and]:[
                        {createAt:{
                            [Op.gte]: startDate,
                            [Op.lt]: endDate
                        }},
                        ...findObject
                    ]
                },
                limit: 100,
                offset: skip,
                raw: true
            })
            //console.log(data);
            return data.map((link, index) => ({
                "ID": skip + index +1,
                "USER ID": link.userId,
                "LINK": link.link,
                "COUNTY": "Subscription Required",
                "IP": "Subscription Required",
                "TIME": "Subscription Required",
                "DEVICE": "Subscription Required",
                "UNIQUE CLICK": "Subscription Required"
            }))

        } catch (error) {
            //console.log(error);
            throw (error)
        }
    }
}
module.exports = LinkDetails