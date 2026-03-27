import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../database";

//tag_roads -> menyimpan tag berdasarkan suatu lokasi, menyimpan data tag yang digunakan saat ini
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
        isHidden:{
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        activeVersionId:{
            type: DataTypes.INTEGER
        },
    },{
        tableName: 'tag_roads',
        underscored: true,
        timestamps: true,
        updatedAt: false
    }
)

//tag_versions -> menyimpan data banyak tag dari suatu lokasi, hanya satu versi saja yang digunakan (diambil melalui tag_roads)
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
        conditionStatus:{
            type: DataTypes.STRING,
            allowNull: false
        },
        description:{
            type: DataTypes.TEXT
        },
        reliabilityScore:{
            type: DataTypes.DOUBLE,
            defaultValue: 0
        },
        isPriorityValidated:{
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
    },{
        tableName: 'tag_versions',
        underscored: true,
        timestamps: true,
        updatedAt: false
    }
)

export {tagRoads, tagVersions}