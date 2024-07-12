const sequelize = require("./database/db");



sequelize.sync({ force: true }).then(() => {
  console.log('Database & tables created!');
  AppSetting.create({packname: 'free', api: 15, website: 35, total:50})
  AppSetting.create({packname: 'gold', api: 200, website: 200, total:400});
  AppSetting.create({packname: 'platinum', api: 500, website: 500, total:1000})
  //process.exit();
}).catch(err => {
  console.error('Unable to create tables, shutting down...', err);
  process.exit(1);
});
const User = require('./database/models/User');
const AppSetting = require("./database/models/appSetting");
const PaymentHistory = require("./database/models/paymentHistory");
const StoreLink = require("./database/models/storelink");
const Subscribtion = require("./database/models/subscribtion");
const Tracker = require("./database/models/tracker");

User.hasOne(Subscribtion, {foreignKey: "userId"});
Subscribtion.belongsTo(User, {foreignKey: "userId"})
