import { Sequelize, DataTypes, INTEGER } from "sequelize";
import ENV from './env'

const sequelize = new Sequelize({
    dialect: 'postgres',
    database: 'app-ta',
    host: 'localhost',
    user: ENV.DATABASE_USER,
    password: ENV.DATABASE_PASSWORD,
    port: 5432
})

const user = sequelize.define('User', 
    {
        id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        username:{
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        email:{
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate:{
                isEmail: true,
                notEmpty: true
            }
        },
        passwordHash:{
            type: DataTypes.STRING,
            allowNull: false,
            validate:{
                notEmpty: true,
                len: [8, 100],
            }
        },
        role:{
            type: DataTypes.ENUM('user', 'admin'),
            defaultValue: 'user',
            allowNull: false
        },
    }, {
        tableName: 'users',
        underscored: true,
        timestamps: true,
        updatedAt: false
    }
)

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