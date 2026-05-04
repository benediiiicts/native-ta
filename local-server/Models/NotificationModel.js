import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../database.js";

const notification = sequelize.define('Notification',
    {
        id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        userId:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        title:{
            type: DataTypes.STRING(100),
            allowNull: false
        },
        message:{
            type: DataTypes.TEXT,
            allowNull: false
        },
        type:{
            type: DataTypes.ENUM('info', 'warning', 'danger', 'success'),
            defaultValue:'info'
        },
        actionType:{
            type: DataTypes.STRING(50),
            allowNull: true //ban, hide, suspend, verify, etc.
        },
        isRead:{
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },{
        tableName: 'notifications',
        underscored: true,
        timestamps: true,
        updatedAt: false
    }
)

export { notification }