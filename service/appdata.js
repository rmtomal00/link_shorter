const AppSetting = require("../database/models/appSetting");

class AppSettings{
    constructor(){}

    async getAppSetting(packname){
        try {
            const data = await AppSetting.findOne({
                where: {packname: packname},
                raw: true
            })
            console.log(data);
            return data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

}

module.exports = AppSettings