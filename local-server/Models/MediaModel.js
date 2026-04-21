import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../database.js";

const versionImages = sequelize.define('VersionImage',
    {
        id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        tagVersionId:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        imageUrl:{
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        tableName: 'version_images',
        underscored: true,
        timestamps: false
    }
)

const comments = sequelize.define('Comment',
    {
        id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        tagVersionId:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        userId:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        content:{
            type: DataTypes.TEXT,
            allowNull: false
        },
        imageUrl:{
            type: DataTypes.STRING,
            allowNull: true
        }
    },{
        tableName: 'comments',
        underscored: true,
        timestamps: true,
        updatedAt: false
    }
)

const reports = sequelize.define('Report',
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        targetType: {
            type: DataTypes.STRING,
            allowNull: false
        },
        targetId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true 
        },
        imageUrls: {
            type: DataTypes.JSON,
            allowNull: true 
        },
        status: {
            type: DataTypes.ENUM('Pending', 'Reviewed', 'Resolved', 'Rejected'),
            allowNull: false,
            defaultValue: 'Pending'
        }
    }, {
        tableName: 'reports',
        underscored: true,
        timestamps: true,
        updatedAt: false
    }
)

export {
    versionImages,
    comments,
    reports
}