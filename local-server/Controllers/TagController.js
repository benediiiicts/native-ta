import {createTagRoad, getAllTags, getTagDetail, getTagRoad, deleteTagRoad, updateTagRoad, createTagVersion, getTagVersion, deleteTagVersion, voteTagVersion} from '../Services/TagService.js'
import {saveImages} from '../Services/MediaService.js'

async function addNewTagRoad(req, res){
    try{
        const userId = req.user.id
        const {latitude, longitude, roadClass, issueType, description, forceCreate} = req.body
        const isForceCreate = (forceCreate=='true'||forceCreate==true)
        const images = req.files || []
        let tagResult = await createTagRoad(userId, latitude, longitude, roadClass, issueType, description, isForceCreate, images)
        
        return res.status(tagResult.status).json(tagResult)
    }
    catch(error){
        console.log(`Controller Error (addNewTagRoad): ${error}`)
        return res.status(500).json({ message: "Internal server error while processing request" });
    }
}

async function addNewTagVersion(req, res){
    try{
        const userId = req.user.id
        const {tagRoadId, status, description} = req.body
        const images = req.files || []
        let versionResult = await createTagVersion(tagRoadId, userId, status, description, images)

        return res.status(versionResult.status).json(versionResult)
    }
    catch(error){
        console.log(`Controller Error (addNewTagVersion): ${error}`)
        return res.status(500).json({ message: "Internal server error while processing request" })
    }
}

async function fetchAllTags(req, res){
    try{
        const tags = await getAllTags()
        return res.status(tags.status).json({
            status: tags.status,
            data: tags.data
        })
    }
    catch(error){
        console.error(`Controller Error while fetching tags: ${error}`)
        return res.status(500).json({message: "Internal server error while fetching tags"})
    }
}

async function fetchTagDetails(req, res){
    try{
        const tagId = req.params.id
        const tagDetails = await getTagDetail(tagId)
        return res.status(tagDetails.status).json({
            status: tagDetails.status,
            data: tagDetails.data,
            message: tagDetails.message
        })   
    }
    catch(error){
        console.error(`Controller error while fetching tag details: ${error}`)
        return res.status(500).json({message: "Internal server error while fetching tag details"})
    }
}

async function handleVote(req, res){
    try{
        const userId = req.user.id
        const tagId = req.params.id
        const {voteType} = req.body
    
        if(!['Approve', 'Reject'].includes(voteType)){
            return res.status(404).json({
                message: "Invalid vote type"
            })
        }

        const voteResult = await voteTagVersion(userId, tagId, voteType)
        return res.status(voteResult.status).json(voteResult)
    }
    catch(error){
        console.error(`Error while processing vote: ${error}`)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

export {
    addNewTagRoad,
    addNewTagVersion,
    fetchAllTags,
    fetchTagDetails,
    handleVote
}