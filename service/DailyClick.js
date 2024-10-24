const { Op } = require("sequelize");
const Tracker = require("../database/models/tracker");
const sequelize = require("../database/db");
const StoreLink = require("../database/models/storelink");
const {buildSchema} = require('graphql');
const { format } = require("date-fns");

class DailyHistory{
    constructor(){}

    /*find object should be an json object {userId: id} etc*/
    async dailyCount(startdate, lastdate, findObject){
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
                        findObject
                    ]          
                },
                group: [sequelize.fn('DATE', sequelize.col('createAt'))],
                raw: true
            })
            return data
        } catch (error) {
            throw(error);
        }
    }



    /*find object should be an json object {userId: id} etc*/
    async dailyCountByLinkId(startDate, endDate, findObject, leave){
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
                        findObject
                    ]          
                },
                group: ["link"],
                raw: true,
                limit: 100,
                offset: leave
            })
            console.log(data);
            return data
        } catch (error) {
            throw(error);
        }
    }

    /*find object should be an json object {userId: id} etc*/
    async countShortLink(startDate, endDate, findObject){
        try {
            const data = await StoreLink.findAll({
                attributes: [
                    
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                where: {
                    [Op.and]:[
                        {createAt:{
                            [Op.gte]: startDate,
                            [Op.lt]: endDate,
                            
                        }},
                        findObject
                    ]          
                },
                raw: true,
            })
            //console.log(data);
            return data
        } catch (error) {
            throw(error);
        }
    }

    async getShortLinkWithDetails(startDate, endDate, findObject, leave = 0){
        try {
            const data = await StoreLink.findAll({
                where: {
                    [Op.and]:[
                        {createAt:{
                            [Op.gte]: new Date(startDate),
                            [Op.lt]: new Date(endDate),
                        }},
                        findObject
                    ]          
                },
                attributes: ['id', 'link', 'shortId', 'shortlink', "createAt", "type", 'click','unique_click'],
                raw: true,
                limit: 100,
                offset: leave
            })
            //console.log(data);
            var customKey = await data.map(object=>({
                ID: object.id,
                LINK: object.link,
                "SHORT ID": object.shortId,
                "SHORT LINK": object.shortlink,
                "CREATE AT": format(object.createAt, 'dd.MM.yyyy'),
                "CREATE WITH": object.type,
                CLICK: object.click,
                "UNIQUE CLICK": object.unique_click
            }))
            return customKey
        } catch (error) {
            throw(error);
        }
    }

    /*find object should be an json object {userId: id} etc*/
    async getCountClick(startDate, endDate, findObject){
        try {
            var totalClick = 0;
            var unique_click = 0;

            const data = await StoreLink.findAll({
                where: {
                    [Op.and]:[
                        {createAt:{
                            [Op.gte]: startDate,
                            [Op.lt]: endDate,
                            
                        }},
                        findObject
                    ]          
                },
                attributes: ['click','unique_click'],
                raw: true,
            })
            
            
            if (data) {
                for(let i = 0; i < data.length; i++){
                    const element = data[i];
                    totalClick += element.click;
                    unique_click += element.unique_click
                }
            }
            //console.log(data);
            return {totalClick, unique_click, totallink: data.length}
        } catch (error) {
            throw(error);
        }
    }

    schama(){
        return buildSchema(`{
            type Query {
                getCountClick: Object,
                getShortLinkWithDetails: Object,
                dailyCount: Object
            }
        }`)
    }


}


module.exports = DailyHistory