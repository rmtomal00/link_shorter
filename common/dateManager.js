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

    daysBetween(startDate, endDate) {
        const oneDay = 24 * 60 * 60 * 1000; // Hours * minutes * seconds * milliseconds
        const diffInTime = endDate.getTime() - startDate.getTime();
        const diffInDays = Math.round(diffInTime / oneDay);
        return diffInDays;
    }
}

module.exports = DateManager