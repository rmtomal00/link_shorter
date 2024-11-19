const sequelize = require("../db");
const Sequelize = require("sequelize")

const Qrcode = sequelize.define("qrcode", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
        allowNull: false
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    link: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    qrcodeImage:{
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    path:{
        type: Sequelize.STRING,
        allowNull: false
    },
    expireAt:{
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: ()=>{
            const now = new Date();
            return now.getDate() + 24 * 60 * 60 * 1000;
        }
    },
    updatedAt: {
        type: Sequelize.DATE
    }
},{
    indexes: [
        {
            fields: ["userId"],
        }
    ],
    tableName: "qrcode",
    timestamps: true,
    createdAt: true,
    updatedAt: true,
})

module.exports = Qrcode;