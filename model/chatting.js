const shortid = require("shortid");

module.exports = (sequelize, DataTypes) => {
    const chatting = sequelize.define("chatting", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true,
            allowNull : false
        },
        user_id: {
            type: DataTypes.STRING(180),
            allowNull: false,
        },
        roomName: {
            type: DataTypes.STRING(180),
            allowNull: false,
        },
        chatting: {
            type: DataTypes.STRING(191),
            allowNull: false
        },
    }, {
        freezeTableName: true,
        timestamps: true,
        comment: "채팅"
    });

    return chatting;
};