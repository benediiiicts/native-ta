import { Sequelize } from "sequelize";
import 'dotenv/config';

//database.js hanya untuk koneksi dengan db

const sequelize = new Sequelize({
    dialect: 'postgres',
    database: 'app-ta',
    host: 'localhost',
    username: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: 5432
})

export default sequelize