import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../database.js";

//tag_roads
const tagRoads = sequelize.define('TagRoad',
    {
        id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        latitude:{
            type: DataTypes.DECIMAL(10,8),
            allowNull: false
        },
        longitude:{
            type: DataTypes.DECIMAL(11,8),
            allowNull: false
        },
        activeVersionId:{
            type: DataTypes.INTEGER,
            allowNull: true
        },
        roadClass:{
            type: DataTypes.STRING,
            defaultValue: 'Unclassified'
        },
        issueType: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isHidden:{
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },{
        tableName: 'tag_roads',
        underscored: true,
        timestamps: true,
        updatedAt: false
    }
)

//tag_versions
const tagVersions = sequelize.define('TagVersion',
    {
        id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        tagRoadId:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        userId:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status:{
            type: DataTypes.STRING,
            allowNull: false
        },
        description:{
            type: DataTypes.TEXT
        },
        score:{
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        isVerified:{
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        approveCount:{
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        rejectCount:{
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        isHidden:{
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },{
        tableName: 'tag_versions',
        underscored: true,
        timestamps: true,
        updatedAt: false
    }
)

export {tagRoads, tagVersions}