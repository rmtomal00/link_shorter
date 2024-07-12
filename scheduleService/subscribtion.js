const Sequelize = require("sequelize");
const Subscribtion = require("../database/models/subscribtion");
const DateManager = require("../common/dateManager");
const cron = require('node-cron');

const DateManage = new DateManager();

class ScheduleSystemsSubscribtion {
    constructor() {}

    async _updateUserSubs() {
        console.log("Subscrption schedule on");
        let size = 0;
        while (true) {
            const data = await Subscribtion.findAll({
                offset: size * 100,
                limit: 100,
                raw: true
            });
            //console.log(data);
            size++;
            if (data.length <= 0) {
                size = 0;
                break;
            } else {
                for (let index = 0; index < data.length; index++) {
                    const element = data[index];
                    if (String(element.plan).toLocaleLowerCase().trim() !== "free") {
                        const lastdate = new Date();
                        const validity = new Date(element.valid);
                        if (lastdate > validity) {
                            await Subscribtion.update({ plan: "free" }, { where: { userId: element.userId } });
                            continue;
                        } else {
                            await Subscribtion.update({ lastUpdate: Sequelize.NOW}, { where: { userId: element.userId } });
                        }
                        const lastUpdatePlan = new Date(element.lastUpdate);
                        const updateAtPlan = new Date(element.updateAt);
                        const daysfar = DateManage.daysBetween(updateAtPlan, lastUpdatePlan);
                        if (daysfar > 30) {
                            await Subscribtion.update({ updateAt: Sequelize.NOW }, { where: { userId: element.userId } });
                        }
                    }
                }
            }
        }
    }

    startSchedule() {
        console.log("Scheduler started");
        cron.schedule('0 0 * * *', async () => { // Runs every day at midnight
            try {
               await this._updateUserSubs();
            } catch (error) {
                console.error('Error updating subscriptions:', error);
            }
        }).start();
    }
}

module.exports = ScheduleSystemsSubscribtion;
