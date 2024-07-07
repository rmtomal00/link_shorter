const Sequelize  = require("sequelize");
const sequelize = require("../db");



const Subscribtion = sequelize.define("subscribers", {
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
    updatedAt:{
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        onUpdate: Sequelize.NOW
    },
    lastUpdate:{
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        onUpdate: Sequelize.NOW
    }

},{
    timestamps: true,
    tableName: "subscribers",
    createdAt: "createAt",
    updatedAt: 'updatedAt'
})

module.exports = Subscribtion