const Sequelize  = require("sequelize");
const sequelize = require("../db");



const Subscribtion = sequelize.define("subscriber", {
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true,
        allowNull: false
    },
    userId:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    plan: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "free"
    },
    createAt:{
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    valid:{
        type: Sequelize.DATE,
        allowNull: true,
    },
    lastUpadte:{
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
        onUpdate: true
    }
},{
    createdAt: "createAt",
    updatedAt: 'lastUpdate'
})

module.exports = Subscribtion