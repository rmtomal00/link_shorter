const  Sequelize  = require("sequelize");
const sequelize = require("../db");


const StoreLink = sequelize.define("storelink", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
        allowNull: false
    },
    userId:{
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    link:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    shortId:{
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    shortlink:{
        type: Sequelize.STRING,
        allowNull: false
    },
    createAt:{
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    type:{
        type: Sequelize.STRING,
        allowNull: false
    },
    click:{
        type: Sequelize.BIGINT,
        defaultValue: 0,
        allowNull: false
    },
    unique_click:{
        type: Sequelize.BIGINT,
        defaultValue: 0,
        allowNull: false
    }
},{
    tableName: "storelink",
    createdAt: "createAt",
    timestamps: true
})

module.exports = StoreLink