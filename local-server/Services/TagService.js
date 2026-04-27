import { tagRoads, tagVersions } from '../Models/TagModel.js';
import { user, userVotes } from '../Models/UserModel.js';
import { versionImages, comments } from '../Models/MediaModel.js';
import { Op } from "sequelize";
import cron from 'node-cron';
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
            where: {isHidden: false}
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

async function getTagDetail(_tagId, _userId=null, _versionId=null){
    try{
        let targetVersionId = _versionId
        const road = await tagRoads.findOne({ where: { id: _tagId } });
        if(!road){
            return{
                status: 404,
                data: null,
                message: "Tag roads not found"
            }
        }

        if (road.isHidden) {
            if (!_userId) {
                return { status: 404, data: null, message: "Tag roads not found" };
            }
            const checkUser = await user.findByPk(_userId, { attributes: ['role'] });
            if (!checkUser || checkUser.role !== 'admin') {
                return { status: 404, data: null, message: "Tag roads not found" };
            }
        }

        if(!targetVersionId){
            targetVersionId = road.activeVersionId
        }

        const currVersion = { id: targetVersionId };

        const detail = await tagRoads.findOne({
            where: {id: _tagId },
            include:[
                {
                    model: tagVersions,
                    as: 'versions',
                    where: currVersion,
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

        if (!detail || !detail.versions || detail.versions.length === 0) {
            return {
                status: 404,
                data: null,
                message: "Data laporan jalan tidak ditemukan."
            }
        }        
        const result = detail.toJSON()
        result.activeVersion = result.versions[0]
        delete result.versions

        let currentUserVote = null
        if(_userId && result.activeVersion){
            const vote = await userVotes.findOne({
                where: { userId: _userId, tagVersionId: result.activeVersion.id }
            });

            if (vote) {
                currentUserVote = vote.voteType;
            }
        }

        result.currentUserVote = currentUserVote;

        return {
            status: 200,
            data: result,
            message: "Tag detail successfully fetched"
        }
    }
    catch(error){
        console.error(`Error while fetching tag details ${error}`)
        error.status = 500; 
        throw error
    }
}

async function getAllTags(_userId=null, _includeHidden="false"){
    try{
        if(_includeHidden !== "false"){
            if(!_userId){
                return{
                    status: 401,
                    message: "User not authorized"
                }
            }
            const checkUser = await user.findByPk(_userId,{
                attributes: ['role']
            })
            if(checkUser.role !== 'admin'){
                return{
                    status: 401,
                    message: "User not authorized"
                }
            }
        }
        let whereCondition = {};
        
        if (_includeHidden === "false") {
            whereCondition.isHidden = false;
        }
        
        const fetchTags = await tagRoads.findAll({
            where: whereCondition
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

            await tagRoads.update(
                { updatedAt: new Date() }, 
                { where: { id: _tagRoadId }, transaction: t }
            );

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

async function getVersionHistory(_tagId){
    try{
        const history = await tagVersions.findAll({
            where: {tagRoadId: _tagId},
            include: [{
                model: user,
                as: 'author',
                attributes: ['username']
            }],
            order: [['score', 'DESC']]
        })

        return{
            status: 200,
            data: history,
            message: 'Version history fetched successfully'
        }
    }
    catch(error){
        console.error(`Error while fetching versions: ${error}`)
        return{
            status: 500,
            message: 'Internal server error while fetching version history'
        }
    }
}

async function voteTagVersion(_userId, _tagId, _voteType){
    try{
        const result = await sequelize.transaction(async (t) => {
            const existingVote = await userVotes.findOne({
                where: {userId: _userId, tagVersionId: _tagId},
                transaction: t
            })

            const version = await tagVersions.findByPk(_tagId, {transaction: t})
            if(!version){
                const error = new Error("Version not found")
                error.status = 404
                throw error
            }

            let actionMessage = "";
            let finalVoteStatus = _voteType;

            if(existingVote){
                if(existingVote.voteType == _voteType){
                    await existingVote.destroy({transaction: t})
                    if (_voteType === 'Approve') {
                        await version.decrement('approveCount', { transaction: t });
                    } else if (_voteType === 'Reject') {
                        await version.decrement('rejectCount', { transaction: t });
                    }
                    actionMessage = "Vote removed";
                    finalVoteStatus = null;
                }
                else{
                    await existingVote.update({voteType: _voteType}, {transaction: t})
                    if(_voteType == 'Approve'){
                        await version.increment('approveCount', {transaction: t})
                        await version.decrement('rejectCount', { transaction: t });
                    }
                    else if(_voteType == 'Reject'){
                        await version.decrement('approveCount', {transaction: t})
                        await version.increment('rejectCount', { transaction: t });
                    }
                    actionMessage = "Vote updated";
                }
            }
            else{
                await userVotes.create({
                    userId: _userId,
                    tagVersionId: _tagId,
                    voteType: _voteType
                }, {transaction: t})

                if(_voteType == 'Approve'){
                    await version.increment('approveCount', {transaction: t})
                }
                else if (_voteType == 'Reject'){
                    await version.increment('rejectCount', {transaction: t})
                }
                actionMessage = "Vote added";
            }

            await version.reload({ transaction: t });

            // Hitung usia dalam hari
            const ageInMs = Date.now() - new Date(version.createdAt).getTime();
            const ageInDays = ageInMs / (1000 * 60 * 60 * 24);

            // Rumus time decay: (Approve - Reject) / (Age + 1)^1.5
            const baseVotes = (version.approveCount - version.rejectCount);
            const newScore = baseVotes / Math.pow((ageInDays + 1), 1.5);

            await version.update({ score: newScore }, { transaction: t });

            // Cari versi dengan skor tertinggi untuk jalan ini
            const bestVersion = await tagVersions.findOne({
                where: { 
                    tagRoadId: version.tagRoadId,
                    approveCount: { [Op.gte]: 3 }
                },
                order: [['score', 'DESC']],
                transaction: t
            });

            const road = await tagRoads.findByPk(version.tagRoadId, { transaction: t });
            if (road && bestVersion && road.activeVersionId !== bestVersion.id) {
                await road.update({ 
                    activeVersionId: bestVersion.id 
                }, { transaction: t });
            }

            return { 
                status: (existingVote && existingVote.voteType !== _voteType) ? 200 : (existingVote ? 200 : 201), 
                message: actionMessage, 
                currentVote: finalVoteStatus 
            };
        })
        
        return result
    }
    catch(error){
        console.error(`Error while processing vote: ${error}`)
        return{
            status: error.status || 500,
            message: error.message || "Internal server error while processing vote"
        }
    }
}

async function countRelevanceScore(){
    try{
        console.log(`[CRON JOB] Calculating scores using time decay`)

        const roads = await tagRoads.findAll({
            where: {isHidden: false},
            include: [
                {
                    model: tagVersions,
                    as: 'versions'
                }
            ]
        })

        const gravitation = 1.5
        for(let road of roads){
            if(!road.versions || road.versions.length == 0) continue
            
            let highestScore = -Infinity
            let bestVersionId = null

            for(let version of road.versions){
                //hitung usia dalam hari
                const ageInMs = Date.now() - new Date(version.createdAt).getTime()
                const ageInDays = ageInMs / (1000*60*60*24)

                // Rumus Time Decay: ( (A - R) + 1 ) / (Age + 1)^1.5
                const baseVote = (version.approveCount - version.rejectCount) + 1
                const divisor = Math.pow(ageInDays + 1, gravitation)
                const decayScore = baseVote / divisor

                await version.update({
                    score: decayScore
                })

                if(version.approveCount >= 3 && decayScore > highestScore){
                    highestScore = decayScore
                    bestVersionId = version.id
                }
            }

            if(bestVersionId && road.activeVersionId !== bestVersionId){
                await road.update({
                    activeVersionId: bestVersionId
                })
                console.log(`[CRON JOB] Road: ${road.id}'s version changed to: ${bestVersionId}`);
            }
        }
        console.log("[CRON JOB] Time decay cron job FINISHED");
    }
    catch(error){
        console.error(`[CRON JOB] Error while calculating time decay: ${error}`)
    }
}

async function checkRecentUpdate(lat, lon, lastFetchTime){
    try{
        const fetchDate = new Date(lastFetchTime)

        const offset = 0.045 //5 km
        const minLat = parseFloat(lat) - offset;
        const maxLat = parseFloat(lat) + offset;
        const minLon = parseFloat(lon) - offset;
        const maxLon = parseFloat(lon) + offset;
        
        const updatesCount = await tagRoads.count({
            //hitung semua tag baru di radius
            where:{
                updatedAt: {[Op.gt]: fetchDate},
                latitude: {[Op.between]: [minLat, maxLat]},
                longitude: { [Op.between]: [minLon, maxLon] }
            }
        })

        return{
            status: 200,
            data: {
                hasUpdates: updatesCount > 0, 
                count: updatesCount
            },
            message: "Update check successfull"
        }
    }
    catch(error){
        console.error(`Error while checking recent updates: ${error}`)
        return{
            status: 500,
            message: "Internal server error while checking updates"
        }
    }
}

export {
    createTagRoad, 
    getTagRoad,
    getTagDetail,
    getAllTags,
    createTagVersion,
    getVersionHistory,
    voteTagVersion,
    countRelevanceScore,
    checkRecentUpdate
}