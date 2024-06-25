class NullChecker{
    constructor(){}

    async check(obj){
        for(const key in obj){
            const value = obj[key]
            //console.log(value);
            if (!value) {
                return `${key} can't be null or empty`
            }
        }

        return null;
    }
}

module.exports = NullChecker