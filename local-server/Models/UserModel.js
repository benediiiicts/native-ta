import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../database.js";

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
        password:{
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
        isActive:{
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'users',
        underscored: true,
        timestamps: true,
        updatedAt: false
    }
)

const userVotes = sequelize.define('UserVote', 
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
        tagVersionId:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        voteType:{
            type: DataTypes.ENUM('Approve', 'Reject'),
            allowNull: true
        }        
    },{
        tableName: 'user_votes',
        underscored: true,
        timestamps: true,
        updatedAt: false
    }
)

export {
    user,
    userVotes
}