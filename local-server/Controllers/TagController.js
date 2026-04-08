import {createTagRoad, getAllTags, getTagRoad, deleteTagRoad, updateTagRoad, createTagVersion, getTagVersion, deleteTagVersion, updateTagVersion} from '../Services/TagService.js'
import {saveImages} from '../Services/ImageService.js'

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
            status: 200,
            data: tags.data
        })
    }
    catch(error){
        console.error(`Controller Error: ${error}`)
        return res.status(500).json({message: "Internal server error while fetching tags"})
    }
}

export {
    addNewTagRoad,
    addNewTagVersion,
    fetchAllTags
}