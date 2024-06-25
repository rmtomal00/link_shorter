const  Sequelize  = require("sequelize");
const sequelize = require("../db");


const Tracker = sequelize.define("tracker",{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true
    },
    linkId:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    ip:{
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "0.0.0.0"
    },
    click:{
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    createAt:{
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    click_device:{
        type: Sequelize.STRING,
    },
    updateAt:{
        type: Sequelize.DATE,
        onUpdate: Sequelize.NOW,
        defaultValue: Sequelize.NOW
    }
})

module.exports = Tracker