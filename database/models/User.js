const  Sequelize  = require("sequelize");
const sequelize = require("../db");

const User = sequelize.define("users", {

    
    id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    username:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    email:{
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
    },
    password:{
        type: Sequelize.STRING,
        allowNull: false
    },
    token:{
        type: Sequelize.STRING,
        allowNull: true,
    },
    temp_token:{
        type: Sequelize.STRING,
        allowNull:true
    },
    createAt:{
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
    },
    updateAt:{
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        onUpdate: Sequelize.NOW,
        allowNull: false,
    },
    lastLogin:{
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    role:{
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "user",
    },
    isDisable:{
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    isEmailVerifird:{
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
},{
    timestamps: true,
    createdAt: 'createAt',
    updatedAt: 'updateAt',
    tableName: "users"
})

module.exports = User