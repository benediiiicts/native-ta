import { manageTags } from "../Services/AdminService.js";

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

export {
    manageTagAdmin
}