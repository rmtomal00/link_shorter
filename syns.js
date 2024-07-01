const sequelize = require("./database/db");



sequelize.sync({ force: true }).then(() => {
  console.log('Database & tables created!');
  process.exit();
}).catch(err => {
  console.error('Unable to create tables, shutting down...', err);
  process.exit(1);
});
const User = require('./database/models/User');
const StoreLink = require("./database/models/storelink");
const Subscribtion = require("./database/models/subscribtion");
const Tracker = require("./database/models/tracker");

User.hasOne(Subscribtion, {foreignKey: "userId"});
Subscribtion.belongsTo(User, {foreignKey: "userId"})
