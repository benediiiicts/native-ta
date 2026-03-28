import { Sequelize, DataTypes } from "sequelize";
import ENV from './env'

//database.js hanya untuk koneksi dengan db

const sequelize = new Sequelize({
    dialect: 'postgres',
    database: 'app-ta',
    host: 'localhost',
    user: ENV.DATABASE_USER,
    password: ENV.DATABASE_PASSWORD,
    port: 5432
})

export {sequelize}