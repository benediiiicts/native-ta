import {getUser, createUser, checkCredentials} from "../Services/UserService"

async function userLogin(req, res){
    try{
        const {email, password} = req.body
        let result = await checkCredentials(email, password)
        return res.status(result.status).json({
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
            message: result.message,
            data: result.data || null
        })
    }
    catch(error){
        console.log(`Register error in controller: ${error}`)
        res.status(500).json({message: "Internal server error"})
    }
}

async function getUserByEmail(req, res){
    try{
        const email = req.params.email
        let result = await getUser(email)
        return res.status(result.status).json({
            message: result.message,
            data: result.data || null
        })
    }
    catch(error){
        console.log(`Cannot get user: ${error}`)
        res.status(500).json({message: "Internal server error"})
    }
}

export {
    userLogin,
    userRegister,
    getUserByEmail
}