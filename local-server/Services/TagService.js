import { tagRoads, tagVersions } from '../Models/TagModel.js';
import { user } from '../Models/UserModel.js';
import { versionImages, comments } from '../Models/MediaModel.js';
import { Op } from "sequelize";
import sequelize from "../database.js";
import { saveImages } from "./MediaService.js";

async function checkRoadRadius(_latitude, _longitude){
    const earthRadius = 6371000
    const maxDistance = 10 //10 meter

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
async function createTagRoad(_userId, _latitude, _longitude, _roadClass, _issueType, _description, _forceCreate = false, _images){
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
                isHidden: false,
                roadClass: _roadClass,
                issueType: _issueType,
            }, {transaction: t})

            const newVersion = await tagVersions.create({
                tagRoadId: newRoad.id,
                userId: _userId,
                status: "Menunggu Tindakan",
                description: _description,
                score: 0,
                isVerified: false
            }, {transaction: t})

            await newRoad.update({
                activeVersionId: newVersion.id
            }, {transaction: t})

            let savedImages = []
            if(_images && _images.length > 0){
                console.log("images available")
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
        console.error(`Transaction error while creating tag road: ${error} `)
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
    try{
        const fetchRoad = await tagRoads.findByPk(_tagRoadId,{
            where: {is_hidden: false}
        })
        if(fetchRoad){
            return {
                data: fetchRoad,
                status: 200
            }
        }
        return{
            status: 404,
            message: "Tag road not found"
        }
    }
    catch(error){
        console.error(`Error while fetching tag ${error}`)
        return{
            status: 500,
            message: "Failed to fetch tag due to server error"
        }
    }
}

async function getTagDetail(_tagId){
    try{
        const detail = await tagRoads.findOne({
            where: {id: _tagId, isHidden: false},
            include:[
                {
                    model: tagVersions,
                    as: 'activeVersion',
                    include:[
                        {model: user, as: 'author', attributes: ['id', 'username']},
                        {model: versionImages, as: 'images', attributes: ['imageUrl']}, 
                        {
                            model: comments,
                            as: 'comments', 
                            include: [{ model: user, as: 'commentAuthor', attributes: ['username'] }]
                        }
                    ]
                }
            ]
        })

        if (!detail) {
            return {
                status: 404,
                data: null,
                message: "Data laporan jalan tidak ditemukan."
            }
        }

        return {
            status: 200,
            data: detail,
            message: "Tag detail successfully fetched"
        }
    }
    catch(error){
        console.error(`Error while fetching tag details ${error}`)
        error.status = 500; 
        throw error
    }
}

async function getAllTags(){
    try{
        const fetchTags = await tagRoads.findAll({
            where: {is_hidden: false}
        })
        return {
            data: fetchTags,
            status: 200
        } 
    }
    catch(error){
        console.error(`Error while fetching tag ${error}`)
        return{
            status: 500,
            message: "Failed to fetch tags due to server error"
        }
    }
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
    try{
        const version = await tagVersions.findByPk(_tagVersionId)
    }
    catch(error){

    }
}

async function deleteTagVersion(){
    
}

async function voteTagVersion(_tagId, _voteType){
    try{
        const version = await tagVersions.findByPk(_tagId, {
            where: {is_hidden: false}
        })
        if(version){
            const approve = version.approveCount
            const reject = version.rejectCount
            (_voteType == 'Approve')? approve+=1 : reject+=1;
            const totalVotes = approve + reject
            const reliability = Math.round((approve/ totalVotes)*100)
        }
    }
    catch(error){

    }
}

export {
    createTagRoad, 
    getTagRoad,
    getTagDetail,
    getAllTags,
    deleteTagRoad,
    updateTagRoad,
    createTagVersion, 
    getTagVersion,
    deleteTagVersion,
    updateTagVersion
}