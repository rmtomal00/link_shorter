const Sequelize  = require("sequelize");
const sequelize = require("../db");


const PaymentHistory = sequelize.define("paymenthistory", {
    id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    userId:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    amount:{
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    payId:{
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
        
    },
    gatewayname:{
        type: Sequelize.STRING,
        allowNull: false
    },
    createAt:{
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updateAt:{
        type: Sequelize.DATE,
        allowNull: false,
        onUpdate: Sequelize.NOW,
        defaultValue: Sequelize.NOW
    },
    plan:{
        type: Sequelize.STRING,
        allowNull: false
    }
},{
    tableName: "paymenthistory",
    timestamps: false,

});
module.exports = PaymentHistory;