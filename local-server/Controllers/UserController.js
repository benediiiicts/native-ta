import {getUser, createUser, checkCredentials, getUserProfile, updateUsername, handleGoogleLogin} from "../Services/UserService.js"

async function userLogin(req, res){
    try{
        const {email, password} = req.body
        let result = await checkCredentials(email, password)
        return res.status(result.status).json({
            status: result.status,
            message: result.message,
            data: result.data || null
        })
    }
    catch(error){
        console.log(`Login error in controller: ${error}`)
        res.status(500).json({message: "Internal server error"})
    }
}

async function userRegister(req, res){
    try{
        const {username, email, password} = req.body
        let result = await createUser(username, email, password)
        return res.status(result.status).json({
            status: result.status,
            message: result.message,
            data: result.data || null
        })
    }
    catch(error){
        console.log(`Register error in controller: ${error}`)
        res.status(500).json({message: "Internal server error"})
    }
}

async function googleAuth(req, res){
    try{
        const {email, username} = req.body
        if(!email || !username){
            return{
                status: 400,
                message: "Email and username are required"
            }
        }
        let result = await handleGoogleLogin(email, username)
        return res.status(result.status).json({
            status: result.status,
            message: result.message,
            data: result.data || null
        })
    }
    catch(error){
        console.log(`Google Auth login error: ${error}`)
        res.status(500).json({ message: "Internal server error" })
    }
}

async function getUserByEmail(req, res){
    try{
        const email = req.params.email
        let result = await getUser(email)
        return res.status(result.status).json({
            status: result.status,
            message: result.message,
            data: result.data || null
        })
    }
    catch(error){
        console.log(`Cannot get user: ${error}`)
        res.status(500).json({message: "Internal server error"})
    }
}

async function fetchUserProfile(req, res){
    try{
        const userId = req.params.id
        const result = await getUserProfile(userId)

        return res.status(result.status).json(result)
    }
    catch(error){
        console.error(`Cannot get user profile: ${error}`)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

async function changeUsername(req, res){
    try{
        const userId = req.user.id
        const newusername = req.body.username
        const result = await updateUsername(userId, newusername)
        
        return res.status(result.status).json(result)
    }
    catch(error){
        console.error(`Cannot change username: ${error}`)
        return res.status(500).json({message: "Error while updating username"})
    }
}

export {
    userLogin,
    userRegister,
    googleAuth,
    getUserByEmail,
    fetchUserProfile,
    changeUsername
}