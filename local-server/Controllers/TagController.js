import {
    createTagRoad, 
    getAllTags, 
    getTagDetail,
    getVersionHistory,
    createTagVersion, 
    voteTagVersion,
    checkRecentUpdate} from '../Services/TagService.js'
import {saveImages} from '../Services/MediaService.js'
import { tagRoads } from '../Models/TagModel.js'

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
        const tags = await getAllTags();
        
        return res.status(tags.status).json({
            status: tags.status,
            data: tags.data,
            message: tags.message || "Tags fetched successfully"
        })
    }
    catch(error){
        console.error(`Controller error while fetching all tags: ${error}`)
        return res.status(500).json({message: "Internal server error while fetching all tags"})
    }
}

async function fetchTagDetails(req, res){
    try{
        const tagId = req.params.id;
        if (!tagId || tagId === 'undefined') {
            return res.status(400).json({ message: "ID Tag tidak valid" });
        }
        const versionId = req.query?.versionId || null
        const userId = req.user?.id || null; 
        const tagDetails = await getTagDetail(tagId, userId, versionId);

        return res.status(tagDetails.status).json({
            status: tagDetails.status,
            data: tagDetails.data,
            message: tagDetails.message
        });
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

async function fetchVersionHistory(req, res){
    try{
        const tagId = req.params.id
        const result = await getVersionHistory(tagId)

        return res.status(result.status).json({
            status: result.status,
            data: result.data,
            message: result.message
        })
    }
    catch(error){
        console.error(`Controller error while fething version history: ${error}`)
        return res.status(500).json({message: 'Internal server error while fetching'})
    }
}

async function checkUpdates(req, res){
    try{
        const {lat, lon, lastFetch} = req.query

        if(!lat || !lon || !lastFetch){
            return res.status(400).json({
                message: "All parameters must be filled"
            })
        }

        const result = await checkRecentUpdate(lat, lon, lastFetch)
        return res.status(200).json(result) 
    }
    catch(error){
        console.error(`Error while fetching updates: ${error}`)
        return res.status(500).json({message: "Internal server error"})
    }
}

export {
    addNewTagRoad,
    addNewTagVersion,
    fetchAllTags,
    fetchTagDetails,
    handleVote,
    fetchVersionHistory,
    checkUpdates
}