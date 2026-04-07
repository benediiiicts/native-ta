import {tagRoads, tagVersions} from "../Models/TagModel.js"
import { Op } from "sequelize";
import sequelize from "../database.js";
import { saveImages } from "./ImageService.js";

async function checkRoadRadius(_latitude, _longitude){
    const earthRadius = 6371000
    const maxDistance = 5 //5 meter

    const distanceQuery = sequelize.literal(`
        ( ${earthRadius} * acos( 
            cos( radians(${_latitude}) ) 
            * cos( radians(latitude) ) 
            * cos( radians(longitude) - radians(${_longitude}) ) 
            + sin( radians(${_latitude}) ) 
            * sin( radians(latitude) ) 
        ) )
    `);

    try{
        let tagExist = await tagRoads.findOne({
            where: sequelize.where(distanceQuery, {
                [Op.lte]: maxDistance
            })
        })
        if (tagExist){
            return {
                status: 409,
                message: "A tag already exist within 5 meter radius",
                data: tagExist
            }
        }
        else{
            return{
                status: 200,
                message: "No tag found within 5 meter radius"
            }
        }
    }
    catch(error){
        console.log(`Radius check error: ${error}`)
        return{
            status: 500,
            message: "Internal error while checking location radius"
        }
    }
}

// TAG ROAD
async function createTagRoad(_userId, _latitude, _longitude, _status, _description, _forceCreate = false, _images){
    if(!_forceCreate){
        let tagExist = await checkRoadRadius(_latitude, _longitude)

        if(tagExist.status !== 200){
            return tagExist;
        }
    }
    
    try{
        const result = await sequelize.transaction(async t =>{
            const newRoad = await tagRoads.create({
                latitude: _latitude,
                longitude: _longitude,
                isHidden: false
            }, {transaction: t})

            const newVersion = await tagVersions.create({
                tagRoadId: newRoad.id,
                userId: _userId,
                status: _status,
                description: _description,
                score: 0,
                isVerified: false
            }, {transaction: t})

            let savedImages = []
            if(_images && _images.length > 0){
                savedImages = await saveImages(newVersion.id, _images, t)
            }
            return {
                road: newRoad,
                version: newVersion,
                images: savedImages
            }
        })

        return{
            status: 201,
            message: "New tag road and its initial version has been created successfully",
            data: result
        }
    }
    catch(error){
        console.log(`Transaction error while creating tag road: ${error} `)
        if(error.status){
            return {
                status: error.status,
                message: error.message
            }
        }
        return{
            status: 500,
            message: "Failed to create tag road due to server error"
        }
    }
}

async function getTagRoad(_tagRoadId){
    return await tagRoads.findByPk(_tagRoadId)
}

async function deleteTagRoad(){
    
}

async function updateTagRoad(){

}

//TAG VERSION
async function createTagVersion(_tagRoadId, _userId, _status, _description, _images){
    const tagRoadExist = await getTagRoad(_tagRoadId)
    if(!tagRoadExist){
        return{
            status: 404,
            message: "Tag road not found"
        }
    }
    try{
        const result = await sequelize.transaction(async t => {
            const newVersion = await tagVersions.create({
                tagRoadId: _tagRoadId,
                userId: _userId,
                status: _status,
                description: _description,
                score: 0,
                isVerified: false
            }, {transaction: t})

            let savedImages = []
            if(_images && _images.length > 0){
                savedImages = await saveImages(newVersion.id, _images, t)
            }
            return {
                version: newVersion,
                images: savedImages
            }
        })

        return {
            status: 201,
            message: "New tag successfully created",
            data: result
        }
    }
    catch(error){
        console.log(`Error while creating new version of the tag: ${error}`)
        if(error.status){
            return{
                status: error.status,
                message: error.message
            }
        }
        return{
            status: 500,
            message: "Internal server error"
        }
    }
}

async function getTagVersion(_tagVersionId){
    return await tagVersions.findByPk(_tagVersionId)
}

async function deleteTagVersion(){
    
}

async function updateTagVersion(){

}

export {
    createTagRoad, 
    getTagRoad,
    deleteTagRoad,
    updateTagRoad,
    createTagVersion, 
    getTagVersion,
    deleteTagVersion,
    updateTagVersion
}