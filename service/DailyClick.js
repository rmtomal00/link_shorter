const { Op } = require("sequelize");
const Tracker = require("../database/models/tracker");
const sequelize = require("../database/db");

class DailyHistory{
    constructor(){}
    async dailyCount(startdate, lastdate, id){
        try {
            const data = await Tracker.findAll({
                attributes: [
                    [sequelize.fn('DATE', sequelize.col('createAt')), 'day'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                where: {
                    [Op.and]:[
                        {createAt:{
                            [Op.gte]: startdate,
                            [Op.lt]: lastdate,
                            
                        }},
                        id
                    ]          
                },
                group: [sequelize.fn('DATE', sequelize.col('createAt'))],
                raw: true
            })
            return data
        } catch (error) {
            throw(error.message);
        }
    }

    async dailyCountByLinkId(startDate, endDate, id, leave){
        try {
            const data = await Tracker.findAll({
                attributes: [
                    "link",
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                where: {
                    [Op.and]:[
                        {createAt:{
                            [Op.gte]: startDate,
                            [Op.lt]: endDate,
                            
                        }},
                        id
                    ]          
                },
                group: ["link"],
                raw: true,
                limit: 100,
                offset: leave
            })
            //console.log(data);
            return data
        } catch (error) {
            throw(error.message);
        }
    }
}

module.exports = DailyHistory