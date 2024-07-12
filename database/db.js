const {Sequelize } = require('sequelize')
require("dotenv").config()
const sequelize = new Sequelize(process.env.DATABSENAME, process.env.DB_USERNAME, process.env.DB_PASSWORD,{
    host: process.env.DB_HOSTNAME,
    port: 3306,
    dialect: "mysql"
});

// sequelize.sync({ force: true }).then(() => {
//   console.log('Database & tables created!');
//   process.exit();
// }).catch(err => {
//   console.error('Unable to create tables, shutting down...', err);
//   process.exit(1);
// });


module.exports = sequelize;