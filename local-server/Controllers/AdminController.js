import { manageTags, manageUserStatus, fetchAllUsers } from "../Services/AdminService.js";

async function manageTagAdmin(req, res){
    try{
        const userId = req.user.id
        const userRole = req.user.role
        if(userRole !== 'admin' || !userId){
            return res.status(401).json({message: "Unauthorized user, feature prohibited"})
        }
        const {tagId, versionId, isVerified, visibility, adminNotes} = req.body
        const result = await manageTags(tagId, versionId, isVerified, visibility, adminNotes)

        return res.status(result.status).json({
            status: result.status,
            message: result.message
        })
    }
    catch(error){
        console.error(`Error while updating tag: ${error}`)
        return res.status(500).json({message: "Internal server error while updating tag"})
    }
}

async function manageUserAdmin(req, res){
    try{
        const userId = req.user.id
        const userRole = req.user.role

        if(userRole !== 'admin' || !userId){
            return res.status(401).json({
                message: "Unauthorized user, feature prohibited"
            })
        }

        const targetUserId = req.params.id
        const { action, durationDays, adminNotes } = req.body

        const result = await manageUserStatus(targetUserId, action, durationDays, adminNotes)

        return res.status(result.status).json({
            status: result.status,
            message: result.message
        })
    }
    catch(error){
        console.error(`Error while managing user: ${error}`)
        return res.status(500).json({
            message: "Internal server error while managing user"
        })
    }
}

async function getUsersAdmin(req, res){
    try{
        const userId = req.user.id
        const userRole = req.user.role

        if(userRole !== 'admin' || !userId){
            return res.status(403).json({
                message: "Unauthorized user, feature forbidden"
            })
        }

        const searchQuery = req.query.search || ''
        const result = await fetchAllUsers(searchQuery)

        return res.status(result.status).json(result)
    }
    catch(error){
        console.error(`Error while get users: ${error}`)
        return res.status(500).json({message: "Server error while fetching users"});
    }
}

export {
    manageTagAdmin,
    manageUserAdmin,
    getUsersAdmin
}