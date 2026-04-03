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
        underscored: true
    }
)

export {versionImages}