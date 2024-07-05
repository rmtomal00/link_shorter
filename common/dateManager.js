class DateManager{
    constructor(){}

    addDays(date, days){
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    checkDateFormat(dateString){
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        return regex.test(dateString);
    }
}

module.exports = DateManager