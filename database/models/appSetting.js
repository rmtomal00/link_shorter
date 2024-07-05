const Sequelize = require("sequelize")
const sequelize = require("../db");

const AppSetting = sequelize.define("appsetting", {
    id:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        unique: true,
        allowNull: false,
        autoIncrement: true
    },
    packname:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    api:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    website:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    total:{
        type: Sequelize.INTEGER,
        allowNull: false,
    }
},{
    tableName: "appsetting",
    timestamps: true
})

module.exports = AppSetting