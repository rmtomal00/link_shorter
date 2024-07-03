const  Sequelize  = require("sequelize");
const sequelize = require("../db");


const Tracker = sequelize.define("tracker",{
    id:{
        type: Sequelize.BIGINT,
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
    createAt:{
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    click_device:{
        type: Sequelize.STRING,
    },
    link:{
        type: Sequelize.STRING,
        allowNull: false
    }
},{
    tableName: "tracker",
    timestamps: false
})

module.exports = Tracker