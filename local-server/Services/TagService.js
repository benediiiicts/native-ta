import {tagRoads, tagVersions} from "../Models/TagModel"
import { Op } from "sequelize";
import { sequelize } from "../database";
import { version } from "react";

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
async function createTagRoad(_userId, _latitude, _longitude, _conditionStatus, _description, _forceCreate = false){
    if(!_forceCreate){
        let tagExist = await checkRoadRadius(_latitude, _longitude)

        if(tagExist.status !== 200){
            return tagExist;
        }
    }

    //if forced to create or if there is no tag existed
    
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
                conditionStatus: _conditionStatus,
                description: _description,
                reliabilityScore: 0,
                isPriorityValidated: false
            }, {transaction: t})

            //karena membuat tag road baru, maka versi saat ini akan menjadi versi utama
            await newRoad.update({
                activeVersionId: newVersion.id
            }, {transaction: t})

            return {
                road: newRoad,
                version: newVersion
            }
        })

        return{
            status: 200,
            message: "New tag road and its initial version has been created successfully",
            data: result
        }
    }
    catch(error){
        console.log(`Transaction error while creating tag road: ${error} `)
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
async function createTagVersion(_tagRoadId, _userId, _conditionStatus, _description){
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
                conditionStatus: _conditionStatus,
                description: _description,
                reliabilityScore: 0,
                isPriorityValidated: false
            }, {transaction: t})

            return newVersion
        })

        return {
            status: 201,
            message: "New tag successfully created",
            data: result
        }
    }
    catch(error){
        console.log(`Error while creating new version of the tag: ${error}`)
        return{
            status: 500,
            message: "Internal server error"
        }
    }
}

async function getTagVersion(){

}

async function deleteTagVersion(){
    
}

async function updateTagVersion(){

}