import { Sequelize, DataTypes } from "sequelize";
import bcrypt from 'bcrypt'
import ENV from './env'
import {user} from "./Models/UserModel"
import {tagRoads, tagVersions} from "./Models/TagModel"

//database.js hanya untuk koneksi dengan db
//fungsi CRUD sementara masih di sini
//HARUS PINDAH -> buat folder service untuk CRUD

const sequelize = new Sequelize({
    dialect: 'postgres',
    database: 'app-ta',
    host: 'localhost',
    user: ENV.DATABASE_USER,
    password: ENV.DATABASE_PASSWORD,
    port: 5432
})

async function passwordHash(plainPassword){

}

async function createUser(_username, _email, _password){
    let hashedPassword = await passwordHash(_password)
    let checkUser = await getUser(_email)

    if(!checkUser.status){
        if(!checkUser.message == "database error"){
            return {
                status: false,
                message: "Cannot create user at this time due to a server error."
            };
        }
        else{
            const newUser = user.create({
                username: _username,
                email: _email,
                passwordHash: hashedPassword
            })
            return {
                status: true,
                message: "User successfully registered",
                data: {
                }
            }
        }
    }    
    
}

async function getUser(_email){
    try{
        let tempUser = await user.findOne({
            where: {
                email: _email
            }
        })
        if(tempUser){
            return {
                status: true,
                data: tempUser
            }
        }
        return {
            status: false,
            message: "User not found registered with that email"
        }
    }
    catch(error){
        console.log(`Database error while getting data for user: ${_email}`)
        return {
            status: false,
            message: "database error"
        }
    }
}

export {sequelize}