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
        type: Sequelize.STRING,
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
    },
    unique_click:{
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    country: {
        type: Sequelize.STRING,
        allowNull: false,
        default: "Unknown"
    },
    userId:{
        type: Sequelize.INTEGER,
        allowNull: false
    }
},{
    indexes:[

        {
            fields: ['linkId'],
            name: "tracker_linkId"
        },
        {
            fields: ['ip'],
            name: "ip",
        },
        {
            fields: ['click_device'],
        },
        {
            fields: ["country", "userId"],
        },
        {
            fields: ["userId"]
        }

    ],
    tableName: "tracker",
    timestamps: false
})

module.exports = Tracker