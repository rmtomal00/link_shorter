const StoreLink = require("../database/models/storelink");

class CreteUID{
    constructor(){}

    //private method
    createUid(length){
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;

        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        //console.log(result);
        return result
    }

    async getUID(){
        var bool = true;
        while(bool){
            const linkId = this.createUid(6);
            const find = await StoreLink.findOne({where: {shortId: linkId}});
            if (!find) {
                bool = false;
                return linkId
            }
        }
    }
}

module.exports = CreteUID;