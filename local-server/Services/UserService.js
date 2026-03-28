import 'dotenv/config';
import {user} from "./Models/UserModel"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

async function hashPassword(_password){
    const saltRounds = await bcrypt.genSalt(10)
    let hashedPassword = await bcrypt.hash(_password, saltRounds)
    return hashedPassword
}

async function comparePassword(_hash, _password){
    let compare = await bcrypt.compare(_password, _hash)
    return compare
}

function handleJwt(_userData){
    const payload = {
        id: _userData.id,
        email: _userData.email,
        role: _userData.role
    }
    const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: '7d'
    })

    return token
}

async function checkCredentials(_email, _password){
    const tempUser = await getUser(_email)
    if(tempUser.status !== 200){
        return{
            status: 401,
            message: "Invalid email or password"
        }
    }
    const hash = tempUser.data.passwordHash
    const isMatch = await comparePassword(hash, _password)
    if(isMatch){
        const _token = handleJwt(tempUser.data)
        return {
            status: 200,
            message: "Login successful",
            data: {
                user: {
                    id: tempUser.data.id,
                    username: tempUser.data.username,
                    email: tempUser.data.email
                },
                token: _token
            }
        }
    }
    else{
        return {
            status: 401,
            message: "Login failed, incorrect password"
        }
    }
}

async function createUser(_username, _email, _password){
    let checkUser = await getUser(_email)

    if(checkUser.status==200){
        return {
            status: 409,
            message: "User has already been registered with that email"
        }
    }
    if(checkUser.status == 500){
        return {
            status: 500,
            message: "Cannot create user at this time due to a server error."
        };
    }
    if(checkUser.status == 404){
        try{
            let hashedPassword = await hashPassword(_password)

            const newUser = await user.create({
                username: _username,
                email: _email,
                passwordHash: hashedPassword
            })
            return {
                status: 201,
                message: "User successfully registered",
                data: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email
                }
            }
        }
        catch(error){
            console.log(`Error while creating user: ${error}`)
            return {
                status: 500,
                message: "Internal error, failed to register user"
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
                status: 200,
                data: tempUser
            }
        }
        return {
            status: 404,
            message: "User not found registered with that email"
        }
    }
    catch(error){
        console.log(`Database error while getting data for user: ${_email}`)
        return {
            status: 500,
            message: "database error"
        }
    }
}

export {
    getUser, 
    createUser,
    checkCredentials
}