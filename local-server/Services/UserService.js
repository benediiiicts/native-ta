import 'dotenv/config';
import {user} from "../Models/UserModel.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { tagVersions } from '../Models/TagModel.js';
import { comments } from '../Models/MediaModel.js';

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

async function handleGoogleLogin(_email, _username){
    try{
        let tempUser = await user.findOne({
            where: {email: _email}
        })

        if(!tempUser){
            //buat password random pada db
            const randomPassword = Math.random().toString(36).slice(-8) + Date.now().toString(36)
            const hashedPassword = await hashPassword(randomPassword)

            tempUser = await user.create({
                username: _username,
                email: _email,
                password: hashedPassword
            })
        }

        const _token = handleJwt(tempUser)

        return{
            status: 200,
            message: "Google login successfull",
            data:{
                user: {
                    id: tempUser.id,
                    username: tempUser.username,
                    email: tempUser.email,
                    role: tempUser.role
                },
                token: _token
            }
        }
    }
    catch(error){
        console.error(`Error during Google login: ${error}`);
        return {
            status: 500,
            message: "Internal server error during Google login"
        }
    }
}

async function checkCredentials(_email, _password){
    const tempUser = await getUser(_email)
    if(tempUser.status !== 200){
        return{
            status: 401,
            message: "Invalid email or password" 
        }
    }
    const hash = tempUser.data.password
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
                    email: tempUser.data.email,
                    role: tempUser.data.role
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
    if (!_password || _password.length < 8) {
        return {
            status: 400,
            message: "Password must be at least 8 characters long."
        };
    }
    
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
                password: hashedPassword
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
                message: `Internal error, failed to register user`
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

async function getUserProfile(targetUserId){
    try{
        const targetUser = await user.findByPk(targetUserId, {
            attributes: ['id', 'username', 'email', 'createdAt']
        })

        if(!targetUser){
            return{
                status: 404,
                message: "user not found."
            }
        }

        const tagCount = await tagVersions.count({
            where: { userId: targetUserId }
        })
        const commentCount = await comments.count({
            where: { userId: targetUserId}
        })

        return{
            status: 200,
            data:{
                ...targetUser.toJSON(),
                stats:{
                    tagCount,
                    commentCount
                }
            },
            message: "User profile successfully fetched"
        }
    }
    catch(error){
        console.error(`Error while fetching user profile: ${error}`)
        return{
            status: 500,
            message: "Internal server error while fetching user profile"
        }
    }
}

async function updateUsername(_userId, _username){
    try{
        const targetUser = await user.findByPk(_userId)
        if(!targetUser){
            return {
                status: 404,
                message: "User not found"
            }
        }
        const existing = await user.findOne({ where: { username: _username } })
        if(existing){
            return{
                status: 400,
                message: "Username has already been used"
            }
        }
        targetUser.username = _username
        await targetUser.save()

        return{
            status: 200,
            message: `Username successfully changed to ${_username}`,
            data: targetUser
        }
    }
    catch(error){
        console.error(`Error while changing username: ${error}`)
        return{
            status: 500,
            message: "Server error while changing username"
        }
    }
}

export {
    getUser, 
    createUser,
    checkCredentials,
    getUserProfile,
    updateUsername,
    handleGoogleLogin
}